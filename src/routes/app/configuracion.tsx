import { Link, createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import type { FormEvent } from 'react'

import {
  createMaintenanceRelationship,
  getOrganizationWorkspace,
  inviteOrganizationMember,
  respondToMaintenanceRelationship,
} from '#/lib/organizations.functions'

export const Route = createFileRoute('/app/configuracion')({
  loader: () => getOrganizationWorkspace(),
  component: ConfigurationPage,
})

function ConfigurationPage() {
  const router = useRouter()
  const workspace = Route.useLoaderData()
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const isAdmin =
    workspace.organization.role === 'client_admin' ||
    workspace.organization.role === 'maintenance_admin'

  async function refresh(nextStatusMessage: string) {
    setStatusMessage(nextStatusMessage)
    await router.invalidate()
  }

  async function inviteMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    try {
      await inviteOrganizationMember({
        data: {
          email: String(formData.get('email')),
          role: String(formData.get('role')) as
            | 'client_admin'
            | 'client_operator'
            | 'maintenance_admin'
            | 'technician',
        },
      })
      event.currentTarget.reset()
      await refresh('La invitación quedó pendiente para ese correo.')
    } catch {
      setStatusMessage('No fue posible crear la invitación.')
    }
  }

  async function inviteOrganization(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    try {
      await createMaintenanceRelationship({
        data: { organizationId: String(formData.get('organizationId')) },
      })
      event.currentTarget.reset()
      await refresh('El vínculo quedó pendiente de aceptación.')
    } catch {
      setStatusMessage(
        'No fue posible crear el vínculo. Verificá el identificador.',
      )
    }
  }

  if (!isAdmin) {
    return (
      <main className="py-8">
        <p>No tenés permisos para administrar esta organización.</p>
      </main>
    )
  }

  const memberRoles =
    workspace.organization.type === 'client'
      ? [
          ['client_admin', 'Administrador de cliente'],
          ['client_operator', 'Operador de cliente'],
        ]
      : [
          ['maintenance_admin', 'Administrador de empresa'],
          ['technician', 'Técnico'],
        ]

  return (
    <main className="py-8">
      <Link to="/app" className="text-sm font-semibold">
        Volver al inicio
      </Link>
      <h1 className="mt-4 font-[Fraunces,Georgia,serif] text-4xl font-bold">
        Configuración
      </h1>
      {statusMessage ? (
        <p className="mt-3 text-sm text-[var(--palm)]">{statusMessage}</p>
      ) : null}
      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-[var(--line)] bg-[linear-gradient(165deg,var(--surface-strong),var(--surface))] p-6 shadow-[inset_0_1px_0_var(--inset-glint),0_22px_44px_rgba(137,41,29,0.12),0_6px_18px_rgba(34,38,43,0.08)] backdrop-blur-sm">
          <h2 className="text-xl font-bold">Integrantes</h2>
          <ul className="mt-4 grid gap-2 text-sm">
            {workspace.members.map((member) => (
              <li key={member.id} className="rounded-lg bg-white/40 px-3 py-2">
                {member.name} · {member.email} · {member.role}
              </li>
            ))}
          </ul>
          <form className="mt-5 grid gap-3" onSubmit={inviteMember}>
            <label className="grid gap-1 text-sm font-semibold">
              Correo del integrante
              <input
                className="rounded-lg border border-[var(--line)] bg-white/70 px-3 py-2 font-normal"
                name="email"
                type="email"
                required
              />
            </label>
            <label className="grid gap-1 text-sm font-semibold">
              Rol
              <select
                className="rounded-lg border border-[var(--line)] bg-white/70 px-3 py-2 font-normal"
                name="role"
              >
                {memberRoles.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <button className="rounded-lg bg-[var(--palm)] px-4 py-2 font-semibold text-white hover:bg-[#8f1c14] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[var(--lagoon)] dark:text-[#271310] dark:hover:bg-[#dc5b45]">
              Invitar integrante
            </button>
          </form>
        </article>
        <article className="rounded-2xl border border-[var(--line)] bg-[linear-gradient(165deg,var(--surface-strong),var(--surface))] p-6 shadow-[inset_0_1px_0_var(--inset-glint),0_22px_44px_rgba(137,41,29,0.12),0_6px_18px_rgba(34,38,43,0.08)] backdrop-blur-sm">
          <h2 className="text-xl font-bold">Empresa o cliente vinculado</h2>
          <p className="mt-2 text-sm text-[var(--sea-ink-soft)]">
            Ingresá el identificador de la organización complementaria. La otra
            parte debe aceptar el vínculo antes de acceder a datos.
          </p>
          <form className="mt-5 grid gap-3" onSubmit={inviteOrganization}>
            <label className="grid gap-1 text-sm font-semibold">
              Identificador de organización
              <input
                className="rounded-lg border border-[var(--line)] bg-white/70 px-3 py-2 font-normal"
                name="organizationId"
                placeholder="UUID de organización"
                required
              />
            </label>
            <button className="rounded-lg bg-[var(--palm)] px-4 py-2 font-semibold text-white hover:bg-[#8f1c14] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[var(--lagoon)] dark:text-[#271310] dark:hover:bg-[#dc5b45]">
              Solicitar vínculo
            </button>
          </form>
          <ul className="mt-6 grid gap-2 text-sm">
            {workspace.relationships.map((relationship) => {
              const counterpartId =
                relationship.clientOrganizationId === workspace.organization.id
                  ? relationship.maintenanceOrganizationId
                  : relationship.clientOrganizationId
              const counterpart = workspace.relatedOrganizations.find(
                (organization) => organization.id === counterpartId,
              )
              const canRespond =
                relationship.status === 'pending' &&
                relationship.initiatedByOrganizationId !==
                  workspace.organization.id

              return (
                <li
                  key={relationship.id}
                  className="rounded-lg bg-white/40 px-3 py-3"
                >
                  <p className="font-semibold">
                    {counterpart?.name ?? counterpartId}
                  </p>
                  <p className="mt-1 text-[var(--sea-ink-soft)]">
                    Estado: {relationship.status}
                  </p>
                  {canRespond ? (
                    <div className="mt-3 flex gap-2">
                      <button
                        className="rounded-md bg-[var(--palm)] px-3 py-1.5 font-semibold text-white hover:bg-[#8f1c14] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[var(--lagoon)] dark:text-[#271310] dark:hover:bg-[#dc5b45]"
                        onClick={() => {
                          void respondToMaintenanceRelationship({
                            data: {
                              relationshipId: relationship.id,
                              accept: true,
                            },
                          }).then(() => refresh('Vínculo aceptado.'))
                        }}
                      >
                        Aceptar
                      </button>
                      <button
                        className="rounded-md border border-[var(--line)] px-3 py-1.5 font-semibold"
                        onClick={() => {
                          void respondToMaintenanceRelationship({
                            data: {
                              relationshipId: relationship.id,
                              accept: false,
                            },
                          }).then(() => refresh('Vínculo rechazado.'))
                        }}
                      >
                        Rechazar
                      </button>
                    </div>
                  ) : null}
                </li>
              )
            })}
          </ul>
        </article>
      </section>
    </main>
  )
}
