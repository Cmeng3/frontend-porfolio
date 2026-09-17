export interface ApiResponse<T> {
  data: T;
}
export interface HealthStatus {
  status: "ok";
  service: string;
  version: string;
}
