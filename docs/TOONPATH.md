# TOONPath Query Language

TOONPath is a simple, intuitive query language designed specifically for TOON data structures. Unlike JSONPath or SQL, TOONPath uses natural, readable syntax that mirrors how you think about your data.

## Why TOONPath?

- **Simple**: No complex syntax to learn - queries look like natural paths
- **Powerful**: Supports filtering, field selection, sorting, and limiting
- **TOON-native**: Built specifically for TOON data structures
- **Type-aware**: Works naturally with TOON's schema-aware format

## Quick Start

### Basic Queries

Get all items from an array:
```
hikes
```

Access nested properties:
```
context.location
```

### Filtering

Filter with comparisons:
```
hikes.distanceKm>7
```

Multiple conditions:
```
hikes.distanceKm>7 and wasSunny==true
```

String matching (quotes required):
```
hikes.companion=='ana'
```

### Field Selection

Select specific fields:
```
hikes.name,distanceKm
```

Combine with filtering:
```
hikes.distanceKm>7.name,companion
```

### Sorting

Sort ascending:
```
hikes sort:distanceKm
```

Sort descending:
```
hikes sort:distanceKm:desc
```

### Limiting

Limit results:
```
hikes limit:5
```

### Complete Example

```
hikes.distanceKm>7 and wasSunny==true sort:elevationGain:desc limit:3.name,distanceKm
```

This query:
1. Gets the `hikes` array
2. Filters for hikes longer than 7km that were sunny
3. Sorts by elevation gain (descending)
4. Takes the top 3 results
5. Returns only the name and distanceKm fields

## Syntax Reference

### Path Expressions

TOONPath queries start with a path to the data you want to query. Paths use dot notation for accessing nested properties:

```
property              # Top-level property
parent.child          # Nested property
parent.child.nested   # Deeply nested property
```

**Important**: TOONPath uses strict path resolution. You must provide the full path from the root. The property must exist at the specified location.

**Examples**:
```toon
context:
  task: Our favorite hikes
  location: Boulder

friends[3]: ana,luis,sam

hikes[3]{id,name,distanceKm}:
  1,Blue Lake Trail,7.5
  2,Ridge Overlook,9.2
  3,Wildflower Loop,5.1
```

- `context` → Returns entire context object
- `context.location` → Returns "Boulder"
- `friends` → Returns ["ana", "luis", "sam"]
- `hikes` → Returns array of all hikes
- `location` → ❌ ERROR (not at root level)

### Filter Expressions

Filters allow you to select only items that match certain conditions. Filters come after the path and before any field selection.

#### Comparison Operators

```
field==value     # Equal to
field!=value     # Not equal to
field>value      # Greater than
field<value      # Less than
field>=value     # Greater than or equal to
field<=value     # Less than or equal to
```

**Examples**:
```
hikes.distanceKm>7
hikes.id==2
hikes.distanceKm<=5
```

#### Value Types

**Numbers**: No quotes needed
```
hikes.distanceKm>7
hikes.elevationGain>=500
```

**Strings**: Single or double quotes required
```
hikes.companion=='ana'
hikes.name=="Blue Lake Trail"
```

**Booleans**: `true` or `false` (no quotes)
```
hikes.wasSunny==true
hikes.isActive!=false
```

#### Logical Operators

Combine multiple conditions with `and` or `or`:

```
hikes.distanceKm>7 and wasSunny==true
hikes.distanceKm<5 or elevationGain>500
hikes.distanceKm>7 and wasSunny==true and companion=='ana'
```

**Operator precedence**: Filters are evaluated left-to-right. Use parentheses for complex logic (coming soon).

#### In Operator

Check if a field matches any value in a list:

```
hikes.companion in ['ana','luis']
hikes.id in [1,3,5]
```

### Field Selection

Select specific fields from results using dot notation followed by comma-separated field names:

```
hikes.name,distanceKm
```

This returns only the `name` and `distanceKm` fields from each hike.

**Combine with filters**:
```
hikes.distanceKm>7.name,companion
```

This filters hikes, then selects only name and companion fields.

**Full example**:
```toon
Input:  hikes[2]{id,name,distanceKm}: 1,Blue Lake,7.5 2,Ridge,9.2

Query:  hikes.name,distanceKm

Output: [
  { name: "Blue Lake", distanceKm: 7.5 },
  { name: "Ridge", distanceKm: 9.2 }
]
```

### Sorting

Sort results by a field using the `sort:` keyword:

**Ascending** (default):
```
hikes sort:distanceKm
hikes sort:name
```

**Descending**:
```
hikes sort:distanceKm:desc
hikes sort:elevationGain:desc
```

**Combine with filters**:
```
hikes.wasSunny==true sort:distanceKm
```

**Sorting behavior**:
- Numbers sorted numerically
- Strings sorted alphabetically (case-insensitive)
- `null` and `undefined` values sorted to the end
- Ascending order: smallest to largest (A to Z)
- Descending order: largest to smallest (Z to A)

### Limiting

Limit the number of results using the `limit:` keyword:

```
hikes limit:5
hikes limit:10
```

**Combine with sorting**:
```
hikes sort:elevationGain:desc limit:3
```

This gets the 3 hikes with the highest elevation gain.

**Common pattern - Top N**:
```
products sort:sales:desc limit:10    # Top 10 best sellers
users sort:signupDate limit:20       # 20 most recent users
```

## Query Order

TOONPath queries are processed in this order:

1. **Path Resolution**: Navigate to the data
2. **Filtering**: Apply filter conditions
3. **Field Selection**: Select specific fields
4. **Sorting**: Sort the results
5. **Limiting**: Limit to N results

This means you can write queries like:
```
hikes.distanceKm>7 and wasSunny==true.name,distanceKm sort:distanceKm:desc limit:3
```

Which processes as:
1. Get `hikes` array
2. Filter: distanceKm>7 and wasSunny==true
3. Select fields: name, distanceKm
4. Sort by: distanceKm (descending)
5. Limit to: 3 results

## Common Patterns

### Get All Items
```
products
users
orders
```

### Filter by Single Condition
```
products.price<100
users.age>=18
orders.status=='pending'
```

### Filter by Multiple Conditions
```
products.price<100 and category=='electronics'
users.age>=18 and isPremium==true
orders.status=='pending' or status=='processing'
```

### Top N Results
```
products sort:sales:desc limit:10
users sort:score:desc limit:5
```

### Get Specific Fields
```
users.name,email
products.title,price,imageUrl
```

### Complex Query
```
products.price<100 and inStock==true.title,price,category sort:price limit:20
```

### Nested Data Access
```
store.products
company.departments
user.profile.settings
```

## Example Dataset

Here's a complete TOON dataset and example queries:

```toon
context:
  task: Our favorite hikes together
  location: Boulder
  season: spring_2025

friends[3]: ana,luis,sam

hikes[3]{id,name,distanceKm,elevationGain,companion,wasSunny}:
  1,Blue Lake Trail,7.5,320,ana,true
  2,Ridge Overlook,9.2,540,luis,false
  3,Wildflower Loop,5.1,180,sam,true
```

### Example Queries

**Get all hikes**:
```
hikes
```
Result: Array of 3 hikes with all fields

**Get sunny hikes only**:
```
hikes.wasSunny==true
```
Result: Blue Lake Trail and Wildflower Loop

**Get hikes longer than 7km**:
```
hikes.distanceKm>7
```
Result: Blue Lake Trail and Ridge Overlook

**Get long, sunny hikes**:
```
hikes.distanceKm>7 and wasSunny==true
```
Result: Blue Lake Trail only

**Get hikes with Ana or Sam**:
```
hikes.companion in ['ana','sam']
```
Result: Blue Lake Trail and Wildflower Loop

**Get just names and distances**:
```
hikes.name,distanceKm
```
Result: Array with only name and distanceKm fields

**Top 2 by elevation**:
```
hikes sort:elevationGain:desc limit:2
```
Result: Ridge Overlook and Blue Lake Trail

**Complex query**:
```
hikes.wasSunny==true.name,distanceKm,companion sort:distanceKm:desc
```
Result: Sunny hikes with selected fields, sorted by distance

## API Usage

### REST API

```bash
POST /api/query
Content-Type: application/json

{
  "table_id": "uuid-here",
  "query": "hikes.distanceKm>7 and wasSunny==true sort:elevationGain limit:5"
}
```

Response:
```json
{
  "results": [...],
  "execution_time_ms": 12,
  "row_count": 2
}
```

### TypeScript SDK

```typescript
import { ToonDB } from 'toondb';

const client = new ToonDB('your-api-key');

const results = await client.query({
  tableId: 'table-uuid',
  query: 'hikes.distanceKm>7 sort:distanceKm'
});

console.log(results.results);
```

### Python SDK

```python
from toondb import ToonDB

client = ToonDB('your-api-key')

results = client.query(
    table_id='table-uuid',
    query='hikes.distanceKm>7 sort:distanceKm'
)

print(results.results)
```

## Error Messages

### Path Not Found
```
Query: location
Error: Property 'location' not found in data structure
```
**Solution**: Use full path `context.location`

### Invalid Syntax
```
Query: hikes.distanceKm > 7  (extra spaces)
Error: Unexpected character at position X
```
**Solution**: Remove spaces around operators: `hikes.distanceKm>7`

### String Without Quotes
```
Query: hikes.companion==ana
Error: Expected value at position X
```
**Solution**: Add quotes: `hikes.companion=='ana'`

### Invalid Field in Selection
```
Query: hikes.name,invalid_field
Result: Objects with name field but invalid_field omitted
```
**Note**: Invalid fields are silently omitted, not errored

## Performance Tips

1. **Be Specific with Paths**: Use exact paths for faster resolution
   - Good: `store.products.price>100`
   - Avoid unnecessary nesting

2. **Filter Early**: Apply filters before field selection
   - Good: `products.price>100.name,price`
   - Less efficient: `products.name,price` (then filter in code)

3. **Use Limits**: Limit results when you don't need everything
   - `products.category=='electronics' limit:50`

4. **Sort Only When Needed**: Sorting has overhead
   - Skip sorting if order doesn't matter

5. **Select Only Needed Fields**: Reduce data transfer
   - `users.id,name` instead of `users`

## Comparison with Other Query Languages

| Feature | TOONPath | JSONPath | SQL |
|---------|----------|----------|-----|
| Syntax | Simple, natural | Complex with `$` and `[]` | Verbose keywords |
| Learning curve | Minutes | Hours | Days |
| Path access | `hikes` | `$.hikes[*]` | `SELECT * FROM hikes` |
| Filtering | `hikes.price>10` | `$.hikes[?@.price>10]` | `WHERE price > 10` |
| Field selection | `hikes.name,price` | Multiple queries | `SELECT name, price` |
| Sorting | `sort:price:desc` | Not supported | `ORDER BY price DESC` |
| Boolean values | `wasSunny==true` | `?@.wasSunny==true` | `wasSunny = TRUE` |

## Future Features

TOONPath is actively developed. Planned features include:

- **Aggregations**: `count()`, `sum()`, `avg()`, `min()`, `max()`
- **Grouping**: `group:field`
- **Parentheses**: Complex logical expressions with `()`
- **Wildcards**: `hikes.*.name` for flexible matching
- **Regular expressions**: `hikes.name~='Lake.*'`
- **Functions**: `hikes.lower(name)=='blue lake'`

## Troubleshooting

### Query Returns Empty Array

1. Check your filter conditions - they might be too restrictive
2. Verify field names match exactly (case-sensitive)
3. Check value types (strings need quotes, numbers don't)
4. Try removing filters one by one to isolate the issue

### Query Returns Wrong Data

1. Verify the path is correct
2. Check operator precedence in complex filters
3. Ensure string values have quotes
4. Test with simpler query first, then add complexity

### Performance Issues

1. Add `limit:N` to restrict results
2. Select only needed fields
3. Ensure the table isn't too large
4. Consider breaking query into smaller parts

## Best Practices

1. **Start Simple**: Begin with basic path, add filters incrementally
2. **Test Incrementally**: Add one feature at a time (filter, then sort, then limit)
3. **Use Field Selection**: Always select only fields you need
4. **Limit Results**: Use `limit:` for large datasets
5. **Clear Names**: Use descriptive field names in your TOON data
6. **Consistent Types**: Keep field types consistent (don't mix strings and numbers)

## Reference

### Keywords
- `and` - Logical AND
- `or` - Logical OR
- `in` - Membership test
- `sort` - Sort results
- `limit` - Limit result count
- `true` / `false` - Boolean values

### Operators
- `==` - Equal
- `!=` - Not equal
- `<` - Less than
- `>` - Greater than
- `<=` - Less than or equal
- `>=` - Greater than or equal

### Syntax Elements
- `.` - Path separator and field selection prefix
- `,` - Field separator
- `:` - Keyword separator
- `[]` - Array literal (for `in` operator)
- `''` or `""` - String delimiter

## Support

- Documentation: https://toondb.io/docs
- Examples: https://toondb.io/examples
- GitHub: https://github.com/your-org/toondb
- Discord: https://discord.gg/toondb

## License

TOONPath is part of ToonDB and is released under the MIT License.

