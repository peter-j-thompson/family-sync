'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { format, addHours } from 'date-fns'

export default function NewEventPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const now = new Date()
  const defaultStart = format(now, "yyyy-MM-dd'T'HH:00")
  const defaultEnd = format(addHours(now, 1), "yyyy-MM-dd'T'HH:00")

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [startTime, setStartTime] = useState(defaultStart)
  const [endTime, setEndTime] = useState(defaultEnd)
  const [allDay, setAllDay] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: profile } = await supabase
        .from('users')
        .select('id, family_id')
        .single()

      if (!profile?.family_id) {
        throw new Error('You need to be part of a family first')
      }

      const { error: insertError } = await supabase.from('events').insert({
        family_id: profile.family_id,
        created_by: profile.id,
        title,
        description: description || null,
        location: location || null,
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        all_day: allDay,
      })

      if (insertError) throw insertError

      router.push('/dashboard/calendar')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/dashboard/calendar">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold">New Event</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Event title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="allDay">All day</Label>
              <Switch
                id="allDay"
                checked={allDay}
                onCheckedChange={setAllDay}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start</Label>
                <Input
                  id="startTime"
                  type={allDay ? 'date' : 'datetime-local'}
                  value={allDay ? startTime.split('T')[0] : startTime}
                  onChange={(e) => setStartTime(allDay ? `${e.target.value}T00:00` : e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End</Label>
                <Input
                  id="endTime"
                  type={allDay ? 'date' : 'datetime-local'}
                  value={allDay ? endTime.split('T')[0] : endTime}
                  onChange={(e) => setEndTime(allDay ? `${e.target.value}T23:59` : e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location (optional)</Label>
              <Input
                id="location"
                placeholder="Add location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Add description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" asChild>
                <Link href="/dashboard/calendar">Cancel</Link>
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? 'Creating...' : 'Create Event'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
