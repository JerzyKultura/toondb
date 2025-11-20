import { JsonValue, JsonObject, JsonArray, DecodeOptions } from './types';

const DEFAULT_OPTIONS: Required<DecodeOptions> = {
  indent: 2,
  strict: true,
  expandPaths: 'off',
};

export class ToonDecoder {
  private options: Required<DecodeOptions>;
  private lines: string[];
  private currentLine: number;

  constructor(options: DecodeOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.lines = [];
    this.currentLine = 0;
  }

  decode(input: string): JsonValue {
    this.lines = input.split('\n');
    this.currentLine = 0;

    // Skip empty lines at start
    while (this.currentLine < this.lines.length && this.lines[this.currentLine].trim() === '') {
      this.currentLine++;
    }

    if (this.currentLine >= this.lines.length) {
      return null;
    }

    const firstLine = this.lines[this.currentLine];
    
    // Check if root is an array
    if (firstLine.trim().startsWith('[')) {
      return this.decodeRootArray();
    }

    // Otherwise decode as object
    return this.decodeObject(0);
  }

  private decodeRootArray(): JsonArray {
    const line = this.lines[this.currentLine].trim();
    const arrayMatch = line.match(/^\[(\d+)([,\t|])?\]:\s*(.*)$/);
    
    if (!arrayMatch) {
      throw new Error(`Invalid root array format at line ${this.currentLine + 1}`);
    }

    const length = parseInt(arrayMatch[1], 10);
    const delimiter = arrayMatch[2] || ',';
    const content = arrayMatch[3];

    this.currentLine++;

    // Empty array
    if (length === 0) {
      return [];
    }

    // Inline array
    if (content) {
      return this.parseInlineArray(content, delimiter);
    }

    // Multi-line array
    return this.decodeMultiLineArray(length, delimiter, 0);
  }

  private decodeObject(depth: number): JsonObject {
    const obj: JsonObject = {};
    const expectedIndent = depth * this.options.indent;

    while (this.currentLine < this.lines.length) {
      const line = this.lines[this.currentLine];
      
      // Skip empty lines
      if (line.trim() === '') {
        this.currentLine++;
        continue;
      }

      const indent = this.getIndentLevel(line);
      
      // If indent is less than expected, we've reached the end of this object
      if (indent < expectedIndent) {
        break;
      }

      // If indent is greater, skip (will be handled by nested call)
      if (indent > expectedIndent) {
        this.currentLine++;
        continue;
      }

      const trimmed = line.trim();

      // Parse key-value pair
      const colonIndex = this.findUnquotedColon(trimmed);
      if (colonIndex === -1) {
        if (this.options.strict) {
          throw new Error(`Missing colon at line ${this.currentLine + 1}: ${line}`);
        }
        this.currentLine++;
        continue;
      }

      const keyPart = trimmed.substring(0, colonIndex).trim();
      const valuePart = trimmed.substring(colonIndex + 1).trim();

      const key = this.parseKey(keyPart);

      // Check if value is an array
      if (keyPart.includes('[')) {
        const arrayMatch = keyPart.match(/^(.*?)\[(\d+)([,\t|])?\]({.*})?$/);
        if (arrayMatch) {
          const actualKey = this.parseKey(arrayMatch[1]);
          const length = parseInt(arrayMatch[2], 10);
          const delimiter = arrayMatch[3] || ',';
          const fields = arrayMatch[4];

          this.currentLine++;

          if (length === 0) {
            obj[actualKey] = [];
          } else if (valuePart) {
            obj[actualKey] = this.parseInlineArray(valuePart, delimiter);
          } else if (fields) {
            obj[actualKey] = this.decodeTabularArray(length, delimiter, fields, depth + 1);
          } else {
            obj[actualKey] = this.decodeMultiLineArray(length, delimiter, depth + 1);
          }
          continue;
        }
      }

      // Nested object
      if (!valuePart) {
        this.currentLine++;
        obj[key] = this.decodeObject(depth + 1);
      } else {
        // Primitive value
        obj[key] = this.parseValue(valuePart);
        this.currentLine++;
      }
    }

    return obj;
  }

  private decodeTabularArray(length: number, delimiter: string, fieldsStr: string, depth: number): JsonArray {
    const fields = this.parseFields(fieldsStr);
    const result: JsonArray = [];
    const expectedIndent = depth * this.options.indent;

    for (let i = 0; i < length; i++) {
      if (this.currentLine >= this.lines.length) {
        if (this.options.strict) {
          throw new Error(`Array length mismatch: expected ${length} rows, got ${i}`);
        }
        break;
      }

      const line = this.lines[this.currentLine];
      const indent = this.getIndentLevel(line);

      if (indent !== expectedIndent) {
        if (this.options.strict) {
          throw new Error(`Incorrect indentation at line ${this.currentLine + 1}`);
        }
        break;
      }

      const values = this.parseDelimitedValues(line.trim(), delimiter);
      
      if (values.length !== fields.length && this.options.strict) {
        throw new Error(`Field count mismatch at line ${this.currentLine + 1}: expected ${fields.length}, got ${values.length}`);
      }

      const obj: JsonObject = {};
      for (let j = 0; j < Math.min(fields.length, values.length); j++) {
        obj[fields[j]] = this.parseValue(values[j]);
      }

      result.push(obj);
      this.currentLine++;
    }

    return result;
  }

  private decodeMultiLineArray(length: number, delimiter: string, depth: number): JsonArray {
    const result: JsonArray = [];
    const expectedIndent = depth * this.options.indent;

    for (let i = 0; i < length; i++) {
      if (this.currentLine >= this.lines.length) {
        if (this.options.strict) {
          throw new Error(`Array length mismatch: expected ${length} items, got ${i}`);
        }
        break;
      }

      const line = this.lines[this.currentLine];
      const indent = this.getIndentLevel(line);

      if (indent < expectedIndent) {
        break;
      }

      const trimmed = line.trim();
      
      if (trimmed.startsWith('- ')) {
        const content = trimmed.substring(2);
        
        // Inline array
        if (content.startsWith('[')) {
          const arrayMatch = content.match(/^\[(\d+)([,\t|])?\]:\s*(.*)$/);
          if (arrayMatch) {
            const itemDelimiter = arrayMatch[2] || ',';
            const itemContent = arrayMatch[3];
            this.currentLine++;
            result.push(this.parseInlineArray(itemContent, itemDelimiter));
            continue;
          }
        }

        // Check if it's an object
        if (content.includes(':')) {
          const colonIndex = this.findUnquotedColon(content);
          if (colonIndex !== -1) {
            const keyPart = content.substring(0, colonIndex).trim();
            const valuePart = content.substring(colonIndex + 1).trim();
            
            if (!valuePart) {
              // Multi-line object
              this.currentLine++;
              result.push(this.decodeObject(depth + 1));
            } else {
              // Single-line object
              const obj: JsonObject = {};
              obj[this.parseKey(keyPart)] = this.parseValue(valuePart);
              this.currentLine++;
              result.push(obj);
            }
            continue;
          }
        }

        // Primitive value
        result.push(this.parseValue(content));
        this.currentLine++;
      } else {
        this.currentLine++;
      }
    }

    return result;
  }

  private parseInlineArray(content: string, delimiter: string): JsonArray {
    const values = this.parseDelimitedValues(content, delimiter);
    return values.map(v => this.parseValue(v));
  }

  private parseDelimitedValues(line: string, delimiter: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    let escapeNext = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (escapeNext) {
        current += char;
        escapeNext = false;
        continue;
      }

      if (char === '\\') {
        escapeNext = true;
        continue;
      }

      if (char === '"') {
        inQuotes = !inQuotes;
        current += char;
        continue;
      }

      if (!inQuotes && char === delimiter) {
        values.push(current.trim());
        current = '';
        continue;
      }

      current += char;
    }

    if (current.trim() !== '') {
      values.push(current.trim());
    }

    return values;
  }

  private parseFields(fieldsStr: string): string[] {
    // Remove { and }
    const content = fieldsStr.substring(1, fieldsStr.length - 1);
    // Split by delimiter (could be comma, tab, or pipe)
    const delimiter = content.includes('\t') ? '\t' : content.includes('|') ? '|' : ',';
    return content.split(delimiter).map(f => f.trim());
  }

  private parseKey(key: string): string {
    if (key.startsWith('"') && key.endsWith('"')) {
      return this.unescapeString(key.substring(1, key.length - 1));
    }
    return key;
  }

  private parseValue(value: string): JsonValue {
    value = value.trim();

    if (value === 'null') return null;
    if (value === 'true') return true;
    if (value === 'false') return false;

    // Quoted string
    if (value.startsWith('"') && value.endsWith('"')) {
      return this.unescapeString(value.substring(1, value.length - 1));
    }

    // Number
    if (/^-?\d+$/.test(value)) {
      return parseInt(value, 10);
    }
    if (/^-?\d+\.\d+$/.test(value)) {
      return parseFloat(value);
    }
    if (/^-?\d+(\.\d+)?[eE][+-]?\d+$/.test(value)) {
      return parseFloat(value);
    }

    // Unquoted string
    return value;
  }

  private unescapeString(str: string): string {
    return str
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\');
  }

  private findUnquotedColon(str: string): number {
    let inQuotes = false;
    let escapeNext = false;

    for (let i = 0; i < str.length; i++) {
      const char = str[i];

      if (escapeNext) {
        escapeNext = false;
        continue;
      }

      if (char === '\\') {
        escapeNext = true;
        continue;
      }

      if (char === '"') {
        inQuotes = !inQuotes;
        continue;
      }

      if (!inQuotes && char === ':') {
        return i;
      }
    }

    return -1;
  }

  private getIndentLevel(line: string): number {
    let spaces = 0;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === ' ') {
        spaces++;
      } else {
        break;
      }
    }
    return spaces;
  }
}

export function decode(input: string, options?: DecodeOptions): JsonValue {
  const decoder = new ToonDecoder(options);
  return decoder.decode(input);
}

