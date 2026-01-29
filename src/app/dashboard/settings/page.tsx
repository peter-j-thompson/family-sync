'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { User } from '@/lib/types'
import { useRouter } from 'next/navigation'
import { LogOut, Copy, Check, Users } from 'lucide-react'

const COLORS = [
  '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#84CC16'
]

export default function SettingsPage() {
  const [profile, setProfile] = useState<User | null>(null)
  const [family, setFamily] = useState<{ name: string; invite_code: string } | null>(null)
  const [members, setMembers] = useState<User[]>([])
  const [name, setName] = useState('')
  const [selectedColor, setSelectedColor] = useState('#3B82F6')
  const [copied, setCopied] = useState(false)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profileData } = await supabase
      .from('users')
      .select('*, families(*)')
      .eq('auth_id', user.id)
      .single()

    if (profileData) {
      setProfile(profileData)
      setName(profileData.name)
      setSelectedColor(profileData.color)
      setFamily(profileData.families as { name: string; invite_code: string })

      // Load family members
      if (profileData.family_id) {
        const { data: membersData } = await supabase
          .from('users')
          .select('*')
          .eq('family_id', profileData.family_id)
          .order('name')

        setMembers(membersData || [])
      }
    }
  }

  const saveProfile = async () => {
    if (!profile) return

    setSaving(true)
    await supabase
      .from('users')
      .update({ name, color: selectedColor })
      .eq('id', profile.id)

    setSaving(false)
    loadData()
  }

  const copyInviteCode = () => {
    if (family?.invite_code) {
      navigator.clipboard.writeText(family.invite_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase()

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">⚙️ Settings</h1>

      {/* Profile */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Your Profile</CardTitle>
          <CardDescription>Manage your account settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16" style={{ borderColor: selectedColor, borderWidth: 3 }}>
              <AvatarFallback 
                className="text-xl"
                style={{ backgroundColor: selectedColor + '20', color: selectedColor }}
              >
                {name ? getInitials(name) : '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{name}</p>
              <p className="text-sm text-gray-500">{profile?.email}</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Your Color</Label>
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

          <Button onClick={saveProfile} disabled={saving} className="w-full">
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      {/* Family */}
      {family && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5" /> {family.name}
            </CardTitle>
            <CardDescription>Manage your family group</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm text-gray-500">Invite Code</Label>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg font-mono text-lg">
                  {family.invite_code}
                </code>
                <Button variant="outline" size="icon" onClick={copyInviteCode}>
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Share this code to invite family members
              </p>
            </div>

            <Separator />

            <div>
              <Label className="text-sm text-gray-500 mb-2 block">Family Members ({members.length})</Label>
              <div className="space-y-2">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback 
                        className="text-xs"
                        style={{ backgroundColor: member.color + '20', color: member.color }}
                      >
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.role}</p>
                    </div>
                    {member.id === profile?.id && (
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                        You
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sign Out */}
      <Card>
        <CardContent className="pt-6">
          <Button variant="outline" className="w-full text-red-600 hover:text-red-700" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
