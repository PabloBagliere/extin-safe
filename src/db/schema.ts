import { sql } from 'drizzle-orm'
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core'

const timestamp = (name: string) =>
  integer(name, { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`)

export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' })
    .notNull()
    .default(false),
  image: text('image'),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at'),
})

export const session = sqliteTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at'),
    updatedAt: timestamp('updated_at'),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    activeOrganizationId: text('active_organization_id'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  (table) => [index('session_user_id_idx').on(table.userId)],
)

export const organizations = sqliteTable(
  'organizations',
  {
    id: text('id').primaryKey(),
    type: text('type', { enum: ['client', 'maintenance_company'] }).notNull(),
    name: text('name').notNull(),
    taxId: text('tax_id'),
    contactEmail: text('contact_email'),
    contactPhone: text('contact_phone'),
    address: text('address'),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    createdAt: timestamp('created_at'),
    updatedAt: timestamp('updated_at'),
  },
  (table) => [index('organizations_type_idx').on(table.type)],
)

export const organizationMembers = sqliteTable(
  'organization_members',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    role: text('role', {
      enum: [
        'client_admin',
        'client_operator',
        'maintenance_admin',
        'technician',
      ],
    }).notNull(),
    status: text('status', { enum: ['active', 'pending', 'revoked'] })
      .notNull()
      .default('active'),
    invitedByUserId: text('invited_by_user_id').references(() => user.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at'),
    updatedAt: timestamp('updated_at'),
  },
  (table) => [
    index('organization_members_user_id_idx').on(table.userId),
    uniqueIndex('organization_members_organization_user_idx').on(
      table.organizationId,
      table.userId,
    ),
  ],
)

export const organizationMemberInvitations = sqliteTable(
  'organization_member_invitations',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    email: text('email').notNull(),
    role: text('role', {
      enum: [
        'client_admin',
        'client_operator',
        'maintenance_admin',
        'technician',
      ],
    }).notNull(),
    status: text('status', { enum: ['pending', 'accepted', 'revoked'] })
      .notNull()
      .default('pending'),
    invitedByUserId: text('invited_by_user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
    acceptedAt: integer('accepted_at', { mode: 'timestamp' }),
    createdAt: timestamp('created_at'),
    updatedAt: timestamp('updated_at'),
  },
  (table) => [
    index('organization_member_invitations_email_idx').on(table.email),
    index('organization_member_invitations_organization_idx').on(
      table.organizationId,
    ),
  ],
)

export const maintenanceRelationships = sqliteTable(
  'maintenance_relationships',
  {
    id: text('id').primaryKey(),
    clientOrganizationId: text('client_organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    maintenanceOrganizationId: text('maintenance_organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    status: text('status', {
      enum: ['pending', 'accepted', 'rejected', 'ended'],
    })
      .notNull()
      .default('pending'),
    initiatedByOrganizationId: text('initiated_by_organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    invitationEmail: text('invitation_email'),
    acceptedAt: integer('accepted_at', { mode: 'timestamp' }),
    endedAt: integer('ended_at', { mode: 'timestamp' }),
    createdAt: timestamp('created_at'),
    updatedAt: timestamp('updated_at'),
  },
  (table) => [
    index('maintenance_relationships_client_idx').on(
      table.clientOrganizationId,
    ),
    index('maintenance_relationships_maintenance_idx').on(
      table.maintenanceOrganizationId,
    ),
    uniqueIndex('maintenance_relationships_pair_idx').on(
      table.clientOrganizationId,
      table.maintenanceOrganizationId,
    ),
  ],
)

export const establishments = sqliteTable(
  'establishments',
  {
    id: text('id').primaryKey(),
    clientOrganizationId: text('client_organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    contactName: text('contact_name'),
    contactEmail: text('contact_email'),
    contactPhone: text('contact_phone'),
    addressLine: text('address_line').notNull(),
    city: text('city').notNull(),
    province: text('province').notNull(),
    postalCode: text('postal_code'),
    archivedAt: integer('archived_at', { mode: 'timestamp' }),
    createdAt: timestamp('created_at'),
    updatedAt: timestamp('updated_at'),
  },
  (table) => [
    index('establishments_client_archived_idx').on(
      table.clientOrganizationId,
      table.archivedAt,
    ),
  ],
)

export const establishmentMaintenanceAssignments = sqliteTable(
  'establishment_maintenance_assignments',
  {
    id: text('id').primaryKey(),
    establishmentId: text('establishment_id')
      .notNull()
      .references(() => establishments.id, { onDelete: 'cascade' }),
    maintenanceRelationshipId: text('maintenance_relationship_id')
      .notNull()
      .references(() => maintenanceRelationships.id, { onDelete: 'cascade' }),
    startsOn: text('starts_on').notNull(),
    endsOn: text('ends_on'),
    createdAt: timestamp('created_at'),
    updatedAt: timestamp('updated_at'),
  },
  (table) => [
    index('establishment_assignments_establishment_idx').on(
      table.establishmentId,
      table.endsOn,
    ),
  ],
)

export const extinguishers = sqliteTable(
  'extinguishers',
  {
    id: text('id').primaryKey(),
    establishmentId: text('establishment_id')
      .notNull()
      .references(() => establishments.id, { onDelete: 'cascade' }),
    code: text('code').notNull(),
    type: text('type').notNull(),
    fireClasses: text('fire_classes').notNull(),
    capacityValue: integer('capacity_value').notNull(),
    capacityUnit: text('capacity_unit', {
      enum: ['kg', 'l', 'other'],
    }).notNull(),
    brand: text('brand'),
    serialNumber: text('serial_number'),
    locationDescription: text('location_description').notNull(),
    lastControlOn: text('last_control_on'),
    nextControlDueOn: text('next_control_due_on'),
    operationalStatus: text('operational_status', {
      enum: ['active', 'attention_required', 'out_of_service'],
    })
      .notNull()
      .default('active'),
    notes: text('notes'),
    archivedAt: integer('archived_at', { mode: 'timestamp' }),
    createdAt: timestamp('created_at'),
    updatedAt: timestamp('updated_at'),
  },
  (table) => [
    uniqueIndex('extinguishers_establishment_code_idx').on(
      table.establishmentId,
      table.code,
    ),
    uniqueIndex('extinguishers_establishment_serial_idx').on(
      table.establishmentId,
      table.serialNumber,
    ),
    index('extinguishers_establishment_archived_idx').on(
      table.establishmentId,
      table.archivedAt,
    ),
    index('extinguishers_next_control_due_idx').on(table.nextControlDueOn),
  ],
)

export const maintenanceEvents = sqliteTable(
  'maintenance_events',
  {
    id: text('id').primaryKey(),
    extinguisherId: text('extinguisher_id')
      .notNull()
      .references(() => extinguishers.id, { onDelete: 'cascade' }),
    maintenanceOrganizationId: text('maintenance_organization_id').references(
      () => organizations.id,
      { onDelete: 'set null' },
    ),
    performedByUserId: text('performed_by_user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'restrict' }),
    eventType: text('event_type', {
      enum: [
        'control',
        'recharge',
        'repair',
        'installation',
        'replacement',
        'decommission',
      ],
    }).notNull(),
    performedOn: text('performed_on').notNull(),
    resultingOperationalStatus: text('resulting_operational_status', {
      enum: ['active', 'attention_required', 'out_of_service'],
    }).notNull(),
    resultingNextControlDueOn: text('resulting_next_control_due_on'),
    notes: text('notes'),
    createdAt: timestamp('created_at'),
  },
  (table) => [
    index('maintenance_events_extinguisher_performed_idx').on(
      table.extinguisherId,
      table.performedOn,
    ),
  ],
)

export const auditLog = sqliteTable(
  'audit_log',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    actorUserId: text('actor_user_id').references(() => user.id, {
      onDelete: 'set null',
    }),
    action: text('action').notNull(),
    entityType: text('entity_type').notNull(),
    entityId: text('entity_id').notNull(),
    metadata: text('metadata'),
    createdAt: timestamp('created_at'),
  },
  (table) => [
    index('audit_log_organization_created_idx').on(
      table.organizationId,
      table.createdAt,
    ),
  ],
)

export const account = sqliteTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: integer('access_token_expires_at', {
      mode: 'timestamp',
    }),
    refreshTokenExpiresAt: integer('refresh_token_expires_at', {
      mode: 'timestamp',
    }),
    scope: text('scope'),
    password: text('password'),
    issuer: text('issuer').notNull(),
    createdAt: timestamp('created_at'),
    updatedAt: timestamp('updated_at'),
  },
  (table) => [
    index('account_user_id_idx').on(table.userId),
    uniqueIndex('account_issuer_account_id_idx').on(
      table.issuer,
      table.accountId,
    ),
  ],
)

export const verification = sqliteTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
    createdAt: timestamp('created_at'),
    updatedAt: timestamp('updated_at'),
  },
  (table) => [index('verification_identifier_idx').on(table.identifier)],
)
