import { createClient } from '@supabase/supabase-js';
import { 
  setupAllLinkSpacePolicies,
  createLinkPolicies,
  createCollectionPolicies,
  createTagPolicies,
  createLinkToTagRelationPolicies,
  createUserIdFunction
} from './rls-helpers';

/**
 * Apply RLS to a specific table in your Supabase database
 * @param tableName The name of the table to apply RLS to (e.g., 'Link', 'Collection')
 * @param supabaseUrl Your Supabase URL
 * @param supabaseKey Your Supabase service role key (needs to be service role for schema modifications)
 * @returns Result of the operation
 */
export async function applyRLSToTable(
  tableName: string,
  supabaseUrl: string,
  supabaseKey: string
) {
  try {
    // Use the admin key (service role) to have permission to create policies
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Build the SQL query based on the table name
    let sql = '';

    // Always create the requesting_user_id function
    sql += createUserIdFunction + '\n';

    // Add table-specific policies
    switch (tableName.toLowerCase()) {
      case 'link':
        sql += createLinkPolicies();
        break;
      case 'collection':
        sql += createCollectionPolicies();
        break;
      case 'tag':
        sql += createTagPolicies();
        break;
      case '_linktoag':
        sql += createLinkToTagRelationPolicies();
        break;
      default:
        throw new Error(`Unknown table: ${tableName}`);
    }

    // Execute the SQL query
    const { error } = await supabase.rpc('pgexec', { sql });

    if (error) {
      throw new Error(`Error applying RLS to ${tableName}: ${error.message}`);
    }

    return { success: true, message: `RLS successfully applied to ${tableName}` };
  } catch (error) {
    console.error('Error applying RLS:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Apply RLS to all LinkSpace tables in your Supabase database
 * @param supabaseUrl Your Supabase URL
 * @param supabaseKey Your Supabase service role key
 * @returns Result of the operation
 */
export async function applyRLSToAllLinkSpaceTables(
  supabaseUrl: string,
  supabaseKey: string
) {
  try {
    // Use the admin key (service role) to have permission to create policies
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Generate SQL for all LinkSpace tables
    const sql = setupAllLinkSpacePolicies();

    // Execute the SQL query
    const { error } = await supabase.rpc('pgexec', { sql });

    if (error) {
      throw new Error(`Error applying RLS to LinkSpace tables: ${error.message}`);
    }

    return { 
      success: true, 
      message: 'RLS successfully applied to all LinkSpace tables' 
    };
  } catch (error) {
    console.error('Error applying RLS to LinkSpace tables:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Example function to call from a script or server action to set up RLS for your project
 */
export async function setupRLSForLinkSpace() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing required environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  }

  // Apply RLS to all tables
  return await applyRLSToAllLinkSpaceTables(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
} 