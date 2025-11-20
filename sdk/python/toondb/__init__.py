"""
ToonDB Python SDK

Official Python client for ToonDB - Token-Oriented Object Notation Database
"""

__version__ = "1.0.0"

from .client import ToonDB
from .models import Table, QueryResult, TokenComparison
from .exceptions import ToonDBError, AuthenticationError, ValidationError

__all__ = [
    "ToonDB",
    "Table",
    "QueryResult",
    "TokenComparison",
    "ToonDBError",
    "AuthenticationError",
    "ValidationError",
]

