import { Link, createFileRoute, redirect } from '@tanstack/react-router'

import {
  getOrganizationWorkspace,
  listMyOrganizations,
} from '#/lib/organizations.functions'
import { getDashboard } from '#/lib/inventory.functions'

export const Route = createFileRoute('/app/')({
  beforeLoad: async () => {
    const organizations = await listMyOrganizations()
    if (organizations.length === 0) {
      throw redirect({ to: '/app/onboarding' })
    }
  },
  loader: async () => {
    const [workspace, dashboard] = await Promise.all([
      getOrganizationWorkspace(),
      getDashboard(),
    ])
    return { workspace, dashboard }
  },
  component: Dashboard,
})

function Dashboard() {
  const { workspace, dashboard } = Route.useLoaderData()
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
          Controlá el estado del inventario y los próximos vencimientos.
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
      <section className="mt-6 grid gap-4 md:grid-cols-4">
        <article className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
          <p className="text-sm text-[var(--sea-ink-soft)]">Equipos activos</p>
          <p className="mt-2 text-3xl font-bold">{dashboard.counts.total}</p>
        </article>
        <article className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
          <p className="text-sm text-[var(--sea-ink-soft)]">En regla</p>
          <p className="mt-2 text-3xl font-bold text-emerald-700">
            {dashboard.counts.inRule}
          </p>
        </article>
        <article className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
          <p className="text-sm text-[var(--sea-ink-soft)]">
            Próximos a revisión
          </p>
          <p className="mt-2 text-3xl font-bold text-amber-700">
            {dashboard.counts.dueSoon}
          </p>
        </article>
        <article className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
          <p className="text-sm text-[var(--sea-ink-soft)]">
            Vencidos o con atención
          </p>
          <p className="mt-2 text-3xl font-bold text-red-700">
            {dashboard.counts.overdue}
          </p>
        </article>
      </section>
      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-[var(--line)] bg-[linear-gradient(165deg,color-mix(in_oklab,var(--surface-strong)_93%,white_7%),var(--surface))] p-6 shadow-[inset_0_1px_0_var(--inset-glint),0_18px_34px_rgba(137,41,29,0.1),0_4px_14px_rgba(34,38,43,0.06)] transition-[border-color,transform] hover:-translate-y-0.5 hover:border-[var(--lagoon-deep)]">
          <h2 className="text-lg font-bold">Establecimientos</h2>
          <p className="mt-2 text-sm text-[var(--sea-ink-soft)]">
            Gestioná sedes e inventario de extintores.
          </p>
          <Link
            to="/app/establecimientos"
            className="mt-4 inline-block font-semibold"
          >
            Abrir establecimientos
          </Link>
        </article>
        <article className="rounded-2xl border border-[var(--line)] bg-[linear-gradient(165deg,color-mix(in_oklab,var(--surface-strong)_93%,white_7%),var(--surface))] p-6 shadow-[inset_0_1px_0_var(--inset-glint),0_18px_34px_rgba(137,41,29,0.1),0_4px_14px_rgba(34,38,43,0.06)] transition-[border-color,transform] hover:-translate-y-0.5 hover:border-[var(--lagoon-deep)]">
          <h2 className="text-lg font-bold">Atención prioritaria</h2>
          <p className="mt-2 text-sm text-[var(--sea-ink-soft)]">
            {dashboard.upcoming.length} equipo(s) requieren seguimiento.
          </p>
          {dashboard.upcoming.slice(0, 3).map((item) => (
            <Link
              key={item.id}
              to="/app/extintores/$extinguisherId"
              params={{ extinguisherId: item.id }}
              className="mt-2 block text-sm font-semibold"
            >
              {item.code} · {item.nextControlDueOn ?? 'Sin fecha'}
            </Link>
          ))}
        </article>
      </section>
    </main>
  )
}
