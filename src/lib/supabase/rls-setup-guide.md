# Setting Up Row Level Security in Supabase with Clerk Authentication

This guide explains how to configure Row Level Security (RLS) in your Supabase database to work with Clerk authentication in your LinkSpace project.

## What is Row Level Security?

Row Level Security is a PostgreSQL feature that allows you to control access to rows in a database table based on the user making the request. When enabled, RLS policies act as filters that are automatically applied to all queries on the table.

## How Clerk and Supabase Work Together

1. **Clerk handles authentication**: Users sign in through Clerk, which issues a JWT token containing the user's ID.
2. **Token is passed to Supabase**: The Supabase client includes this token in requests to the database.
3. **RLS policies use the token**: Supabase extracts the user ID from the token and applies RLS policies.

## Step 1: Set up Clerk as a Third-party Auth Provider in Supabase

1. In the Clerk Dashboard, go to "Integrations" > "Supabase".
2. Activate the Supabase integration and copy the Clerk domain.
3. In the Supabase Dashboard, go to "Authentication" > "Sign In / Up".
4. Click "Add provider" and select "Clerk".
5. Paste the Clerk domain you copied.

## Step 2: Create a Function to Extract the User ID

In the Supabase SQL Editor, run the following SQL to create a function that extracts the Clerk user ID from the JWT token:

```sql
-- Function to get the current user ID from the Clerk JWT
CREATE OR REPLACE FUNCTION requesting_user_id()
RETURNS TEXT AS $$
BEGIN
  RETURN NULLIF(current_setting('request.jwt.claims', true)::json->>'sub', '')::text;
END;
$$ LANGUAGE plpgsql;
```

## Step 3: Add a User ID Column to Your Tables

For each table you want to secure, add a `user_id` column that will store the ID of the user who owns the record:

```sql
-- Add a user_id column to the table (replace 'links' with your table name)
ALTER TABLE "links" 
ADD COLUMN IF NOT EXISTS user_id TEXT NOT NULL DEFAULT requesting_user_id();
```

If you're creating a new table, include the `user_id` column in the table definition:

```sql
CREATE TABLE links (
  id SERIAL PRIMARY KEY,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  user_id TEXT NOT NULL DEFAULT requesting_user_id()
);
```

## Step 4: Enable RLS on Your Tables

For each table you want to secure:

```sql
-- Enable Row Level Security
ALTER TABLE "links" ENABLE ROW LEVEL SECURITY;
```

## Step 5: Create RLS Policies

RLS policies determine what rows a user can access. Here are common policies you might need:

### SELECT Policy (Read Access)

```sql
-- Allow users to read only their own links
CREATE POLICY "Users can view their own links"
ON "links"
FOR SELECT
TO authenticated
USING (requesting_user_id() = user_id);
```

### INSERT Policy (Create Access)

```sql
-- Ensure users can only insert links with their own user_id
CREATE POLICY "Users can insert their own links"
ON "links"
FOR INSERT
TO authenticated
WITH CHECK (requesting_user_id() = user_id);
```

### UPDATE Policy (Edit Access)

```sql
-- Allow users to update only their own links
CREATE POLICY "Users can update their own links"
ON "links"
FOR UPDATE
TO authenticated
USING (requesting_user_id() = user_id);
```

### DELETE Policy (Delete Access)

```sql
-- Allow users to delete only their own links
CREATE POLICY "Users can delete their own links"
ON "links"
FOR DELETE
TO authenticated
USING (requesting_user_id() = user_id);
```

## Step 6: Create a Public Read Policy (Optional)

If you want to allow public access to certain data (e.g., published links):

```sql
-- Allow anyone to view public links
CREATE POLICY "Anyone can view public links"
ON "links"
FOR SELECT
TO authenticated, anon
USING (is_public = true);
```

## Step 7: Configure Your Supabase Client with Clerk Authentication

In your application code, make sure your Supabase client is configured to use the Clerk session token:

```typescript
// Client-side
import { useSession } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';

function useSupabase() {
  const { session } = useSession();
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: session ? `Bearer ${session.getToken({ template: 'supabase' })}` : '',
        },
      },
    }
  );
  
  return supabase;
}
```

```typescript
// Server-side
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

async function getServerSupabase() {
  const { getToken } = await auth();
  const token = await getToken({ template: 'supabase' });
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      },
    }
  );
  
  return supabase;
}
```

## Step 8: Test Your RLS Policies

To test your RLS policies:

1. Sign in as User A and create some data.
2. Sign in as User B and try to access User A's data.
3. Verify that User B cannot access User A's data.

## Advanced RLS Patterns

### Row-Level Security with Shared Access

To allow users to share data with specific other users:

```sql
-- Create a shared_with table
CREATE TABLE shared_links (
  link_id INTEGER REFERENCES links(id) ON DELETE CASCADE,
  shared_with_user_id TEXT NOT NULL,
  PRIMARY KEY (link_id, shared_with_user_id)
);

-- Create a policy that allows viewing shared links
CREATE POLICY "Users can view links shared with them"
ON "links"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM shared_links
    WHERE shared_links.link_id = links.id
    AND shared_links.shared_with_user_id = requesting_user_id()
  )
);
```

### RLS with Role-Based Access

For role-based access combined with row-level security:

```sql
-- Create a policy for admins to see all data
CREATE POLICY "Admins can view all links"
ON "links"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = requesting_user_id()
    AND user_roles.role = 'admin'
  )
);
```

## Troubleshooting

### Common Issues and Solutions

1. **Data not visible to owner**: Check that the `user_id` column is correctly populated.
2. **All data visible to everyone**: Ensure RLS is enabled on the table.
3. **JWT token invalid**: Verify Clerk integration is properly set up in Supabase.
4. **Policy not working**: Check syntax and verify the policy is applied to the correct operation.

## Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Clerk Supabase Integration](https://clerk.com/docs/integrations/databases/supabase)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html) 