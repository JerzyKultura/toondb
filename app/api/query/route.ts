import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { queryTOONPath } from '@/lib/toon/toonpath';
import { validateApiKey, extractApiKeyFromRequest } from '@/lib/auth/apiKey';

async function getUserId(request: NextRequest): Promise<string | null> {
  // Try API key authentication first
  const apiKey = extractApiKeyFromRequest(request);
  if (apiKey) {
    const userId = await validateApiKey(apiKey);
    if (userId) return userId;
  }

  // Fall back to session authentication
  const supabase = createServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (!error && user) return user.id;

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    const effectiveUserId = userId || '00000000-0000-0000-0000-000000000000';

    const supabase = createServerClient();
    const body = await request.json();
    const { table_id, query, data } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'query is required' },
        { status: 400 }
      );
    }

    let tableData: any;

    // Playground mode: data is provided directly
    if (data) {
      tableData = data;
    } 
    // Normal mode: fetch from database
    else if (table_id) {
      // Get table data
      const { data: table, error: tableError } = await (supabase
        .from('toon_tables')
        .select('*')
        .eq('id', table_id)
        .single() as any);

      if (tableError || !table) {
        console.error('Table error:', tableError);
        return NextResponse.json({ error: 'Table not found' }, { status: 404 });
      }
      
      tableData = table.data;
    } else {
      return NextResponse.json(
        { error: 'Either table_id or data is required' },
        { status: 400 }
      );
    }

    const startTime = Date.now();
    
    // Execute TOONPath query on TOON data
    let results: any[] = [];
    let error_message: string | null = null;
    let status: 'success' | 'error' = 'success';

    try {
      // Use TOONPath to query the data
      const queryResults = queryTOONPath(tableData, query);
      
      // Ensure results is always an array
      if (!Array.isArray(queryResults)) {
        results = [queryResults];
      } else {
        results = queryResults;
      }
    } catch (error) {
      status = 'error';
      error_message = error instanceof Error ? error.message : 'TOONPath query failed';
      results = [];
    }

    const executionTime = Date.now() - startTime;

    // Log query history only for non-playground queries
    if (table_id && table_id !== 'playground') {
      await supabase.from('query_history').insert({
        user_id: effectiveUserId,
        table_id,
        query_text: query,
        execution_time_ms: executionTime,
        result_rows: Array.isArray(results) ? results.length : 0,
        status,
        error_message,
      } as any);
    }

    if (status === 'error') {
      return NextResponse.json(
        { error: error_message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      results,
      execution_time_ms: executionTime,
      row_count: Array.isArray(results) ? results.length : 0,
    });
  } catch (error) {
    console.error('Query error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
