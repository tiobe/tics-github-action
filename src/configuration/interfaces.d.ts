export interface RetryConfig {
  delay: number;
  maxRetries: number;
  codes: number[];
}

export interface CliOption {
  action: string;
  cli?: string;
  modes: Mode[];
}
