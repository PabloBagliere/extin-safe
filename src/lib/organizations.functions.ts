import { createServerFn } from '@tanstack/react-start'
import { and, eq, inArray, or } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '#/db'
import {
  maintenanceRelationships,
  organizationMemberInvitations,
  organizationMembers,
  organizations,
  session,
  user,
} from '#/db/schema'
import { getActiveOrganizationId, requireSession } from '#/lib/auth.functions'
import {
  defaultRoleForOrganization,
  isRoleAllowedForOrganization,
  organizationRoles,
  requireActiveMembership,
  requireOrganizationAdmin,
} from '#/lib/authorization'

const organizationTypeSchema = z.enum(['client', 'maintenance_company'])
const roleSchema = z.enum(organizationRoles)

function organizationSlug(name: string) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

async function activeMembership() {
  const currentSession = await requireSession()
  const organizationId = await getActiveOrganizationId(
    currentSession.session.id,
  )

  if (!organizationId) {
    throw new Error('Selecciona una organizacion para continuar.')
  }

  const membership = await requireActiveMembership(
    currentSession.user.id,
    organizationId,
  )

  return { currentSession, organizationId, membership }
}

export const listMyOrganizations = createServerFn({ method: 'GET' }).handler(
  async () => {
    const currentSession = await requireSession()
    const activeOrganizationId = await getActiveOrganizationId(
      currentSession.session.id,
    )

    return db
      .select({
        id: organizations.id,
        name: organizations.name,
        type: organizations.type,
        role: organizationMembers.role,
        isActive: organizations.isActive,
        selected: eq(organizations.id, activeOrganizationId ?? ''),
      })
      .from(organizationMembers)
      .innerJoin(
        organizations,
        eq(organizationMembers.organizationId, organizations.id),
      )
      .where(
        and(
          eq(organizationMembers.userId, currentSession.user.id),
          eq(organizationMembers.status, 'active'),
          eq(organizations.isActive, true),
        ),
      )
  },
)

export const createOrganization = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      name: z.string().trim().min(2).max(120),
      type: organizationTypeSchema,
      taxId: z.string().trim().max(32).optional(),
      contactEmail: z.string().email().optional(),
      contactPhone: z.string().trim().max(40).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const currentSession = await requireSession()
    const organizationId = crypto.randomUUID()
    const now = new Date()

    await db.batch([
      db.insert(organizations).values({
        id: organizationId,
        name: data.name,
        type: data.type,
        taxId: data.taxId || null,
        contactEmail: data.contactEmail || null,
        contactPhone: data.contactPhone || null,
        createdAt: now,
        updatedAt: now,
      }),
      db.insert(organizationMembers).values({
        id: crypto.randomUUID(),
        organizationId,
        userId: currentSession.user.id,
        role: defaultRoleForOrganization(data.type),
        status: 'active',
        createdAt: now,
        updatedAt: now,
      }),
      db
        .update(session)
        .set({ activeOrganizationId: organizationId, updatedAt: now })
        .where(eq(session.id, currentSession.session.id)),
    ])

    return { id: organizationId, slug: organizationSlug(data.name) }
  })

export const setActiveOrganization = createServerFn({ method: 'POST' })
  .validator(z.object({ organizationId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const currentSession = await requireSession()
    await requireActiveMembership(currentSession.user.id, data.organizationId)

    await db
      .update(session)
      .set({ activeOrganizationId: data.organizationId, updatedAt: new Date() })
      .where(eq(session.id, currentSession.session.id))

    return { organizationId: data.organizationId }
  })

export const inviteOrganizationMember = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      email: z.string().trim().email(),
      role: roleSchema,
    }),
  )
  .handler(async ({ data }) => {
    const { currentSession, organizationId, membership } =
      await activeMembership()
    requireOrganizationAdmin(membership.role)

    if (!isRoleAllowedForOrganization(membership.organizationType, data.role)) {
      throw new Error('El rol no corresponde al tipo de organizacion.')
    }

    const now = new Date()
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    await db.insert(organizationMemberInvitations).values({
      id: crypto.randomUUID(),
      organizationId,
      email: data.email.toLowerCase(),
      role: data.role,
      status: 'pending',
      invitedByUserId: currentSession.user.id,
      expiresAt,
      createdAt: now,
      updatedAt: now,
    })

    return { success: true }
  })

export const acceptOrganizationMemberInvitation = createServerFn({
  method: 'POST',
})
  .validator(z.object({ invitationId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const currentSession = await requireSession()
    const invitations = await db
      .select()
      .from(organizationMemberInvitations)
      .where(eq(organizationMemberInvitations.id, data.invitationId))

    if (invitations.length === 0) {
      throw new Error('La invitacion no esta disponible.')
    }

    const invitation = invitations[0]
    if (
      invitation.status !== 'pending' ||
      invitation.expiresAt < new Date() ||
      invitation.email !== currentSession.user.email.toLowerCase()
    ) {
      throw new Error('La invitacion no esta disponible.')
    }

    const now = new Date()
    await db.transaction(async (tx) => {
      await tx
        .insert(organizationMembers)
        .values({
          id: crypto.randomUUID(),
          organizationId: invitation.organizationId,
          userId: currentSession.user.id,
          role: invitation.role,
          status: 'active',
          invitedByUserId: invitation.invitedByUserId,
          createdAt: now,
          updatedAt: now,
        })
        .onConflictDoNothing()

      await tx
        .update(organizationMemberInvitations)
        .set({ status: 'accepted', acceptedAt: now, updatedAt: now })
        .where(eq(organizationMemberInvitations.id, invitation.id))
    })

    return { organizationId: invitation.organizationId }
  })

export const createMaintenanceRelationship = createServerFn({ method: 'POST' })
  .validator(z.object({ organizationId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { currentSession, organizationId, membership } =
      await activeMembership()
    requireOrganizationAdmin(membership.role)

    const targetOrganizations = await db
      .select({ id: organizations.id, type: organizations.type })
      .from(organizations)
      .where(
        and(
          eq(organizations.id, data.organizationId),
          eq(organizations.isActive, true),
        ),
      )

    if (targetOrganizations.length === 0) {
      throw new Error('Selecciona una organizacion del tipo complementario.')
    }

    const targetOrganization = targetOrganizations[0]
    if (targetOrganization.type === membership.organizationType) {
      throw new Error('Selecciona una organizacion del tipo complementario.')
    }

    const clientOrganizationId =
      membership.organizationType === 'client'
        ? organizationId
        : targetOrganization.id
    const maintenanceOrganizationId =
      membership.organizationType === 'maintenance_company'
        ? organizationId
        : targetOrganization.id
    const now = new Date()

    await db
      .insert(maintenanceRelationships)
      .values({
        id: crypto.randomUUID(),
        clientOrganizationId,
        maintenanceOrganizationId,
        initiatedByOrganizationId: organizationId,
        status: 'pending',
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [
          maintenanceRelationships.clientOrganizationId,
          maintenanceRelationships.maintenanceOrganizationId,
        ],
        set: {
          status: 'pending',
          initiatedByOrganizationId: organizationId,
          acceptedAt: null,
          endedAt: null,
          updatedAt: now,
        },
      })

    return { success: true }
  })

export const respondToMaintenanceRelationship = createServerFn({
  method: 'POST',
})
  .validator(
    z.object({
      relationshipId: z.string().uuid(),
      accept: z.boolean(),
    }),
  )
  .handler(async ({ data }) => {
    const { organizationId, membership } = await activeMembership()
    requireOrganizationAdmin(membership.role)

    const relationships = await db
      .select()
      .from(maintenanceRelationships)
      .where(eq(maintenanceRelationships.id, data.relationshipId))

    if (relationships.length === 0) {
      throw new Error('No podes responder esta invitacion.')
    }

    const relationship = relationships[0]
    if (
      relationship.status !== 'pending' ||
      relationship.initiatedByOrganizationId === organizationId ||
      (relationship.clientOrganizationId !== organizationId &&
        relationship.maintenanceOrganizationId !== organizationId)
    ) {
      throw new Error('No podes responder esta invitacion.')
    }

    const now = new Date()
    await db
      .update(maintenanceRelationships)
      .set({
        status: data.accept ? 'accepted' : 'rejected',
        acceptedAt: data.accept ? now : null,
        updatedAt: now,
      })
      .where(eq(maintenanceRelationships.id, relationship.id))

    return { success: true }
  })

export const getOrganizationWorkspace = createServerFn({
  method: 'GET',
}).handler(async () => {
  const { currentSession, organizationId, membership } =
    await activeMembership()
  const activeMembers = await db
    .select({
      id: organizationMembers.id,
      name: user.name,
      email: user.email,
      role: organizationMembers.role,
    })
    .from(organizationMembers)
    .innerJoin(user, eq(organizationMembers.userId, user.id))
    .where(
      and(
        eq(organizationMembers.organizationId, organizationId),
        eq(organizationMembers.status, 'active'),
      ),
    )

  const relationships = await db
    .select()
    .from(maintenanceRelationships)
    .where(
      or(
        eq(maintenanceRelationships.clientOrganizationId, organizationId),
        eq(maintenanceRelationships.maintenanceOrganizationId, organizationId),
      ),
    )

  const relatedIds = relationships.flatMap((relationship) => [
    relationship.clientOrganizationId,
    relationship.maintenanceOrganizationId,
  ])
  const relatedOrganizations = relatedIds.length
    ? await db
        .select({
          id: organizations.id,
          name: organizations.name,
          type: organizations.type,
        })
        .from(organizations)
        .where(inArray(organizations.id, relatedIds))
    : []

  return {
    currentUserId: currentSession.user.id,
    organization: {
      id: organizationId,
      name: membership.organizationName,
      type: membership.organizationType,
      role: membership.role,
    },
    members: activeMembers,
    relationships,
    relatedOrganizations,
  }
})
