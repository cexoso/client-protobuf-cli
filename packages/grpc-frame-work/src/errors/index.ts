export class CustomerError extends Error {
  public status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export class UnauthorizedError extends CustomerError {
  constructor(message: string) {
    super(message ?? 'Authorization Required', 401)
  }
}

export class Forbidden extends CustomerError {
  constructor(message: string) {
    super(message ?? `you don't have permission to access this resource`, 403)
  }
}
