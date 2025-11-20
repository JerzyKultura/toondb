/**
 * Path Parser for Data Manipulation
 * Parses update/insert/delete paths into actionable AST
 * 
 * Examples:
 * - "products['Mechanical Keyboard'].price"
 * - "products[id==8].price"
 * - "store.products[name=='Widget']"
 */

export interface PathAST {
  path: string[];
  selector: Selector | null;
  targetField: string | null;
}

export type Selector = FieldSelector | FilterSelector;

export interface FieldSelector {
  type: 'field';
  field: string;
  value: string | number | boolean;
}

export interface FilterSelector {
  type: 'filter';
  field: string;
  operator: '==' | '!=' | '<' | '>' | '<=' | '>=';
  value: string | number | boolean;
}

export class PathParser {
  private input: string;
  private position: number;

  constructor(path: string) {
    this.input = path.trim();
    this.position = 0;
  }

  parse(): PathAST {
    const ast: PathAST = {
      path: [],
      selector: null,
      targetField: null,
    };

    // Parse path segments
    while (this.position < this.input.length) {
      this.skipWhitespace();
      
      if (this.position >= this.input.length) break;

      const char = this.current();

      // Dot separator
      if (char === '.') {
        this.position++;
        continue;
      }

      // Selector with bracket
      if (char === '[') {
        ast.selector = this.parseSelector();
        continue;
      }

      // Identifier (path segment or field)
      if (this.isIdentifierStart(char)) {
        const identifier = this.parseIdentifier();
        
        // Check if this is the last segment (target field)
        this.skipWhitespace();
        if (this.position >= this.input.length) {
          // If we already have a selector, this is the target field
          if (ast.selector) {
            ast.targetField = identifier;
          } else {
            // Otherwise it's just a path segment
            ast.path.push(identifier);
          }
        } else if (this.current() === '.' && this.peek(1) !== '[') {
          // More path segments to come
          ast.path.push(identifier);
        } else if (this.current() === '[') {
          // Selector follows
          ast.path.push(identifier);
        } else {
          // Last segment
          ast.path.push(identifier);
        }
        continue;
      }

      throw new Error(`Unexpected character '${char}' at position ${this.position}`);
    }

    return ast;
  }

  private parseSelector(): Selector {
    this.position++; // Skip opening '['
    this.skipWhitespace();

    // Check if it's a string literal selector ['value']
    if (this.current() === "'" || this.current() === '"') {
      const value = this.parseString();
      this.skipWhitespace();
      if (this.current() !== ']') {
        throw new Error(`Expected ']' at position ${this.position}`);
      }
      this.position++; // Skip closing ']'
      
      // This is a field selector, typically matching a 'name' field
      return {
        type: 'field',
        field: 'name', // Default to 'name' field for string selectors
        value,
      };
    }

    // Otherwise it's a filter expression: field==value
    const field = this.parseIdentifier();
    this.skipWhitespace();

    // Parse operator
    const operator = this.parseOperator();
    this.skipWhitespace();

    // Parse value
    let value: string | number | boolean;
    if (this.current() === "'" || this.current() === '"') {
      value = this.parseString();
    } else if (this.current() === 't' || this.current() === 'f') {
      value = this.parseBoolean();
    } else if (this.isDigit(this.current()) || this.current() === '-') {
      value = this.parseNumber();
    } else {
      throw new Error(`Expected value at position ${this.position}`);
    }

    this.skipWhitespace();
    if (this.current() !== ']') {
      throw new Error(`Expected ']' at position ${this.position}`);
    }
    this.position++; // Skip closing ']'

    return {
      type: 'filter',
      field,
      operator,
      value,
    };
  }

  private parseIdentifier(): string {
    let identifier = '';
    while (this.position < this.input.length && this.isIdentifierChar(this.current())) {
      identifier += this.current();
      this.position++;
    }
    return identifier;
  }

  private parseString(): string {
    const quote = this.current();
    this.position++; // Skip opening quote

    let value = '';
    while (this.position < this.input.length && this.current() !== quote) {
      if (this.current() === '\\' && this.position + 1 < this.input.length) {
        this.position++;
        value += this.current();
      } else {
        value += this.current();
      }
      this.position++;
    }

    if (this.position >= this.input.length) {
      throw new Error('Unterminated string');
    }

    this.position++; // Skip closing quote
    return value;
  }

  private parseNumber(): number {
    let numStr = '';
    if (this.current() === '-') {
      numStr += '-';
      this.position++;
    }
    while (this.position < this.input.length && 
           (this.isDigit(this.current()) || this.current() === '.')) {
      numStr += this.current();
      this.position++;
    }
    return parseFloat(numStr);
  }

  private parseBoolean(): boolean {
    if (this.input.substr(this.position, 4) === 'true') {
      this.position += 4;
      return true;
    } else if (this.input.substr(this.position, 5) === 'false') {
      this.position += 5;
      return false;
    }
    throw new Error(`Expected boolean at position ${this.position}`);
  }

  private parseOperator(): '==' | '!=' | '<' | '>' | '<=' | '>=' {
    const char = this.current();
    const nextChar = this.peek(1);

    if ((char === '=' || char === '!' || char === '<' || char === '>') && nextChar === '=') {
      this.position += 2;
      return (char + nextChar) as '==' | '!=' | '<=' | '>=';
    } else if (char === '<' || char === '>') {
      this.position++;
      return char as '<' | '>';
    }

    throw new Error(`Expected operator at position ${this.position}`);
  }

  private current(): string {
    return this.input[this.position] || '';
  }

  private peek(offset: number): string {
    return this.input[this.position + offset] || '';
  }

  private skipWhitespace(): void {
    while (this.position < this.input.length && /\s/.test(this.current())) {
      this.position++;
    }
  }

  private isIdentifierStart(char: string): boolean {
    return /[a-zA-Z_]/.test(char);
  }

  private isIdentifierChar(char: string): boolean {
    return /[a-zA-Z0-9_]/.test(char);
  }

  private isDigit(char: string): boolean {
    return /[0-9]/.test(char);
  }
}

/**
 * Parse a path string into an AST
 */
export function parsePath(path: string): PathAST {
  const parser = new PathParser(path);
  return parser.parse();
}

/**
 * Validate a path string
 */
export function validatePath(path: string): { valid: boolean; error?: string } {
  try {
    parsePath(path);
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

