export interface RetryConfig {
  delay: number;
  maxRetries: number;
  codes: number[];
}

export interface CliOption {
  action: string;
  modes: Mode[];
}
