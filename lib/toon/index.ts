// Main TOON library exports

export { encode, ToonEncoder } from './encoder';
export { decode, ToonDecoder } from './decoder';
export { countTokens, compareTokens, TokenCounter, tokenCounter } from './tokenizer';
export type {
  JsonValue,
  JsonObject,
  JsonArray,
  JsonPrimitive,
  EncodeOptions,
  DecodeOptions,
  TokenCount,
  ConversionResult,
} from './types';

/**
 * Convert JSON to TOON format
 */
export function jsonToToon(json: string, options?: any): string {
  try {
    const data = JSON.parse(json);
    const { encode } = require('./encoder');
    return encode(data, options);
  } catch (error) {
    throw new Error(`Failed to convert JSON to TOON: ${error}`);
  }
}

/**
 * Convert TOON to JSON format
 */
export function toonToJson(toon: string, options?: any): string {
  try {
    const { decode } = require('./decoder');
    const data = decode(toon, options);
    return JSON.stringify(data, null, 2);
  } catch (error) {
    throw new Error(`Failed to convert TOON to JSON: ${error}`);
  }
}

/**
 * Validate TOON format
 */
export function validate(toon: string): { valid: boolean; error?: string } {
  try {
    const { decode } = require('./decoder');
    decode(toon, { strict: true });
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

