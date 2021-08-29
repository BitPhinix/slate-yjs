import Y from 'yjs';

export type InsertDelta = {
  insert: string;
  attributes: Record<string, unknown>;
}[];

export type SyncElement = Y.XmlElement;
export type SyncLeaf = Y.XmlText;
export type SharedType = Y.XmlFragment;

export type SyncNode = SyncElement | SyncLeaf | SharedType;
export type SyncDescendant = SyncElement | SyncLeaf;

export type YPath = (string | number)[];

export function isSyncLeaf(v: unknown): v is SyncLeaf {
  return v instanceof Y.XmlText;
}

export function isSyncElement(v: unknown): v is SyncElement {
  return v instanceof Y.XmlElement;
}

export function isSharedType(v: unknown): v is SharedType {
  return v instanceof Y.XmlFragment;
}

export function isSyncDescendant(v: unknown): v is SyncNode {
  return isSyncLeaf(v) || isSyncElement(v);
}
