import Y from 'yjs';

export type InsertDelta = {
  insert: string;
  attributes: Record<string, unknown>;
}[];

export type SyncElement = Y.Map<unknown>;
export type SyncLeaf = Y.Text;
export type SharedType = Y.Array<SyncElement | SyncLeaf>;

export type SyncNode = SyncElement | SyncLeaf | SharedType;
export type SyncDescendant = SyncElement | SyncLeaf;

export type YPath = (string | number)[];

export function isSyncLeaf(v: unknown): v is SyncLeaf {
  return v instanceof Y.Text;
}

export function isSyncElement(v: unknown): v is SyncElement {
  return v instanceof Y.Map;
}

export function isSharedType(v: unknown): v is SharedType {
  return v instanceof Y.Array;
}
