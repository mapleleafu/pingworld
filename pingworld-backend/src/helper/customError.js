class BadRequestError extends Error {
  constructor(message) {
    super(message);
    this.status = 400;
    this.success = false;
    this.data = null;
    this.error = message;
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.status = 404;
    this.success = false;
    this.data = null;
    this.error = message;
  }
}

class InternalServerError extends Error {
  constructor(message) {
    super(message);
    this.status = 500;
    this.success = false;
    this.data = null;
    this.error = message;
  }
}

class UnAuthorizedError extends Error {
  constructor(message) {
    super(message);
    this.status = 401;
    this.success = false;
    this.data = null;
    this.error = message;
  }
}

class ForbiddenError extends Error {
  constructor(message) {
    super(message);
    this.status = 403;
    this.success = false;
    this.data = null;
    this.error = message;
  }
}

export { BadRequestError, NotFoundError, InternalServerError, UnAuthorizedError, ForbiddenError };
