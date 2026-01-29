export interface Family {
  id: string
  name: string
  invite_code: string
  timezone: string
  created_at: string
  updated_at: string
}

export interface User {
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
  last_location: { lat: number; lng: number; timestamp: string; place_name?: string } | null
  notification_preferences: { push: boolean; email: boolean; digest: string }
  created_at: string
  updated_at: string
}

export interface CalendarEvent {
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
  // Joined fields
  creator?: User
  attendees?: EventAttendee[]
}

export interface EventAttendee {
  event_id: string
  user_id: string
  status: 'pending' | 'accepted' | 'declined' | 'tentative'
  user?: User
}

export interface TaskList {
  id: string
  family_id: string
  name: string
  icon: string
  color: string | null
  sort_order: number
  created_by: string
  created_at: string
  updated_at: string
  tasks?: Task[]
}

export interface Task {
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
  // Joined
  assignee?: User
}

export interface Message {
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
  sender?: User
}

export interface Place {
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
