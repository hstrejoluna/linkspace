-- LINKSPACE ROW LEVEL SECURITY SETUP SCRIPT
-- This script sets up Row Level Security (RLS) for the LinkSpace project
-- Run this script in the Supabase SQL Editor to secure your database tables

-- Create the requesting_user_id function (extracts user ID from Clerk JWT)
CREATE OR REPLACE FUNCTION requesting_user_id()
RETURNS TEXT AS $$
BEGIN
  RETURN NULLIF(current_setting('request.jwt.claims', true)::json->>'sub', '')::text;
END;
$$ LANGUAGE plpgsql;

-- First, let's check which tables exist
DO $$ 
DECLARE
  link_table_name TEXT;
  collection_table_name TEXT;
  tag_table_name TEXT;
  link_to_tag_table_name TEXT;
BEGIN
  -- Check which version of the table names exist
  -- Prisma might create tables with different naming conventions depending on setup

  -- Get Link table name
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Link' AND table_schema = 'public') THEN
    link_table_name := 'Link';
  ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'link' AND table_schema = 'public') THEN
    link_table_name := 'link';
  ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'links' AND table_schema = 'public') THEN
    link_table_name := 'links';
  ELSE
    RAISE NOTICE 'No Link table found. RLS for links will be skipped.';
    link_table_name := NULL;
  END IF;

  -- Get Collection table name
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Collection' AND table_schema = 'public') THEN
    collection_table_name := 'Collection';
  ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'collection' AND table_schema = 'public') THEN
    collection_table_name := 'collection';
  ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'collections' AND table_schema = 'public') THEN
    collection_table_name := 'collections';
  ELSE
    RAISE NOTICE 'No Collection table found. RLS for collections will be skipped.';
    collection_table_name := NULL;
  END IF;

  -- Get Tag table name
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Tag' AND table_schema = 'public') THEN
    tag_table_name := 'Tag';
  ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tag' AND table_schema = 'public') THEN
    tag_table_name := 'tag';
  ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tags' AND table_schema = 'public') THEN
    tag_table_name := 'tags';
  ELSE
    RAISE NOTICE 'No Tag table found. RLS for tags will be skipped.';
    tag_table_name := NULL;
  END IF;

  -- Get link to tag relation table name
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = '_LinkToTag' AND table_schema = 'public') THEN
    link_to_tag_table_name := '_LinkToTag';
  ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'link_to_tag' AND table_schema = 'public') THEN
    link_to_tag_table_name := 'link_to_tag';
  ELSE
    RAISE NOTICE 'No link-to-tag relation table found. RLS for this relation will be skipped.';
    link_to_tag_table_name := NULL;
  END IF;

  -- LINK TABLE RLS SETUP
  IF link_table_name IS NOT NULL THEN
    RAISE NOTICE 'Setting up RLS for table: %', link_table_name;
    
    -- Check if userId column exists (Prisma naming convention)
    IF EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = link_table_name AND column_name = 'userId') THEN
      RAISE NOTICE 'Using existing userId column for Link table';
      
      -- Enable RLS on the Link table
      EXECUTE format('ALTER TABLE "%s" ENABLE ROW LEVEL SECURITY', link_table_name);
      
      -- Drop existing policies if they exist
      IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = link_table_name AND policyname = 'Users can view their own links') THEN
        EXECUTE format('DROP POLICY "Users can view their own links" ON "%s"', link_table_name);
      END IF;
      
      IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = link_table_name AND policyname = 'Users can insert their own links') THEN
        EXECUTE format('DROP POLICY "Users can insert their own links" ON "%s"', link_table_name);
      END IF;
      
      IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = link_table_name AND policyname = 'Users can update their own links') THEN
        EXECUTE format('DROP POLICY "Users can update their own links" ON "%s"', link_table_name);
      END IF;
      
      IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = link_table_name AND policyname = 'Users can delete their own links') THEN
        EXECUTE format('DROP POLICY "Users can delete their own links" ON "%s"', link_table_name);
      END IF;
      
      IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = link_table_name AND policyname = 'Anyone can view public links') THEN
        EXECUTE format('DROP POLICY "Anyone can view public links" ON "%s"', link_table_name);
      END IF;
      
      -- Create new policies for Link table
      -- Note: We're using userId with the existing Prisma column instead of adding user_id
      EXECUTE format('
        CREATE POLICY "Users can view their own links"
        ON "%s"
        FOR SELECT
        TO authenticated
        USING (requesting_user_id() = "userId")', link_table_name);
      
      EXECUTE format('
        CREATE POLICY "Users can insert their own links"
        ON "%s"
        FOR INSERT
        TO authenticated
        WITH CHECK (requesting_user_id() = "userId")', link_table_name);
      
      EXECUTE format('
        CREATE POLICY "Users can update their own links"
        ON "%s"
        FOR UPDATE
        TO authenticated
        USING (requesting_user_id() = "userId")', link_table_name);
      
      EXECUTE format('
        CREATE POLICY "Users can delete their own links"
        ON "%s"
        FOR DELETE
        TO authenticated
        USING (requesting_user_id() = "userId")', link_table_name);
      
      -- Check if isPublic column exists
      IF EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = link_table_name AND column_name = 'isPublic') THEN
        -- Create policy for public links
        EXECUTE format('
          CREATE POLICY "Anyone can view public links"
          ON "%s"
          FOR SELECT
          TO authenticated, anon
          USING ("isPublic" = true)', link_table_name);
      ELSE
        RAISE NOTICE 'isPublic column not found on % table. Skipping public access policy.', link_table_name;
      END IF;
    ELSE
      RAISE NOTICE 'No userId column found on % table. RLS setup for this table will be skipped.', link_table_name;
    END IF;
  END IF;

  -- COLLECTION TABLE RLS SETUP
  IF collection_table_name IS NOT NULL THEN
    RAISE NOTICE 'Setting up RLS for table: %', collection_table_name;
    
    -- Check if userId column exists (Prisma naming convention)
    IF EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = collection_table_name AND column_name = 'userId') THEN
      RAISE NOTICE 'Using existing userId column for Collection table';
      
      -- Enable RLS on the Collection table
      EXECUTE format('ALTER TABLE "%s" ENABLE ROW LEVEL SECURITY', collection_table_name);
      
      -- Drop existing policies if they exist
      IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = collection_table_name AND policyname = 'Users can view their own collections') THEN
        EXECUTE format('DROP POLICY "Users can view their own collections" ON "%s"', collection_table_name);
      END IF;
      
      IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = collection_table_name AND policyname = 'Users can insert their own collections') THEN
        EXECUTE format('DROP POLICY "Users can insert their own collections" ON "%s"', collection_table_name);
      END IF;
      
      IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = collection_table_name AND policyname = 'Users can update their own collections') THEN
        EXECUTE format('DROP POLICY "Users can update their own collections" ON "%s"', collection_table_name);
      END IF;
      
      IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = collection_table_name AND policyname = 'Users can delete their own collections') THEN
        EXECUTE format('DROP POLICY "Users can delete their own collections" ON "%s"', collection_table_name);
      END IF;
      
      IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = collection_table_name AND policyname = 'Anyone can view public collections') THEN
        EXECUTE format('DROP POLICY "Anyone can view public collections" ON "%s"', collection_table_name);
      END IF;
      
      -- Create new policies for Collection table
      EXECUTE format('
        CREATE POLICY "Users can view their own collections"
        ON "%s"
        FOR SELECT
        TO authenticated
        USING (requesting_user_id() = "userId")', collection_table_name);
      
      EXECUTE format('
        CREATE POLICY "Users can insert their own collections"
        ON "%s"
        FOR INSERT
        TO authenticated
        WITH CHECK (requesting_user_id() = "userId")', collection_table_name);
      
      EXECUTE format('
        CREATE POLICY "Users can update their own collections"
        ON "%s"
        FOR UPDATE
        TO authenticated
        USING (requesting_user_id() = "userId")', collection_table_name);
      
      EXECUTE format('
        CREATE POLICY "Users can delete their own collections"
        ON "%s"
        FOR DELETE
        TO authenticated
        USING (requesting_user_id() = "userId")', collection_table_name);
      
      -- Check if isPublic column exists
      IF EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = collection_table_name AND column_name = 'isPublic') THEN
        -- Create policy for public collections
        EXECUTE format('
          CREATE POLICY "Anyone can view public collections"
          ON "%s"
          FOR SELECT
          TO authenticated, anon
          USING ("isPublic" = true)', collection_table_name);
      ELSE
        RAISE NOTICE 'isPublic column not found on % table. Skipping public access policy.', collection_table_name;
      END IF;
    ELSE
      RAISE NOTICE 'No userId column found on % table. RLS setup for this table will be skipped.', collection_table_name;
    END IF;
  END IF;

  -- TAG TABLE RLS SETUP
  IF tag_table_name IS NOT NULL THEN
    RAISE NOTICE 'Setting up RLS for table: %', tag_table_name;
    
    -- Enable RLS on the Tag table
    EXECUTE format('ALTER TABLE "%s" ENABLE ROW LEVEL SECURITY', tag_table_name);
    
    -- Drop existing policies if they exist
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = tag_table_name AND policyname = 'Anyone can view tags') THEN
      EXECUTE format('DROP POLICY "Anyone can view tags" ON "%s"', tag_table_name);
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = tag_table_name AND policyname = 'Authenticated users can create tags') THEN
      EXECUTE format('DROP POLICY "Authenticated users can create tags" ON "%s"', tag_table_name);
    END IF;
    
    -- Create new policies for Tag table
    -- Since tags are shared resources, we allow all authenticated users to view them
    EXECUTE format('
      CREATE POLICY "Anyone can view tags"
      ON "%s"
      FOR SELECT
      TO authenticated, anon
      USING (true)', tag_table_name);
    
    EXECUTE format('
      CREATE POLICY "Authenticated users can create tags"
      ON "%s"
      FOR INSERT
      TO authenticated
      WITH CHECK (true)', tag_table_name);
  END IF;

  -- LINK TO TAG RELATION TABLE SETUP
  IF link_to_tag_table_name IS NOT NULL AND link_table_name IS NOT NULL THEN
    RAISE NOTICE 'Setting up RLS for link to tag relation table: %', link_to_tag_table_name;
    
    -- Enable RLS on the relation table
    EXECUTE format('ALTER TABLE "%s" ENABLE ROW LEVEL SECURITY', link_to_tag_table_name);
    
    -- Drop existing policies if they exist
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = link_to_tag_table_name AND policyname = 'Users can manage tags for their links') THEN
      EXECUTE format('DROP POLICY "Users can manage tags for their links" ON "%s"', link_to_tag_table_name);
    END IF;
    
    -- Create policy that ensures users can only modify tags for their own links
    -- Note: This depends on the schema structure, which might need adjustment
    IF link_to_tag_table_name = '_LinkToTag' THEN
      -- For Prisma's default many-to-many relation table
      EXECUTE format('
        CREATE POLICY "Users can manage tags for their links"
        ON "%s"
        USING (
          EXISTS (
            SELECT 1 FROM "%s" link
            WHERE link.id = "%s"."A"
            AND link."userId" = requesting_user_id()
          )
        )', link_to_tag_table_name, link_table_name, link_to_tag_table_name);
    ELSE
      -- For a custom link_to_tag table
      EXECUTE format('
        CREATE POLICY "Users can manage tags for their links"
        ON "%s"
        USING (
          EXISTS (
            SELECT 1 FROM "%s" link
            WHERE link.id = "%s"."link_id"
            AND link."userId" = requesting_user_id()
          )
        )', link_to_tag_table_name, link_table_name, link_to_tag_table_name);
    END IF;
  END IF;
END $$;

-- Confirm completion
SELECT 'Row Level Security setup completed successfully!' as result; 