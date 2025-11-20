import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { deleteItem } from '@/lib/toon/data-manipulator';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient();
    const body = await request.json();
    const { path, selector } = body;

    if (!path) {
      return NextResponse.json(
        { error: 'path is required' },
        { status: 400 }
      );
    }

    if (!selector || typeof selector !== 'object') {
      return NextResponse.json(
        { error: 'selector must be an object' },
        { status: 400 }
      );
    }

    // Get current table data
    const { data: table, error: tableError } = await supabase
      .from('toon_tables')
      .select('*')
      .eq('id', params.id)
      .single();

    if (tableError || !table) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    // Perform delete
    const result = deleteItem(table.data, path, selector);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    // Update row count
    const newRowCount = Math.max(0, table.row_count - result.deletedCount);

    // Save updated data back to database
    const { error: updateError } = await supabase
      .from('toon_tables')
      .update({
        data: result.newData,
        toon_content: result.newToon,
        row_count: newRowCount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id);

    if (updateError) {
      console.error('Error updating table:', updateError);
      return NextResponse.json(
        { error: 'Failed to save changes' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
