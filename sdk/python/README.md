# ToonDB Python SDK

Official Python client for ToonDB - Token-Oriented Object Notation Database

## Installation

```bash
pip install toondb
```

## Quick Start

```python
from toondb import ToonDB

# Initialize client
db = ToonDB(
    url="https://your-project.supabase.co",
    api_key="your_api_key"
)

# Create a table from TOON content
table = db.tables.create(
    name="users",
    toon_content="""
users[3]{id,name,role}:
  1,Alice,admin
  2,Bob,user
  3,Charlie,user
    """
)

print(f"Created table: {table.name} with {table.row_count} rows")

# Query data
results = db.queries.execute(
    table_id=table.id,
    sql="SELECT * FROM users WHERE role = 'user'"
)

print(f"Found {results.row_count} users")
for row in results.results:
    print(row)

# Convert JSON to TOON
json_data = {
    "users": [
        {"id": 1, "name": "Alice"},
        {"id": 2, "name": "Bob"}
    ]
}

toon_output = db.converter.json_to_toon(json_data)
print(toon_output)
```

## Features

- **Table Management**: Create, read, update, delete tables
- **Query Execution**: Run SQL queries on your data
- **Format Conversion**: Convert between JSON and TOON formats
- **Token Comparison**: Compare token counts to measure savings
- **Async Support**: Coming soon
- **Type Hints**: Full type annotations for better IDE support

## Documentation

Full documentation available at: https://docs.toondb.io

## Examples

### List All Tables

```python
tables = db.tables.list()
for table in tables:
    print(f"{table.name}: {table.row_count} rows")
```

### Update a Table

```python
updated_table = db.tables.update(
    table_id="table-id",
    description="Updated description",
    is_public=True
)
```

### Delete a Table

```python
success = db.tables.delete(table_id="table-id")
if success:
    print("Table deleted successfully")
```

### Convert TOON to JSON

```python
toon_content = """
users[2]{id,name}:
  1,Alice
  2,Bob
"""

json_data = db.converter.toon_to_json(toon_content)
print(json_data)
# Output: {'users': [{'id': 1, 'name': 'Alice'}, {'id': 2, 'name': 'Bob'}]}
```

## Error Handling

```python
from toondb import ToonDB, ToonDBError, AuthenticationError, ValidationError

try:
    db = ToonDB(url="...", api_key="...")
    table = db.tables.get("invalid-id")
except AuthenticationError:
    print("Invalid API key")
except ValidationError as e:
    print(f"Validation error: {e}")
except ToonDBError as e:
    print(f"API error: {e}")
```

## Configuration

### Timeout

```python
db = ToonDB(
    url="...",
    api_key="...",
    timeout=60  # seconds
)
```

### Retries

```python
db = ToonDB(
    url="...",
    api_key="...",
    max_retries=5
)
```

## License

MIT License - see LICENSE file for details

