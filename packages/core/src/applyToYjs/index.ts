import { Editor, Operation } from 'slate';
import * as Y from 'yjs';
import { NODE_MAPPER } from './node';
import { TEXT_MAPPER } from './text';
import { ApplyFunc, OpMapper } from './types';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const nullOp: ApplyFunc = () => {};

const opMappers: OpMapper = {
  ...TEXT_MAPPER,
  ...NODE_MAPPER,

  set_selection: nullOp,
};

/**
 * Applies a slate operation to a Y.XmlText
 *
 * @param sharedType
 * @param op
 */
export function applySlateOp(
  root: Y.XmlText,
  editor: Editor,
  op: Operation,
  origin: unknown
): void {
  // TODO: Handle "set_marks" operation pairs differently
  const apply = opMappers[op.type] as ApplyFunc<typeof op>;
  if (!apply) {
    throw new Error(`Unknown operation: ${op.type}`);
  }

  root.doc?.transact(() => {
    apply(root, editor, op);
  }, origin);
}
