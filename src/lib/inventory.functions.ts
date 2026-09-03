import { createServerFn } from '@tanstack/react-start'
import { and, asc, desc, eq, inArray, isNull, like, or } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '#/db'
import {
  auditLog,
  establishmentMaintenanceAssignments,
  establishments,
  extinguishers,
  maintenanceEvents,
  maintenanceRelationships,
} from '#/db/schema'
import { complianceStatus } from '#/lib/compliance-status'
import { requireActiveMembership } from '#/lib/authorization'

export const extinguisherTypes = [
  'water',
  'foam',
  'dry_chemical_powder',
  'carbon_dioxide',
  'clean_agent',
  'wet_chemical',
  'other',
] as const

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
const operationalStatusSchema = z.enum([
  'active',
  'attention_required',
  'out_of_service',
])
const extinguisherSchema = z.object({
  establishmentId: z.string().uuid(),
  code: z.string().trim().min(1).max(80),
  type: z.enum(extinguisherTypes),
  fireClasses: z.array(z.enum(['A', 'B', 'C', 'D', 'K/F'])).min(1),
  capacityValue: z.coerce.number().positive().max(10000),
  capacityUnit: z.enum(['kg', 'l', 'other']),
  brand: z.string().trim().max(100).optional(),
  serialNumber: z.string().trim().max(100).optional(),
  locationDescription: z.string().trim().min(1).max(250),
  lastControlOn: dateSchema.optional(),
  nextControlDueOn: dateSchema.optional(),
  operationalStatus: operationalStatusSchema,
  notes: z.string().trim().max(2000).optional(),
})

async function activeMembership() {
  const { getActiveOrganizationId, requireSession } =
    await import('#/lib/auth.server')
  const currentSession = await requireSession()
  const organizationId = await getActiveOrganizationId(
    currentSession.session.id,
  )
  if (!organizationId)
    throw new Error('Selecciona una organizacion para continuar.')
  const membership = await requireActiveMembership(
    currentSession.user.id,
    organizationId,
  )
  return { currentSession, organizationId, membership }
}

function requireClientEditor(role: string) {
  if (role !== 'client_admin' && role !== 'client_operator') {
    throw new Error('No tenes permisos para administrar el inventario.')
  }
}

function requireClientAdmin(role: string) {
  if (role !== 'client_admin')
    throw new Error('Necesitas permisos de administrador.')
}

async function accessibleEstablishment(establishmentId: string) {
  const active = await activeMembership()
  const rows = await db
    .select({ establishment: establishments })
    .from(establishments)
    .where(
      and(
        eq(establishments.id, establishmentId),
        isNull(establishments.archivedAt),
      ),
    )
  if (rows.length === 0) throw new Error('El establecimiento no existe.')
  const establishment = rows[0].establishment

  if (active.membership.organizationType === 'client') {
    if (establishment.clientOrganizationId !== active.organizationId) {
      throw new Error('No tenes acceso a este establecimiento.')
    }
    return {
      ...active,
      establishment,
      canManageInventory: active.membership.role !== 'client_operator',
    }
  }

  const assignments = await db
    .select({ id: establishmentMaintenanceAssignments.id })
    .from(establishmentMaintenanceAssignments)
    .innerJoin(
      maintenanceRelationships,
      eq(
        establishmentMaintenanceAssignments.maintenanceRelationshipId,
        maintenanceRelationships.id,
      ),
    )
    .where(
      and(
        eq(
          establishmentMaintenanceAssignments.establishmentId,
          establishmentId,
        ),
        isNull(establishmentMaintenanceAssignments.endsOn),
        eq(
          maintenanceRelationships.maintenanceOrganizationId,
          active.organizationId,
        ),
        eq(maintenanceRelationships.status, 'accepted'),
      ),
    )
  if (assignments.length === 0)
    throw new Error('No tenes acceso a este establecimiento.')
  return { ...active, establishment, canManageInventory: false }
}

async function writeAudit(
  organizationId: string,
  actorUserId: string,
  action: string,
  entityType: string,
  entityId: string,
  metadata?: Record<string, string>,
) {
  await db.insert(auditLog).values({
    id: crypto.randomUUID(),
    organizationId,
    actorUserId,
    action,
    entityType,
    entityId,
    metadata: metadata ? JSON.stringify(metadata) : null,
    createdAt: new Date(),
  })
}

export const listEstablishments = createServerFn({ method: 'GET' }).handler(
  async () => {
    const active = await activeMembership()
    if (active.membership.organizationType === 'client') {
      return db
        .select()
        .from(establishments)
        .where(
          and(
            eq(establishments.clientOrganizationId, active.organizationId),
            isNull(establishments.archivedAt),
          ),
        )
        .orderBy(asc(establishments.name))
    }
    return db
      .select({ establishment: establishments })
      .from(establishmentMaintenanceAssignments)
      .innerJoin(
        establishments,
        eq(
          establishmentMaintenanceAssignments.establishmentId,
          establishments.id,
        ),
      )
      .innerJoin(
        maintenanceRelationships,
        eq(
          establishmentMaintenanceAssignments.maintenanceRelationshipId,
          maintenanceRelationships.id,
        ),
      )
      .where(
        and(
          eq(
            maintenanceRelationships.maintenanceOrganizationId,
            active.organizationId,
          ),
          eq(maintenanceRelationships.status, 'accepted'),
          isNull(establishmentMaintenanceAssignments.endsOn),
          isNull(establishments.archivedAt),
        ),
      )
      .orderBy(asc(establishments.name))
      .then((rows) => rows.map((row) => row.establishment))
  },
)

export const createEstablishment = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      name: z.string().trim().min(2).max(120),
      addressLine: z.string().trim().min(2).max(180),
      city: z.string().trim().min(2).max(100),
      province: z.string().trim().min(2).max(100),
      postalCode: z.string().trim().max(20).optional(),
      contactName: z.string().trim().max(120).optional(),
      contactEmail: z.string().trim().email().optional(),
      contactPhone: z.string().trim().max(40).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const active = await activeMembership()
    if (active.membership.organizationType !== 'client')
      throw new Error('Solo los clientes pueden crear establecimientos.')
    requireClientEditor(active.membership.role)
    const id = crypto.randomUUID()
    const now = new Date()
    await db.insert(establishments).values({
      id,
      clientOrganizationId: active.organizationId,
      ...data,
      postalCode: data.postalCode || null,
      contactName: data.contactName || null,
      contactEmail: data.contactEmail || null,
      contactPhone: data.contactPhone || null,
      createdAt: now,
      updatedAt: now,
    })
    await writeAudit(
      active.organizationId,
      active.currentSession.user.id,
      'establishment.created',
      'establishment',
      id,
    )
    return { id }
  })

export const archiveEstablishment = createServerFn({ method: 'POST' })
  .validator(z.object({ establishmentId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const access = await accessibleEstablishment(data.establishmentId)
    if (access.membership.organizationType !== 'client')
      throw new Error('No tenes permisos para archivar este establecimiento.')
    requireClientAdmin(access.membership.role)
    const now = new Date()
    await db
      .update(establishments)
      .set({ archivedAt: now, updatedAt: now })
      .where(eq(establishments.id, data.establishmentId))
    await writeAudit(
      access.organizationId,
      access.currentSession.user.id,
      'establishment.archived',
      'establishment',
      data.establishmentId,
    )
    return { success: true }
  })

export const assignMaintenanceCompany = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      establishmentId: z.string().uuid(),
      maintenanceRelationshipId: z.string().uuid(),
      startsOn: dateSchema,
    }),
  )
  .handler(async ({ data }) => {
    const access = await accessibleEstablishment(data.establishmentId)
    if (access.membership.organizationType !== 'client')
      throw new Error('No tenes permisos para asignar una empresa.')
    requireClientAdmin(access.membership.role)
    const relationships = await db
      .select()
      .from(maintenanceRelationships)
      .where(
        and(
          eq(maintenanceRelationships.id, data.maintenanceRelationshipId),
          eq(
            maintenanceRelationships.clientOrganizationId,
            access.organizationId,
          ),
          eq(maintenanceRelationships.status, 'accepted'),
        ),
      )
    if (relationships.length === 0)
      throw new Error('El vinculo de mantenimiento no esta disponible.')
    const relationship = relationships[0]
    const now = new Date()
    await db.transaction(async (tx) => {
      await tx
        .update(establishmentMaintenanceAssignments)
        .set({ endsOn: data.startsOn, updatedAt: now })
        .where(
          and(
            eq(
              establishmentMaintenanceAssignments.establishmentId,
              data.establishmentId,
            ),
            isNull(establishmentMaintenanceAssignments.endsOn),
          ),
        )
      await tx.insert(establishmentMaintenanceAssignments).values({
        id: crypto.randomUUID(),
        establishmentId: data.establishmentId,
        maintenanceRelationshipId: relationship.id,
        startsOn: data.startsOn,
        createdAt: now,
        updatedAt: now,
      })
    })
    await writeAudit(
      access.organizationId,
      access.currentSession.user.id,
      'establishment.maintenance_assigned',
      'establishment',
      data.establishmentId,
    )
    return { success: true }
  })

export const listExtinguishers = createServerFn({ method: 'GET' })
  .validator(
    z.object({
      establishmentId: z.string().uuid(),
      query: z.string().trim().max(100).optional(),
      status: z
        .enum(['in_rule', 'due_soon', 'overdue_or_attention'])
        .optional(),
      page: z.coerce.number().int().positive().default(1),
      pageSize: z.coerce.number().int().min(1).max(100).default(25),
      sort: z.enum(['due', 'code', 'location', 'updated']).default('due'),
    }),
  )
  .handler(async ({ data }) => {
    await accessibleEstablishment(data.establishmentId)
    const conditions = [
      eq(extinguishers.establishmentId, data.establishmentId),
      isNull(extinguishers.archivedAt),
    ]
    if (data.query)
      conditions.push(
        or(
          like(extinguishers.code, `%${data.query}%`),
          like(extinguishers.serialNumber, `%${data.query}%`),
          like(extinguishers.brand, `%${data.query}%`),
          like(extinguishers.locationDescription, `%${data.query}%`),
        )!,
      )
    const order =
      data.sort === 'code'
        ? asc(extinguishers.code)
        : data.sort === 'location'
          ? asc(extinguishers.locationDescription)
          : data.sort === 'updated'
            ? desc(extinguishers.updatedAt)
            : asc(extinguishers.nextControlDueOn)
    const rows = await db
      .select()
      .from(extinguishers)
      .where(and(...conditions))
      .orderBy(order)
    const items = rows
      .map(withCompliance)
      .filter((item) => !data.status || item.complianceStatus === data.status)
    const start = (data.page - 1) * data.pageSize
    return {
      items: items.slice(start, start + data.pageSize),
      total: items.length,
      page: data.page,
      pageSize: data.pageSize,
    }
  })

export const createExtinguisher = createServerFn({ method: 'POST' })
  .validator(extinguisherSchema)
  .handler(async ({ data }) => {
    const access = await accessibleEstablishment(data.establishmentId)
    if (access.membership.organizationType !== 'client')
      throw new Error('Solo el cliente puede crear extintores.')
    requireClientEditor(access.membership.role)
    const id = crypto.randomUUID()
    const now = new Date()
    try {
      await db.insert(extinguishers).values({
        id,
        ...data,
        fireClasses: JSON.stringify(data.fireClasses),
        brand: data.brand || null,
        serialNumber: data.serialNumber || null,
        lastControlOn: data.lastControlOn || null,
        nextControlDueOn: data.nextControlDueOn || null,
        notes: data.notes || null,
        createdAt: now,
        updatedAt: now,
      })
    } catch {
      throw new Error(
        'El codigo o numero de serie ya existe en este establecimiento.',
      )
    }
    await writeAudit(
      access.organizationId,
      access.currentSession.user.id,
      'extinguisher.created',
      'extinguisher',
      id,
    )
    return { id }
  })

export const getExtinguisher = createServerFn({ method: 'GET' })
  .validator(z.object({ extinguisherId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const extinguishersFound = await db
      .select()
      .from(extinguishers)
      .where(
        and(
          eq(extinguishers.id, data.extinguisherId),
          isNull(extinguishers.archivedAt),
        ),
      )
    if (extinguishersFound.length === 0)
      throw new Error('El extintor no existe.')
    const extinguisher = extinguishersFound[0]
    await accessibleEstablishment(extinguisher.establishmentId)
    const events = await db
      .select()
      .from(maintenanceEvents)
      .where(eq(maintenanceEvents.extinguisherId, extinguisher.id))
      .orderBy(
        desc(maintenanceEvents.performedOn),
        desc(maintenanceEvents.createdAt),
      )
    return { extinguisher: withCompliance(extinguisher), events }
  })

export const archiveExtinguisher = createServerFn({ method: 'POST' })
  .validator(z.object({ extinguisherId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const extinguishersFound = await db
      .select()
      .from(extinguishers)
      .where(eq(extinguishers.id, data.extinguisherId))
    if (extinguishersFound.length === 0)
      throw new Error('El extintor no existe.')
    const extinguisher = extinguishersFound[0]
    const access = await accessibleEstablishment(extinguisher.establishmentId)
    if (access.membership.organizationType !== 'client')
      throw new Error('No tenes permisos para archivar este extintor.')
    requireClientAdmin(access.membership.role)
    const now = new Date()
    await db
      .update(extinguishers)
      .set({ archivedAt: now, updatedAt: now })
      .where(eq(extinguishers.id, extinguisher.id))
    await writeAudit(
      access.organizationId,
      access.currentSession.user.id,
      'extinguisher.archived',
      'extinguisher',
      extinguisher.id,
    )
    return { success: true }
  })

export const recordMaintenance = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      extinguisherId: z.string().uuid(),
      eventType: z.enum([
        'control',
        'recharge',
        'repair',
        'installation',
        'replacement',
        'decommission',
      ]),
      performedOn: dateSchema,
      resultingOperationalStatus: operationalStatusSchema,
      resultingNextControlDueOn: dateSchema.optional(),
      notes: z.string().trim().max(2000).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const extinguishersFound = await db
      .select()
      .from(extinguishers)
      .where(
        and(
          eq(extinguishers.id, data.extinguisherId),
          isNull(extinguishers.archivedAt),
        ),
      )
    if (extinguishersFound.length === 0)
      throw new Error('El extintor no existe.')
    const extinguisher = extinguishersFound[0]
    const access = await accessibleEstablishment(extinguisher.establishmentId)
    if (access.membership.organizationType !== 'maintenance_company')
      throw new Error(
        'Solo una empresa de mantenimiento puede registrar intervenciones.',
      )
    const id = crypto.randomUUID()
    const now = new Date()
    const { extinguisherId: _, ...event } = data
    await db.transaction(async (tx) => {
      await tx.insert(maintenanceEvents).values({
        id,
        extinguisherId: extinguisher.id,
        maintenanceOrganizationId: access.organizationId,
        performedByUserId: access.currentSession.user.id,
        ...event,
        resultingNextControlDueOn: data.resultingNextControlDueOn || null,
        notes: data.notes || null,
        createdAt: now,
      })
      await tx
        .update(extinguishers)
        .set({
          lastControlOn: data.performedOn,
          nextControlDueOn: data.resultingNextControlDueOn || null,
          operationalStatus: data.resultingOperationalStatus,
          updatedAt: now,
        })
        .where(eq(extinguishers.id, extinguisher.id))
    })
    await writeAudit(
      access.organizationId,
      access.currentSession.user.id,
      'maintenance.recorded',
      'maintenance_event',
      id,
    )
    return { id }
  })

export const getDashboard = createServerFn({ method: 'GET' }).handler(
  async () => {
    const active = await activeMembership()
    const establishmentRows = await listEstablishments()
    const ids = establishmentRows.map((establishment) => establishment.id)
    const rows = ids.length
      ? await db
          .select()
          .from(extinguishers)
          .where(
            and(
              inArray(extinguishers.establishmentId, ids),
              isNull(extinguishers.archivedAt),
            ),
          )
      : []
    const items = rows.map(withCompliance)
    const counts = { total: items.length, inRule: 0, dueSoon: 0, overdue: 0 }
    for (const item of items) {
      if (item.complianceStatus === 'in_rule') counts.inRule += 1
      else if (item.complianceStatus === 'due_soon') counts.dueSoon += 1
      else counts.overdue += 1
    }
    const upcoming = items
      .filter((item) => item.complianceStatus !== 'in_rule')
      .sort((a, b) =>
        (a.nextControlDueOn ?? '').localeCompare(b.nextControlDueOn ?? ''),
      )
      .slice(0, 10)
    return {
      organization: {
        name: active.membership.organizationName,
        type: active.membership.organizationType,
      },
      counts,
      upcoming,
    }
  },
)

function withCompliance(extinguisher: typeof extinguishers.$inferSelect) {
  return {
    ...extinguisher,
    fireClasses: JSON.parse(extinguisher.fireClasses) as string[],
    complianceStatus: complianceStatus(
      extinguisher.operationalStatus,
      extinguisher.nextControlDueOn,
    ),
  }
}
