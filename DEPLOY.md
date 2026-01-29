# Family Sync - Deployment Guide

## Current Status ✅

The Family Sync MVP is **complete and ready to deploy**. All code is committed and pushed to:
- **GitHub:** https://github.com/peter-j-thompson/family-sync

## What's Built

### Features
- ✅ **Authentication** - Email/password + Google OAuth ready
- ✅ **Family Hub** - Dashboard with family status, today's events, tasks
- ✅ **Shared Calendar** - Month view, event creation, color-coded by member
- ✅ **Task Lists** - Multiple lists, assignments, completion tracking
- ✅ **Family Chat** - Real-time messaging with quick pings
- ✅ **Settings** - Profile management, invite code sharing
- ✅ **Onboarding** - Create or join family flow

### Tech Stack
- Next.js 16 + React 19
- Supabase (Auth, Database, Realtime)
- Tailwind CSS + shadcn/ui
- TypeScript

## Deployment Steps

### 1. Deploy to Vercel

**Option A: Via Vercel Dashboard (Recommended)**
1. Go to https://vercel.com/new
2. Import from GitHub: `peter-j-thompson/family-sync`
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://bhorddqjxkzepdjuhlix.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `sb_publishable_zMi4TWd8EGxTGIGfEEaLRg_5wlLeSLR`
4. Deploy!

**Option B: Via CLI**
```bash
cd ~/Projects/family-sync
npx vercel login
npx vercel --prod
```

### 2. Apply Database Migration

Go to Supabase SQL Editor:
https://supabase.com/dashboard/project/bhorddqjxkzepdjuhlix/sql

Copy and run the contents of:
`supabase/migrations/20260129_init.sql`

### 3. Enable Google OAuth (Optional)

1. Go to Google Cloud Console: https://console.cloud.google.com
2. Create OAuth 2.0 credentials
3. Set authorized redirect URI: `https://bhorddqjxkzepdjuhlix.supabase.co/auth/v1/callback`
4. Add credentials in Supabase:
   - Dashboard → Authentication → Providers → Google
   - Enter Client ID and Secret

### 4. Update Auth Redirect URLs

In Supabase Dashboard → Authentication → URL Configuration:
- Site URL: `https://your-vercel-url.vercel.app`
- Redirect URLs: Add `https://your-vercel-url.vercel.app/auth/callback`

### 5. Invite Collaborators

After deployment, share the app URL and invite code with:
- somethingpeter@gmail.com
- lauratomforde@gmail.com

---

## Local Development

```bash
cd ~/Projects/family-sync
npm install
npm run dev
```

Open http://localhost:3000

---

## Database Schema

See `supabase/migrations/20260129_init.sql` for complete schema including:
- families, users, events, tasks, messages, etc.
- Row Level Security policies
- Realtime subscriptions
