const SYNC_SKEW_ERROR_PATTERNS = [
  'Cannot find a descendant at path',
  'yOffset out of bounds',
  'Cannot descent into slate text',
  "yText isn't a descendant of root element",
  "Path doesn't match yText",
  'Unexpected y parent type',
  'Path has to a have a length >= 1',
  'yTarget spans multiple nodes',
];

export function isSyncSkewError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return SYNC_SKEW_ERROR_PATTERNS.some((pattern) =>
    error.message.includes(pattern)
  );
}
