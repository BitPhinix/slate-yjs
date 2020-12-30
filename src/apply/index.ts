import { Operation } from 'slate';
import { SyncDoc } from '../model';
import node from './node';
import text from './text';
import { ApplyFunc, OpMapper } from './types';

const nullOp: ApplyFunc = (doc: SyncDoc) => doc;

const opMappers: OpMapper = {
  ...text,
  ...node,

  // SetSelection is currently a null op since we don't support cursors
  set_selection: nullOp,
};

/**
 * Applies a slate operation to a SyncDoc
 *
 * @param doc
 * @param op
 */
export function applySlateOp(doc: SyncDoc, op: Operation): SyncDoc {
  const apply = opMappers[op.type] as ApplyFunc<typeof op>;
  if (!apply) {
    throw new Error(`Unknown operation: ${op.type}`);
  }

  return apply(doc, op);
}

/**
 * Applies a slate operations to a SyncDoc
 *
 * @param doc
 * @param op
 */
export function applySlateOps(doc: SyncDoc, operations: Operation[]): SyncDoc {
  return operations.reduce(applySlateOp, doc);
}
