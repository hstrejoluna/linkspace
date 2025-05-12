-- LINKSPACE ROW LEVEL SECURITY SETUP SCRIPT (FIXED)
-- This script sets up Row Level Security (RLS) for the LinkSpace project
-- Run this script in the Supabase SQL Editor to secure your database tables

-- Create the requesting_user_id function (extracts user ID from Clerk JWT)
CREATE OR REPLACE FUNCTION requesting_user_id()
RETURNS TEXT AS $$
BEGIN
  RETURN NULLIF(current_setting('request.jwt.claims', true)::json->>'sub', '')::text;
END;
$$ LANGUAGE plpgsql;

-- LINK TABLE RLS SETUP
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Link' AND table_schema = 'public') THEN
    RAISE NOTICE 'Setting up RLS for table: Link';
    
    -- Enable RLS on Link table
    ALTER TABLE "Link" ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view their own links" ON "Link";
    DROP POLICY IF EXISTS "Users can insert their own links" ON "Link";
    DROP POLICY IF EXISTS "Users can update their own links" ON "Link";
    DROP POLICY IF EXISTS "Users can delete their own links" ON "Link";
    DROP POLICY IF EXISTS "Anyone can view public links" ON "Link";
    
    -- Create new policies
    CREATE POLICY "Users can view their own links"
    ON "Link"
    FOR SELECT
    TO authenticated
    USING (requesting_user_id() = "userId");
    
    CREATE POLICY "Users can insert their own links"
    ON "Link"
    FOR INSERT
    TO authenticated
    WITH CHECK (requesting_user_id() = "userId");
    
    CREATE POLICY "Users can update their own links"
    ON "Link"
    FOR UPDATE
    TO authenticated
    USING (requesting_user_id() = "userId");
    
    CREATE POLICY "Users can delete their own links"
    ON "Link"
    FOR DELETE
    TO authenticated
    USING (requesting_user_id() = "userId");
    
    -- Public access policy if isPublic column exists
    CREATE POLICY "Anyone can view public links"
    ON "Link"
    FOR SELECT
    TO authenticated, anon
    USING ("isPublic" = true);
  ELSE
    RAISE NOTICE 'Table Link does not exist. Skipping.';
  END IF;
END $$;

-- COLLECTION TABLE RLS SETUP
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Collection' AND table_schema = 'public') THEN
    RAISE NOTICE 'Setting up RLS for table: Collection';
    
    -- Enable RLS on Collection table
    ALTER TABLE "Collection" ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view their own collections" ON "Collection";
    DROP POLICY IF EXISTS "Users can insert their own collections" ON "Collection";
    DROP POLICY IF EXISTS "Users can update their own collections" ON "Collection";
    DROP POLICY IF EXISTS "Users can delete their own collections" ON "Collection";
    DROP POLICY IF EXISTS "Anyone can view public collections" ON "Collection";
    
    -- Create new policies
    CREATE POLICY "Users can view their own collections"
    ON "Collection"
    FOR SELECT
    TO authenticated
    USING (requesting_user_id() = "userId");
    
    CREATE POLICY "Users can insert their own collections"
    ON "Collection"
    FOR INSERT
    TO authenticated
    WITH CHECK (requesting_user_id() = "userId");
    
    CREATE POLICY "Users can update their own collections"
    ON "Collection"
    FOR UPDATE
    TO authenticated
    USING (requesting_user_id() = "userId");
    
    CREATE POLICY "Users can delete their own collections"
    ON "Collection"
    FOR DELETE
    TO authenticated
    USING (requesting_user_id() = "userId");
    
    -- Public access policy
    CREATE POLICY "Anyone can view public collections"
    ON "Collection"
    FOR SELECT
    TO authenticated, anon
    USING ("isPublic" = true);
  ELSE
    RAISE NOTICE 'Table Collection does not exist. Skipping.';
  END IF;
END $$;

-- TAG TABLE RLS SETUP
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Tag' AND table_schema = 'public') THEN
    RAISE NOTICE 'Setting up RLS for table: Tag';
    
    -- Enable RLS on Tag table
    ALTER TABLE "Tag" ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Anyone can view tags" ON "Tag";
    DROP POLICY IF EXISTS "Authenticated users can create tags" ON "Tag";
    
    -- Create new policies
    CREATE POLICY "Anyone can view tags"
    ON "Tag"
    FOR SELECT
    TO authenticated, anon
    USING (true);
    
    CREATE POLICY "Authenticated users can create tags"
    ON "Tag"
    FOR INSERT
    TO authenticated
    WITH CHECK (true);
  ELSE
    RAISE NOTICE 'Table Tag does not exist. Skipping.';
  END IF;
END $$;

-- _LinkToTag RELATION TABLE RLS SETUP
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = '_LinkToTag' AND table_schema = 'public') THEN
    RAISE NOTICE 'Setting up RLS for relation table: _LinkToTag';
    
    -- Enable RLS on relation table
    ALTER TABLE "_LinkToTag" ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can manage tags for their links" ON "_LinkToTag";
    
    -- Create new policy for many-to-many relationship
    CREATE POLICY "Users can manage tags for their links"
    ON "_LinkToTag"
    USING (
      EXISTS (
        SELECT 1 FROM "Link" link
        WHERE link.id = "_LinkToTag"."A"
        AND link."userId" = requesting_user_id()
      )
    );
  ELSE
    RAISE NOTICE 'Table _LinkToTag does not exist. Skipping.';
  END IF;
END $$;

-- Display confirmation message
SELECT 'Row Level Security setup completed successfully!' as result; 