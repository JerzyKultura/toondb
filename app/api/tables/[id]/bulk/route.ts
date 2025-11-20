import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { bulkOperation, Operation } from '@/lib/toon/data-manipulator';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient();
    const body = await request.json();
    const { operations } = body;

    if (!operations || !Array.isArray(operations)) {
      return NextResponse.json(
        { error: 'operations must be an array' },
        { status: 400 }
      );
    }

    if (operations.length === 0) {
      return NextResponse.json(
        { error: 'operations array cannot be empty' },
        { status: 400 }
      );
    }

    // Validate operations
    for (const op of operations) {
      if (!op.op || !['update', 'insert', 'delete'].includes(op.op)) {
        return NextResponse.json(
          { error: `Invalid operation type: ${op.op}` },
          { status: 400 }
        );
      }
      if (!op.path) {
        return NextResponse.json(
          { error: 'Each operation must have a path' },
          { status: 400 }
        );
      }
    }

    // Get current table data
    const { data: table, error: tableError } = await ((supabase as any)
      .from('toon_tables')
      .select('*')
      .eq('id', params.id)
      .single());

    if (tableError || !table) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    // Perform bulk operation
    const result = bulkOperation(table.data, operations as Operation[]);

    // Calculate row count change
    let rowCountDelta = 0;
    result.results.forEach(r => {
      if ('insertedCount' in r) {
        rowCountDelta += r.insertedCount;
      } else if ('deletedCount' in r) {
        rowCountDelta -= r.deletedCount;
      }
    });

    const newRowCount = Math.max(0, table.row_count + rowCountDelta);

    // Save updated data back to database
    const { error: updateError } = await ((supabase as any)
      .from('toon_tables')
      .update({
        data: result.finalData,
        toon_content: result.finalToon,
        row_count: newRowCount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id));

    if (updateError) {
      console.error('Error updating table:', updateError);
      return NextResponse.json(
        { error: 'Failed to save changes' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: result.success,
      message: result.message,
      results: result.results.map(r => ({
        success: r.success,
        message: r.message,
        count: 'modifiedCount' in r ? r.modifiedCount : 
               'insertedCount' in r ? r.insertedCount :
               'deletedCount' in r ? r.deletedCount : 0,
      })),
    });
  } catch (error) {
    console.error('Bulk operation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
