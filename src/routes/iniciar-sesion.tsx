import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import type { FormEvent } from 'react'

import { authClient } from '#/lib/auth-client'

export const Route = createFileRoute('/iniciar-sesion')({
  component: SignInPage,
})

function SignInPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    setError(null)
    setIsSubmitting(true)

    const { error: signInError } = await authClient.signIn.email({
      email: String(formData.get('email')),
      password: String(formData.get('password')),
    })

    setIsSubmitting(false)
    if (signInError) {
      setError('Correo o contraseña incorrectos.')
      return
    }

    await navigate({ to: '/app' })
  }

  return (
    <main className="page-wrap flex min-h-screen items-center py-10">
      <form
        className="island-shell mx-auto w-full max-w-lg rounded-3xl p-7 md:p-10"
        onSubmit={handleSubmit}
      >
        <p className="island-kicker">Área privada</p>
        <h1 className="display-title mt-3 text-4xl font-bold">
          Iniciar sesión
        </h1>
        <fieldset className="mt-7 grid gap-4" disabled={isSubmitting}>
          <label className="grid gap-1.5 font-semibold">
            Correo electrónico
            <input
              className="rounded-xl border border-[var(--line)] bg-white/70 px-3 py-2 font-normal"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </label>
          <label className="grid gap-1.5 font-semibold">
            Contraseña
            <input
              className="rounded-xl border border-[var(--line)] bg-white/70 px-3 py-2 font-normal"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
        </fieldset>
        {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
        <button
          className="mt-6 w-full rounded-xl bg-[var(--palm)] px-5 py-3 font-semibold text-white hover:bg-[#8f1c14] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[var(--lagoon)] disabled:opacity-60 dark:text-[#271310] dark:hover:bg-[#dc5b45]"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Ingresando...' : 'Ingresar'}
        </button>
        <p className="mt-5 text-sm text-[var(--sea-ink-soft)]">
          ¿Todavía no tenés cuenta? <Link to="/registro">Registrate</Link>
        </p>
      </form>
    </main>
  )
}
