import type Y from 'yjs';

export type DeltaRetain = { retain: number };
export type DeltaDelete = { delete: number };
export type DeltaInsert = {
  insert: string | Y.XmlText;
  attributes?: Record<string, unknown>;
};

export type InsertDelta = Array<DeltaInsert>;
export type Delta = Array<DeltaRetain | DeltaDelete | DeltaInsert>;

export type YPath = (string | number)[];
export type TextRange = { start: number; end: number };
