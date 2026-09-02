import { Link, Outlet, createFileRoute, redirect } from '@tanstack/react-router'

import { authClient } from '#/lib/auth-client'
import { getCurrentSession } from '#/lib/auth.functions'

export const Route = createFileRoute('/app')({
  beforeLoad: async () => {
    try {
      const currentSession = await getCurrentSession()
      return { user: currentSession.user }
    } catch {
      throw redirect({ to: '/iniciar-sesion' })
    }
  },
  component: AppLayout,
})

function AppLayout() {
  const user = Route.useRouteContext({ select: (context) => context.user })

  return (
    <div className="page-wrap min-h-screen py-5">
      <header className="island-shell flex flex-wrap items-center justify-between gap-4 rounded-2xl px-5 py-4">
        <Link
          to="/app"
          className="display-title text-2xl font-bold no-underline"
        >
          Extin Safe
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-[var(--sea-ink-soft)]">{user.email}</span>
          <button
            className="rounded-lg border border-[var(--line)] px-3 py-1.5 font-semibold"
            onClick={() => {
              void authClient.signOut()
            }}
          >
            Salir
          </button>
        </div>
      </header>
      <Outlet />
    </div>
  )
}
