/**
 * RLS (Row Level Security) Helper Documentation
 * 
 * This file contains SQL code snippets and documentation for setting up Row Level Security 
 * in your Supabase database with Clerk authentication.
 * 
 * How RLS Works with Clerk:
 * 1. The Clerk JWT token contains the user's ID in the 'sub' claim
 * 2. Supabase can access this claim using the current_setting('request.jwt.claims') function
 * 3. You create policies that restrict data access based on the user ID
 */

/**
 * SQL to create a requesting_user_id function
 * This function extracts the user ID from the JWT token's 'sub' claim
 */
export const createUserIdFunction = `
-- Function to get the current user ID from the Clerk JWT
CREATE OR REPLACE FUNCTION requesting_user_id()
RETURNS TEXT AS $$
BEGIN
  RETURN NULLIF(current_setting('request.jwt.claims', true)::json->>'sub', '')::text;
END;
$$ LANGUAGE plpgsql;
`;

/**
 * Builds an SQL snippet to check if a table exists
 * @param tableName The name of the table to check
 */
export const checkIfTableExists = (tableName: string) => `
-- Check if table ${tableName} exists
IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = '${tableName}' AND table_schema = 'public') THEN
`;

/**
 * SQL to enable RLS on a table
 * @param tableName The name of the table to enable RLS on
 */
export const enableRLS = (tableName: string) => `
-- Enable Row Level Security on the ${tableName} table
ALTER TABLE "${tableName}" ENABLE ROW LEVEL SECURITY;
`;

/**
 * SQL to drop an existing policy if it exists
 * @param tableName The name of the table
 * @param policyName The name of the policy to drop
 */
export const dropPolicyIfExists = (tableName: string, policyName: string) => `
-- Drop policy if it exists
DROP POLICY IF EXISTS "${policyName}" ON "${tableName}";
`;

/**
 * SQL to create a SELECT policy that only allows users to view their own data
 * @param tableName The name of the table to create the policy for
 * @param userIdColumn The name of the column containing the user ID (default: "userId")
 * @param policyName The name of the policy
 */
export const createSelectPolicy = (
  tableName: string, 
  userIdColumn = "userId",
  policyName = `Users can view their own ${tableName.toLowerCase()}s`
) => `
-- Create a policy that allows users to select only their own data
CREATE POLICY "${policyName}"
ON "${tableName}"
FOR SELECT
TO authenticated
USING (requesting_user_id() = "${userIdColumn}");
`;

/**
 * SQL to create an INSERT policy that only allows users to insert their own data
 * @param tableName The name of the table to create the policy for
 * @param userIdColumn The name of the column containing the user ID (default: "userId")
 * @param policyName The name of the policy
 */
export const createInsertPolicy = (
  tableName: string, 
  userIdColumn = "userId",
  policyName = `Users can insert their own ${tableName.toLowerCase()}s`
) => `
-- Create a policy that ensures users can only insert rows with their own user ID
CREATE POLICY "${policyName}"
ON "${tableName}"
FOR INSERT
TO authenticated
WITH CHECK (requesting_user_id() = "${userIdColumn}");
`;

/**
 * SQL to create an UPDATE policy that only allows users to update their own data
 * @param tableName The name of the table to create the policy for
 * @param userIdColumn The name of the column containing the user ID (default: "userId")
 * @param policyName The name of the policy
 */
export const createUpdatePolicy = (
  tableName: string, 
  userIdColumn = "userId",
  policyName = `Users can update their own ${tableName.toLowerCase()}s`
) => `
-- Create a policy that allows users to update only their own data
CREATE POLICY "${policyName}"
ON "${tableName}"
FOR UPDATE
TO authenticated
USING (requesting_user_id() = "${userIdColumn}");
`;

/**
 * SQL to create a DELETE policy that only allows users to delete their own data
 * @param tableName The name of the table to create the policy for
 * @param userIdColumn The name of the column containing the user ID (default: "userId")
 * @param policyName The name of the policy
 */
export const createDeletePolicy = (
  tableName: string, 
  userIdColumn = "userId",
  policyName = `Users can delete their own ${tableName.toLowerCase()}s`
) => `
-- Create a policy that allows users to delete only their own data
CREATE POLICY "${policyName}"
ON "${tableName}"
FOR DELETE
TO authenticated
USING (requesting_user_id() = "${userIdColumn}");
`;

/**
 * SQL to create a public access policy for a table
 * @param tableName The name of the table to create the policy for
 * @param isPublicColumn The name of the column that determines if a record is public (default: "isPublic")
 * @param policyName The name of the policy
 */
export const createPublicAccessPolicy = (
  tableName: string,
  isPublicColumn = "isPublic",
  policyName = `Anyone can view public ${tableName.toLowerCase()}s`
) => `
-- Create a policy that allows anyone to view public records
CREATE POLICY "${policyName}"
ON "${tableName}"
FOR SELECT
TO authenticated, anon
USING ("${isPublicColumn}" = true);
`;

/**
 * SQL to create a complete set of RLS policies for a table
 * @param tableName The name of the table to create policies for
 * @param userIdColumn The name of the column containing the user ID
 * @param options Options for which policies to include
 */
export const createBasicPolicies = (
  tableName: string,
  userIdColumn = "userId",
  options = {
    select: true,
    insert: true,
    update: true,
    delete: true,
    publicAccess: false,
  }
) => `
-- Enable RLS on the table
${enableRLS(tableName)}

-- Drop existing policies
${options.select ? dropPolicyIfExists(tableName, `Users can view their own ${tableName.toLowerCase()}s`) : ''}
${options.insert ? dropPolicyIfExists(tableName, `Users can insert their own ${tableName.toLowerCase()}s`) : ''}
${options.update ? dropPolicyIfExists(tableName, `Users can update their own ${tableName.toLowerCase()}s`) : ''}
${options.delete ? dropPolicyIfExists(tableName, `Users can delete their own ${tableName.toLowerCase()}s`) : ''}
${options.publicAccess ? dropPolicyIfExists(tableName, `Anyone can view public ${tableName.toLowerCase()}s`) : ''}

-- Create policies
${options.select ? createSelectPolicy(tableName, userIdColumn) : ''}
${options.insert ? createInsertPolicy(tableName, userIdColumn) : ''}
${options.update ? createUpdatePolicy(tableName, userIdColumn) : ''}
${options.delete ? createDeletePolicy(tableName, userIdColumn) : ''}
${options.publicAccess ? createPublicAccessPolicy(tableName) : ''}
`;

/**
 * SQL to create RLS policies for the Link table
 */
export const createLinkPolicies = () => `
DO $$
BEGIN
  ${checkIfTableExists('Link')}
    RAISE NOTICE 'Setting up RLS for table: Link';
    
    ${createBasicPolicies('Link', 'userId', {
      select: true,
      insert: true,
      update: true,
      delete: true,
      publicAccess: true,
    })}
  ELSE
    RAISE NOTICE 'Table Link does not exist. Skipping.';
  END IF;
END $$;
`;

/**
 * SQL to create RLS policies for the Collection table
 */
export const createCollectionPolicies = () => `
DO $$
BEGIN
  ${checkIfTableExists('Collection')}
    RAISE NOTICE 'Setting up RLS for table: Collection';
    
    ${createBasicPolicies('Collection', 'userId', {
      select: true,
      insert: true,
      update: true,
      delete: true,
      publicAccess: true,
    })}
  ELSE
    RAISE NOTICE 'Table Collection does not exist. Skipping.';
  END IF;
END $$;
`;

/**
 * SQL to create RLS policies for the Tag table
 */
export const createTagPolicies = () => `
DO $$
BEGIN
  ${checkIfTableExists('Tag')}
    RAISE NOTICE 'Setting up RLS for table: Tag';
    
    ${enableRLS('Tag')}
    
    -- Drop existing policies
    ${dropPolicyIfExists('Tag', 'Anyone can view tags')}
    ${dropPolicyIfExists('Tag', 'Authenticated users can create tags')}
    
    -- Create policies
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
`;

/**
 * SQL to create RLS policies for the _LinkToTag relation table
 */
export const createLinkToTagRelationPolicies = () => `
DO $$
BEGIN
  ${checkIfTableExists('_LinkToTag')}
    RAISE NOTICE 'Setting up RLS for relation table: _LinkToTag';
    
    ${enableRLS('_LinkToTag')}
    
    -- Drop existing policies
    ${dropPolicyIfExists('_LinkToTag', 'Users can manage tags for their links')}
    
    -- Create policy for many-to-many relationship
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
`;

/**
 * SQL to set up all RLS policies for the LinkSpace project
 */
export const setupAllLinkSpacePolicies = () => `
-- Create the user ID function
${createUserIdFunction}

-- Set up policies for each table
${createLinkPolicies()}
${createCollectionPolicies()}
${createTagPolicies()}
${createLinkToTagRelationPolicies()}

-- Confirm completion
SELECT 'Row Level Security setup completed successfully!' as result;
`; 