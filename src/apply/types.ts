import { Operation } from 'slate';
import { SyncDoc } from '../model';

export type ApplyFunc<O extends Operation = Operation> = (syncDoc: SyncDoc, op: O) => SyncDoc;

export type OpMapper<Ops extends Operation = Operation> = {
  [K in Ops['type']]: Ops extends { type: K } ? ApplyFunc<Ops> : never;
};
