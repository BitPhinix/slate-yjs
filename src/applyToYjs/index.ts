import { Descendant, Operation } from 'slate';
import invariant from 'tiny-invariant';
import { SharedType } from '../model/types';
import { textMapper } from './text';

import { ApplyFunc, OpMapper } from './types';

const nullOp: ApplyFunc = (doc: SharedType) => doc;

const opMappers: OpMapper = {
  ...textMapper,

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
  doc: Descendant[],
  op: Operation
): SharedType {
  const apply = opMappers[op.type] as ApplyFunc<typeof op>;
  if (!apply) {
    throw new Error(`Unknown operation: ${op.type}`);
  }

  return apply(sharedType, doc, op);
}

/**
 * Applies slate operations to a SharedType
 */
export function applySlateOps(
  sharedType: SharedType,
  doc: Descendant[],
  ops: Operation[],
  origin: unknown
): SharedType {
  invariant(sharedType.doc, 'Shared type without attached document');

  if (ops.length > 0) {
    sharedType.doc.transact(() => {
      ops.forEach((op) => applySlateOp(sharedType, doc, op));
    }, origin);
  }

  return sharedType;
}
