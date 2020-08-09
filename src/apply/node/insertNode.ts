import { InsertNodeOperation } from 'slate';
import { SyncNode } from '../../model';
import { getParent } from '../../path';
import { toSyncElement } from '../../utils/convert';
import { ApplyFunc } from '../types';

/**
 * Applies an insert node operation to a SyncDoc.
 *
 * @param doc
 * @param op
 */
const insertNode: ApplyFunc<InsertNodeOperation> = (doc, op) => {
  const [parent, index] = getParent(doc, op.path);

  if (SyncNode.getText(parent) !== undefined) {
    throw new TypeError("Can't insert node into text node");
  }

  const children = SyncNode.getChildren(parent);
  if (!children) {
    throw new TypeError('');
  }

  SyncNode.getChildren(parent)!.insert(index, [toSyncElement(op.node)]);
  return doc;
};

export default insertNode;
