# Row Level Security with Clerk Authentication in Supabase

This guide explains how to set up and use Row Level Security (RLS) in Supabase with Clerk authentication for the LinkSpace project.

## Overview

Row Level Security (RLS) is a feature that allows you to restrict access to rows in a database table based on the user's identity. When combined with Clerk authentication, it ensures users can only access their own data.

### How it works:

1. Clerk provides a JWT (JSON Web Token) containing the user's ID
2. The JWT is sent to Supabase with each request
3. Supabase uses RLS policies to filter data based on the user ID in the JWT

## Setup Options

There are three ways to set up RLS in your LinkSpace project:

1. **SQL Script**: Run the `setup-rls-fixed.sql` script in Supabase SQL Editor
2. **API Endpoint**: Use the `/api/admin/apply-rls` endpoint (admin only)
3. **Programmatic Setup**: Use the `applyRLSToTable` or `setupRLSForLinkSpace` functions

## Method 1: SQL Script

1. Go to the Supabase Dashboard > SQL Editor
2. Open the `scripts/setup-rls-fixed.sql` file from your project
3. Run the script in the SQL Editor

This script:
- Creates a `requesting_user_id()` function to extract the user ID from the Clerk JWT
- Enables RLS on all tables
- Creates appropriate policies for each table

## Method 2: Admin API Endpoint

```typescript
// Example: Call the admin endpoint to apply RLS
const applyRLS = async () => {
  const response = await fetch('/api/admin/apply-rls', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      adminKey: process.env.ADMIN_API_KEY,
    }),
  });
  
  const result = await response.json();
  console.log(result);
};
```

## Method 3: Programmatic Setup

```typescript
import { setupRLSForLinkSpace } from '@/lib/supabase/apply-rls';

// Use in a server action or script
const setupRLS = async () => {
  try {
    const result = await setupRLSForLinkSpace();
    console.log('RLS setup complete:', result);
  } catch (error) {
    console.error('Error setting up RLS:', error);
  }
};
```

## Policies Created

The RLS setup creates the following policies:

### For Link Table

1. `Users can view their own links`: Allows users to SELECT their own links
2. `Users can insert their own links`: Ensures users can only INSERT links with their own user ID
3. `Users can update their own links`: Allows users to UPDATE only their own links
4. `Users can delete their own links`: Allows users to DELETE only their own links
5. `Anyone can view public links`: Allows anyone to view links where isPublic = true

### For Collection Table

Similar policies as the Link table, including public access for collections marked as public.

### For Tag Table

1. `Anyone can view tags`: All tags are publicly readable
2. `Authenticated users can create tags`: Any authenticated user can create tags

### For Link-Tag Relationship

1. `Users can manage tags for their links`: Ensures users can only modify tag relationships for their own links

## Using With Clerk

To use RLS with Clerk authentication:

1. Ensure Clerk is properly integrated with Next.js using the middleware
2. Configure Supabase to use Clerk's JWT by setting the JWT secret in Supabase

### JWT Configuration

In your Supabase project settings:

1. Go to API Settings > JWT Settings
2. Set the JWT Secret to your Clerk JWT verification key (JWKS URL)
3. Configure the claim mapping to use `sub` as the user ID

## Client-Side Usage

```tsx
'use client';

import { useUser } from '@clerk/nextjs';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

export default function MyLinks() {
  const { user, isSignedIn } = useUser();
  const [links, setLinks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLinks = async () => {
      if (!isSignedIn) return;
      
      setIsLoading(true);
      
      try {
        const supabase = createClient();
        
        // The RLS policies will automatically filter the data
        // to only return links owned by the current user
        const { data, error } = await supabase
          .from('Link')
          .select('*');
          
        if (error) throw error;
        setLinks(data || []);
      } catch (error) {
        console.error('Error fetching links:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLinks();
  }, [isSignedIn, user?.id]);
  
  return (
    <div>
      <h1>My Links</h1>
      {isLoading ? (
        <p>Loading links...</p>
      ) : (
        <ul>
          {links.map((link) => (
            <li key={link.id}>
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                {link.title}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## Server-Side Usage

```tsx
import { currentUser } from '@clerk/nextjs';
import { createClient } from '@/lib/supabase/server';

export default async function UserCollections() {
  const user = await currentUser();
  
  if (!user) {
    return <div>Please sign in to view your collections</div>;
  }
  
  const supabase = await createClient();
  
  // RLS policies apply automatically based on the user's JWT
  const { data: collections } = await supabase
    .from('Collection')
    .select('*');
    
  return (
    <div>
      <h1>My Collections</h1>
      <ul>
        {collections?.map((collection) => (
          <li key={collection.id}>{collection.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Troubleshooting

If you encounter issues with RLS:

1. **Check JWT Configuration**: Ensure Supabase is correctly configured to use Clerk's JWT
2. **Verify Table Names**: Make sure the table names in your policies match your actual table names
3. **Check User ID Column**: Confirm that you're using the correct column name (e.g., `userId` not `user_id`)
4. **Test Policies**: Use the Supabase dashboard to test policies and view SQL errors

## Advanced Usage

### Custom Policies for Specific Use Cases

```sql
-- Example: Allow sharing links with specific users
CREATE POLICY "Users can view shared links"
ON "Link"
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT link_id FROM shared_links WHERE shared_with = requesting_user_id()
  )
);
```

### Using with Prisma

When using Prisma, note that:

1. Table names are capitalized in Supabase (e.g., `Link` not `links`)
2. Column names use camelCase (e.g., `userId` not `user_id`)
3. Many-to-many relations use tables like `_LinkToTag`

Ensure your RLS policies match these naming conventions. 