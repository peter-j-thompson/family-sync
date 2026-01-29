import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BottomNav } from '@/components/bottom-nav'
import { Toaster } from '@/components/ui/sonner'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*, families(*)')
    .eq('auth_id', user.id)
    .single()

  // If user has no family, redirect to onboarding
  if (!profile?.family_id) {
    redirect('/onboarding')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16">
      {children}
      <BottomNav />
      <Toaster />
    </div>
  )
}
