import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { insertItem } from '@/lib/toon/data-manipulator';
import { detectSchema, validateItem } from '@/lib/toon/schema-validator';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient();
    const body = await request.json();
    const { path, item, validate = true } = body;

    if (!path) {
      return NextResponse.json(
        { error: 'path is required' },
        { status: 400 }
      );
    }

    if (!item || typeof item !== 'object') {
      return NextResponse.json(
        { error: 'item must be an object' },
        { status: 400 }
      );
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

    // Validate item against existing schema if requested
    if (validate && table.data) {
      // Try to get the array at the path
      let targetArray: any = table.data;
      const pathSegments = path.split('.');
      for (const segment of pathSegments) {
        if (targetArray && segment in targetArray) {
          targetArray = targetArray[segment];
        }
      }

      if (Array.isArray(targetArray) && targetArray.length > 0) {
        const schema = detectSchema(targetArray);
        const validation = validateItem(item, schema, false);
        
        if (!validation.valid) {
          return NextResponse.json(
            {
              error: 'Validation failed',
              errors: validation.errors,
              warnings: validation.warnings,
            },
            { status: 400 }
          );
        }

        // Log warnings if any
        if (validation.warnings.length > 0) {
          console.log('Validation warnings:', validation.warnings);
        }
      }
    }

    // Perform insert
    const result = insertItem(table.data, path, item);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    // Update row count
    const newRowCount = table.row_count + result.insertedCount;

    // Save updated data back to database
    const { error: updateError } = await ((supabase as any)
      .from('toon_tables')
      .update({
        data: result.newData,
        toon_content: result.newToon,
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
      success: true,
      message: result.message,
      insertedCount: result.insertedCount,
    });
  } catch (error) {
    console.error('Insert error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
