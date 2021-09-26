import { Editor, Operation } from 'slate';
import Y from 'yjs';

export type ApplyFunc<O extends Operation = Operation> = (
  root: Y.XmlText,
  editor: Editor,
  op: O
) => void;

export type OpMapper<O extends Operation = Operation> = {
  [K in O['type']]: O extends { type: K } ? ApplyFunc<O> : never;
};
