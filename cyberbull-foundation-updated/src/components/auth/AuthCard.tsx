import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, CheckCircle2, Circle, Eye, EyeOff, Loader2, Shield, UserRound } from 'lucide-react'
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
import { LanguageSelector } from '@/components/ui/LanguageSelector'
import { AnimatedStep } from '@/components/ui/AnimatedStep'
import { generateCyberBullUsername, isLikelyDomain } from '@/lib/authIdentity'

const domainSchema = z
  .string()
  .trim()
  .min(3, 'Voer een geldig domein in')
  .refine((value) => isLikelyDomain(value), 'Voer een geldig domein in')

const registerSchema = z
  .object({
    firstName: z.string().trim().min(1, 'Voornaam is verplicht'),
    lastName: z.string().trim().min(1, 'Achternaam is verplicht'),
    domain: domainSchema,
    password: z.string().min(8, 'Wachtwoord moet minstens 8 tekens bevatten'),
    confirmPassword: z.string().min(8, 'Bevestig je wachtwoord'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Wachtwoorden komen niet overeen',
    path: ['confirmPassword'],
  })

const loginSchema = z.object({
  domain: domainSchema,
  username: z.string().trim().min(1, 'Gebruikersnaam is verplicht'),
  password: z.string().min(1, 'Wachtwoord is verplicht'),
})

const resetSchema = z.object({
  domain: domainSchema,
  username: z.string().trim().min(1, 'Gebruikersnaam is verplicht'),
})

const ownerSchema = z.object({
  password: z.string().min(1, 'Wachtwoord is verplicht'),
})

type RegisterForm = z.infer<typeof registerSchema>
type LoginForm = z.infer<typeof loginSchema>
type ResetForm = z.infer<typeof resetSchema>
type OwnerForm = z.infer<typeof ownerSchema>
type View = 'landing' | 'login' | 'register' | 'forgot' | 'owner'
type RegisterStage = 'idle' | 'validating' | 'username' | 'creating' | 'profile' | 'done'

const REGISTER_STEPS = ['validating', 'username', 'creating', 'profile', 'done'] as const

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function AuthCard() {
  const navigate = useNavigate()
  const { t, language } = useLanguage()
  const { login, register, resetPassword, refreshProfile, error } = useAuth()
  const [view, setView] = useState<View>('landing')
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [registerStage, setRegisterStage] = useState<RegisterStage>('idle')
  const [ownerConfirmed, setOwnerConfirmed] = useState(false)

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { domain: '', username: '', password: '' },
  })

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      domain: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  })

  const resetForm = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
    defaultValues: { domain: '', username: '' },
  })

  const ownerForm = useForm<OwnerForm>({
    resolver: zodResolver(ownerSchema),
    defaultValues: { password: '' },
  })

  const firstName = registerForm.watch('firstName')
  const lastName = registerForm.watch('lastName')
  const generatedUsername = useMemo(() => generateCyberBullUsername(firstName, lastName), [firstName, lastName])

  useEffect(() => {
    setNotice(null)
    setShowPassword(false)
    setRegisterStage('idle')
    setOwnerConfirmed(false)
  }, [view])

  const goDashboard = async () => {
    navigate('/dashboard')
  }

  const handleLogin = loginForm.handleSubmit(async (values) => {
    setSubmitting(true)
    setNotice(null)
    try {
      await login(values.domain, values.username, values.password)
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
    setRegisterStage('validating')
    try {
      await sleep(300)
      setRegisterStage('username')
      await sleep(260)
      setRegisterStage('creating')
      await register({
        firstName: values.firstName,
        lastName: values.lastName,
        domain: values.domain,
        password: values.password,
        language,
      })
      setRegisterStage('profile')
      await sleep(260)
      setRegisterStage('done')
      setNotice(t.auth.setupDone)
      await refreshProfile()
      await sleep(500)
      await goDashboard()
    } catch (err) {
      setRegisterStage('idle')
      setNotice(err instanceof Error ? err.message : 'Account aanmaken mislukt.')
    } finally {
      setSubmitting(false)
    }
  })

  const handleReset = resetForm.handleSubmit(async (values) => {
    setSubmitting(true)
    setNotice(null)
    try {
      await resetPassword(values.domain, values.username)
      setNotice(t.auth.resetSuccess)
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Resetlink verzenden mislukt.')
    } finally {
      setSubmitting(false)
    }
  })

  const handleOwner = ownerForm.handleSubmit(async (values) => {
    if (!ownerConfirmed) return
    setSubmitting(true)
    setNotice(null)
    try {
      await login('stiers.cyberbull.be', 'STIERS', values.password)
      await refreshProfile()
      await goDashboard()
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Owner login mislukt.')
    } finally {
      setSubmitting(false)
    }
  })

  const passwordPlaceholder = view === 'register' ? t.auth.smartschoolPlaceholder : t.auth.cyberbullPlaceholder
  const currentRegisterStepIndex = REGISTER_STEPS.indexOf(registerStage)

  const renderProgressRow = (stage: RegisterStage, label: string) => {
    const stageIndex = REGISTER_STEPS.indexOf(stage)
    const isActive = registerStage === stage
    const isComplete = currentRegisterStepIndex > stageIndex || registerStage === 'done'

    return (
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
        <div className={isComplete ? 'text-emerald-600' : isActive ? 'text-cyberblue' : 'text-slate-300'}>
          {isComplete ? <CheckCircle2 className="h-5 w-5" /> : isActive ? <Loader2 className="h-5 w-5 animate-spin" /> : <Circle className="h-5 w-5" />}
        </div>
        <span className={`text-sm ${isComplete ? 'font-medium text-slate-900' : isActive ? 'font-medium text-slate-700' : 'text-slate-500'}`}>
          {label}
        </span>
      </div>
    )
  }

  const topBar = (
    <div className="flex items-start justify-end">
      <LanguageSelector />
    </div>
  )

  const content = () => {
    if (view === 'landing') {
      return (
        <AnimatedStep stepKey="landing">
          <div className="space-y-6 text-center">
            {topBar}

            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-[2.1rem]">{t.landing.title}</h1>
              <p className="text-[17px] text-slate-500">{t.landing.subtitle}</p>
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
            {topBar}
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold text-slate-900">{t.auth.login}</h2>
              <p className="text-sm text-slate-500">{t.landing.subtitle}</p>
            </div>

            <Input
              label={t.auth.domain}
              type="text"
              placeholder={t.auth.domainPlaceholder}
              error={loginForm.formState.errors.domain?.message}
              autoComplete="off"
              leftIcon={<Shield className="h-4 w-4" />}
              {...loginForm.register('domain')}
            />

            <Input
              label={t.auth.username}
              type="text"
              placeholder={t.auth.usernamePlaceholder}
              error={loginForm.formState.errors.username?.message}
              autoComplete="off"
              leftIcon={<UserRound className="h-4 w-4" />}
              {...loginForm.register('username')}
            />

            <div className="space-y-2">
              <Input
                label={t.auth.password}
                type={showPassword ? 'text' : 'password'}
                placeholder={t.auth.cyberbullPlaceholder}
                error={loginForm.formState.errors.password?.message}
                autoComplete="current-password"
                leftIcon={<Shield className="h-4 w-4" />}
                {...loginForm.register('password')}
              />
            </div>

            <div className="flex items-center justify-between gap-3 text-sm">
              <button type="button" className="flex items-center gap-1 text-slate-500 transition hover:text-cyberblue" onClick={() => setView('forgot')}>
                {t.auth.forgotPassword}
              </button>
              <button type="button" className="flex items-center gap-1 text-slate-500 transition hover:text-cyberblue" onClick={() => setView('landing')}>
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
              className="mx-auto flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700"
            >
              {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
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
            {topBar}
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold text-slate-900">{t.auth.createAccount}</h2>
              <p className="text-sm text-slate-500">{t.landing.subtitle}</p>
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
              label={t.auth.domain}
              type="text"
              placeholder={t.auth.domainPlaceholder}
              error={registerForm.formState.errors.domain?.message}
              autoComplete="off"
              leftIcon={<Shield className="h-4 w-4" />}
              {...registerForm.register('domain')}
            />

            <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{t.auth.generatedUsername}</p>
              <div className="mt-2 flex flex-col gap-1">
                <p className="text-xl font-semibold tracking-tight text-slate-900">{generatedUsername || '—'}</p>
              </div>
              <p className="mt-2 text-xs text-slate-500">{t.auth.generatedUsernameNote}</p>
            </div>

            <div className="space-y-2">
              <Input
                label={t.auth.password}
                type={showPassword ? 'text' : 'password'}
                placeholder={t.auth.smartschoolPlaceholder}
                error={registerForm.formState.errors.password?.message}
                autoComplete="new-password"
                leftIcon={<Shield className="h-4 w-4" />}
                {...registerForm.register('password')}
              />
              <FieldNote>{t.auth.passwordHint}</FieldNote>
            </div>

            <Input
              label={t.auth.confirmPassword}
              type={showPassword ? 'text' : 'password'}
              placeholder={t.auth.smartschoolPlaceholder}
              error={registerForm.formState.errors.confirmPassword?.message}
              autoComplete="new-password"
              leftIcon={<Shield className="h-4 w-4" />}
              {...registerForm.register('confirmPassword')}
            />

            <div className="flex items-center justify-between gap-3 text-sm">
              <button type="button" className="text-slate-500 transition hover:text-cyberblue" onClick={() => setView('landing')}>
                {t.auth.back}
              </button>
              <button type="button" onClick={() => setShowPassword((value) => !value)} className="flex items-center gap-1 text-slate-500 transition hover:text-cyberblue">
                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {showPassword ? 'Hide password' : 'Show password'}
              </button>
            </div>

            {notice ? <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">{notice}</p> : null}
            {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

            <Button type="submit" variant="success" className="w-full" isLoading={submitting}>
              {submitting ? t.auth.loading : t.auth.registerButton}
              {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
            </Button>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: registerStage === 'idle' ? 0 : 1, y: registerStage === 'idle' ? 10 : 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className={registerStage === 'idle' ? 'pointer-events-none hidden' : 'space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-4'}
            >
              <p className="text-sm font-semibold text-slate-900">{t.auth.setupTitle}</p>
              <div className="space-y-2">
                {renderProgressRow('validating', t.auth.setupValidation)}
                {renderProgressRow('username', t.auth.setupUsername)}
                {renderProgressRow('creating', t.auth.setupAccount)}
                {renderProgressRow('profile', t.auth.setupProfile)}
                {renderProgressRow('done', t.auth.setupDone)}
              </div>
            </motion.div>
          </form>
        </AnimatedStep>
      )
    }

    if (view === 'forgot') {
      return (
        <AnimatedStep stepKey="forgot">
          <form className="space-y-5" onSubmit={handleReset}>
            {topBar}
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold text-slate-900">{t.auth.resetTitle}</h2>
              <p className="text-sm text-slate-500">{t.auth.resetSubtitle}</p>
            </div>

            <Input
              label={t.auth.domain}
              type="text"
              placeholder={t.auth.domainPlaceholder}
              error={resetForm.formState.errors.domain?.message}
              autoComplete="off"
              leftIcon={<Shield className="h-4 w-4" />}
              {...resetForm.register('domain')}
            />

            <Input
              label={t.auth.username}
              type="text"
              placeholder={t.auth.usernamePlaceholder}
              error={resetForm.formState.errors.username?.message}
              autoComplete="off"
              leftIcon={<UserRound className="h-4 w-4" />}
              {...resetForm.register('username')}
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
          {topBar}
          <div className="space-y-2 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-cyberblue">
              <Shield className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">{t.auth.ownerTitle}</h2>
            <p className="text-sm text-slate-500">{t.auth.ownerSubtitle}</p>
          </div>

          <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <input
              type="checkbox"
              checked={ownerConfirmed}
              onChange={(event) => setOwnerConfirmed(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-cyberblue focus:ring-cyberblue"
            />
            <span className="text-sm text-slate-600">{t.auth.michielConfirm}</span>
          </label>

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
            <button type="button" onClick={() => setShowPassword((value) => !value)} className="flex items-center gap-1 text-slate-500 transition hover:text-cyberblue">
              {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {showPassword ? 'Hide password' : 'Show password'}
            </button>
          </div>

          {notice ? <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">{notice}</p> : null}
          {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

          <Button type="submit" className="w-full" isLoading={submitting} disabled={!ownerConfirmed}>
            {submitting ? t.auth.loading : t.auth.ownerButton}
            {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
          </Button>
        </form>
      </AnimatedStep>
    )
  }

  return (
    <Card className="relative mx-auto w-full max-w-[560px] px-6 py-7 shadow-soft-xl sm:px-10 sm:py-9">
      <div className="pt-1">{content()}</div>
    </Card>
  )
}
