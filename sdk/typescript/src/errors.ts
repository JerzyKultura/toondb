/**
 * ToonDB Error Classes
 */

export class ToonDBError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ToonDBError';
  }
}

export class AuthenticationError extends ToonDBError {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class ValidationError extends ToonDBError {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends ToonDBError {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends ToonDBError {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitError';
  }
}

