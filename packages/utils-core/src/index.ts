/**
 * @mtngtools/utils-core
 * Core utility functions shared across mtngTOOLS packages.
 */

/**
 * Identity function: returns the value unchanged.
 * Useful as a default or placeholder in higher-order utilities.
 */
export function identity<T>(value: T): T {
  return value;
}
