export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      families: {
        Row: {
          id: string
          name: string
          invite_code: string
          timezone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          invite_code?: string
          timezone?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          invite_code?: string
          timezone?: string
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          auth_id: string | null
          family_id: string | null
          email: string | null
          name: string
          avatar_url: string | null
          color: string
          role: 'admin' | 'member' | 'kid'
          phone: string | null
          location_sharing: boolean
          last_location: Json | null
          notification_preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          auth_id?: string | null
          family_id?: string | null
          email?: string | null
          name: string
          avatar_url?: string | null
          color?: string
          role?: 'admin' | 'member' | 'kid'
          phone?: string | null
          location_sharing?: boolean
          last_location?: Json | null
          notification_preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          auth_id?: string | null
          family_id?: string | null
          email?: string | null
          name?: string
          avatar_url?: string | null
          color?: string
          role?: 'admin' | 'member' | 'kid'
          phone?: string | null
          location_sharing?: boolean
          last_location?: Json | null
          notification_preferences?: Json
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          family_id: string
          title: string
          description: string | null
          location: string | null
          start_time: string
          end_time: string
          all_day: boolean
          recurrence_rule: string | null
          recurrence_end_date: string | null
          created_by: string
          color: string | null
          external_id: string | null
          external_source: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          family_id: string
          title: string
          description?: string | null
          location?: string | null
          start_time: string
          end_time: string
          all_day?: boolean
          recurrence_rule?: string | null
          recurrence_end_date?: string | null
          created_by: string
          color?: string | null
          external_id?: string | null
          external_source?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          title?: string
          description?: string | null
          location?: string | null
          start_time?: string
          end_time?: string
          all_day?: boolean
          recurrence_rule?: string | null
          recurrence_end_date?: string | null
          created_by?: string
          color?: string | null
          external_id?: string | null
          external_source?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      task_lists: {
        Row: {
          id: string
          family_id: string
          name: string
          icon: string
          color: string | null
          sort_order: number
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          family_id: string
          name: string
          icon?: string
          color?: string | null
          sort_order?: number
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          name?: string
          icon?: string
          color?: string | null
          sort_order?: number
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          list_id: string
          family_id: string
          title: string
          description: string | null
          status: 'todo' | 'in_progress' | 'done'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          due_date: string | null
          assigned_to: string | null
          recurrence_rule: string | null
          points: number
          completed_at: string | null
          completed_by: string | null
          sort_order: number
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          list_id: string
          family_id: string
          title: string
          description?: string | null
          status?: 'todo' | 'in_progress' | 'done'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          due_date?: string | null
          assigned_to?: string | null
          recurrence_rule?: string | null
          points?: number
          completed_at?: string | null
          completed_by?: string | null
          sort_order?: number
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          list_id?: string
          family_id?: string
          title?: string
          description?: string | null
          status?: 'todo' | 'in_progress' | 'done'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          due_date?: string | null
          assigned_to?: string | null
          recurrence_rule?: string | null
          points?: number
          completed_at?: string | null
          completed_by?: string | null
          sort_order?: number
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          family_id: string
          sender_id: string
          content: string | null
          message_type: 'text' | 'image' | 'ping' | 'event_share' | 'task_share'
          ping_type: string | null
          attached_event_id: string | null
          attached_task_id: string | null
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          family_id: string
          sender_id: string
          content?: string | null
          message_type?: 'text' | 'image' | 'ping' | 'event_share' | 'task_share'
          ping_type?: string | null
          attached_event_id?: string | null
          attached_task_id?: string | null
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          sender_id?: string
          content?: string | null
          message_type?: 'text' | 'image' | 'ping' | 'event_share' | 'task_share'
          ping_type?: string | null
          attached_event_id?: string | null
          attached_task_id?: string | null
          image_url?: string | null
          created_at?: string
        }
      }
      places: {
        Row: {
          id: string
          family_id: string
          name: string
          address: string | null
          latitude: number
          longitude: number
          radius_meters: number
          icon: string
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          family_id: string
          name: string
          address?: string | null
          latitude: number
          longitude: number
          radius_meters?: number
          icon?: string
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          name?: string
          address?: string | null
          latitude?: number
          longitude?: number
          radius_meters?: number
          icon?: string
          created_by?: string
          created_at?: string
        }
      }
    }
  }
}

export type Family = Database['public']['Tables']['families']['Row']
export type User = Database['public']['Tables']['users']['Row']
export type Event = Database['public']['Tables']['events']['Row']
export type TaskList = Database['public']['Tables']['task_lists']['Row']
export type Task = Database['public']['Tables']['tasks']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type Place = Database['public']['Tables']['places']['Row']
