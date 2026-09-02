import { createServerFn } from '@tanstack/react-start'

export const getCurrentSession = createServerFn({ method: 'GET' }).handler(
  async () => (await import('#/lib/auth.server')).requireSession(),
)
