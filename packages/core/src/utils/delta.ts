import * as Y from 'yjs';
import { DeltaInsert, InsertDelta } from '../model/types';

export function normalizeInsertDelta(delta: InsertDelta): InsertDelta {
  return delta.reduce<InsertDelta>((normalized, element) => {
    if (typeof element.insert === 'string' && element.insert.length === 0) {
      return normalized;
    }

    const prev = normalized[normalized.length - 1];
    if (
      !prev ||
      typeof prev.insert !== 'string' ||
      typeof element.insert !== 'string'
    ) {
      normalized.push(element);
      return normalized;
    }

    const equalAttributes =
      prev.attributes === element.attributes ||
      (!prev.attributes === !element.attributes &&
        Object.entries(prev.attributes ?? {}).every(
          ([key, value]) => element.attributes?.[key] === value
        ));

    if (equalAttributes) {
      prev.insert += element.insert;
      return normalized;
    }

    normalized.push(element);
    return normalized;
  }, []);
}

export function yTextToInsertDelta(yText: Y.XmlText): InsertDelta {
  return normalizeInsertDelta(yText.toDelta()) as InsertDelta;
}

export function getInsertLength({ insert }: DeltaInsert): number {
  return typeof insert === 'string' ? insert.length : 1;
}

export function getInsertDeltaLength(delta: InsertDelta): number {
  return delta.reduce((curr, element) => curr + getInsertLength(element), 0);
}

export function sliceInsertDelta(
  delta: InsertDelta,
  start: number,
  length: number
): InsertDelta {
  if (length < 1) {
    return [];
  }

  let currentOffset = 0;
  const sliced: InsertDelta = [];
  const end = start + length;

  for (let i = 0; i < delta.length; i++) {
    if (currentOffset >= end) {
      break;
    }

    const element = delta[i];
    const elementLength = getInsertLength(element);

    if (currentOffset + elementLength <= start) {
      currentOffset += elementLength;
      continue;
    }

    if (typeof element.insert !== 'string') {
      currentOffset += elementLength;
      sliced.push(element);
      continue;
    }

    const startOffset = Math.max(0, start - currentOffset);
    const endOffset = Math.min(
      elementLength,
      elementLength - (currentOffset + elementLength - end)
    );

    sliced.push({
      ...element,
      insert: element.insert.slice(startOffset, endOffset),
    });
    currentOffset += elementLength;
  }

  return sliced;
}
