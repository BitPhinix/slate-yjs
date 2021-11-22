import { BaseRange } from 'slate';
import type Y from 'yjs';

export type DeltaAttributes = {
  retain: number;
  attributes: Record<string, unknown>;
};
export type DeltaRetain = { retain: number };
export type DeltaDelete = { delete: number };
export type DeltaInsert = {
  insert: string | Y.XmlText;
  attributes?: Record<string, unknown>;
};

export type InsertDelta = Array<DeltaInsert>;
export type Delta = Array<
  DeltaRetain | DeltaDelete | DeltaInsert | DeltaAttributes
>;

export type YPath = (string | number)[];
export type TextRange = { start: number; end: number };

export type YNodePath = Y.XmlText[];

export type RelativeRange<T extends BaseRange = BaseRange> = Omit<
  T,
  'anchor' | 'focus'
> & {
  anchor: Y.RelativePosition;
  focus: Y.RelativePosition;
};

export type HistoryStackItem = {
  meta: Map<string, unknown>;
};
