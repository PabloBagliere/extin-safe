import { Link, createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import type { FormEvent } from 'react'

import { getExtinguisher, recordMaintenance } from '#/lib/inventory.functions'

export const Route = createFileRoute('/app/extintores/$extinguisherId')({
  loader: ({ params }) => getExtinguisher({ data: params }),
  component: ExtinguisherPage,
})

function ExtinguisherPage() {
  const router = useRouter()
  const { extinguisher, events } = Route.useLoaderData()
  const [message, setMessage] = useState<string | null>(null)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    try {
      await recordMaintenance({
        data: {
          extinguisherId: extinguisher.id,
          eventType: String(form.get('eventType')) as
            | 'control'
            | 'recharge'
            | 'repair'
            | 'installation'
            | 'replacement'
            | 'decommission',
          performedOn: String(form.get('performedOn')),
          resultingOperationalStatus: String(form.get('operationalStatus')) as
            'active' | 'attention_required' | 'out_of_service',
          resultingNextControlDueOn:
            String(form.get('nextControlDueOn')) || undefined,
          notes: String(form.get('notes')) || undefined,
        },
      })
      event.currentTarget.reset()
      setMessage('Intervención registrada.')
      await router.invalidate()
    } catch {
      setMessage(
        'No fue posible registrar la intervención. Solo la empresa asignada puede hacerlo.',
      )
    }
  }
  return (
    <main className="py-8">
      <Link
        to="/app/establecimientos/$establishmentId"
        params={{ establishmentId: extinguisher.establishmentId }}
        className="text-sm font-semibold"
      >
        Volver al inventario
      </Link>
      <h1 className="mt-4 font-[Fraunces,Georgia,serif] text-4xl font-bold">
        {extinguisher.code}
      </h1>
      <p className="mt-2 text-[var(--sea-ink-soft)]">
        {extinguisher.locationDescription} · próximo control:{' '}
        {extinguisher.nextControlDueOn ?? 'sin fecha'}
      </p>
      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
          <h2 className="text-lg font-bold">Historial de mantenimiento</h2>
          <ol className="mt-4 grid gap-3">
            {events.length ? (
              events.map((item) => (
                <li
                  key={item.id}
                  className="border-l-2 border-[var(--lagoon)] pl-3"
                >
                  <p className="font-semibold">
                    {item.eventType} · {item.performedOn}
                  </p>
                  <p className="text-sm text-[var(--sea-ink-soft)]">
                    Estado: {item.resultingOperationalStatus}. Próximo control:{' '}
                    {item.resultingNextControlDueOn ?? 'sin fecha'}.
                  </p>
                  {item.notes ? (
                    <p className="mt-1 text-sm">{item.notes}</p>
                  ) : null}
                </li>
              ))
            ) : (
              <li className="text-[var(--sea-ink-soft)]">
                No hay intervenciones registradas.
              </li>
            )}
          </ol>
        </article>
        <form
          className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5"
          onSubmit={submit}
        >
          <h2 className="text-lg font-bold">Registrar mantenimiento</h2>
          <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
            Disponible para la empresa de mantenimiento asignada.
          </p>
          <div className="mt-4 grid gap-3">
            <Select
              label="Intervención"
              name="eventType"
              values={[
                ['control', 'Control'],
                ['recharge', 'Recarga'],
                ['repair', 'Reparación'],
                ['installation', 'Instalación'],
                ['replacement', 'Reemplazo'],
                ['decommission', 'Baja'],
              ]}
            />
            <Input
              label="Fecha realizada"
              name="performedOn"
              type="date"
              required
            />
            <Select
              label="Estado resultante"
              name="operationalStatus"
              values={[
                ['active', 'Activo'],
                ['attention_required', 'Requiere atención'],
                ['out_of_service', 'Fuera de servicio'],
              ]}
            />
            <Input
              label="Próximo control"
              name="nextControlDueOn"
              type="date"
            />
            <label className="grid gap-1 text-sm font-semibold">
              Observaciones
              <textarea
                className="rounded-lg border border-[var(--line)] bg-white/70 px-3 py-2 font-normal"
                name="notes"
                rows={3}
              />
            </label>
          </div>
          {message ? <p className="mt-3 text-sm">{message}</p> : null}
          <button className="mt-4 rounded-lg bg-[var(--palm)] px-4 py-2 font-semibold text-white">
            Registrar intervención
          </button>
        </form>
      </section>
    </main>
  )
}
function Input({
  label,
  name,
  required,
  type = 'text',
}: {
  label: string
  name: string
  required?: boolean
  type?: string
}) {
  return (
    <label className="grid gap-1 text-sm font-semibold">
      {label}
      <input
        className="rounded-lg border border-[var(--line)] bg-white/70 px-3 py-2 font-normal"
        name={name}
        type={type}
        required={required}
      />
    </label>
  )
}
function Select({
  label,
  name,
  values,
}: {
  label: string
  name: string
  values: string[][]
}) {
  return (
    <label className="grid gap-1 text-sm font-semibold">
      {label}
      <select
        className="rounded-lg border border-[var(--line)] bg-white/70 px-3 py-2 font-normal"
        name={name}
      >
        {values.map(([value, text]) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </select>
    </label>
  )
}
