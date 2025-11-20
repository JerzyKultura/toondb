// Supabase Edge Function: Parse TOON Format
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// Simple TOON decoder for Edge Function
function decodeToon(input: string): any {
  const lines = input.split('\n');
  let currentLine = 0;
  
  function skipEmpty() {
    while (currentLine < lines.length && lines[currentLine].trim() === '') {
      currentLine++;
    }
  }
  
  function getIndent(line: string): number {
    let spaces = 0;
    for (const char of line) {
      if (char === ' ') spaces++;
      else break;
    }
    return spaces;
  }
  
  function parseValue(value: string): any {
    value = value.trim();
    if (value === 'null') return null;
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value.startsWith('"') && value.endsWith('"')) {
      return value.substring(1, value.length - 1)
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\');
    }
    if (/^-?\d+$/.test(value)) return parseInt(value, 10);
    if (/^-?\d+\.\d+$/.test(value)) return parseFloat(value);
    return value;
  }
  
  function parseObject(depth: number): any {
    const obj: any = {};
    const expectedIndent = depth * 2;
    
    while (currentLine < lines.length) {
      const line = lines[currentLine];
      if (line.trim() === '') {
        currentLine++;
        continue;
      }
      
      const indent = getIndent(line);
      if (indent < expectedIndent) break;
      if (indent > expectedIndent) {
        currentLine++;
        continue;
      }
      
      const trimmed = line.trim();
      const colonIndex = trimmed.indexOf(':');
      if (colonIndex === -1) {
        currentLine++;
        continue;
      }
      
      const keyPart = trimmed.substring(0, colonIndex).trim();
      const valuePart = trimmed.substring(colonIndex + 1).trim();
      const key = keyPart.replace(/^"|"$/g, '');
      
      // Check for array
      if (keyPart.includes('[')) {
        const arrayMatch = keyPart.match(/^(.*?)\[(\d+)([,\t|])?\]({.*})?$/);
        if (arrayMatch) {
          const actualKey = arrayMatch[1].replace(/^"|"$/g, '');
          const length = parseInt(arrayMatch[2], 10);
          const delimiter = arrayMatch[3] || ',';
          const fields = arrayMatch[4];
          
          currentLine++;
          
          if (length === 0) {
            obj[actualKey] = [];
          } else if (valuePart) {
            obj[actualKey] = valuePart.split(delimiter).map(v => parseValue(v));
          } else if (fields) {
            const fieldNames = fields.substring(1, fields.length - 1).split(delimiter);
            const arr = [];
            for (let i = 0; i < length; i++) {
              if (currentLine >= lines.length) break;
              const rowLine = lines[currentLine];
              const values = rowLine.trim().split(delimiter);
              const rowObj: any = {};
              for (let j = 0; j < fieldNames.length; j++) {
                rowObj[fieldNames[j].trim()] = parseValue(values[j] || '');
              }
              arr.push(rowObj);
              currentLine++;
            }
            obj[actualKey] = arr;
          }
          continue;
        }
      }
      
      if (!valuePart) {
        currentLine++;
        obj[key] = parseObject(depth + 1);
      } else {
        obj[key] = parseValue(valuePart);
        currentLine++;
      }
    }
    
    return obj;
  }
  
  skipEmpty();
  if (currentLine >= lines.length) return null;
  
  const firstLine = lines[currentLine].trim();
  if (firstLine.startsWith('[')) {
    const arrayMatch = firstLine.match(/^\[(\d+)([,\t|])?\]:\s*(.*)$/);
    if (arrayMatch) {
      const length = parseInt(arrayMatch[1], 10);
      const delimiter = arrayMatch[2] || ',';
      const content = arrayMatch[3];
      
      currentLine++;
      
      if (length === 0) return [];
      if (content) {
        return content.split(delimiter).map(v => parseValue(v));
      }
    }
  }
  
  return parseObject(0);
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
    const { toon_content, strict = true } = await req.json();
    
    if (!toon_content) {
      return new Response(
        JSON.stringify({ error: 'toon_content is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    
    const parsed = decodeToon(toon_content);
    
    return new Response(
      JSON.stringify({ success: true, data: parsed }),
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
        error: 'Parse error',
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

