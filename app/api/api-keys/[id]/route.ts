import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Delete the API key (ensure it belongs to the user)
    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log audit event - skip if RPC doesn't exist
    try {
      await supabase.rpc('log_audit_event', {
        p_action: 'api_key_deleted',
        p_resource_type: 'api_key',
        p_resource_id: id,
        p_metadata: {},
      } as any);
    } catch (rpcError) {
      console.error('Audit log error:', rpcError);
    }

    return NextResponse.json({ message: 'API key deleted successfully' });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
