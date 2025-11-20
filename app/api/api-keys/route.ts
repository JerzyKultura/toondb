import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { randomBytes, createHash } from 'crypto';

function generateApiKey(): { key: string; hash: string; prefix: string } {
  const key = `toon_${randomBytes(32).toString('hex')}`;
  const hash = createHash('sha256').update(key).digest('hex');
  const prefix = key.substring(0, 12);
  
  return { key, hash, prefix };
}

export async function GET() {
  try {
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: apiKeys, error } = await supabase
      .from('api_keys')
      .select('id, name, key_prefix, last_used_at, expires_at, is_active, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ api_keys: apiKeys });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, expires_in_days } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const { key, hash, prefix } = generateApiKey();
    
    let expiresAt: string | null = null;
    if (expires_in_days && expires_in_days > 0) {
      const date = new Date();
      date.setDate(date.getDate() + expires_in_days);
      expiresAt = date.toISOString();
    }

    const { data: apiKey, error } = await supabase
      .from('api_keys')
      .insert({
        user_id: user.id,
        key_hash: hash,
        key_prefix: prefix,
        name,
        expires_at: expiresAt,
      })
      .select('id, name, key_prefix, expires_at, is_active, created_at')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log audit event - skip if RPC doesn't exist
    try {
      await supabase.rpc('log_audit_event', {
        p_action: 'api_key_created',
        p_resource_type: 'api_key',
        p_resource_id: apiKey.id,
        p_metadata: { name },
      } as any);
    } catch (rpcError) {
      console.error('Audit log error:', rpcError);
    }

    return NextResponse.json({
      api_key: apiKey,
      key,
      warning: 'Save this key now. You won\'t be able to see it again.',
    }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
