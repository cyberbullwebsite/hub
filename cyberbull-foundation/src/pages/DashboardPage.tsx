import { LogOut, Mail, ShieldCheck, UserRound } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useAuth } from '@/context/AuthContext'

export function DashboardPage() {
  const { profile, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'CyberBull - Dashboard'
  }, [])

  if (!profile) return null

  const onLogout = async () => {
    await logout()
    navigate('/auth')
  }

  return (
    <div className="cyber-shell min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex items-center justify-between gap-4 rounded-[28px] border border-white/70 bg-white/90 px-6 py-4 shadow-soft-lg backdrop-blur">
          <div>
            <p className="text-sm font-medium text-slate-500">CyberBull</p>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          </div>
          <Button variant="secondary" onClick={onLogout}>
            <LogOut className="h-4 w-4" />
            Uitloggen
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
          <Card className="p-6 sm:p-8">
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-cyberblue">
                  <UserRound className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Welkom terug</p>
                  <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                    {profile.firstName} {profile.lastName}
                  </h2>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <InfoCard label="E-mail" value={profile.email} icon={<Mail className="h-4 w-4" />} />
                <InfoCard label="Rol" value={<Badge>{profile.role}</Badge>} icon={<ShieldCheck className="h-4 w-4" />} />
                <InfoCard label="Status" value={<Badge className="bg-emerald-50 text-emerald-700">{profile.accountStatus}</Badge>} icon={<ShieldCheck className="h-4 w-4" />} />
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
                This is the permanent dashboard foundation for CyberBull. Future modules like messaging, moderation, school tools, notifications and admin controls will plug in here.
              </div>
            </div>
          </Card>

          <Card className="p-6 sm:p-8">
            <h3 className="text-lg font-bold text-slate-900">Account</h3>
            <div className="mt-5 space-y-4">
              <MiniRow label="Voornaam" value={profile.firstName} />
              <MiniRow label="Achternaam" value={profile.lastName} />
              <MiniRow label="School" value={profile.school || '—'} />
              <MiniRow label="Taal" value={profile.language} />
              <MiniRow label="Thema" value={profile.theme} />
              <MiniRow label="Wachtwoord gewijzigd" value={profile.passwordChanged ? 'Ja' : 'Nee'} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function InfoCard({ label, value, icon }: { label: string; value: React.ReactNode; icon: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <div className="mt-3 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  )
}

function MiniRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-900">{value}</span>
    </div>
  )
}
