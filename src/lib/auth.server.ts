import { getRequestHeaders } from '@tanstack/react-start/server'
import { eq } from 'drizzle-orm'

import { db } from '#/db'
import { session } from '#/db/schema'
import { auth } from '#/lib/auth'

export async function requireSession() {
  const currentSession = await auth.api.getSession({
    headers: getRequestHeaders(),
  })

  if (!currentSession) {
    throw new Error('No autenticado.')
  }

  return currentSession
}

export async function getActiveOrganizationId(sessionId: string) {
  const currentSessions = await db
    .select({ activeOrganizationId: session.activeOrganizationId })
    .from(session)
    .where(eq(session.id, sessionId))

  return currentSessions.length > 0
    ? currentSessions[0].activeOrganizationId
    : null
}
