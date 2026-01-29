'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, CheckSquare, MessageCircle, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/dashboard/calendar', icon: Calendar, label: 'Calendar' },
  { href: '/dashboard/tasks', icon: CheckSquare, label: 'Tasks' },
  { href: '/dashboard/chat', icon: MessageCircle, label: 'Chat' },
  { href: '/dashboard/settings', icon: Settings, label: 'More' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors",
                isActive 
                  ? "text-blue-600 dark:text-blue-400" 
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
