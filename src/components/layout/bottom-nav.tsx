'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, CheckSquare, MessageCircle, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/dashboard/calendar', icon: Calendar, label: 'Calendar' },
  { href: '/dashboard/tasks', icon: CheckSquare, label: 'Tasks' },
  { href: '/dashboard/chat', icon: MessageCircle, label: 'Chat' },
  { href: '/dashboard/more', icon: MoreHorizontal, label: 'More' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t z-50">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="flex justify-around items-center py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/dashboard' && pathname.startsWith(item.href))
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors',
                  isActive 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
