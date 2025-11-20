// Supabase Edge Function: Convert between TOON and JSON
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// Simple TOON encoder
function encodeToon(value: any, indent = 0): string {
  if (value === null || value === undefined) return '';
  
  if (Array.isArray(value)) {
    if (value.length === 0) return '[0]:';
    
    // Check if uniform primitives
    if (value.every(v => typeof v !== 'object' || v === null)) {
      const firstType = typeof value[0];
      if (value.every(v => typeof v === firstType)) {
        return `[${value.length}]: ${value.join(',')}`;
      }
    }
    
    // Check if uniform objects
    if (value.every(v => v !== null && typeof v === 'object' && !Array.isArray(v))) {
      const firstKeys = Object.keys(value[0]).sort();
      const isUniform = value.slice(1).every((v: any) => {
        const keys = Object.keys(v).sort();
        return keys.length === firstKeys.length && keys.every((k, i) => k === firstKeys[i]);
      });
      
      if (isUniform) {
        const fields = Object.keys(value[0]);
        let result = `[${value.length}]{${fields.join(',')}}:\n`;
        for (const obj of value) {
          const values = fields.map(f => String(obj[f]));
          result += '  ' + values.join(',') + '\n';
        }
        return result.trim();
      }
    }
  }
  
  if (typeof value === 'object' && !Array.isArray(value)) {
    const lines: string[] = [];
    const indentStr = ' '.repeat(indent * 2);
    
    for (const [key, val] of Object.entries(value)) {
      if (val === null || val === undefined) continue;
      
      if (Array.isArray(val)) {
        const arrayOutput = encodeToon(val);
        lines.push(`${indentStr}${key}${arrayOutput.startsWith('[') ? arrayOutput : ': ' + arrayOutput}`);
      } else if (typeof val === 'object') {
        lines.push(`${indentStr}${key}:`);
        lines.push(encodeToon(val, indent + 1));
      } else {
        lines.push(`${indentStr}${key}: ${val}`);
      }
    }
    
    return lines.join('\n');
  }
  
  return String(value);
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
    const { content, from_format, to_format } = await req.json();
    
    if (!content || !from_format || !to_format) {
      return new Response(
        JSON.stringify({ error: 'content, from_format, and to_format are required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    
    let result: string;
    
    if (from_format === 'json' && to_format === 'toon') {
      const jsonData = JSON.parse(content);
      result = encodeToon(jsonData);
    } else if (from_format === 'toon' && to_format === 'json') {
      // Would need to import decoder - simplified for now
      return new Response(
        JSON.stringify({ error: 'TOON to JSON conversion not yet implemented in Edge Function' }),
        {
          status: 501,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid conversion format' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    
    return new Response(
      JSON.stringify({ success: true, output: result }),
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
        error: 'Conversion error',
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

