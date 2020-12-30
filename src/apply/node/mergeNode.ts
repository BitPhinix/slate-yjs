import { MergeNodeOperation } from 'slate';
import { SyncDoc, SyncNode } from '../../model';
import { getParent } from '../../path';
import { cloneSyncElement } from '../../utils';

/**
 * Applies a merge node operation to a SyncDoc.
 *
 * @param doc
 * @param op
 */
export default function mergeNode(
  doc: SyncDoc,
  op: MergeNodeOperation
): SyncDoc {
  const [parent, index] = getParent(doc, op.path);

  const children = SyncNode.getChildren(parent);
  const prev = children!.get(index - 1);
  const next = children!.get(index);

  const prevText = SyncNode.getText(prev);
  const nextText = SyncNode.getText(next);

  if (prevText && nextText) {
    prevText.insert(prevText.length, nextText.toString());
  } else {
    const toPush = SyncNode.getChildren(next)!.map(cloneSyncElement);
    SyncNode.getChildren(prev)!.push(toPush);
  }

  SyncNode.getChildren(parent)!.delete(index, 1);

  return doc;
}
