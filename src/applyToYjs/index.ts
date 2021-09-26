import { Editor, Operation } from 'slate';
import Y from 'yjs';
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
  op: Operation
): void {
  // TODO: Handle "set_marks" operation pairs differently
  const apply = opMappers[op.type] as ApplyFunc<typeof op>;
  if (!apply) {
    throw new Error(`Unknown operation: ${op.type}`);
  }

  apply(root, editor, op);
}

/**
 * Applies slate operations to a Y.XmlText
 */
export function applySlateOps(
  root: Y.XmlText,
  editor: Editor,
  ops: Operation[],
  origin: unknown
): void {
  if (!root.doc) {
    throw new Error('Shared type without attached document');
  }

  if (ops.length > 0) {
    root.doc.transact(() => {
      ops.forEach((op) => applySlateOp(root, editor, op));
    }, origin);
  }
}
