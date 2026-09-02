import { Link, createFileRoute, redirect } from '@tanstack/react-router'

import {
  getOrganizationWorkspace,
  listMyOrganizations,
} from '#/lib/organizations.functions'

export const Route = createFileRoute('/app/')({
  beforeLoad: async () => {
    const organizations = await listMyOrganizations()
    if (organizations.length === 0) {
      throw redirect({ to: '/app/onboarding' })
    }
  },
  loader: () => getOrganizationWorkspace(),
  component: Dashboard,
})

function Dashboard() {
  const workspace = Route.useLoaderData()
  const isAdmin =
    workspace.organization.role === 'client_admin' ||
    workspace.organization.role === 'maintenance_admin'

  return (
    <main className="py-8">
      <section className="island-shell rounded-3xl p-7 md:p-10">
        <p className="island-kicker">
          {workspace.organization.type === 'client'
            ? 'Cliente'
            : 'Empresa de mantenimiento'}
        </p>
        <h1 className="display-title mt-3 text-4xl font-bold">
          {workspace.organization.name}
        </h1>
        <p className="mt-3 text-[var(--sea-ink-soft)]">
          Organización activa. El inventario y los establecimientos se
          incorporarán en la próxima fase.
        </p>
        {isAdmin ? (
          <Link
            to="/app/configuracion"
            className="mt-6 inline-block rounded-xl bg-[var(--palm)] px-5 py-3 font-semibold text-white no-underline"
          >
            Administrar equipo y vínculos
          </Link>
        ) : null}
      </section>
      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <article className="feature-card rounded-2xl border border-[var(--line)] p-6">
          <h2 className="text-lg font-bold">Equipo</h2>
          <p className="mt-2 text-sm text-[var(--sea-ink-soft)]">
            {workspace.members.length} integrante(s) con acceso activo.
          </p>
        </article>
        <article className="feature-card rounded-2xl border border-[var(--line)] p-6">
          <h2 className="text-lg font-bold">Vínculos de mantenimiento</h2>
          <p className="mt-2 text-sm text-[var(--sea-ink-soft)]">
            {workspace.relationships.length} vínculo(s) registrado(s).
          </p>
        </article>
      </section>
    </main>
  )
}
