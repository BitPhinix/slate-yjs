import { Editor, Operation } from 'slate';
import invariant from 'tiny-invariant';
import { SharedType } from '../model/types';
import { NODE_MAPPER } from './node';
import { TEXT_MAPPER } from './text';
import { ApplyFunc, OpMapper } from './types';

const nullOp: ApplyFunc = (doc: SharedType) => doc;

const opMappers: OpMapper = {
  ...TEXT_MAPPER,
  ...NODE_MAPPER,

  // SetSelection is currently a null op since we don't support cursors
  set_selection: nullOp,
};

/**
 * Applies a slate operation to a SharedType
 *
 * @param sharedType
 * @param op
 */
export function applySlateOp(
  sharedType: SharedType,
  editor: Editor,
  op: Operation
): void {
  // TODO: Handle "set_marks" operation pairs differently
  const apply = opMappers[op.type] as ApplyFunc<typeof op>;
  if (!apply) {
    throw new Error(`Unknown operation: ${op.type}`);
  }

  apply(sharedType, editor, op);
}

/**
 * Applies slate operations to a SharedType
 */
export function applySlateOps(
  sharedType: SharedType,
  editor: Editor,
  ops: Operation[],
  origin: unknown
): SharedType {
  invariant(sharedType.doc, 'Shared type without attached document');

  if (ops.length > 0) {
    sharedType.doc.transact(() => {
      ops.forEach((op) => applySlateOp(sharedType, editor, op));
    }, origin);
  }

  return sharedType;
}
