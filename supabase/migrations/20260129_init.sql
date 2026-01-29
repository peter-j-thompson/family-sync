-- Family Sync Database Schema
-- Enable UUID
create extension if not exists "uuid-ossp";

-- ====================
-- FAMILIES
-- ====================
create table public.families (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  invite_code text unique not null default substring(md5(random()::text) from 1 for 8),
  timezone text not null default 'America/Los_Angeles',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ====================
-- USERS (Family Members)
-- ====================
create table public.users (
  id uuid primary key default uuid_generate_v4(),
  auth_id uuid unique,
  family_id uuid references public.families(id) on delete cascade,
  email text unique,
  name text not null,
  avatar_url text,
  color text not null default '#3B82F6',
  role text not null default 'member' check (role in ('admin', 'member', 'kid')),
  phone text,
  location_sharing boolean default false,
  last_location jsonb,
  notification_preferences jsonb default '{"push": true, "email": true, "digest": "weekly"}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ====================
-- CALENDAR EVENTS
-- ====================
create table public.events (
  id uuid primary key default uuid_generate_v4(),
  family_id uuid not null references public.families(id) on delete cascade,
  title text not null,
  description text,
  location text,
  start_time timestamptz not null,
  end_time timestamptz not null,
  all_day boolean default false,
  recurrence_rule text,
  recurrence_end_date date,
  created_by uuid not null references public.users(id),
  color text,
  external_id text,
  external_source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Event attendees (many-to-many)
create table public.event_attendees (
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'tentative')),
  primary key (event_id, user_id)
);

-- ====================
-- TASK LISTS
-- ====================
create table public.task_lists (
  id uuid primary key default uuid_generate_v4(),
  family_id uuid not null references public.families(id) on delete cascade,
  name text not null,
  icon text default '📋',
  color text,
  sort_order integer default 0,
  created_by uuid not null references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ====================
-- TASKS
-- ====================
create table public.tasks (
  id uuid primary key default uuid_generate_v4(),
  list_id uuid not null references public.task_lists(id) on delete cascade,
  family_id uuid not null references public.families(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  priority text default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  due_date timestamptz,
  assigned_to uuid references public.users(id),
  recurrence_rule text,
  points integer default 0,
  completed_at timestamptz,
  completed_by uuid references public.users(id),
  sort_order integer default 0,
  created_by uuid not null references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ====================
-- MESSAGES (Family Chat)
-- ====================
create table public.messages (
  id uuid primary key default uuid_generate_v4(),
  family_id uuid not null references public.families(id) on delete cascade,
  sender_id uuid not null references public.users(id),
  content text,
  message_type text not null default 'text' check (message_type in ('text', 'image', 'ping', 'event_share', 'task_share')),
  ping_type text,
  attached_event_id uuid references public.events(id),
  attached_task_id uuid references public.tasks(id),
  image_url text,
  created_at timestamptz not null default now()
);

-- ====================
-- NOTIFICATIONS
-- ====================
create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  family_id uuid not null references public.families(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  data jsonb,
  read boolean default false,
  sent_push boolean default false,
  created_at timestamptz not null default now()
);

-- ====================
-- PLACES (for location alerts)
-- ====================
create table public.places (
  id uuid primary key default uuid_generate_v4(),
  family_id uuid not null references public.families(id) on delete cascade,
  name text not null,
  address text,
  latitude decimal(10, 8) not null,
  longitude decimal(11, 8) not null,
  radius_meters integer default 100,
  icon text default '📍',
  created_by uuid not null references public.users(id),
  created_at timestamptz not null default now()
);

-- ====================
-- INDEXES
-- ====================
create index idx_events_family_time on public.events(family_id, start_time);
create index idx_tasks_family_list on public.tasks(family_id, list_id);
create index idx_tasks_assigned on public.tasks(assigned_to, status);
create index idx_messages_family_time on public.messages(family_id, created_at desc);
create index idx_notifications_user on public.notifications(user_id, read, created_at desc);
create index idx_users_auth on public.users(auth_id);
create index idx_users_family on public.users(family_id);

-- ====================
-- ROW LEVEL SECURITY
-- ====================
alter table public.families enable row level security;
alter table public.users enable row level security;
alter table public.events enable row level security;
alter table public.event_attendees enable row level security;
alter table public.task_lists enable row level security;
alter table public.tasks enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.places enable row level security;

-- Policy: Users can access their own family data
create policy "Users access own family" on public.families
  for all using (id in (select family_id from public.users where auth_id = auth.uid()));

create policy "Users access family members" on public.users
  for all using (family_id in (select family_id from public.users where auth_id = auth.uid()) or auth_id = auth.uid());

create policy "Users can insert themselves" on public.users
  for insert with check (auth_id = auth.uid());

create policy "Users access family events" on public.events
  for all using (family_id in (select family_id from public.users where auth_id = auth.uid()));

create policy "Users access event attendees" on public.event_attendees
  for all using (event_id in (select id from public.events where family_id in (select family_id from public.users where auth_id = auth.uid())));

create policy "Users access family task lists" on public.task_lists
  for all using (family_id in (select family_id from public.users where auth_id = auth.uid()));

create policy "Users access family tasks" on public.tasks
  for all using (family_id in (select family_id from public.users where auth_id = auth.uid()));

create policy "Users access family messages" on public.messages
  for all using (family_id in (select family_id from public.users where auth_id = auth.uid()));

create policy "Users access own notifications" on public.notifications
  for all using (user_id in (select id from public.users where auth_id = auth.uid()));

create policy "Users access family places" on public.places
  for all using (family_id in (select family_id from public.users where auth_id = auth.uid()));

-- Allow new users to create families
create policy "Anyone can create family" on public.families
  for insert with check (true);

-- ====================
-- FUNCTIONS
-- ====================

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (auth_id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger update_families_updated_at before update on public.families
  for each row execute procedure public.update_updated_at();

create trigger update_users_updated_at before update on public.users
  for each row execute procedure public.update_updated_at();

create trigger update_events_updated_at before update on public.events
  for each row execute procedure public.update_updated_at();

create trigger update_task_lists_updated_at before update on public.task_lists
  for each row execute procedure public.update_updated_at();

create trigger update_tasks_updated_at before update on public.tasks
  for each row execute procedure public.update_updated_at();

-- ====================
-- ENABLE REALTIME
-- ====================
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.events;
alter publication supabase_realtime add table public.tasks;
alter publication supabase_realtime add table public.users;
