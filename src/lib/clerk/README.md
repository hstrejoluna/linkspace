# Clerk Integration with Supabase

This directory contains the integration between Clerk authentication and Supabase for the LinkSpace application.

## Overview

The integration allows us to:

1. Use Clerk for authentication and user management
2. Use Supabase for database operations with Row-Level Security (RLS)
3. Synchronize user data between Clerk and our database

## Files

- `clerk-supabase.ts`: Utilities for creating Supabase clients with Clerk authentication
- `use-supabase.ts`: React hook for using Supabase with Clerk on the client side
- `user-sync.ts`: Functions to synchronize user data between Clerk and our databases
- `config.ts`: Configuration for Clerk authentication

## Setup Instructions

1. Create a Clerk account and set up a new project
2. Create a Supabase account and set up a new project
3. In the Clerk Dashboard, navigate to JWT Templates and create a new Supabase template
4. Copy your Supabase JWT Secret from the Supabase Dashboard (Project Settings > API > JWT Settings)
5. Paste the JWT Secret into the Clerk JWT Template
6. Configure your environment variables in the `.env` file

## Environment Variables

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_SECRET_KEY=your-clerk-secret-key
CLERK_WEBHOOK_SECRET=your-clerk-webhook-secret

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_KEY=your-supabase-anon-key
```

## Webhooks

The webhook handler in `src/app/api/webhooks/clerk/route.ts` synchronizes user data when events occur in Clerk (e.g., user created, user updated).

To set up webhooks:

1. In the Clerk Dashboard, navigate to Webhooks
2. Create a new webhook with the endpoint `https://your-domain.com/api/webhooks/clerk`
3. Select the events you want to listen for (e.g., `user.created`, `user.updated`)
4. Copy the signing secret and add it to your `.env` file as `CLERK_WEBHOOK_SECRET`

## Row-Level Security (RLS)

To secure your Supabase tables with Row-Level Security:

1. Enable RLS on your tables
2. Create policies that use the user ID from the JWT token
3. Example policy for selecting data:

```sql
CREATE POLICY "Users can view their own data"
ON "public"."your_table"
FOR SELECT
USING (auth.uid() = user_id);
```

4. Example policy for inserting data:

```sql
CREATE POLICY "Users can insert their own data"
ON "public"."your_table"
FOR INSERT
WITH CHECK (auth.uid() = user_id);
``` 