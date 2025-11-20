import { JsonValue, JsonObject, JsonArray, EncodeOptions } from './types';

const DEFAULT_OPTIONS: Required<EncodeOptions> = {
  indent: 2,
  keyFolding: 'off',
  delimiter: ',',
  minTabularRows: 2,
};

export class ToonEncoder {
  private options: Required<EncodeOptions>;

  constructor(options: EncodeOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  encode(value: JsonValue): string {
    if (value === null || value === undefined) {
      return '';
    }

    if (Array.isArray(value)) {
      return this.encodeRootArray(value);
    }

    if (typeof value === 'object') {
      return this.encodeObject(value as JsonObject, 0);
    }

    return this.encodeValue(value, 0);
  }

  private encodeRootArray(arr: JsonArray): string {
    if (arr.length === 0) {
      return '[0]:';
    }

    // Check if uniform array of primitives
    if (this.isUniformPrimitiveArray(arr)) {
      return `[${arr.length}]: ${this.encodeArrayInline(arr)}`;
    }

    // Check if uniform array of objects (tabular)
    if (this.isUniformObjectArray(arr) && arr.length >= this.options.minTabularRows) {
      return this.encodeTabularArray(arr as JsonObject[], 0);
    }

    // Mixed array (list format)
    return this.encodeListArray(arr, 0);
  }

  private encodeObject(obj: JsonObject, depth: number): string {
    const entries = Object.entries(obj);
    if (entries.length === 0) {
      return '';
    }

    const indentStr = ' '.repeat(depth * this.options.indent);
    const lines: string[] = [];

    for (const [key, value] of entries) {
      if (value === null || value === undefined) {
        continue;
      }

      const safeKey = this.escapeKey(key);

      if (Array.isArray(value)) {
        const arrayOutput = this.encodeArray(value, key, depth);
        lines.push(`${indentStr}${safeKey}${arrayOutput}`);
      } else if (typeof value === 'object') {
        lines.push(`${indentStr}${safeKey}:`);
        const nested = this.encodeObject(value as JsonObject, depth + 1);
        if (nested) {
          lines.push(nested);
        }
      } else {
        const encoded = this.encodeValue(value, depth);
        lines.push(`${indentStr}${safeKey}: ${encoded}`);
      }
    }

    return lines.join('\n');
  }

  private encodeArray(arr: JsonArray, key: string, depth: number): string {
    if (arr.length === 0) {
      return '[0]:';
    }

    // Inline primitive array
    if (this.isUniformPrimitiveArray(arr)) {
      const delimiter = this.options.delimiter;
      return `[${arr.length}${delimiter}]: ${this.encodeArrayInline(arr)}`;
    }

    // Tabular format for uniform objects
    if (this.isUniformObjectArray(arr) && arr.length >= this.options.minTabularRows) {
      return this.encodeTabularArray(arr as JsonObject[], depth);
    }

    // List format for mixed arrays
    return this.encodeListArray(arr, depth);
  }

  private encodeTabularArray(arr: JsonObject[], depth: number): string {
    if (arr.length === 0) return '[0]:';

    const delimiter = this.options.delimiter;
    const fields = Object.keys(arr[0]);
    const header = `[${arr.length}${delimiter}]{${fields.join(delimiter)}}:`;

    const rows: string[] = [];
    for (const obj of arr) {
      const values = fields.map(field => {
        const val = obj[field];
        return this.encodeTableValue(val);
      });
      rows.push(values.join(delimiter));
    }

    const indentStr = ' '.repeat((depth + 1) * this.options.indent);
    const rowLines = rows.map(row => `${indentStr}${row}`).join('\n');

    return `${header}\n${rowLines}`;
  }

  private encodeListArray(arr: JsonArray, depth: number): string {
    const delimiter = this.options.delimiter;
    const header = `[${arr.length}${delimiter}]:`;
    const indentStr = ' '.repeat((depth + 1) * this.options.indent);
    
    const items: string[] = [];
    for (const item of arr) {
      if (item === null || typeof item !== 'object') {
        items.push(`${indentStr}- ${this.encodeValue(item, depth + 1)}`);
      } else if (Array.isArray(item)) {
        if (this.isUniformPrimitiveArray(item)) {
          const inline = this.encodeArrayInline(item);
          items.push(`${indentStr}- [${item.length}${delimiter}]: ${inline}`);
        } else {
          items.push(`${indentStr}-`);
          const nested = this.encodeObject(item as any, depth + 2);
          if (nested) items.push(nested);
        }
      } else {
        const objLines = this.encodeObject(item as JsonObject, depth + 1);
        const firstLine = objLines.split('\n')[0];
        const rest = objLines.split('\n').slice(1).join('\n');
        items.push(`${indentStr}- ${firstLine.trim()}`);
        if (rest) items.push(rest);
      }
    }

    return `${header}\n${items.join('\n')}`;
  }

  private encodeArrayInline(arr: JsonArray): string {
    const delimiter = this.options.delimiter;
    return arr.map(v => this.encodeTableValue(v)).join(delimiter);
  }

  private encodeTableValue(value: JsonValue): string {
    if (value === null) return 'null';
    if (value === true) return 'true';
    if (value === false) return 'false';
    if (typeof value === 'number') return String(value);
    if (typeof value === 'string') {
      return this.needsQuoting(value) ? this.quoteString(value) : value;
    }
    return JSON.stringify(value);
  }

  private encodeValue(value: JsonValue, depth: number): string {
    if (value === null) return 'null';
    if (typeof value === 'boolean') return String(value);
    if (typeof value === 'number') return String(value);
    if (typeof value === 'string') {
      return this.needsQuoting(value) ? this.quoteString(value) : value;
    }
    return JSON.stringify(value);
  }

  private needsQuoting(str: string): boolean {
    if (str === '') return true;
    if (str === 'null' || str === 'true' || str === 'false') return true;
    if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(str)) return true;
    if (str.includes(this.options.delimiter)) return true;
    if (str.includes('\n') || str.includes('\r')) return true;
    if (str.includes('"') || str.includes('\\')) return true;
    if (str.startsWith(' ') || str.endsWith(' ')) return true;
    if (str.startsWith('[') || str.startsWith('{')) return true;
    return false;
  }

  private quoteString(str: string): string {
    let escaped = str
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
    return `"${escaped}"`;
  }

  private escapeKey(key: string): string {
    if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)) {
      return key;
    }
    return this.quoteString(key);
  }

  private isUniformPrimitiveArray(arr: JsonArray): boolean {
    if (arr.length === 0) return false;
    const firstType = typeof arr[0];
    if (firstType === 'object') return false;
    return arr.every(item => typeof item === firstType && item !== null);
  }

  private isUniformObjectArray(arr: JsonArray): boolean {
    if (arr.length === 0) return false;
    if (!arr.every(item => item !== null && typeof item === 'object' && !Array.isArray(item))) {
      return false;
    }

    const firstKeys = Object.keys(arr[0] as object).sort();
    return arr.slice(1).every(item => {
      const keys = Object.keys(item as object).sort();
      return keys.length === firstKeys.length &&
        keys.every((k, i) => k === firstKeys[i]);
    });
  }
}

export function encode(value: JsonValue, options?: EncodeOptions): string {
  const encoder = new ToonEncoder(options);
  return encoder.encode(value);
}

