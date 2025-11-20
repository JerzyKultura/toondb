import { NextRequest, NextResponse } from 'next/server';
import { encode, decode, compareTokens } from '@/lib/toon';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, from_format, to_format, options = {} } = body;

    if (!content || !from_format || !to_format) {
      return NextResponse.json(
        { error: 'content, from_format, and to_format are required' },
        { status: 400 }
      );
    }

    let result: any;
    let tokenComparison = null;

    try {
      if (from_format === 'json' && to_format === 'toon') {
        // JSON to TOON
        const jsonData = JSON.parse(content);
        const toonOutput = encode(jsonData, options);
        
        tokenComparison = compareTokens(toonOutput, content);
        
        result = {
          output: toonOutput,
          token_comparison: tokenComparison,
        };
      } else if (from_format === 'toon' && to_format === 'json') {
        // TOON to JSON
        const toonData = decode(content, options);
        const jsonOutput = JSON.stringify(toonData, null, 2);
        
        tokenComparison = compareTokens(content, jsonOutput);
        
        result = {
          output: jsonOutput,
          token_comparison: tokenComparison,
        };
      } else {
        return NextResponse.json(
          { error: 'Invalid conversion format. Supported: json->toon, toon->json' },
          { status: 400 }
        );
      }

      return NextResponse.json(result);
    } catch (error) {
      return NextResponse.json(
        { error: `Conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

