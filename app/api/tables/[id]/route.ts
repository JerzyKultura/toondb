import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { decode, encode } from '@/lib/toon';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient();
    // Demo mode - no authentication required
    const { data: table, error } = await ((supabase as any)
      .from('toon_tables')
      .select('*')
      .eq('id', params.id)
      .single());

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    return NextResponse.json({ table });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient();
    // Demo mode - no authentication required
    const body = await request.json();
    const { name, description, toon_content, is_public } = body;

    // Parse TOON content if provided
    let updateData: any = {};
    
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (is_public !== undefined) updateData.is_public = is_public;

    if (toon_content) {
      try {
        const parsedData = decode(toon_content);
        updateData.data = parsedData;
        updateData.toon_content = toon_content;
        
        if (Array.isArray(parsedData)) {
          updateData.row_count = parsedData.length;
        }
      } catch (error) {
        return NextResponse.json(
          { error: `Invalid TOON format: ${error}` },
          { status: 400 }
        );
      }
    }

    const { data: table, error } = await ((supabase as any)
      .from('toon_tables')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single());

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ table });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient();
    // Demo mode - no authentication required
    const { error } = await ((supabase as any)
      .from('toon_tables')
      .delete()
      .eq('id', params.id));

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
