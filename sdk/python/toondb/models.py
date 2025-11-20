"""
ToonDB Data Models
"""

from dataclasses import dataclass
from typing import Any, Dict, List, Optional
from datetime import datetime


@dataclass
class Table:
    """Represents a ToonDB table."""
    
    id: str
    user_id: str
    name: str
    description: Optional[str]
    schema_fields: Dict[str, str]
    row_count: int
    data: Any
    toon_content: Optional[str]
    delimiter: str
    is_public: bool
    created_at: str
    updated_at: str
    
    @property
    def created_datetime(self) -> datetime:
        """Get created_at as datetime object."""
        return datetime.fromisoformat(self.created_at.replace('Z', '+00:00'))
    
    @property
    def updated_datetime(self) -> datetime:
        """Get updated_at as datetime object."""
        return datetime.fromisoformat(self.updated_at.replace('Z', '+00:00'))


@dataclass
class QueryResult:
    """Represents query execution results."""
    
    results: List[Any]
    execution_time_ms: int
    row_count: int
    
    def to_dict(self) -> Dict:
        """Convert results to dictionary."""
        return {
            'results': self.results,
            'execution_time_ms': self.execution_time_ms,
            'row_count': self.row_count,
        }


@dataclass
class TokenComparison:
    """Token count comparison between TOON and JSON."""
    
    toon: int
    json: int
    savings: int
    savings_percentage: float
    
    def __str__(self) -> str:
        return (
            f"TOON: {self.toon} tokens\n"
            f"JSON: {self.json} tokens\n"
            f"Savings: {self.savings} tokens ({self.savings_percentage}%)"
        )


@dataclass
class ApiKey:
    """Represents an API key."""
    
    id: str
    name: str
    key_prefix: str
    last_used_at: Optional[str]
    expires_at: Optional[str]
    is_active: bool
    created_at: str

