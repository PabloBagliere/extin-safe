import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import type { FormEvent } from 'react'

import {
  createOrganization,
  listMyOrganizations,
} from '#/lib/organizations.functions'

export const Route = createFileRoute('/app/onboarding')({
  beforeLoad: async () => {
    const organizations = await listMyOrganizations()
    if (organizations.length > 0) {
      throw redirect({ to: '/app' })
    }
  },
  component: OnboardingPage,
})

function OnboardingPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    setError(null)
    setIsSubmitting(true)

    try {
      await createOrganization({
        data: {
          name: String(formData.get('name')),
          type: String(formData.get('type')) as
            'client' | 'maintenance_company',
          taxId: String(formData.get('taxId')) || undefined,
          contactEmail: String(formData.get('contactEmail')) || undefined,
          contactPhone: String(formData.get('contactPhone')) || undefined,
        },
      })
      await navigate({ to: '/app' })
    } catch {
      setError('No pudimos crear la organización. Intentá nuevamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="mx-auto max-w-2xl py-10">
      <form
        className="island-shell rounded-3xl p-7 md:p-10"
        onSubmit={handleSubmit}
      >
        <p className="island-kicker">Configuración inicial</p>
        <h1 className="display-title mt-3 text-4xl font-bold">
          Tu organización
        </h1>
        <p className="mt-3 text-[var(--sea-ink-soft)]">
          Elegí el perfil que representa tu cuenta. Podrás invitar a tu equipo y
          vincularte con la otra parte más adelante.
        </p>
        <fieldset className="mt-7 grid gap-4" disabled={isSubmitting}>
          <label className="grid gap-1.5 font-semibold">
            Nombre de la organización
            <input
              className="rounded-xl border border-[var(--line)] bg-white/70 px-3 py-2 font-normal"
              name="name"
              minLength={2}
              required
            />
          </label>
          <label className="grid gap-1.5 font-semibold">
            Tipo de cuenta
            <select
              className="rounded-xl border border-[var(--line)] bg-white/70 px-3 py-2 font-normal"
              name="type"
              defaultValue="client"
            >
              <option value="client">Cliente o establecimiento</option>
              <option value="maintenance_company">
                Empresa de mantenimiento
              </option>
            </select>
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-1.5 font-semibold">
              CUIT (opcional)
              <input
                className="rounded-xl border border-[var(--line)] bg-white/70 px-3 py-2 font-normal"
                name="taxId"
              />
            </label>
            <label className="grid gap-1.5 font-semibold">
              Teléfono (opcional)
              <input
                className="rounded-xl border border-[var(--line)] bg-white/70 px-3 py-2 font-normal"
                name="contactPhone"
                type="tel"
              />
            </label>
          </div>
          <label className="grid gap-1.5 font-semibold">
            Correo de contacto (opcional)
            <input
              className="rounded-xl border border-[var(--line)] bg-white/70 px-3 py-2 font-normal"
              name="contactEmail"
              type="email"
            />
          </label>
        </fieldset>
        {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
        <button
          className="mt-6 rounded-xl bg-[var(--palm)] px-5 py-3 font-semibold text-[var(--button-primary-text)] disabled:opacity-60"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creando...' : 'Crear organización'}
        </button>
      </form>
    </main>
  )
}
