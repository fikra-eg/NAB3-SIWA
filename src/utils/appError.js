//Defines a standard application error used across the backend

export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.name = "AppError";
    this.statusCode = statusCode;
  }
}
export default AppError;
