import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export function AccessDeniedPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="max-w-md rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-soft-xl">
        <h1 className="text-2xl font-bold text-slate-900">Account access is restricted</h1>
        <p className="mt-3 text-sm text-slate-600">This account cannot access the requested area right now.</p>
        <div className="mt-6">
          <Button onClick={() => navigate('/auth')}>Back to login</Button>
        </div>
      </div>
    </div>
  )
}
