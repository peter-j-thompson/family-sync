'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CalendarEvent, User } from '@/lib/types'
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [members, setMembers] = useState<User[]>([])
  const [familyId, setFamilyId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [newEvent, setNewEvent] = useState({ title: '', description: '', location: '', date: '', startTime: '09:00', endTime: '10:00' })
  const [loading, setLoading] = useState(false)
  
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [currentDate])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('users')
      .select('id, family_id')
      .eq('auth_id', user.id)
      .single()

    if (!profile?.family_id) return
    
    setFamilyId(profile.family_id)
    setUserId(profile.id)

    // Load events for the month
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)

    const { data: eventsData } = await supabase
      .from('events')
      .select('*, creator:users!events_created_by_fkey(*)')
      .eq('family_id', profile.family_id)
      .gte('start_time', monthStart.toISOString())
      .lte('start_time', monthEnd.toISOString())
      .order('start_time')

    setEvents(eventsData || [])

    // Load family members
    const { data: membersData } = await supabase
      .from('users')
      .select('*')
      .eq('family_id', profile.family_id)

    setMembers(membersData || [])
  }

  const addEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!familyId || !userId) return

    setLoading(true)
    
    const startTime = new Date(`${newEvent.date}T${newEvent.startTime}`)
    const endTime = new Date(`${newEvent.date}T${newEvent.endTime}`)

    const { error } = await supabase
      .from('events')
      .insert({
        family_id: familyId,
        title: newEvent.title,
        description: newEvent.description || null,
        location: newEvent.location || null,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        created_by: userId,
      })

    if (!error) {
      setShowAddEvent(false)
      setNewEvent({ title: '', description: '', location: '', date: '', startTime: '09:00', endTime: '10:00' })
      loadData()
    }
    setLoading(false)
  }

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const getEventsForDay = (day: Date) => events.filter(e => isSameDay(new Date(e.start_time), day))
  const selectedDayEvents = getEventsForDay(selectedDate)

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">📅 Calendar</h1>
        <Dialog open={showAddEvent} onOpenChange={setShowAddEvent}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1" /> Add Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Event</DialogTitle>
            </DialogHeader>
            <form onSubmit={addEvent} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="Event title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={newEvent.startTime}
                    onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={newEvent.endTime}
                    onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location (optional)</Label>
                <Input
                  id="location"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  placeholder="Where?"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Notes (optional)</Label>
                <Textarea
                  id="description"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Any additional details..."
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Adding...' : 'Add Event'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Calendar */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <CardTitle className="text-lg">{format(currentDate, 'MMMM yyyy')}</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Member filters */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            <Button variant="outline" size="sm" className="text-xs shrink-0">All</Button>
            {members.map((member) => (
              <Button 
                key={member.id} 
                variant="outline" 
                size="sm" 
                className="text-xs shrink-0"
                style={{ borderColor: member.color }}
              >
                {member.name.split(' ')[0]}
              </Button>
            ))}
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <div key={i} className="text-center text-xs font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const dayEvents = getEventsForDay(day)
              const isSelected = isSameDay(day, selectedDate)
              const isToday = isSameDay(day, new Date())
              const isCurrentMonth = isSameMonth(day, currentDate)

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "aspect-square p-1 rounded-lg text-sm relative transition-colors",
                    isSelected && "bg-blue-100 dark:bg-blue-900",
                    isToday && !isSelected && "bg-gray-100 dark:bg-gray-800",
                    !isCurrentMonth && "text-gray-300 dark:text-gray-600"
                  )}
                >
                  <span className={cn(
                    "block w-6 h-6 mx-auto rounded-full flex items-center justify-center",
                    isToday && "bg-blue-600 text-white"
                  )}>
                    {format(day, 'd')}
                  </span>
                  {dayEvents.length > 0 && (
                    <div className="flex justify-center gap-0.5 mt-0.5">
                      {dayEvents.slice(0, 3).map((event, i) => (
                        <div 
                          key={i} 
                          className="w-1 h-1 rounded-full" 
                          style={{ backgroundColor: event.color || (event.creator as User)?.color || '#3B82F6' }}
                        />
                      ))}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Day Events */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            {format(selectedDate, 'EEEE, MMMM d')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDayEvents.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">No events scheduled</p>
          ) : (
            <div className="space-y-3">
              {selectedDayEvents.map((event) => (
                <div 
                  key={event.id} 
                  className="p-3 rounded-lg border-l-4"
                  style={{ borderColor: event.color || (event.creator as User)?.color || '#3B82F6' }}
                >
                  <h3 className="font-medium">{event.title}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" />
                    {format(new Date(event.start_time), 'h:mm a')} - {format(new Date(event.end_time), 'h:mm a')}
                  </p>
                  {event.location && (
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {event.location}
                    </p>
                  )}
                  {event.description && (
                    <p className="text-sm text-gray-600 mt-2">{event.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
