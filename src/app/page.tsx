import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="text-6xl mb-6">👨‍👩‍👧‍👦</div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Family Sync
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
            Your family, perfectly in sync.
          </p>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            The modern way to coordinate schedules, tasks, and life logistics with your loved ones.
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link href="/signup">
            <Button size="lg" className="w-full sm:w-auto text-lg px-8">
              Get Started Free
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8">
              Sign In
            </Button>
          </Link>
        </div>

        {/* Features */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            emoji="📅"
            title="Shared Calendar"
            description="See everyone's schedule at a glance. Color-coded by family member."
          />
          <FeatureCard
            emoji="✅"
            title="Task Lists"
            description="Groceries, chores, errands - all shared and assignable."
          />
          <FeatureCard
            emoji="💬"
            title="Family Chat"
            description="Quick pings, messages, and updates in one place."
          />
          <FeatureCard
            emoji="🎯"
            title="Simple Setup"
            description="Create a family, share a code, everyone's in sync in minutes."
          />
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-sm text-gray-500">
          <p>Built with ❤️ for busy families</p>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ emoji, title, description }: { emoji: string; title: string; description: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="text-3xl mb-3">{emoji}</div>
      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  )
}
