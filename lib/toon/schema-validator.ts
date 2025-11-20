/**
 * Schema Validator
 * Flexible validation for data integrity
 */

export interface SchemaField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'null' | 'unknown';
  required: boolean;
  nullable: boolean;
}

export interface Schema {
  fields: SchemaField[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestedSchema?: Schema;
}

/**
 * Detect schema from existing data
 */
export function detectSchema(data: any[]): Schema {
  if (data.length === 0) {
    return { fields: [] };
  }

  const fieldMap = new Map<string, SchemaField>();

  // Analyze all items
  data.forEach(item => {
    if (typeof item !== 'object' || item === null) return;

    Object.keys(item).forEach(key => {
      const value = item[key];
      const valueType = getValueType(value);

      if (!fieldMap.has(key)) {
        fieldMap.set(key, {
          name: key,
          type: valueType,
          required: false,
          nullable: value === null,
        });
      } else {
        const field = fieldMap.get(key)!;
        // If types differ, mark as unknown
        if (field.type !== valueType && valueType !== 'null') {
          field.type = 'unknown';
        }
        if (value === null) {
          field.nullable = true;
        }
      }
    });
  });

  // Determine required fields (present in all items)
  const fields = Array.from(fieldMap.values());
  fields.forEach(field => {
    field.required = data.every(item =>
      typeof item === 'object' && item !== null && field.name in item
    );
  });

  return { fields };
}

/**
 * Validate an item against a schema
 */
export function validateItem(item: any, schema: Schema, strict: boolean = false): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (typeof item !== 'object' || item === null) {
    errors.push('Item must be an object');
    return { valid: false, errors, warnings };
  }

  // Check required fields
  schema.fields.forEach(field => {
    if (field.required && !(field.name in item)) {
      errors.push(`Required field '${field.name}' is missing`);
    } else if (field.name in item) {
      const value = item[field.name];
      const actualType = getValueType(value);

      // Check null
      if (value === null && !field.nullable) {
        errors.push(`Field '${field.name}' cannot be null`);
      } else if (value !== null && field.type !== 'unknown' && actualType !== field.type) {
        errors.push(`Field '${field.name}' has wrong type: expected ${field.type}, got ${actualType}`);
      }
    }
  });

  // Check for extra fields in strict mode
  if (strict) {
    const schemaFieldNames = new Set(schema.fields.map(f => f.name));
    Object.keys(item).forEach(key => {
      if (!schemaFieldNames.has(key)) {
        warnings.push(`Extra field '${key}' not in schema`);
      }
    });
  } else {
    // In flexible mode, suggest adding new fields
    const schemaFieldNames = new Set(schema.fields.map(f => f.name));
    Object.keys(item).forEach(key => {
      if (!schemaFieldNames.has(key)) {
        const suggestion = findSimilarFieldName(key, Array.from(schemaFieldNames));
        if (suggestion) {
          warnings.push(`New field '${key}' - did you mean '${suggestion}'?`);
        } else {
          warnings.push(`New field '${key}' will be added to schema`);
        }
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate multiple items against a schema
 */
export function validateItems(items: any[], schema: Schema, strict: boolean = false): ValidationResult {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  items.forEach((item, index) => {
    const result = validateItem(item, schema, strict);
    result.errors.forEach(error => {
      allErrors.push(`Item ${index}: ${error}`);
    });
    result.warnings.forEach(warning => {
      allWarnings.push(`Item ${index}: ${warning}`);
    });
  });

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
}

/**
 * Merge new item schema with existing schema
 */
export function mergeSchema(existingSchema: Schema, newItem: any): Schema {
  const fields = [...existingSchema.fields];
  const fieldMap = new Map(fields.map(f => [f.name, f]));

  if (typeof newItem === 'object' && newItem !== null) {
    Object.keys(newItem).forEach(key => {
      const value = newItem[key];
      const valueType = getValueType(value);

      if (!fieldMap.has(key)) {
        // Add new field
        fields.push({
          name: key,
          type: valueType,
          required: false,
          nullable: value === null,
        });
      } else {
        // Update existing field
        const field = fieldMap.get(key)!;
        if (field.type !== valueType && valueType !== 'null') {
          field.type = 'unknown';
        }
        if (value === null) {
          field.nullable = true;
        }
      }
    });
  }

  return { fields };
}

/**
 * Get the type of a value
 */
function getValueType(value: any): SchemaField['type'] {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'object') return 'object';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'string') return 'string';
  return 'unknown';
}

/**
 * Find similar field name (for typo suggestions)
 */
function findSimilarFieldName(input: string, candidates: string[]): string | null {
  const lowerInput = input.toLowerCase();
  
  // Exact match (case insensitive)
  const exactMatch = candidates.find(c => c.toLowerCase() === lowerInput);
  if (exactMatch) return exactMatch;

  // Levenshtein distance for fuzzy matching
  let bestMatch: string | null = null;
  let bestDistance = Infinity;

  candidates.forEach(candidate => {
    const distance = levenshteinDistance(lowerInput, candidate.toLowerCase());
    if (distance < bestDistance && distance <= 2) { // Only suggest if within 2 edits
      bestDistance = distance;
      bestMatch = candidate;
    }
  });

  return bestMatch;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Export schema to readable format
 */
export function schemaToString(schema: Schema): string {
  if (schema.fields.length === 0) {
    return 'No fields defined';
  }

  return schema.fields
    .map(field => {
      const required = field.required ? 'required' : 'optional';
      const nullable = field.nullable ? ' (nullable)' : '';
      return `  ${field.name}: ${field.type} (${required})${nullable}`;
    })
    .join('\n');
}

