import { MergeNodeOperation } from 'slate';
import { SyncNode } from '../../model';
import { getParent } from '../../path';
import { cloneSyncElement } from '../../utils/clone';
import { ApplyFunc } from '../types';

/**
 * Applies a merge node operation to a SyncDoc.
 *
 * @param doc
 * @param op
 */
const mergeNode: ApplyFunc<MergeNodeOperation> = (doc, op) => {
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
};

export default mergeNode;
