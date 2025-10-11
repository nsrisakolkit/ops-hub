const DATE_INPUT_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function currentDateInputValue(): string {
  const now = new Date();
  const year = String(now.getFullYear()).padStart(4, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isValidDateInput(value: string): boolean {
  return DATE_INPUT_PATTERN.test(value);
}

export function isDateBefore(value: string, comparison: string): boolean {
  if (!isValidDateInput(value) || !isValidDateInput(comparison)) {
    return false;
  }
  return value < comparison;
}

export function dateInputToIso(value: string): string | null {
  if (!isValidDateInput(value)) {
    return null;
  }

  const isoString = new Date(`${value}T00:00:00Z`).toISOString();
  if (!isoString.startsWith(value)) {
    return null;
  }

  return isoString;
}
