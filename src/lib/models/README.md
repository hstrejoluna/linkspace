# LinkSpace Models

This directory contains the base models for the LinkSpace application.

## Setup

1. Create a `.env` file in the root directory with the following variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Prisma
DATABASE_URL="postgresql://user:password@localhost:5432/linkspace?schema=public"
DIRECT_URL="postgresql://user:password@localhost:5432/linkspace?schema=public"
```

2. Run the Prisma migration to create the database schema:

```bash
npx prisma migrate dev --name init
```

## Models

The application includes the following models:

- **User**: Represents a user in the system
- **Link**: Represents a link shared by a user
- **Collection**: Represents a collection of links
- **Tag**: Represents a tag that can be applied to links

## Repositories

Each model has a corresponding repository that provides methods for interacting with the database:

- **UserRepository**: Methods for user operations
- **LinkRepository**: Methods for link operations
- **CollectionRepository**: Methods for collection operations
- **TagRepository**: Methods for tag operations

## Authentication

Authentication is handled by Supabase. The `AuthService` provides methods for syncing Supabase users with our database.

## Usage

Import the repositories from the `repositories.ts` file:

```typescript
import { UserRepository, LinkRepository, CollectionRepository, TagRepository, AuthService } from '@/lib/models/repositories';
```

Example usage:

```typescript
// Get the current user
const { data: user, error } = await AuthService.getCurrentUser();

// Create a new link
const { data: link, error } = await LinkRepository.create({
  url: 'https://example.com',
  title: 'Example',
  description: 'An example link',
  userId: user.id,
  isPublic: true,
});
``` 