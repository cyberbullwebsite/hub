import { Card } from '@/components/ui/Card'
import { useAuth } from '@/context/AuthContext'

export function ProfilePage() {
  const { profile } = useAuth()
  if (!profile) return null

  return (
    <div className="cyber-shell min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Card className="p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
          <p className="mt-2 text-slate-600">
            Placeholder profile page for {profile.firstName} {profile.lastName}.
          </p>
        </Card>
      </div>
    </div>
  )
}
