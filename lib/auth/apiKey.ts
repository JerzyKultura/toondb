import { createHash } from 'crypto';
import { createServerClient } from '@/lib/supabase/server';

export async function validateApiKey(apiKey: string): Promise<string | null> {
  if (!apiKey || !apiKey.startsWith('toon_')) {
    return null;
  }

  try {
    // Hash the API key
    const keyHash = createHash('sha256').update(apiKey).digest('hex');

    // Get the Supabase client
    const supabase = createServerClient();

    // Look up the API key in the database
    const { data: apiKeyRecord, error } = await supabase
      .from('api_keys')
      .select('id, user_id, is_active, expires_at')
      .eq('key_hash', keyHash)
      .single();

    if (error || !apiKeyRecord) {
      return null;
    }

    // Check if the key is active
    if (!apiKeyRecord.is_active) {
      return null;
    }

    // Check if the key has expired
    if (apiKeyRecord.expires_at) {
      const expiresAt = new Date(apiKeyRecord.expires_at);
      if (expiresAt < new Date()) {
        return null;
      }
    }

    // Update last_used_at
    await supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', apiKeyRecord.id);

    // Return the user ID
    return apiKeyRecord.user_id;
  } catch (err) {
    console.error('Error validating API key:', err);
    return null;
  }
}

export function extractApiKeyFromRequest(request: Request): string | null {
  // Check Authorization header
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check X-API-Key header
  const apiKeyHeader = request.headers.get('X-API-Key');
  if (apiKeyHeader) {
    return apiKeyHeader;
  }

  return null;
}
