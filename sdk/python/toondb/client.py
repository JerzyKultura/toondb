"""
ToonDB Client Implementation
"""

import json
import requests
from typing import Dict, List, Optional, Any
from .models import Table, QueryResult, TokenComparison
from .exceptions import ToonDBError, AuthenticationError, ValidationError


class ToonDB:
    """
    ToonDB client for interacting with the ToonDB API.
    
    Example:
        >>> db = ToonDB(url="https://your-project.supabase.co", api_key="your_api_key")
        >>> db.tables.create(name="users", toon_content="users[2]{id,name}:\\n  1,Alice\\n  2,Bob")
    """
    
    def __init__(
        self,
        url: str,
        api_key: str,
        timeout: int = 30,
        max_retries: int = 3,
    ):
        """
        Initialize ToonDB client.
        
        Args:
            url: Base URL of your ToonDB/Supabase project
            api_key: API key for authentication
            timeout: Request timeout in seconds (default: 30)
            max_retries: Maximum number of retry attempts (default: 3)
        """
        self.url = url.rstrip('/')
        self.api_key = api_key
        self.timeout = timeout
        self.max_retries = max_retries
        
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json',
        })
        
        # Initialize sub-clients
        self.tables = TablesClient(self)
        self.queries = QueriesClient(self)
        self.converter = ConverterClient(self)
    
    def _request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict] = None,
        params: Optional[Dict] = None,
    ) -> Dict:
        """Make HTTP request to API."""
        url = f"{self.url}{endpoint}"
        
        try:
            response = self.session.request(
                method=method,
                url=url,
                json=data,
                params=params,
                timeout=self.timeout,
            )
            
            if response.status_code == 401:
                raise AuthenticationError("Invalid API key or unauthorized")
            
            if response.status_code == 400:
                error_data = response.json()
                raise ValidationError(error_data.get('error', 'Validation error'))
            
            if not response.ok:
                raise ToonDBError(f"API error: {response.status_code} - {response.text}")
            
            return response.json()
        
        except requests.exceptions.RequestException as e:
            raise ToonDBError(f"Request failed: {str(e)}")


class TablesClient:
    """Client for table operations."""
    
    def __init__(self, client: ToonDB):
        self.client = client
    
    def list(self) -> List[Table]:
        """
        List all tables.
        
        Returns:
            List of Table objects
        """
        response = self.client._request('GET', '/api/tables')
        return [Table(**table) for table in response.get('tables', [])]
    
    def get(self, table_id: str) -> Table:
        """
        Get a specific table.
        
        Args:
            table_id: Table ID
            
        Returns:
            Table object
        """
        response = self.client._request('GET', f'/api/tables/{table_id}')
        return Table(**response['table'])
    
    def create(
        self,
        name: str,
        toon_content: str,
        description: Optional[str] = None,
        delimiter: str = ',',
    ) -> Table:
        """
        Create a new table from TOON content.
        
        Args:
            name: Table name
            toon_content: TOON formatted data
            description: Optional table description
            delimiter: Delimiter used in TOON (default: ',')
            
        Returns:
            Created Table object
        """
        data = {
            'name': name,
            'toon_content': toon_content,
            'description': description,
            'delimiter': delimiter,
        }
        response = self.client._request('POST', '/api/tables', data=data)
        return Table(**response['table'])
    
    def update(
        self,
        table_id: str,
        name: Optional[str] = None,
        description: Optional[str] = None,
        toon_content: Optional[str] = None,
        is_public: Optional[bool] = None,
    ) -> Table:
        """
        Update a table.
        
        Args:
            table_id: Table ID
            name: New table name
            description: New description
            toon_content: Updated TOON content
            is_public: Whether table is public
            
        Returns:
            Updated Table object
        """
        data = {}
        if name is not None:
            data['name'] = name
        if description is not None:
            data['description'] = description
        if toon_content is not None:
            data['toon_content'] = toon_content
        if is_public is not None:
            data['is_public'] = is_public
        
        response = self.client._request('PUT', f'/api/tables/{table_id}', data=data)
        return Table(**response['table'])
    
    def delete(self, table_id: str) -> bool:
        """
        Delete a table.
        
        Args:
            table_id: Table ID
            
        Returns:
            True if deleted successfully
        """
        response = self.client._request('DELETE', f'/api/tables/{table_id}')
        return response.get('success', False)
    
    def update_value(
        self,
        table_id: str,
        path: str,
        value: Any,
    ) -> Dict[str, Any]:
        """
        Update a value in table data using path-based syntax.
        
        Example:
            >>> db.tables.update_value('table-id', 'products[id==8].price', 120.00)
        
        Args:
            table_id: Table ID
            path: Path to the field to update (e.g., 'products[id==8].price')
            value: New value
            
        Returns:
            Dict with success, message, and modifiedCount
        """
        data = {
            'path': path,
            'value': value,
        }
        return self.client._request('POST', f'/api/tables/{table_id}/update', data=data)
    
    def insert_item(
        self,
        table_id: str,
        path: str,
        item: Dict[str, Any],
        validate: bool = True,
    ) -> Dict[str, Any]:
        """
        Insert a new item into table data.
        
        Example:
            >>> db.tables.insert_item('table-id', 'products', {
            ...     'id': 16, 'name': 'New Keyboard', 'price': 99.99
            ... })
        
        Args:
            table_id: Table ID
            path: Path to the array (e.g., 'products')
            item: Item to insert
            validate: Whether to validate against schema (default: True)
            
        Returns:
            Dict with success, message, and insertedCount
        """
        data = {
            'path': path,
            'item': item,
            'validate': validate,
        }
        return self.client._request('POST', f'/api/tables/{table_id}/insert', data=data)
    
    def delete_item(
        self,
        table_id: str,
        path: str,
        selector: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Delete items from table data matching selector.
        
        Example:
            >>> db.tables.delete_item('table-id', 'products', {'name': 'Old Product'})
        
        Args:
            table_id: Table ID
            path: Path to the array (e.g., 'products')
            selector: Selector to match items for deletion
            
        Returns:
            Dict with success, message, and deletedCount
        """
        data = {
            'path': path,
            'selector': selector,
        }
        return self.client._request('POST', f'/api/tables/{table_id}/delete', data=data)
    
    def bulk_operation(
        self,
        table_id: str,
        operations: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """
        Execute multiple operations in a single transaction.
        
        Example:
            >>> db.tables.bulk_operation('table-id', [
            ...     {'op': 'update', 'path': 'products[id==8].price', 'value': 120.00},
            ...     {'op': 'insert', 'path': 'products', 'item': {'id': 17, 'name': 'New', 'price': 50}},
            ...     {'op': 'delete', 'path': 'products', 'selector': {'id': 5}}
            ... ])
        
        Args:
            table_id: Table ID
            operations: List of operations to execute
            
        Returns:
            Dict with success, message, and results list
        """
        data = {
            'operations': operations,
        }
        return self.client._request('POST', f'/api/tables/{table_id}/bulk', data=data)


class QueriesClient:
    """Client for query operations."""
    
    def __init__(self, client: ToonDB):
        self.client = client
    
    def execute(
        self,
        table_id: str,
        sql: str,
    ) -> QueryResult:
        """
        Execute SQL query on a table.
        
        Args:
            table_id: Table ID to query
            sql: SQL query string
            
        Returns:
            QueryResult object
        """
        data = {
            'table_id': table_id,
            'sql': sql,
        }
        response = self.client._request('POST', '/api/query', data=data)
        return QueryResult(
            results=response['results'],
            execution_time_ms=response['execution_time_ms'],
            row_count=response['row_count'],
        )


class ConverterClient:
    """Client for TOON/JSON conversion."""
    
    def __init__(self, client: ToonDB):
        self.client = client
    
    def json_to_toon(
        self,
        json_data: Any,
        options: Optional[Dict] = None,
    ) -> str:
        """
        Convert JSON to TOON format.
        
        Args:
            json_data: JSON data (dict, list, or JSON string)
            options: Encoding options
            
        Returns:
            TOON formatted string
        """
        if isinstance(json_data, (dict, list)):
            json_str = json.dumps(json_data)
        else:
            json_str = json_data
        
        data = {
            'content': json_str,
            'from_format': 'json',
            'to_format': 'toon',
            'options': options or {},
        }
        response = self.client._request('POST', '/api/convert', data=data)
        return response['output']
    
    def toon_to_json(
        self,
        toon_content: str,
        options: Optional[Dict] = None,
    ) -> Any:
        """
        Convert TOON to JSON format.
        
        Args:
            toon_content: TOON formatted string
            options: Decoding options
            
        Returns:
            Parsed JSON data
        """
        data = {
            'content': toon_content,
            'from_format': 'toon',
            'to_format': 'json',
            'options': options or {},
        }
        response = self.client._request('POST', '/api/convert', data=data)
        return json.loads(response['output'])
    
    def compare_tokens(
        self,
        toon_content: str,
        json_content: str,
    ) -> TokenComparison:
        """
        Compare token counts between TOON and JSON.
        
        Args:
            toon_content: TOON formatted string
            json_content: JSON formatted string
            
        Returns:
            TokenComparison object
        """
        # This would call the token counting edge function
        # For now, return a simple comparison
        toon_tokens = len(toon_content.split())
        json_tokens = len(json_content.split())
        
        return TokenComparison(
            toon=toon_tokens,
            json=json_tokens,
            savings=json_tokens - toon_tokens,
            savings_percentage=round((json_tokens - toon_tokens) / json_tokens * 100, 2) if json_tokens > 0 else 0,
        )

