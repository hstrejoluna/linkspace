This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, set up your environment variables:

```bash
# Create a .env file with your database and Supabase credentials
cp .env.example .env
# Edit the .env file with your actual credentials
```

Then, install dependencies and generate the Prisma client:

```bash
npm install
# This will also run prisma generate due to the postinstall script
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database and Models

This project uses [Prisma](https://www.prisma.io/) as the ORM with a PostgreSQL database. The models are defined in `prisma/schema.prisma`:

- **User**: Represents a user in the system
- **Link**: Represents a link shared by a user
- **Collection**: Represents a collection of links
- **Tag**: Represents a tag that can be applied to links

### Prisma Commands

```bash
# Generate Prisma client after schema changes
npm run prisma:generate

# Run migrations to update the database schema
npm run prisma:migrate

# Open Prisma Studio to explore and edit your data
npm run prisma:studio
```

### Generated Files

The Prisma client is generated in `src/generated/prisma/` and is excluded from Git. It will be regenerated automatically during installation or when you run `npm run prisma:generate`.

## Authentication

Authentication is handled by Supabase. The setup includes:

- Server-side authentication with middleware
- Client-side authentication components
- Automatic user synchronization between Supabase and the database

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [Prisma Documentation](https://www.prisma.io/docs) - learn about Prisma ORM.
- [Supabase Documentation](https://supabase.com/docs) - learn about Supabase.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
