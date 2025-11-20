import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { decode } from '@/lib/toon';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    // For now, return all public tables or use a demo mode
    // TODO: Add proper authentication
    const { data: tables, error } = await supabase
      .from('toon_tables')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ tables: tables || [] });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const body = await request.json();
    const { name, description, toon_content, delimiter = ',' } = body;

    if (!name || !toon_content) {
      return NextResponse.json(
        { error: 'Name and toon_content are required' },
        { status: 400 }
      );
    }

    // Parse TOON content
    let parsedData;
    try {
      parsedData = decode(toon_content);
    } catch (error) {
      return NextResponse.json(
        { error: `Invalid TOON format: ${error}` },
        { status: 400 }
      );
    }

    // Extract schema if data is array of objects
    let schemaFields = {};
    let rowCount = 0;

    // Handle both root arrays and objects containing arrays
    let dataArray: any[] = [];
    
    if (Array.isArray(parsedData)) {
      dataArray = parsedData;
    } else if (typeof parsedData === 'object' && parsedData !== null) {
      // If it's an object, look for the first array property
      const firstKey = Object.keys(parsedData)[0];
      if (firstKey && Array.isArray(parsedData[firstKey])) {
        dataArray = parsedData[firstKey];
      }
    }

    if (dataArray.length > 0) {
      rowCount = dataArray.length;
      if (typeof dataArray[0] === 'object' && dataArray[0] !== null) {
        schemaFields = Object.keys(dataArray[0]).reduce((acc, key) => {
          acc[key] = typeof dataArray[0][key];
          return acc;
        }, {} as Record<string, string>);
      }
    }

    // For demo purposes, use a fixed user_id
    // TODO: Replace with actual authentication
    const demoUserId = '00000000-0000-0000-0000-000000000000';

    // Insert table
    const { data: table, error } = await supabase
      .from('toon_tables')
      .insert({
        user_id: demoUserId,
        name,
        description,
        schema_fields: schemaFields,
        row_count: rowCount,
        data: parsedData,
        toon_content,
        delimiter,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Table with this name already exists' },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ table }, { status: 201 });
  } catch (error) {
    console.error('Error creating table:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
