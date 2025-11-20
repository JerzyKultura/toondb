/**
 * TOONPath Query Engine
 * Executes TOONPath queries against TOON data
 */

import { parseTOONPath, QueryAST, FilterExpression, ComparisonFilter, LogicalFilter, InFilter } from './toonpath-parser';
import { JsonValue } from './types';

export interface QueryResult {
  results: any[];
  executionTimeMs?: number;
}

/**
 * Execute a TOONPath query against TOON data
 * @param data - Decoded TOON data (JSON structure)
 * @param query - TOONPath query string
 * @returns Query results
 */
export function queryTOONPath(data: JsonValue, query: string): any[] {
  const startTime = Date.now();
  
  try {
    // Parse query into AST
    const ast = parseTOONPath(query);
    
    // Execute query
    let results = resolvePath(data, ast.path);
    
    // Apply filters
    if (ast.filters && Array.isArray(results)) {
      results = applyFilters(results, ast.filters);
    }
    
    // Apply field selection
    if (ast.fields && Array.isArray(results)) {
      results = selectFields(results, ast.fields);
    }
    
    // Apply sorting
    if (ast.sort && Array.isArray(results)) {
      results = sortResults(results, ast.sort.field, ast.sort.order);
    }
    
    // Apply limit
    if (ast.limit !== null && Array.isArray(results)) {
      results = results.slice(0, ast.limit);
    }
    
    // Ensure results is always an array
    if (!Array.isArray(results)) {
      results = [results];
    }
    
    return results;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`TOONPath query error: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Resolve a path in the data structure
 * Strict path resolution - full path required
 */
function resolvePath(data: JsonValue, path: string[]): any {
  let current: any = data;
  
  for (const segment of path) {
    if (current === null || current === undefined) {
      throw new Error(`Cannot access property '${segment}' of ${current}`);
    }
    
    if (typeof current !== 'object') {
      throw new Error(`Cannot access property '${segment}' of primitive value`);
    }
    
    if (!(segment in current)) {
      throw new Error(`Property '${segment}' not found in data structure`);
    }
    
    current = current[segment];
  }
  
  return current;
}

/**
 * Apply filters to an array of items
 */
function applyFilters(items: any[], filter: FilterExpression): any[] {
  return items.filter(item => evaluateFilter(item, filter));
}

/**
 * Evaluate a filter expression against an item
 */
function evaluateFilter(item: any, filter: FilterExpression): boolean {
  if (filter.type === 'comparison') {
    return evaluateComparison(item, filter);
  }
  
  if (filter.type === 'logical') {
    return evaluateLogical(item, filter);
  }
  
  if (filter.type === 'in') {
    return evaluateIn(item, filter);
  }
  
  return false;
}

/**
 * Evaluate a comparison filter
 */
function evaluateComparison(item: any, filter: ComparisonFilter): boolean {
  if (typeof item !== 'object' || item === null) {
    return false;
  }
  
  const fieldValue = item[filter.field];
  const compareValue = filter.value;
  
  switch (filter.operator) {
    case '==':
      return fieldValue == compareValue;
    case '!=':
      return fieldValue != compareValue;
    case '<':
      return Number(fieldValue) < Number(compareValue);
    case '>':
      return Number(fieldValue) > Number(compareValue);
    case '<=':
      return Number(fieldValue) <= Number(compareValue);
    case '>=':
      return Number(fieldValue) >= Number(compareValue);
    default:
      return false;
  }
}

/**
 * Evaluate a logical filter (and/or)
 */
function evaluateLogical(item: any, filter: LogicalFilter): boolean {
  const leftResult = evaluateFilter(item, filter.left);
  const rightResult = evaluateFilter(item, filter.right);
  
  if (filter.operator === 'and') {
    return leftResult && rightResult;
  }
  
  if (filter.operator === 'or') {
    return leftResult || rightResult;
  }
  
  return false;
}

/**
 * Evaluate an 'in' filter
 */
function evaluateIn(item: any, filter: InFilter): boolean {
  if (typeof item !== 'object' || item === null) {
    return false;
  }
  
  const fieldValue = item[filter.field];
  
  // Check if field value is in the list
  return filter.values.some(value => fieldValue == value);
}

/**
 * Select specific fields from items
 */
function selectFields(items: any[], fields: string[]): any[] {
  return items.map(item => {
    if (typeof item !== 'object' || item === null) {
      return item;
    }
    
    const selected: any = {};
    for (const field of fields) {
      if (field in item) {
        selected[field] = item[field];
      }
    }
    return selected;
  });
}

/**
 * Sort results by a field
 */
function sortResults(items: any[], field: string, order: 'asc' | 'desc'): any[] {
  const sorted = [...items];
  
  sorted.sort((a, b) => {
    const aVal = typeof a === 'object' && a !== null ? a[field] : a;
    const bVal = typeof b === 'object' && b !== null ? b[field] : b;
    
    // Handle null/undefined
    if (aVal === null || aVal === undefined) return order === 'asc' ? 1 : -1;
    if (bVal === null || bVal === undefined) return order === 'asc' ? -1 : 1;
    
    // Compare values
    let comparison = 0;
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      comparison = aVal.localeCompare(bVal);
    } else if (typeof aVal === 'number' && typeof bVal === 'number') {
      comparison = aVal - bVal;
    } else {
      // Convert to strings for comparison
      comparison = String(aVal).localeCompare(String(bVal));
    }
    
    return order === 'asc' ? comparison : -comparison;
  });
  
  return sorted;
}

/**
 * Helper function to validate TOONPath query syntax
 */
export function validateTOONPath(query: string): { valid: boolean; error?: string } {
  try {
    parseTOONPath(query);
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Helper to get query statistics
 */
export function analyzeTOONPath(query: string): {
  path: string[];
  hasFilters: boolean;
  hasFieldSelection: boolean;
  hasSorting: boolean;
  hasLimit: boolean;
} {
  try {
    const ast = parseTOONPath(query);
    return {
      path: ast.path,
      hasFilters: ast.filters !== null,
      hasFieldSelection: ast.fields !== null,
      hasSorting: ast.sort !== null,
      hasLimit: ast.limit !== null,
    };
  } catch (error) {
    throw new Error(`Invalid TOONPath query: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
