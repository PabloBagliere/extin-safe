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
      <section className="rounded-3xl border border-[var(--line)] bg-[linear-gradient(165deg,var(--surface-strong),var(--surface))] p-7 shadow-[inset_0_1px_0_var(--inset-glint),0_22px_44px_rgba(137,41,29,0.12),0_6px_18px_rgba(34,38,43,0.08)] backdrop-blur-sm md:p-10">
        <p className="text-[0.69rem] font-bold uppercase tracking-[0.16em] text-[var(--kicker)]">
          {workspace.organization.type === 'client'
            ? 'Cliente'
            : 'Empresa de mantenimiento'}
        </p>
        <h1 className="mt-3 font-[Fraunces,Georgia,serif] text-4xl font-bold">
          {workspace.organization.name}
        </h1>
        <p className="mt-3 text-[var(--sea-ink-soft)]">
          Organización activa. El inventario y los establecimientos se
          incorporarán en la próxima fase.
        </p>
        {isAdmin ? (
          <Link
            to="/app/configuracion"
            className="mt-6 inline-block rounded-xl bg-[var(--palm)] px-5 py-3 font-semibold text-white no-underline shadow-[0_8px_18px_rgba(194,65,12,0.28)] transition-colors hover:bg-[#9a3412] hover:text-white focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[var(--lagoon)]"
          >
            Administrar equipo y vínculos
          </Link>
        ) : null}
      </section>
      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-[var(--line)] bg-[linear-gradient(165deg,color-mix(in_oklab,var(--surface-strong)_93%,white_7%),var(--surface))] p-6 shadow-[inset_0_1px_0_var(--inset-glint),0_18px_34px_rgba(137,41,29,0.1),0_4px_14px_rgba(34,38,43,0.06)] transition-[border-color,transform] hover:-translate-y-0.5 hover:border-[var(--lagoon-deep)]">
          <h2 className="text-lg font-bold">Equipo</h2>
          <p className="mt-2 text-sm text-[var(--sea-ink-soft)]">
            {workspace.members.length} integrante(s) con acceso activo.
          </p>
        </article>
        <article className="rounded-2xl border border-[var(--line)] bg-[linear-gradient(165deg,color-mix(in_oklab,var(--surface-strong)_93%,white_7%),var(--surface))] p-6 shadow-[inset_0_1px_0_var(--inset-glint),0_18px_34px_rgba(137,41,29,0.1),0_4px_14px_rgba(34,38,43,0.06)] transition-[border-color,transform] hover:-translate-y-0.5 hover:border-[var(--lagoon-deep)]">
          <h2 className="text-lg font-bold">Vínculos de mantenimiento</h2>
          <p className="mt-2 text-sm text-[var(--sea-ink-soft)]">
            {workspace.relationships.length} vínculo(s) registrado(s).
          </p>
        </article>
      </section>
    </main>
  )
}
