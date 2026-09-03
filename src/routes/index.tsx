import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <main className="page-wrap flex min-h-screen items-center py-12">
      <section className="island-shell w-full rounded-3xl p-8 md:p-14">
        <p className="island-kicker">Control de extintores</p>
        <h1 className="display-title mt-4 max-w-3xl text-5xl font-bold tracking-tight md:text-7xl">
          Tu seguridad, organizada.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--sea-ink-soft)]">
          Extin Safe centraliza los equipos, responsables y próximos controles
          de cada establecimiento.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/registro"
            className="primary-action rounded-xl px-5 py-3 font-semibold"
          >
            Crear cuenta
          </Link>
          <Link
            to="/iniciar-sesion"
            className="rounded-xl border border-[var(--line)] px-5 py-3 font-semibold no-underline"
          >
            Iniciar sesión
          </Link>
        </div>
      </section>
    </main>
  )
}
