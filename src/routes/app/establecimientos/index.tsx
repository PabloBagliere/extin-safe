import { Link, createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import type { FormEvent } from 'react'

import {
  createEstablishment,
  listEstablishments,
} from '#/lib/inventory.functions'

export const Route = createFileRoute('/app/establecimientos/')({
  loader: () => listEstablishments(),
  component: EstablishmentsPage,
})

function EstablishmentsPage() {
  const router = useRouter()
  const establishments = Route.useLoaderData()
  const [message, setMessage] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    try {
      await createEstablishment({
        data: {
          name: String(form.get('name')),
          addressLine: String(form.get('addressLine')),
          city: String(form.get('city')),
          province: String(form.get('province')),
          contactName: String(form.get('contactName')) || undefined,
          contactEmail: String(form.get('contactEmail')) || undefined,
          contactPhone: String(form.get('contactPhone')) || undefined,
        },
      })
      event.currentTarget.reset()
      setMessage('Establecimiento creado.')
      await router.invalidate()
    } catch {
      setMessage(
        'No fue posible crear el establecimiento. Verificá los datos y tus permisos.',
      )
    }
  }

  return (
    <main className="py-8">
      <Link to="/app" className="text-sm font-semibold">
        Volver al tablero
      </Link>
      <h1 className="mt-4 font-[Fraunces,Georgia,serif] text-4xl font-bold">
        Establecimientos
      </h1>
      <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="grid gap-3">
          {establishments.length ? (
            establishments.map((establishment) => (
              <Link
                key={establishment.id}
                to="/app/establecimientos/$establishmentId"
                params={{ establishmentId: establishment.id }}
                className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 no-underline transition hover:border-[var(--lagoon-deep)]"
              >
                <h2 className="font-bold">{establishment.name}</h2>
                <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
                  {establishment.addressLine}, {establishment.city},{' '}
                  {establishment.province}
                </p>
              </Link>
            ))
          ) : (
            <p className="rounded-2xl border border-dashed border-[var(--line)] p-6 text-[var(--sea-ink-soft)]">
              Todavía no hay establecimientos cargados.
            </p>
          )}
        </div>
        <form
          className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5"
          onSubmit={handleSubmit}
        >
          <h2 className="text-lg font-bold">Nuevo establecimiento</h2>
          <div className="mt-4 grid gap-3">
            <Field label="Nombre" name="name" required />
            <Field label="Dirección" name="addressLine" required />
            <Field label="Localidad" name="city" required />
            <Field label="Provincia" name="province" required />
            <Field label="Contacto" name="contactName" />
            <Field
              label="Correo de contacto"
              name="contactEmail"
              type="email"
            />
            <Field label="Teléfono" name="contactPhone" type="tel" />
          </div>
          {message ? <p className="mt-3 text-sm">{message}</p> : null}
          <button className="mt-4 rounded-lg bg-[var(--palm)] px-4 py-2 font-semibold text-white">
            Crear establecimiento
          </button>
        </form>
      </section>
    </main>
  )
}

function Field({
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
