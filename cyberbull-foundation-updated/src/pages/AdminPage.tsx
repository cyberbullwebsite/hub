import { Card } from '@/components/ui/Card'

export function AdminPage() {
  return (
    <div className="cyber-shell min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Card className="p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-slate-900">Admin</h1>
          <p className="mt-2 text-slate-600">Protected owner/admin shell ready for future management tools.</p>
        </Card>
      </div>
    </div>
  )
}
