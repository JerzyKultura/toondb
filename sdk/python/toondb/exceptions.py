"""
ToonDB Exceptions
"""


class ToonDBError(Exception):
    """Base exception for ToonDB errors."""
    pass


class AuthenticationError(ToonDBError):
    """Raised when authentication fails."""
    pass


class ValidationError(ToonDBError):
    """Raised when validation fails."""
    pass


class NotFoundError(ToonDBError):
    """Raised when resource is not found."""
    pass


class RateLimitError(ToonDBError):
    """Raised when rate limit is exceeded."""
    pass

