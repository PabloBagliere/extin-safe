import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <main className="mx-auto min-h-screen w-[calc(100%-2rem)] max-w-[1180px] py-6 md:py-10">
      <header className="flex items-center justify-between">
        <span className="text-lg font-black tracking-[-0.04em] text-[var(--sea-ink)]">
          extin<span className="text-[var(--lagoon-deep)]">safe</span>
        </span>
        <Link
          to="/iniciar-sesion"
          className="rounded-full px-4 py-2 text-sm font-bold text-[var(--sea-ink)] no-underline transition-colors hover:bg-white"
        >
          Ingresar
        </Link>
      </header>
      <section className="mt-6 grid overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[var(--surface-strong)] shadow-[0_24px_60px_rgba(16,42,67,0.12)] lg:grid-cols-[1.1fr_0.9fr]">
        <div className="p-8 md:p-14">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--kicker)]">
            Gestión contra incendios
          </p>
          <h1 className="mt-5 max-w-xl text-5xl font-black leading-[0.95] tracking-[-0.06em] text-[var(--sea-ink)] md:text-7xl">
            El control no debería vivir en una planilla.
          </h1>
          <p className="mt-7 max-w-lg text-lg leading-8 text-[var(--sea-ink-soft)]">
            Organizá extintores, responsables y vencimientos de cada sede en un
            solo lugar.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              to="/registro"
              className="rounded-xl bg-[var(--palm)] px-5 py-3 font-bold text-white no-underline shadow-[0_8px_18px_rgba(194,65,12,0.28)] transition-colors hover:bg-[#9a3412] hover:text-white focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[var(--lagoon)]"
            >
              Empezar ahora
            </Link>
            <Link
              to="/iniciar-sesion"
              className="rounded-xl border border-[var(--line)] px-5 py-3 font-bold text-[var(--sea-ink)] no-underline transition-colors hover:bg-[#edf3f8]"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>
        <div className="bg-[#102a43] p-6 text-white md:p-10">
          <div className="flex items-center justify-between border-b border-white/15 pb-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#fdba74]">
                Panel de control
              </p>
              <p className="mt-1 text-sm text-[#b2c2d2]">Sede central</p>
            </div>
            <span className="rounded-full bg-[#fb923c] px-3 py-1 text-xs font-black text-[#102a43]">
              03 alertas
            </span>
          </div>
          <div className="mt-7 rounded-2xl bg-white p-5 text-[#102a43] shadow-[0_16px_30px_rgba(0,0,0,0.18)]">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#52637a]">
              Próximo control
            </p>
            <p className="mt-2 text-3xl font-black tracking-[-0.05em]">
              14 días
            </p>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#edf3f8]">
              <div className="h-full w-[72%] rounded-full bg-[#fb923c]" />
            </div>
          </div>
          <div className="mt-5 grid gap-3 text-sm">
            <div className="flex items-center justify-between rounded-xl border border-white/15 px-4 py-3">
              <span>Extintor ABC 5 kg</span>
              <span className="font-bold text-[#86efac]">Al día</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-white/15 px-4 py-3">
              <span>Extintor CO2</span>
              <span className="font-bold text-[#fdba74]">Próximo</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-white/15 px-4 py-3">
              <span>Gabinete 02</span>
              <span className="font-bold text-[#fca5a5]">Vencido</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
