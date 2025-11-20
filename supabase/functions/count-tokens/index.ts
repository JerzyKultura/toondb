// Supabase Edge Function: Count and Compare Tokens
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

function countTokens(text: string): number {
  // Simplified token counting (approximation)
  const withoutExcessWhitespace = text.replace(/\s+/g, ' ').trim();
  const charCount = withoutExcessWhitespace.length;
  let tokenEstimate = Math.ceil(charCount / 4);
  
  const specialChars = (text.match(/[,:.;!?{}\[\]()]/g) || []).length;
  tokenEstimate += Math.ceil(specialChars * 0.5);
  
  return tokenEstimate;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }
  
  try {
    const { toon_content, json_content } = await req.json();
    
    if (!toon_content && !json_content) {
      return new Response(
        JSON.stringify({ error: 'At least one content type is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    
    const toonTokens = toon_content ? countTokens(toon_content) : 0;
    const jsonTokens = json_content ? countTokens(json_content) : 0;
    
    const result = {
      toon_tokens: toonTokens,
      json_tokens: jsonTokens,
      savings: jsonTokens - toonTokens,
      savings_percentage: jsonTokens > 0 
        ? Math.round(((jsonTokens - toonTokens) / jsonTokens) * 100 * 100) / 100 
        : 0,
    };
    
    return new Response(
      JSON.stringify({ success: true, ...result }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Token counting error',
        message: error.message,
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});

