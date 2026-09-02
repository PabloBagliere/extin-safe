import { env } from 'cloudflare:workers'
import { drizzle } from 'drizzle-orm/d1'

import * as schema from './schema.ts'

export function createDb(database: D1Database) {
  return drizzle(database, { schema })
}

export const db = createDb(env.DB)
