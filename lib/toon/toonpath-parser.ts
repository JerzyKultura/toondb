/**
 * TOONPath Parser - Tokenizer and AST Builder
 * Parses TOONPath query strings into Abstract Syntax Trees
 */

export interface QueryAST {
  path: string[];
  filters: FilterExpression | null;
  fields: string[] | null;
  sort: SortExpression | null;
  limit: number | null;
}

export type FilterExpression =
  | ComparisonFilter
  | LogicalFilter
  | InFilter;

export interface ComparisonFilter {
  type: 'comparison';
  field: string;
  operator: '==' | '!=' | '<' | '>' | '<=' | '>=';
  value: string | number | boolean;
}

export interface LogicalFilter {
  type: 'logical';
  operator: 'and' | 'or';
  left: FilterExpression;
  right: FilterExpression;
}

export interface InFilter {
  type: 'in';
  field: string;
  values: (string | number | boolean)[];
}

export interface SortExpression {
  field: string;
  order: 'asc' | 'desc';
}

enum TokenType {
  IDENTIFIER,
  DOT,
  OPERATOR,
  VALUE,
  STRING,
  NUMBER,
  BOOLEAN,
  KEYWORD,
  COMMA,
  LBRACKET,
  RBRACKET,
  COLON,
  EOF,
}

interface Token {
  type: TokenType;
  value: string;
  position: number;
}

export class TOONPathParser {
  private input: string;
  private position: number;
  private tokens: Token[];
  private currentTokenIndex: number;

  constructor(query: string) {
    this.input = query.trim();
    this.position = 0;
    this.tokens = [];
    this.currentTokenIndex = 0;
  }

  parse(): QueryAST {
    this.tokenize();
    return this.parseQuery();
  }

  private tokenize(): void {
    while (this.position < this.input.length) {
      this.skipWhitespace();
      
      if (this.position >= this.input.length) break;

      const char = this.input[this.position];

      // String literals
      if (char === "'" || char === '"') {
        this.tokenizeString(char);
        continue;
      }

      // Numbers
      if (this.isDigit(char) || (char === '-' && this.isDigit(this.peekChar(1)))) {
        this.tokenizeNumber();
        continue;
      }

      // Operators
      if (this.isOperatorStart(char)) {
        this.tokenizeOperator();
        continue;
      }

      // Special characters
      if (char === '.') {
        this.tokens.push({ type: TokenType.DOT, value: '.', position: this.position });
        this.position++;
        continue;
      }

      if (char === ',') {
        this.tokens.push({ type: TokenType.COMMA, value: ',', position: this.position });
        this.position++;
        continue;
      }

      if (char === '[') {
        this.tokens.push({ type: TokenType.LBRACKET, value: '[', position: this.position });
        this.position++;
        continue;
      }

      if (char === ']') {
        this.tokens.push({ type: TokenType.RBRACKET, value: ']', position: this.position });
        this.position++;
        continue;
      }

      if (char === ':') {
        this.tokens.push({ type: TokenType.COLON, value: ':', position: this.position });
        this.position++;
        continue;
      }

      // Identifiers and keywords
      if (this.isIdentifierStart(char)) {
        this.tokenizeIdentifier();
        continue;
      }

      throw new Error(`Unexpected character '${char}' at position ${this.position}`);
    }

    this.tokens.push({ type: TokenType.EOF, value: '', position: this.position });
  }

  private tokenizeString(quote: string): void {
    const start = this.position;
    this.position++; // Skip opening quote
    
    let value = '';
    while (this.position < this.input.length && this.input[this.position] !== quote) {
      if (this.input[this.position] === '\\' && this.position + 1 < this.input.length) {
        this.position++;
        value += this.input[this.position];
      } else {
        value += this.input[this.position];
      }
      this.position++;
    }

    if (this.position >= this.input.length) {
      throw new Error(`Unterminated string starting at position ${start}`);
    }

    this.position++; // Skip closing quote
    this.tokens.push({ type: TokenType.STRING, value, position: start });
  }

  private tokenizeNumber(): void {
    const start = this.position;
    let value = '';

    if (this.input[this.position] === '-') {
      value += '-';
      this.position++;
    }

    while (this.position < this.input.length && 
           (this.isDigit(this.input[this.position]) || this.input[this.position] === '.')) {
      value += this.input[this.position];
      this.position++;
    }

    this.tokens.push({ type: TokenType.NUMBER, value, position: start });
  }

  private tokenizeOperator(): void {
    const start = this.position;
    const char = this.input[this.position];
    const nextChar = this.peekChar(1);

    if ((char === '=' || char === '!' || char === '<' || char === '>') && nextChar === '=') {
      this.tokens.push({ type: TokenType.OPERATOR, value: char + nextChar, position: start });
      this.position += 2;
    } else if (char === '<' || char === '>') {
      this.tokens.push({ type: TokenType.OPERATOR, value: char, position: start });
      this.position++;
    } else {
      throw new Error(`Invalid operator at position ${start}`);
    }
  }

  private tokenizeIdentifier(): void {
    const start = this.position;
    let value = '';

    while (this.position < this.input.length && this.isIdentifierChar(this.input[this.position])) {
      value += this.input[this.position];
      this.position++;
    }

    // Check for keywords
    if (value === 'and' || value === 'or' || value === 'in' || 
        value === 'sort' || value === 'limit' || 
        value === 'true' || value === 'false') {
      if (value === 'true' || value === 'false') {
        this.tokens.push({ type: TokenType.BOOLEAN, value, position: start });
      } else {
        this.tokens.push({ type: TokenType.KEYWORD, value, position: start });
      }
    } else {
      this.tokens.push({ type: TokenType.IDENTIFIER, value, position: start });
    }
  }

  private parseQuery(): QueryAST {
    const ast: QueryAST = {
      path: [],
      filters: null,
      fields: null,
      sort: null,
      limit: null,
    };

    // Parse path
    ast.path = this.parsePath();

    // Parse filters (if dot + identifier + operator, or just operator)
    if (this.currentToken().type === TokenType.DOT) {
      const next = this.peek(1);
      if (next.type === TokenType.IDENTIFIER) {
        const afterIdent = this.peek(2);
        if (afterIdent.type === TokenType.OPERATOR || afterIdent.value === 'in') {
          // This is a filter expression like .price>10
          this.advance(); // skip dot
          ast.filters = this.parseFilterExpression();
        }
      }
    } else if (this.currentToken().type === TokenType.OPERATOR) {
      ast.filters = this.parseFilterExpression();
    }

    // Parse field selection (if dot followed by identifiers/commas)
    if (this.currentToken().type === TokenType.DOT) {
      this.advance(); // skip dot
      ast.fields = this.parseFields();
    }

    // Parse sort
    if (this.currentToken().type === TokenType.KEYWORD && this.currentToken().value === 'sort') {
      ast.sort = this.parseSort();
    }

    // Parse limit
    if (this.currentToken().type === TokenType.KEYWORD && this.currentToken().value === 'limit') {
      ast.limit = this.parseLimit();
    }

    return ast;
  }

  private parsePath(): string[] {
    const path: string[] = [];

    if (this.currentToken().type !== TokenType.IDENTIFIER) {
      throw new Error(`Expected path identifier at position ${this.currentToken().position}`);
    }

    path.push(this.currentToken().value);
    this.advance();

    while (this.currentToken().type === TokenType.DOT) {
      this.advance(); // skip dot
      
      // Check if this is field selection or filter
      if (this.currentToken().type === TokenType.IDENTIFIER) {
        const next = this.peek(1);
        // If followed by operator, this is a filter field (not part of path)
        if (next.type === TokenType.OPERATOR) {
          // This is a filter expression, backtrack to the dot
          this.currentTokenIndex--; // Back to the dot
          break;
        }
        // If followed by comma, keyword, or EOF, this is field selection
        if (next.type === TokenType.COMMA || next.type === TokenType.KEYWORD || next.type === TokenType.EOF) {
          // This is field selection, backtrack to the dot
          this.currentTokenIndex--;
          break;
        }
        // Otherwise, it's part of the path
        path.push(this.currentToken().value);
        this.advance();
      } else {
        break;
      }
    }

    return path;
  }

  private parseFilterExpression(): FilterExpression {
    let left = this.parseComparison();

    while (this.currentToken().type === TokenType.KEYWORD && 
           (this.currentToken().value === 'and' || this.currentToken().value === 'or')) {
      const operator = this.currentToken().value as 'and' | 'or';
      this.advance();
      const right = this.parseComparison();
      left = {
        type: 'logical',
        operator,
        left,
        right,
      };
    }

    return left;
  }

  private parseComparison(): FilterExpression {
    if (this.currentToken().type !== TokenType.IDENTIFIER) {
      throw new Error(`Expected field name at position ${this.currentToken().position}`);
    }

    const field = this.currentToken().value;
    this.advance();

    // Check for 'in' operator
    if (this.currentToken().type === TokenType.KEYWORD && this.currentToken().value === 'in') {
      this.advance();
      return this.parseInFilter(field);
    }

    // Regular comparison
    if (this.currentToken().type !== TokenType.OPERATOR) {
      throw new Error(`Expected operator at position ${this.currentToken().position}`);
    }

    const operator = this.currentToken().value as '==' | '!=' | '<' | '>' | '<=' | '>=';
    this.advance();

    const value = this.parseValue();

    return {
      type: 'comparison',
      field,
      operator,
      value,
    };
  }

  private parseInFilter(field: string): InFilter {
    if (this.currentToken().type !== TokenType.LBRACKET) {
      throw new Error(`Expected '[' after 'in' at position ${this.currentToken().position}`);
    }
    this.advance();

    const values: (string | number | boolean)[] = [];

    while (this.currentToken().type !== TokenType.RBRACKET) {
      values.push(this.parseValue());

      if (this.currentToken().type === TokenType.COMMA) {
        this.advance();
      } else if (this.currentToken().type !== TokenType.RBRACKET) {
        throw new Error(`Expected ',' or ']' at position ${this.currentToken().position}`);
      }
    }

    this.advance(); // skip closing bracket

    return {
      type: 'in',
      field,
      values,
    };
  }

  private parseValue(): string | number | boolean {
    const token = this.currentToken();

    if (token.type === TokenType.STRING) {
      this.advance();
      return token.value;
    }

    if (token.type === TokenType.NUMBER) {
      this.advance();
      return parseFloat(token.value);
    }

    if (token.type === TokenType.BOOLEAN) {
      this.advance();
      return token.value === 'true';
    }

    throw new Error(`Expected value at position ${token.position}`);
  }

  private parseFields(): string[] {
    const fields: string[] = [];

    if (this.currentToken().type !== TokenType.IDENTIFIER) {
      throw new Error(`Expected field name at position ${this.currentToken().position}`);
    }

    fields.push(this.currentToken().value);
    this.advance();

    while (this.currentToken().type === TokenType.COMMA) {
      this.advance();
      if (this.currentToken().type !== TokenType.IDENTIFIER) {
        throw new Error(`Expected field name at position ${this.currentToken().position}`);
      }
      fields.push(this.currentToken().value);
      this.advance();
    }

    return fields;
  }

  private parseSort(): SortExpression {
    this.advance(); // skip 'sort'

    if (this.currentToken().type !== TokenType.COLON) {
      throw new Error(`Expected ':' after 'sort' at position ${this.currentToken().position}`);
    }
    this.advance();

    if (this.currentToken().type !== TokenType.IDENTIFIER) {
      throw new Error(`Expected field name at position ${this.currentToken().position}`);
    }

    const field = this.currentToken().value;
    this.advance();

    let order: 'asc' | 'desc' = 'asc';

    if (this.currentToken().type === TokenType.COLON) {
      this.advance();
      if (this.currentToken().type !== TokenType.IDENTIFIER) {
        throw new Error(`Expected 'asc' or 'desc' at position ${this.currentToken().position}`);
      }
      if (this.currentToken().value !== 'asc' && this.currentToken().value !== 'desc') {
        throw new Error(`Invalid sort order '${this.currentToken().value}' at position ${this.currentToken().position}`);
      }
      order = this.currentToken().value as 'asc' | 'desc';
      this.advance();
    }

    return { field, order };
  }

  private parseLimit(): number {
    this.advance(); // skip 'limit'

    if (this.currentToken().type !== TokenType.COLON) {
      throw new Error(`Expected ':' after 'limit' at position ${this.currentToken().position}`);
    }
    this.advance();

    if (this.currentToken().type !== TokenType.NUMBER) {
      throw new Error(`Expected number at position ${this.currentToken().position}`);
    }

    const limit = parseInt(this.currentToken().value, 10);
    this.advance();

    return limit;
  }

  private currentToken(): Token {
    return this.tokens[this.currentTokenIndex] || this.tokens[this.tokens.length - 1];
  }

  private advance(): void {
    if (this.currentTokenIndex < this.tokens.length - 1) {
      this.currentTokenIndex++;
    }
  }

  private peek(offset: number): Token {
    const index = this.currentTokenIndex + offset;
    if (index < this.tokens.length) {
      return this.tokens[index];
    }
    return this.tokens[this.tokens.length - 1];
  }

  private peekChar(offset: number): string {
    const index = this.position + offset;
    if (index < this.input.length) {
      return this.input[index];
    }
    return '';
  }

  private skipWhitespace(): void {
    while (this.position < this.input.length && /\s/.test(this.input[this.position])) {
      this.position++;
    }
  }

  private isDigit(char: string): boolean {
    return /[0-9]/.test(char);
  }

  private isIdentifierStart(char: string): boolean {
    return /[a-zA-Z_]/.test(char);
  }

  private isIdentifierChar(char: string): boolean {
    return /[a-zA-Z0-9_]/.test(char);
  }

  private isOperatorStart(char: string): boolean {
    return ['=', '!', '<', '>'].includes(char);
  }
}

/**
 * Parse a TOONPath query string into an AST
 */
export function parseTOONPath(query: string): QueryAST {
  const parser = new TOONPathParser(query);
  return parser.parse();
}
