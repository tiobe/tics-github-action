/**
 * Checks if the first value is one of the following ones.
 * Replaces value === arg1 || value === arg2 || ...
 * @param value value to compare.
 * @param args values to compare with.
 * @returns if value equals one of the values to compare with.
 */
export function isOneOf<T>(value: T, ...args: [T, ...T[]]): boolean {
  return args.includes(value);
}

export function emptyToNull(value: string | null | undefined): string | null {
  return value !== undefined && value !== null && value !== '' ? value : null;
}
