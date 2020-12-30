import { RemoveNodeOperation } from 'slate';
import { SyncDoc, SyncNode } from '../../model';
import { getParent } from '../../path';

/**
 * Applies a remove node operation to a SyncDoc.
 *
 * @param doc
 * @param op
 */
export default function removeNode(
  doc: SyncDoc,
  op: RemoveNodeOperation
): SyncDoc {
  const [parent, index] = getParent(doc, op.path);

  if (SyncNode.getText(parent) !== undefined) {
    throw new TypeError("Can't remove node from text node");
  }

  SyncNode.getChildren(parent)!.delete(index);
  return doc;
}
