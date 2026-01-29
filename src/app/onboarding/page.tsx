'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const COLORS = [
  '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#84CC16'
]

export default function OnboardingPage() {
  const [familyName, setFamilyName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [selectedColor, setSelectedColor] = useState(COLORS[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Get current user's profile ID
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('id, family_id')
          .eq('auth_id', user.id)
          .single()
        
        if (profile?.family_id) {
          router.push('/dashboard')
        } else if (profile) {
          setUserId(profile.id)
        }
      }
    }
    getUser()
  }, [supabase, router])

  const createFamily = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return
    
    setLoading(true)
    setError(null)

    try {
      // Create family
      const { data: family, error: familyError } = await supabase
        .from('families')
        .insert({ name: familyName })
        .select()
        .single()

      if (familyError) throw familyError

      // Update user to join family and set as admin
      const { error: userError } = await supabase
        .from('users')
        .update({ 
          family_id: family.id, 
          role: 'admin',
          color: selectedColor
        })
        .eq('id', userId)

      if (userError) throw userError

      // Create default task lists
      await supabase.from('task_lists').insert([
        { family_id: family.id, name: 'Groceries', icon: '🛒', created_by: userId },
        { family_id: family.id, name: 'House', icon: '🏠', created_by: userId },
        { family_id: family.id, name: 'Errands', icon: '📦', created_by: userId },
      ])

      router.push('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const joinFamily = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return
    
    setLoading(true)
    setError(null)

    try {
      // Find family by invite code
      const { data: family, error: familyError } = await supabase
        .from('families')
        .select()
        .eq('invite_code', inviteCode.toLowerCase().trim())
        .single()

      if (familyError || !family) {
        throw new Error('Invalid invite code. Please check and try again.')
      }

      // Update user to join family
      const { error: userError } = await supabase
        .from('users')
        .update({ 
          family_id: family.id,
          color: selectedColor
        })
        .eq('id', userId)

      if (userError) throw userError

      router.push('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 text-5xl">👨‍👩‍👧‍👦</div>
          <CardTitle className="text-2xl font-bold">Welcome to Family Sync!</CardTitle>
          <CardDescription>Let&apos;s get your family set up</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Color picker */}
          <div className="mb-6">
            <Label className="text-sm font-medium mb-2 block">Choose your color</Label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full transition-transform ${
                    selectedColor === color ? 'scale-125 ring-2 ring-offset-2 ring-gray-400' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="create">Create Family</TabsTrigger>
              <TabsTrigger value="join">Join Family</TabsTrigger>
            </TabsList>

            <TabsContent value="create">
              <form onSubmit={createFamily} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="familyName">Family Name</Label>
                  <Input
                    id="familyName"
                    type="text"
                    placeholder="The Smiths"
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Family'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="join">
              <form onSubmit={joinFamily} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="inviteCode">Invite Code</Label>
                  <Input
                    id="inviteCode"
                    type="text"
                    placeholder="abc123de"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Ask a family member for the invite code
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Joining...' : 'Join Family'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
