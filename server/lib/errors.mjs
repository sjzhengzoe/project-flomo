export class HttpError extends Error {
  constructor(statusCode, code, message, details) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export function assertCondition(condition, statusCode, code, message, details) {
  if (!condition) {
    throw new HttpError(statusCode, code, message, details);
  }
}
