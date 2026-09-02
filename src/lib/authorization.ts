import { and, eq } from 'drizzle-orm'

import { db } from '#/db'
import { organizationMembers, organizations } from '#/db/schema'

export const organizationRoles = [
  'client_admin',
  'client_operator',
  'maintenance_admin',
  'technician',
] as const

export type OrganizationRole = (typeof organizationRoles)[number]

export type OrganizationType = 'client' | 'maintenance_company'

export async function requireActiveMembership(
  userId: string,
  organizationId: string,
) {
  const memberships = await db
    .select({
      organizationId: organizationMembers.organizationId,
      role: organizationMembers.role,
      organizationType: organizations.type,
      organizationName: organizations.name,
    })
    .from(organizationMembers)
    .innerJoin(
      organizations,
      eq(organizationMembers.organizationId, organizations.id),
    )
    .where(
      and(
        eq(organizationMembers.userId, userId),
        eq(organizationMembers.organizationId, organizationId),
        eq(organizationMembers.status, 'active'),
        eq(organizations.isActive, true),
      ),
    )

  if (memberships.length === 0) {
    throw new Error('No tenes acceso a esta organizacion.')
  }

  return memberships[0]
}

export function requireOrganizationAdmin(role: OrganizationRole) {
  if (role !== 'client_admin' && role !== 'maintenance_admin') {
    throw new Error('Necesitas permisos de administrador para esta accion.')
  }
}

export function defaultRoleForOrganization(
  type: OrganizationType,
): OrganizationRole {
  return type === 'client' ? 'client_admin' : 'maintenance_admin'
}

export function isRoleAllowedForOrganization(
  type: OrganizationType,
  role: OrganizationRole,
) {
  return type === 'client'
    ? role === 'client_admin' || role === 'client_operator'
    : role === 'maintenance_admin' || role === 'technician'
}
