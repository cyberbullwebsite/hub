import { useState } from 'react'
import { ArrowRight, Eye, EyeOff, Loader2, Mail, Shield, UserRound } from 'lucide-react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '@/context/LanguageContext'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { FieldNote } from '@/components/ui/FieldNote'
import { Logo } from '@/components/ui/Logo'
import { LanguageSelector } from '@/components/ui/LanguageSelector'
import { AnimatedStep } from '@/components/ui/AnimatedStep'

const registerSchema = z
  .object({
    firstName: z.string().min(1, 'Voornaam is verplicht'),
    lastName: z.string().min(1, 'Achternaam is verplicht'),
    email: z.string().email('Voer een geldig e-mailadres in'),
    password: z.string().min(8, 'Wachtwoord moet minstens 8 tekens bevatten'),
    confirmPassword: z.string().min(8, 'Bevestig je wachtwoord'),
    terms: z.boolean().refine((value) => value, 'Je moet akkoord gaan met de voorwaarden'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Wachtwoorden komen niet overeen',
    path: ['confirmPassword'],
  })

const loginSchema = z.object({
  email: z.string().email('Voer een geldig e-mailadres in'),
  password: z.string().min(1, 'Wachtwoord is verplicht'),
})

const resetSchema = z.object({
  email: z.string().email('Voer een geldig e-mailadres in'),
})

type RegisterForm = z.infer<typeof registerSchema>
type LoginForm = z.infer<typeof loginSchema>
type ResetForm = z.infer<typeof resetSchema>
type View = 'landing' | 'login' | 'register' | 'forgot' | 'owner'

export function AuthCard() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { login, register, resetPassword, refreshProfile, error } = useAuth()
  const [view, setView] = useState<View>('landing')
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: false,
    },
    mode: 'onChange',
  })

  const resetForm = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: '' },
  })

  const ownerForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const goDashboard = async () => {
    navigate('/dashboard')
  }

  const handleLogin = loginForm.handleSubmit(async (values) => {
    setSubmitting(true)
    setNotice(null)
    try {
      await login(values.email, values.password)
      await refreshProfile()
      await goDashboard()
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Aanmelden mislukt.')
    } finally {
      setSubmitting(false)
    }
  })

  const handleRegister = registerForm.handleSubmit(async (values) => {
    setSubmitting(true)
    setNotice(null)
    try {
      await register({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        language: 'nl',
      })
      await refreshProfile()
      await goDashboard()
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Account aanmaken mislukt.')
    } finally {
      setSubmitting(false)
    }
  })

  const handleReset = resetForm.handleSubmit(async (values) => {
    setSubmitting(true)
    setNotice(null)
    try {
      await resetPassword(values.email)
      setNotice(t.auth.resetSuccess)
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Resetlink verzenden mislukt.')
    } finally {
      setSubmitting(false)
    }
  })

  const handleOwner = ownerForm.handleSubmit(async (values) => {
    setSubmitting(true)
    setNotice(null)
    try {
      await login(values.email, values.password)
      await refreshProfile()
      await goDashboard()
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Owner login mislukt.')
    } finally {
      setSubmitting(false)
    }
  })

  const passwordPlaceholder = view === 'register' ? t.auth.smartschoolPlaceholder : t.auth.cyberbullPlaceholder

  const content = () => {
    if (view === 'landing') {
      return (
        <AnimatedStep stepKey="landing">
          <div className="space-y-6 text-center">
            <div className="flex items-start justify-end">
              <LanguageSelector />
            </div>

            <div className="flex flex-col items-center gap-5">
              <Logo className="w-48 max-w-full object-contain sm:w-56" />
              <div className="space-y-2">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-[2.1rem]">
                  {t.landing.title}
                </h1>
                <p className="text-[17px] text-slate-500">{t.landing.subtitle}</p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <Button variant="primary" className="w-full rounded-[18px] py-4 text-lg shadow-lg shadow-cyberblue/15" onClick={() => setView('login')}>
                {t.auth.login}
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button variant="success" className="w-full rounded-[18px] py-4 text-lg shadow-lg shadow-cybergreen/15" onClick={() => setView('register')}>
                {t.auth.createAccount}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setView('owner')}
                className="text-[15px] text-slate-500 transition hover:text-slate-800 hover:underline"
              >
                {t.landing.ownerLink}
              </button>
            </div>
          </div>
        </AnimatedStep>
      )
    }

    if (view === 'login') {
      return (
        <AnimatedStep stepKey="login">
          <form className="space-y-5" onSubmit={handleLogin}>
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold text-slate-900">{t.auth.login}</h2>
              <p className="text-sm text-slate-500">{t.landing.subtitle}</p>
            </div>

            <Input
              label={t.auth.email}
              type="email"
              placeholder={t.common.emailPlaceholder}
              error={loginForm.formState.errors.email?.message}
              autoComplete="email"
              leftIcon={<Mail className="h-4 w-4" />}
              {...loginForm.register('email')}
            />

            <div className="space-y-2">
              <Input
                label={t.auth.password}
                type={showPassword ? 'text' : 'password'}
                placeholder={passwordPlaceholder}
                error={loginForm.formState.errors.password?.message}
                autoComplete="current-password"
                leftIcon={<Shield className="h-4 w-4" />}
                {...loginForm.register('password')}
              />
              <FieldNote>{view === 'register' ? 'Minstens 8 tekens.' : ' '}</FieldNote>
            </div>

            <div className="flex items-center justify-between gap-3 text-sm">
              <button type="button" className="text-slate-500 transition hover:text-cyberblue" onClick={() => setView('forgot')}>
                {t.auth.forgotPassword}
              </button>
              <button type="button" className="text-slate-500 transition hover:text-cyberblue" onClick={() => setView('landing')}>
                {t.auth.back}
              </button>
            </div>

            {notice ? <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">{notice}</p> : null}
            {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

            <Button type="submit" className="w-full" isLoading={submitting}>
              {submitting ? t.auth.loading : t.auth.loginButton}
              {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
            </Button>

            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="mx-auto block text-xs font-medium text-slate-500 hover:text-slate-700"
            >
              {showPassword ? 'Hide password' : 'Show password'}
            </button>
          </form>
        </AnimatedStep>
      )
    }

    if (view === 'register') {
      return (
        <AnimatedStep stepKey="register">
          <form className="space-y-5" onSubmit={handleRegister}>
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold text-slate-900">{t.auth.createAccount}</h2>
              <p className="text-sm text-slate-500">
                {t.landing.subtitle === 'Log in or create an account' ? 'Fill in your details to get started.' : 'Vul je gegevens in om te beginnen.'}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label={t.auth.firstName}
                error={registerForm.formState.errors.firstName?.message}
                autoComplete="given-name"
                leftIcon={<UserRound className="h-4 w-4" />}
                {...registerForm.register('firstName')}
              />
              <Input
                label={t.auth.lastName}
                error={registerForm.formState.errors.lastName?.message}
                autoComplete="family-name"
                leftIcon={<UserRound className="h-4 w-4" />}
                {...registerForm.register('lastName')}
              />
            </div>

            <Input
              label={t.auth.email}
              type="email"
              placeholder={t.common.emailPlaceholder}
              error={registerForm.formState.errors.email?.message}
              autoComplete="email"
              leftIcon={<Mail className="h-4 w-4" />}
              {...registerForm.register('email')}
            />

            <div className="space-y-2">
              <Input
                label={t.auth.password}
                type={showPassword ? 'text' : 'password'}
                placeholder={passwordPlaceholder}
                error={registerForm.formState.errors.password?.message}
                autoComplete="new-password"
                leftIcon={<Shield className="h-4 w-4" />}
                {...registerForm.register('password')}
              />
              <FieldNote>{t.landing.subtitle === 'Log in or create an account' ? 'Minimum 8 characters.' : 'Minstens 8 tekens.'}</FieldNote>
            </div>

            <Input
              label={t.auth.confirmPassword}
              type={showPassword ? 'text' : 'password'}
              placeholder={passwordPlaceholder}
              error={registerForm.formState.errors.confirmPassword?.message}
              autoComplete="new-password"
              leftIcon={<Shield className="h-4 w-4" />}
              {...registerForm.register('confirmPassword')}
            />

            <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-slate-300 text-cyberblue focus:ring-cyberblue"
                {...registerForm.register('terms')}
              />
              <span className="text-sm text-slate-600">{t.auth.terms}</span>
            </label>
            {registerForm.formState.errors.terms ? (
              <p className="text-xs font-medium text-rose-600">{registerForm.formState.errors.terms.message}</p>
            ) : null}

            <div className="flex items-center justify-between gap-3 text-sm">
              <button type="button" className="text-slate-500 transition hover:text-cyberblue" onClick={() => setView('landing')}>
                {t.auth.back}
              </button>
              <button type="button" onClick={() => setShowPassword((value) => !value)} className="text-slate-500 transition hover:text-cyberblue">
                {showPassword ? 'Hide password' : 'Show password'}
              </button>
            </div>

            {notice ? <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">{notice}</p> : null}
            {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

            <Button type="submit" variant="success" className="w-full" isLoading={submitting}>
              {submitting ? t.auth.loading : t.auth.registerButton}
              {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
            </Button>
          </form>
        </AnimatedStep>
      )
    }

    if (view === 'forgot') {
      return (
        <AnimatedStep stepKey="forgot">
          <form className="space-y-5" onSubmit={handleReset}>
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold text-slate-900">{t.auth.resetTitle}</h2>
              <p className="text-sm text-slate-500">{t.auth.resetSubtitle}</p>
            </div>

            <Input
              label={t.auth.email}
              type="email"
              placeholder={t.common.emailPlaceholder}
              error={resetForm.formState.errors.email?.message}
              autoComplete="email"
              leftIcon={<Mail className="h-4 w-4" />}
              {...resetForm.register('email')}
            />

            {notice ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</p> : null}
            {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button variant="secondary" type="button" className="sm:flex-1" onClick={() => setView('login')}>
                {t.auth.back}
              </Button>
              <Button type="submit" className="sm:flex-1" isLoading={submitting}>
                {submitting ? t.auth.loading : t.auth.sendReset}
                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
              </Button>
            </div>
          </form>
        </AnimatedStep>
      )
    }

    return (
      <AnimatedStep stepKey="owner">
        <form className="space-y-5" onSubmit={handleOwner}>
          <div className="space-y-2 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-cyberblue">
              <Shield className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">{t.auth.ownerTitle}</h2>
            <p className="text-sm text-slate-500">{t.auth.ownerSubtitle}</p>
          </div>

          <Input
            label={t.auth.email}
            type="email"
            placeholder={t.common.emailPlaceholder}
            error={ownerForm.formState.errors.email?.message}
            autoComplete="email"
            leftIcon={<Mail className="h-4 w-4" />}
            {...ownerForm.register('email')}
          />
          <Input
            label={t.auth.password}
            type={showPassword ? 'text' : 'password'}
            placeholder={t.auth.cyberbullPlaceholder}
            error={ownerForm.formState.errors.password?.message}
            autoComplete="current-password"
            leftIcon={<Shield className="h-4 w-4" />}
            {...ownerForm.register('password')}
          />

          <div className="flex items-center justify-between gap-3 text-sm">
            <button type="button" className="text-slate-500 transition hover:text-cyberblue" onClick={() => setView('landing')}>
              {t.auth.back}
            </button>
            <button type="button" onClick={() => setShowPassword((value) => !value)} className="text-slate-500 transition hover:text-cyberblue">
              {showPassword ? 'Hide password' : 'Show password'}
            </button>
          </div>

          {notice ? <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">{notice}</p> : null}
          {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

          <Button type="submit" className="w-full" isLoading={submitting}>
            {submitting ? t.auth.loading : t.auth.ownerButton}
            {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
          </Button>
        </form>
      </AnimatedStep>
    )
  }

  return (
    <Card className="relative mx-auto w-full max-w-[560px] px-6 py-7 shadow-soft-xl sm:px-10 sm:py-9">
      <div className="pt-1">
        <div className="flex flex-col items-center">
          <Logo className="w-48 max-w-full object-contain sm:w-56" />
        </div>

        <div className="mt-6">{content()}</div>
      </div>
    </Card>
  )
}
