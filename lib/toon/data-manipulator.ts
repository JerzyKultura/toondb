/**
 * Data Manipulation Engine
 * Core functions for modifying TOON data structures
 */

import { JsonValue } from './types';
import { parsePath, PathAST, Selector } from './path-parser';
import { encode } from './encoder';

export interface UpdateResult {
  success: boolean;
  message: string;
  modifiedCount: number;
  newData: JsonValue;
  newToon: string;
}

export interface InsertResult {
  success: boolean;
  message: string;
  insertedCount: number;
  newData: JsonValue;
  newToon: string;
}

export interface DeleteResult {
  success: boolean;
  message: string;
  deletedCount: number;
  newData: JsonValue;
  newToon: string;
}

/**
 * Update a value in the data structure
 */
export function updateValue(
  data: JsonValue,
  path: string,
  newValue: any
): UpdateResult {
  try {
    const ast = parsePath(path);
    const dataCopy = JSON.parse(JSON.stringify(data));
    
    // Navigate to the target location
    let current: any = dataCopy;
    for (const segment of ast.path) {
      if (current === null || current === undefined) {
        return {
          success: false,
          message: `Cannot access property '${segment}' of ${current}`,
          modifiedCount: 0,
          newData: data,
          newToon: '',
        };
      }
      if (!(segment in current)) {
        return {
          success: false,
          message: `Property '${segment}' not found`,
          modifiedCount: 0,
          newData: data,
          newToon: '',
        };
      }
      current = current[segment];
    }

    // Apply selector if present
    let modifiedCount = 0;
    if (ast.selector && Array.isArray(current)) {
      const items = findItemsBySelector(current, ast.selector);
      
      if (items.length === 0) {
        return {
          success: false,
          message: 'No items found matching selector',
          modifiedCount: 0,
          newData: data,
          newToon: '',
        };
      }

      // Update the target field in matching items
      if (ast.targetField) {
        items.forEach(item => {
          if (typeof item === 'object' && item !== null) {
            item[ast.targetField!] = newValue;
            modifiedCount++;
          }
        });
      }
    } else if (ast.targetField) {
      // Direct field update without selector
      if (typeof current === 'object' && current !== null) {
        current[ast.targetField] = newValue;
        modifiedCount = 1;
      }
    } else {
      return {
        success: false,
        message: 'Invalid path: no target field specified',
        modifiedCount: 0,
        newData: data,
        newToon: '',
      };
    }

    const newToon = encode(dataCopy, { delimiter: ',' });

    return {
      success: true,
      message: `Updated ${modifiedCount} item(s)`,
      modifiedCount,
      newData: dataCopy,
      newToon,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Update failed',
      modifiedCount: 0,
      newData: data,
      newToon: '',
    };
  }
}

/**
 * Insert a new item into an array
 */
export function insertItem(
  data: JsonValue,
  path: string,
  newItem: any
): InsertResult {
  try {
    const ast = parsePath(path);
    const dataCopy = JSON.parse(JSON.stringify(data));
    
    // Navigate to the target location
    let current: any = dataCopy;
    for (const segment of ast.path) {
      if (current === null || current === undefined) {
        return {
          success: false,
          message: `Cannot access property '${segment}' of ${current}`,
          insertedCount: 0,
          newData: data,
          newToon: '',
        };
      }
      if (!(segment in current)) {
        return {
          success: false,
          message: `Property '${segment}' not found`,
          insertedCount: 0,
          newData: data,
          newToon: '',
        };
      }
      current = current[segment];
    }

    // Current should be an array
    if (!Array.isArray(current)) {
      return {
        success: false,
        message: 'Target is not an array',
        insertedCount: 0,
        newData: data,
        newToon: '',
      };
    }

    // Insert the new item
    current.push(newItem);
    const newToon = encode(dataCopy, { delimiter: ',' });

    return {
      success: true,
      message: 'Item inserted successfully',
      insertedCount: 1,
      newData: dataCopy,
      newToon,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Insert failed',
      insertedCount: 0,
      newData: data,
      newToon: '',
    };
  }
}

/**
 * Delete items from an array matching a selector
 */
export function deleteItem(
  data: JsonValue,
  path: string,
  selector: Record<string, any>
): DeleteResult {
  try {
    const ast = parsePath(path);
    const dataCopy = JSON.parse(JSON.stringify(data));
    
    // Navigate to the target location
    let current: any = dataCopy;
    for (const segment of ast.path) {
      if (current === null || current === undefined) {
        return {
          success: false,
          message: `Cannot access property '${segment}' of ${current}`,
          deletedCount: 0,
          newData: data,
          newToon: '',
        };
      }
      if (!(segment in current)) {
        return {
          success: false,
          message: `Property '${segment}' not found`,
          deletedCount: 0,
          newData: data,
          newToon: '',
        };
      }
      current = current[segment];
    }

    // Current should be an array
    if (!Array.isArray(current)) {
      return {
        success: false,
        message: 'Target is not an array',
        deletedCount: 0,
        newData: data,
        newToon: '',
      };
    }

    // Find items matching selector
    const initialLength = current.length;
    const filtered = current.filter(item => {
      if (typeof item !== 'object' || item === null) return true;
      
      // Check if all selector fields match
      for (const [key, value] of Object.entries(selector)) {
        if (item[key] !== value) return true; // Keep items that don't match
      }
      return false; // Remove items that match
    });

    const deletedCount = initialLength - filtered.length;

    // Update the array in place
    // Navigate again to set the filtered array
    let target: any = dataCopy;
    for (let i = 0; i < ast.path.length - 1; i++) {
      target = target[ast.path[i]];
    }
    target[ast.path[ast.path.length - 1]] = filtered;

    const newToon = encode(dataCopy, { delimiter: ',' });

    return {
      success: true,
      message: `Deleted ${deletedCount} item(s)`,
      deletedCount,
      newData: dataCopy,
      newToon,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Delete failed',
      deletedCount: 0,
      newData: data,
      newToon: '',
    };
  }
}

/**
 * Find items matching a selector
 */
export function findItems(data: JsonValue, path: string, selector: Selector): any[] {
  try {
    const ast = parsePath(path);
    
    // Navigate to the target location
    let current: any = data;
    for (const segment of ast.path) {
      if (current === null || current === undefined || !(segment in current)) {
        return [];
      }
      current = current[segment];
    }

    // Current should be an array
    if (!Array.isArray(current)) {
      return [];
    }

    return findItemsBySelector(current, selector);
  } catch (error) {
    return [];
  }
}

/**
 * Helper: Find items in an array by selector
 */
function findItemsBySelector(items: any[], selector: Selector): any[] {
  return items.filter(item => {
    if (typeof item !== 'object' || item === null) return false;

    if (selector.type === 'field') {
      return item[selector.field] === selector.value;
    } else if (selector.type === 'filter') {
      const fieldValue = item[selector.field];
      const compareValue = selector.value;

      switch (selector.operator) {
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

    return false;
  });
}

/**
 * Batch operations
 */
export interface Operation {
  op: 'update' | 'insert' | 'delete';
  path: string;
  value?: any;
  item?: any;
  selector?: Record<string, any>;
}

export interface BulkResult {
  success: boolean;
  message: string;
  results: Array<UpdateResult | InsertResult | DeleteResult>;
  finalData: JsonValue;
  finalToon: string;
}

export function bulkOperation(data: JsonValue, operations: Operation[]): BulkResult {
  let currentData = data;
  const results: Array<UpdateResult | InsertResult | DeleteResult> = [];

  for (const op of operations) {
    let result: UpdateResult | InsertResult | DeleteResult;

    switch (op.op) {
      case 'update':
        if (op.value === undefined) {
          result = {
            success: false,
            message: 'Update operation requires value',
            modifiedCount: 0,
            newData: currentData,
            newToon: '',
          };
        } else {
          result = updateValue(currentData, op.path, op.value);
          if (result.success) {
            currentData = result.newData;
          }
        }
        break;

      case 'insert':
        if (op.item === undefined) {
          result = {
            success: false,
            message: 'Insert operation requires item',
            insertedCount: 0,
            newData: currentData,
            newToon: '',
          };
        } else {
          result = insertItem(currentData, op.path, op.item);
          if (result.success) {
            currentData = result.newData;
          }
        }
        break;

      case 'delete':
        if (op.selector === undefined) {
          result = {
            success: false,
            message: 'Delete operation requires selector',
            deletedCount: 0,
            newData: currentData,
            newToon: '',
          };
        } else {
          result = deleteItem(currentData, op.path, op.selector);
          if (result.success) {
            currentData = result.newData;
          }
        }
        break;

      default:
        result = {
          success: false,
          message: `Unknown operation: ${(op as any).op}`,
          modifiedCount: 0,
          newData: currentData,
          newToon: '',
        } as UpdateResult;
    }

    results.push(result);
  }

  const allSuccessful = results.every(r => r.success);
  const finalToon = encode(currentData, { delimiter: ',' });

  return {
    success: allSuccessful,
    message: allSuccessful 
      ? `All ${operations.length} operations completed successfully`
      : 'Some operations failed',
    results,
    finalData: currentData,
    finalToon,
  };
}

