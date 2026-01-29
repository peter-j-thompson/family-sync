'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect, useRef } from 'react'
import { format, isToday, isYesterday } from 'date-fns'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Message, User } from '@/lib/types'
import { Send, Car, Clock, AlertCircle, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'

const PING_TYPES = [
  { type: 'on_my_way', icon: Car, label: '🚗 On my way', color: 'bg-blue-500' },
  { type: 'running_late', icon: Clock, label: '⏰ Running late', color: 'bg-yellow-500' },
  { type: 'need_help', icon: AlertCircle, label: '🆘 Need help', color: 'bg-red-500' },
  { type: 'call_me', icon: Phone, label: '📞 Call me', color: 'bg-green-500' },
]

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [members, setMembers] = useState<User[]>([])
  const [familyId, setFamilyId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (!familyId) return

    // Subscribe to new messages
    const channel = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `family_id=eq.${familyId}`,
      }, async (payload) => {
        // Fetch the full message with sender info
        const { data: newMsg } = await supabase
          .from('messages')
          .select('*, sender:users!messages_sender_id_fkey(*)')
          .eq('id', payload.new.id)
          .single()
        
        if (newMsg) {
          setMessages(prev => [...prev, newMsg as Message])
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [familyId])

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

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

    // Load recent messages
    const { data: messagesData } = await supabase
      .from('messages')
      .select('*, sender:users!messages_sender_id_fkey(*)')
      .eq('family_id', profile.family_id)
      .order('created_at', { ascending: true })
      .limit(100)

    setMessages(messagesData || [])

    // Load family members
    const { data: membersData } = await supabase
      .from('users')
      .select('*')
      .eq('family_id', profile.family_id)

    setMembers(membersData || [])
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !familyId || !userId) return

    setLoading(true)

    await supabase
      .from('messages')
      .insert({
        family_id: familyId,
        sender_id: userId,
        content: newMessage.trim(),
        message_type: 'text',
      })

    setNewMessage('')
    setLoading(false)
  }

  const sendPing = async (pingType: string) => {
    if (!familyId || !userId) return

    const ping = PING_TYPES.find(p => p.type === pingType)
    
    await supabase
      .from('messages')
      .insert({
        family_id: familyId,
        sender_id: userId,
        content: ping?.label || pingType,
        message_type: 'ping',
        ping_type: pingType,
      })
  }

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase()

  const formatMessageDate = (date: Date) => {
    if (isToday(date)) return format(date, 'h:mm a')
    if (isYesterday(date)) return 'Yesterday ' + format(date, 'h:mm a')
    return format(date, 'MMM d, h:mm a')
  }

  // Group messages by date
  let lastDate = ''

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-lg mx-auto">
      {/* Header */}
      <div className="px-4 py-3 border-b bg-white dark:bg-gray-950">
        <h1 className="text-xl font-bold">💬 Family Chat</h1>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4" ref={scrollRef}>
        <div className="py-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No messages yet.</p>
              <p className="text-sm text-gray-400">Start the conversation!</p>
            </div>
          ) : (
            messages.map((message, index) => {
              const sender = message.sender as User
              const isOwn = message.sender_id === userId
              const messageDate = format(new Date(message.created_at), 'MMM d, yyyy')
              const showDate = messageDate !== lastDate
              lastDate = messageDate

              return (
                <div key={message.id}>
                  {showDate && (
                    <div className="text-center py-2">
                      <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                        {isToday(new Date(message.created_at)) ? 'Today' : 
                         isYesterday(new Date(message.created_at)) ? 'Yesterday' : 
                         format(new Date(message.created_at), 'MMMM d')}
                      </span>
                    </div>
                  )}
                  <div className={cn("flex gap-2", isOwn && "flex-row-reverse")}>
                    {!isOwn && (
                      <Avatar className="w-8 h-8 shrink-0">
                        <AvatarFallback 
                          style={{ backgroundColor: sender?.color + '20', color: sender?.color }}
                          className="text-xs"
                        >
                          {sender ? getInitials(sender.name) : '?'}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className={cn("max-w-[75%]", isOwn && "text-right")}>
                      {!isOwn && (
                        <span className="text-xs text-gray-500 ml-1">
                          {sender?.name?.split(' ')[0]}
                        </span>
                      )}
                      <div
                        className={cn(
                          "rounded-2xl px-4 py-2 inline-block",
                          message.message_type === 'ping' 
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                            : isOwn 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                        )}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 px-1">
                        {formatMessageDate(new Date(message.created_at))}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </ScrollArea>

      {/* Quick Pings */}
      <div className="px-4 py-2 border-t bg-gray-50 dark:bg-gray-900">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {PING_TYPES.map((ping) => (
            <Button
              key={ping.type}
              variant="outline"
              size="sm"
              className="shrink-0 text-xs"
              onClick={() => sendPing(ping.type)}
            >
              {ping.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="px-4 py-3 border-t bg-white dark:bg-gray-950">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={loading || !newMessage.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}
