import { Operation } from 'slate';
import { SyncDoc } from '../model';

export type ApplyFunc<O extends Operation = Operation> = (
  syncDoc: SyncDoc,
  op: O
) => SyncDoc;

export type OpMapper<O extends Operation = Operation> = {
  [K in O['type']]: O extends { type: K } ? ApplyFunc<O> : never;
};
