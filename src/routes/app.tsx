import {
  Link,
  Outlet,
  createFileRoute,
  redirect,
  useNavigate,
} from '@tanstack/react-router'

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
  const navigate = useNavigate()

  async function handleSignOut() {
    await authClient.signOut()
    await navigate({ to: '/' })
  }

  return (
    <div className="mx-auto min-h-screen w-[calc(100%-2rem)] max-w-[1080px] py-5">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--line)] bg-[linear-gradient(165deg,var(--surface-strong),var(--surface))] px-5 py-4 shadow-[inset_0_1px_0_var(--inset-glint),0_22px_44px_rgba(137,41,29,0.12),0_6px_18px_rgba(34,38,43,0.08)] backdrop-blur-sm">
        <Link
          to="/app"
          className="font-[Fraunces,Georgia,serif] text-2xl font-bold no-underline"
        >
          Extin Safe
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-[var(--sea-ink-soft)]">{user.email}</span>
          <button
            className="cursor-pointer rounded-lg border border-[var(--line)] px-3 py-1.5 font-semibold transition-colors hover:bg-white"
            onClick={() => {
              void handleSignOut()
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
