// TOON Type Definitions

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;
export interface JsonObject {
  [key: string]: JsonValue;
}
export type JsonArray = JsonValue[];

export interface EncodeOptions {
  indent?: number;
  keyFolding?: 'off' | 'safe';
  delimiter?: ',' | '\t' | '|';
  minTabularRows?: number;
}

export interface DecodeOptions {
  indent?: number;
  strict?: boolean;
  expandPaths?: 'off' | 'safe';
}

export interface TokenCount {
  toon: number;
  json: number;
  savings: number;
  savingsPercentage: number;
}

export interface ConversionResult {
  output: string;
  tokenCount?: TokenCount;
  error?: string;
}

