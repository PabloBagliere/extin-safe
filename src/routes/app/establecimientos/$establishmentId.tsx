import { Link, createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import type { FormEvent } from 'react'

import {
  createExtinguisher,
  extinguisherTypes,
  listExtinguishers,
} from '#/lib/inventory.functions'

export const Route = createFileRoute('/app/establecimientos/$establishmentId')({
  loader: ({ params }) =>
    listExtinguishers({ data: { establishmentId: params.establishmentId } }),
  component: InventoryPage,
})

const labels: Record<(typeof extinguisherTypes)[number], string> = {
  water: 'Agua',
  foam: 'Espuma',
  dry_chemical_powder: 'Polvo químico seco',
  carbon_dioxide: 'Dióxido de carbono',
  clean_agent: 'Agente limpio',
  wet_chemical: 'Químico húmedo',
  other: 'Otro',
}

function InventoryPage() {
  const router = useRouter()
  const inventory = Route.useLoaderData()
  const { establishmentId } = Route.useParams()
  const [message, setMessage] = useState<string | null>(null)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    try {
      await createExtinguisher({
        data: {
          establishmentId,
          code: String(form.get('code')),
          type: String(form.get('type')) as (typeof extinguisherTypes)[number],
          fireClasses: form.getAll('fireClasses') as Array<
            'A' | 'B' | 'C' | 'D' | 'K/F'
          >,
          capacityValue: Number(form.get('capacityValue')),
          capacityUnit: String(form.get('capacityUnit')) as
            'kg' | 'l' | 'other',
          locationDescription: String(form.get('locationDescription')),
          brand: String(form.get('brand')) || undefined,
          serialNumber: String(form.get('serialNumber')) || undefined,
          nextControlDueOn: String(form.get('nextControlDueOn')) || undefined,
          operationalStatus: 'active',
        },
      })
      event.currentTarget.reset()
      setMessage('Extintor incorporado.')
      await router.invalidate()
    } catch {
      setMessage(
        'No fue posible guardar el extintor. Revisá código, serie y campos obligatorios.',
      )
    }
  }
  return (
    <main className="py-8">
      <Link to="/app/establecimientos" className="text-sm font-semibold">
        Volver a establecimientos
      </Link>
      <h1 className="mt-4 font-[Fraunces,Georgia,serif] text-4xl font-bold">
        Inventario
      </h1>
      <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_24rem]">
        <div className="overflow-x-auto rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--line)]">
                <th className="p-3">Código</th>
                <th className="p-3">Ubicación</th>
                <th className="p-3">Próximo control</th>
                <th className="p-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {inventory.items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-[var(--line)] last:border-0"
                >
                  <td className="p-3 font-semibold">
                    <Link
                      to="/app/extintores/$extinguisherId"
                      params={{ extinguisherId: item.id }}
                    >
                      {item.code}
                    </Link>
                  </td>
                  <td className="p-3">{item.locationDescription}</td>
                  <td className="p-3">
                    {item.nextControlDueOn ?? 'Sin fecha'}
                  </td>
                  <td className="p-3">
                    <Status status={item.complianceStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {inventory.items.length ? null : (
            <p className="p-5 text-[var(--sea-ink-soft)]">
              No hay extintores cargados.
            </p>
          )}
        </div>
        <form
          className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5"
          onSubmit={submit}
        >
          <h2 className="text-lg font-bold">Agregar extintor</h2>
          <div className="mt-4 grid gap-3">
            <Input label="Código" name="code" required />
            <label className="grid gap-1 text-sm font-semibold">
              Tipo
              <select
                className="rounded-lg border border-[var(--line)] bg-white/70 px-3 py-2 font-normal"
                name="type"
              >
                {extinguisherTypes.map((type) => (
                  <option key={type} value={type}>
                    {labels[type]}
                  </option>
                ))}
              </select>
            </label>
            <Input
              label="Capacidad"
              name="capacityValue"
              type="number"
              required
            />
            <label className="grid gap-1 text-sm font-semibold">
              Unidad
              <select
                className="rounded-lg border border-[var(--line)] bg-white/70 px-3 py-2 font-normal"
                name="capacityUnit"
              >
                <option value="kg">kg</option>
                <option value="l">litros</option>
                <option value="other">otra</option>
              </select>
            </label>
            <Input label="Ubicación" name="locationDescription" required />
            <Input
              label="Próximo control"
              name="nextControlDueOn"
              type="date"
            />
            <Input label="Marca" name="brand" />
            <Input label="Número de serie" name="serialNumber" />
          </div>
          <fieldset className="mt-3">
            <legend className="text-sm font-semibold">Clases de fuego</legend>
            <div className="mt-1 flex gap-3 text-sm">
              {['A', 'B', 'C', 'D', 'K/F'].map((value) => (
                <label key={value}>
                  <input
                    name="fireClasses"
                    type="checkbox"
                    value={value}
                    defaultChecked={value === 'A'}
                  />{' '}
                  {value}
                </label>
              ))}
            </div>
          </fieldset>
          {message ? <p className="mt-3 text-sm">{message}</p> : null}
          <button className="mt-4 rounded-lg bg-[var(--palm)] px-4 py-2 font-semibold text-white">
            Agregar
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
        min={type === 'number' ? '0.01' : undefined}
        required={required}
      />
    </label>
  )
}
function Status({ status }: { status: string }) {
  const label =
    status === 'in_rule'
      ? 'En regla'
      : status === 'due_soon'
        ? 'Próximo a revisión'
        : 'Vencido o atención'
  const color =
    status === 'in_rule'
      ? 'bg-emerald-100 text-emerald-900'
      : status === 'due_soon'
        ? 'bg-amber-100 text-amber-900'
        : 'bg-red-100 text-red-900'
  return (
    <span className={`rounded-full px-2 py-1 text-xs font-bold ${color}`}>
      {label}
    </span>
  )
}
