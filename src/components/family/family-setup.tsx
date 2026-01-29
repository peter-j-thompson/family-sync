'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface FamilySetupProps {
  userId: string
}

export function FamilySetup({ userId }: FamilySetupProps) {
  const [familyName, setFamilyName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault()
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

      // Update user with family_id and set as admin
      const { error: userError } = await supabase
        .from('users')
        .update({ family_id: family.id, role: 'admin' })
        .eq('id', userId)

      if (userError) throw userError

      // Create default task lists
      await supabase.from('task_lists').insert([
        { family_id: family.id, name: 'Groceries', icon: '🛒', created_by: userId },
        { family_id: family.id, name: 'House', icon: '🏠', created_by: userId },
        { family_id: family.id, name: 'Errands', icon: '📦', created_by: userId },
      ])

      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinFamily = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Find family by invite code
      const { data: family, error: familyError } = await supabase
        .from('families')
        .select()
        .eq('invite_code', inviteCode.toLowerCase())
        .single()

      if (familyError || !family) {
        throw new Error('Invalid invite code. Please check and try again.')
      }

      // Update user with family_id
      const { error: userError } = await supabase
        .from('users')
        .update({ family_id: family.id })
        .eq('id', userId)

      if (userError) throw userError

      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="text-5xl mb-4">👨‍👩‍👧‍👦</div>
          <CardTitle className="text-2xl">Set up your family</CardTitle>
          <CardDescription>
            Create a new family or join an existing one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">Create Family</TabsTrigger>
              <TabsTrigger value="join">Join Family</TabsTrigger>
            </TabsList>

            <TabsContent value="create">
              <form onSubmit={handleCreateFamily} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="familyName">Family name</Label>
                  <Input
                    id="familyName"
                    placeholder="The Smiths"
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                    required
                  />
                </div>

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating...' : 'Create family'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="join">
              <form onSubmit={handleJoinFamily} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="inviteCode">Invite code</Label>
                  <Input
                    id="inviteCode"
                    placeholder="abc123"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Ask a family member for the invite code
                  </p>
                </div>

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Joining...' : 'Join family'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
