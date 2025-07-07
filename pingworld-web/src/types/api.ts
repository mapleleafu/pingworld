interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  status?: number;
}

export class ApiError extends Error {
  public success: boolean;
  public data?: any;
  public error?: string;
  public status?: number;

  constructor(errorData: ApiResponse) {
    super(errorData.error || 'An error occurred');
    this.success = errorData.success;
    this.data = errorData.data;
    this.error = errorData.error;
    this.status = errorData.status;
  }
}