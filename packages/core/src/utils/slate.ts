import { Text } from 'slate';

export function getMarks({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  text,
  ...marks
}: Text): Record<string, unknown> {
  return marks;
}
