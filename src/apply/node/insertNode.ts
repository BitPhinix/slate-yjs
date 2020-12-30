import { InsertNodeOperation } from 'slate';
import { SyncDoc, SyncNode } from '../../model';
import { getParent } from '../../path';
import { toSyncElement } from '../../utils/convert';

/**
 * Applies an insert node operation to a SyncDoc.
 *
 * @param doc
 * @param op
 */
export default function insertNode(
  doc: SyncDoc,
  op: InsertNodeOperation
): SyncDoc {
  const [parent, index] = getParent(doc, op.path);

  const children = SyncNode.getChildren(parent);
  if (SyncNode.getText(parent) !== undefined || !children) {
    throw new TypeError("Can't insert node into text node");
  }

  SyncNode.getChildren(parent)!.insert(index, [toSyncElement(op.node)]);
  return doc;
}
