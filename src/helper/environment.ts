export function setVariable(key: string, value: string): void {
  process.env[key] = value;
}

export function unsetVariable(key: string): void {
  delete process.env[key];
}