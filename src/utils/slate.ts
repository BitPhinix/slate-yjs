import { Text } from 'slate';

export function getMarks({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  text,
  ...attributes
}: Text): Record<string, unknown> {
  return attributes;
}
