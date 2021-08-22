import { Descendant, Operation } from 'slate';
import { SharedType } from '../model/types';

export type ApplyFunc<O extends Operation = Operation> = (
  sharedType: SharedType,
  doc: Descendant[],
  op: O
) => void;

export type OpMapper<O extends Operation = Operation> = {
  [K in O['type']]: O extends { type: K } ? ApplyFunc<O> : never;
};
