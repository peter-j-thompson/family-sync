import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { format, startOfToday, endOfToday, startOfTomorrow, endOfWeek } from 'date-fns'
import { Calendar, CheckSquare, Plus, Users } from 'lucide-react'
import { FamilySetup } from '@/components/family/family-setup'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Get user profile with family
  const { data: profile } = await supabase
    .from('users')
    .select('*, families(*)')
    .eq('auth_id', user.id)
    .single()

  // If no family, show setup
  if (!profile?.family_id) {
    return <FamilySetup userId={profile?.id || ''} />
  }

  // Get today's events
  const today = startOfToday()
  const todayEnd = endOfToday()
  
  const { data: todayEvents } = await supabase
    .from('events')
    .select('*, users!events_created_by_fkey(name, color)')
    .eq('family_id', profile.family_id)
    .gte('start_time', today.toISOString())
    .lte('start_time', todayEnd.toISOString())
    .order('start_time', { ascending: true })
    .limit(5)

  // Get upcoming tasks
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*, users!tasks_assigned_to_fkey(name, color)')
    .eq('family_id', profile.family_id)
    .eq('status', 'todo')
    .order('due_date', { ascending: true })
    .limit(5)

  // Get family members
  const { data: familyMembers } = await supabase
    .from('users')
    .select('*')
    .eq('family_id', profile.family_id)

  const greeting = getGreeting()

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h2 className="text-2xl font-semibold">{greeting}, {profile.name?.split(' ')[0]} 👋</h2>
        <p className="text-muted-foreground">{format(new Date(), 'EEEE, MMMM d')}</p>
      </div>

      {/* Family Members */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            Family
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {familyMembers?.map((member) => (
              <div key={member.id} className="flex flex-col items-center min-w-[60px]">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-medium"
                  style={{ backgroundColor: member.color }}
                >
                  {member.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                </div>
                <span className="text-xs mt-1 truncate max-w-[60px]">
                  {member.name.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Today's Events */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Today
            </CardTitle>
            <Button asChild size="sm" variant="ghost">
              <Link href="/dashboard/calendar">View all</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {todayEvents && todayEvents.length > 0 ? (
            <div className="space-y-3">
              {todayEvents.map((event) => (
                <div key={event.id} className="flex items-start gap-3">
                  <div 
                    className="w-1 h-full min-h-[40px] rounded-full" 
                    style={{ backgroundColor: event.color || event.users?.color || '#3B82F6' }}
                  />
                  <div className="flex-1">
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(event.start_time), 'h:mm a')}
                      {event.location && ` • ${event.location}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No events today</p>
          )}
        </CardContent>
      </Card>

      {/* Tasks */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Tasks
            </CardTitle>
            <Button asChild size="sm" variant="ghost">
              <Link href="/dashboard/tasks">View all</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {tasks && tasks.length > 0 ? (
            <div className="space-y-2">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 py-2">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded border-gray-300"
                    disabled
                  />
                  <div className="flex-1">
                    <p className="font-medium">{task.title}</p>
                    {task.due_date && (
                      <p className="text-sm text-muted-foreground">
                        Due {format(new Date(task.due_date), 'MMM d')}
                      </p>
                    )}
                  </div>
                  {task.users && (
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                      style={{ backgroundColor: task.users.color }}
                    >
                      {task.users.name[0]}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No tasks yet</p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button asChild className="h-auto py-4">
          <Link href="/dashboard/calendar/new" className="flex flex-col items-center gap-1">
            <Calendar className="h-5 w-5" />
            <span>Add Event</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto py-4">
          <Link href="/dashboard/tasks/new" className="flex flex-col items-center gap-1">
            <CheckSquare className="h-5 w-5" />
            <span>Add Task</span>
          </Link>
        </Button>
      </div>
    </div>
  )
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}
