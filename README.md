# Client Portal

A modern, multi-tenant support ticket management portal built with Next.js, React, and Supabase. Designed for managing organization requests, support tickets, and team collaboration with a focus on user experience and accessibility.

## Overview

The Client Portal is a comprehensive solution for organizations to:
- Submit and track organization access requests
- Manage support tickets across multiple organizations
- Collaborate with team members
- Control access and permissions through role-based access

## Key Features

### Ticket Management
- **Create & Track Tickets** - Submit support tickets with priority levels (low, medium, high, urgent)
- **Ticket Status Tracking** - Monitor ticket lifecycle (open, in_progress, resolved, closed)
- **Search & Filter** - Find tickets by title, description, status, or priority
- **Pagination** - Browse tickets with smart numbered pagination
- **Assignee Management** - Assign tickets to team members with avatars and email display

### Organization Access Control
- **Signup Requests** - Allow organizations to request access with company details
- **Request Review** - Admin approval workflow with decision notes
- **Auto-Invite on Approval** - Automatically send magic link invites to approved requesters
- **Request Status Lookup** - Organizations can track their request status with their email

### User Management
- **Multi-Tenant Support** - Isolated data per organization
- **Role-Based Access** - Three roles: Admin, Technician, Client
- **Organization Switching** - Switch between organizations you have access to
- **User Profiles** - Manage profile information and password

### User Experience
- **Dark/Light Mode Toggle** - Customize theme preferences (system, light, dark)
- **Keyboard Shortcuts** - Power user shortcuts for efficient navigation:
  - **j** - Navigate down through tickets
  - **k** - Navigate up through tickets
  - **c** - Create new ticket
  - **?** - Show keyboard shortcuts dialog
- **Loading Skeletons** - Smooth loading states with skeleton screens
- **Toast Notifications** - User-friendly feedback for all actions
- **Responsive Design** - Works seamlessly on desktop and mobile

### Authentication & Security
- **Supabase Auth** - Magic link authentication (no password required initially)
- **Session Management** - Automatic session handling across tabs
- **Row-Level Security** - Database-level access control
- **Role-Based Row Filters** - Users only see data they have access to

## Tech Stack

- **Framework**: Next.js 16.1.6 with React 19 (App Router)
- **Database**: Supabase PostgreSQL with migrations
- **Authentication**: Supabase Auth (Magic Links)
- **UI Components**: Shadcn/UI + Tailwind CSS 4 + CVA
- **Forms**: React Hook Form + Zod validation
- **Query Management**: TanStack React Query
- **Typography**: Montserrat (Google Fonts)
- **Icons**: Lucide React

## Prerequisites

Before you begin, ensure you have:
- Node.js 18+ and npm/yarn
- A Supabase account and project
- Git

## Local Setup & Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory:
```bash
# Supabase (get these from your Supabase project settings)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App URL (local development)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set Up Supabase Locally (Optional)

If you want to run Supabase locally:
```bash
# Install Supabase CLI
npm install -g supabase

# Start Supabase locally
supabase start

# Run migrations
supabase db push
```

Or use your remote Supabase project directly.

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### 5. Build for Production
```bash
npm run build
npm start
```

## How to Use the App

### For Clients
1. **Sign In** - Use the "Portal sign in" tab with your email (magic link sent)
2. **View Dashboard** - See your organization overview and ticket counts
3. **Create Ticket** - Click "New ticket" or press `c` to report an issue
4. **Track Tickets** - View all your tickets with filtering and search
5. **View Profile** - Manage your profile and set a password

### For Technicians
All client features plus:
1. **Edit Tickets** - Update status, priority, and assignments
2. **Comments** - Add comments to tickets for team communication
3. **Ticket Assignment** - Assign tickets to yourself or team members

### For Admins
All technician features plus:
1. **Admin Panel** - Access admin controls for organization management
2. **Review Requests** - Approve/reject organization access requests
3. **Invite Users** - Send invites to users for organizations
4. **View Access Logs** - See who has access to organizations

## Database Migrations

Migrations are located in `supabase/migrations/`. 
To apply migrations:
```bash
supabase db push
```
