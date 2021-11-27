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
export type RelativePositionRef = {
  affinity: 'forward' | 'backward';
  position: Y.RelativePosition;
};

export type RelativeRange = {
  anchor: Y.RelativePosition;
  focus: Y.RelativePosition;
} & Record<string, unknown>;

export type HistoryStackItem = {
  meta: Map<string, unknown>;
};
