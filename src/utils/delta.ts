import { DeltaInsert, InsertDelta } from '../model/types';

export function getInsertLength({ insert }: DeltaInsert): number {
  return typeof insert === 'string' ? insert.length : 1;
}

export function sliceInsertDelta(
  delta: InsertDelta,
  start: number,
  length: number
): InsertDelta {
  if (length < 1) {
    return [];
  }

  let offset = 0;
  const sliced: InsertDelta = [];
  const end = start + length;

  for (let i = 0; i < delta.length; i++) {
    const element = delta[i];
    const elementLength = getInsertLength(element);

    if (offset + elementLength >= start + elementLength) {
      return sliced;
    }

    if (offset + elementLength < start) {
      offset += elementLength;
      continue;
    }

    if (typeof element.insert !== 'string') {
      sliced.push(element);
      offset += elementLength;
      continue;
    }

    const startOffset = Math.max(0, start - offset);
    const endOffset = Math.min(
      elementLength,
      elementLength - (offset + elementLength - end)
    );

    sliced.push({
      ...element,
      insert: element.insert.slice(startOffset, endOffset),
    });
    offset += elementLength;
  }

  if (end > offset) {
    throw new Error("Offsets don't match delta, end out of bounds");
  }

  return sliced;
}
