-- Script to check existing tables in the Supabase database

-- List all tables in the public schema
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- List table structure for important tables (if they exist)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Link' AND table_schema = 'public') THEN
    RAISE NOTICE 'Table Link exists';
  ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'link' AND table_schema = 'public') THEN
    RAISE NOTICE 'Table link exists';
  ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'links' AND table_schema = 'public') THEN
    RAISE NOTICE 'Table links exists';
  ELSE
    RAISE NOTICE 'No Link/link/links table found';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Collection' AND table_schema = 'public') THEN
    RAISE NOTICE 'Table Collection exists';
  ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'collection' AND table_schema = 'public') THEN
    RAISE NOTICE 'Table collection exists';
  ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'collections' AND table_schema = 'public') THEN
    RAISE NOTICE 'Table collections exists';
  ELSE
    RAISE NOTICE 'No Collection/collection/collections table found';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Tag' AND table_schema = 'public') THEN
    RAISE NOTICE 'Table Tag exists';
  ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tag' AND table_schema = 'public') THEN
    RAISE NOTICE 'Table tag exists';
  ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tags' AND table_schema = 'public') THEN
    RAISE NOTICE 'Table tags exists';
  ELSE
    RAISE NOTICE 'No Tag/tag/tags table found';
  END IF;
END $$; 