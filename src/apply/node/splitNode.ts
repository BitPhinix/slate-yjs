import { SplitNodeOperation } from 'slate';
import { SyncNode } from '../../model';
import { getParent } from '../../path';
import { cloneSyncElement } from '../../utils/clone';
import { ApplyFunc } from '../types';

/**
 * Applies a split node operation to a SyncDoc
 *
 * @param doc
 * @param op
 */
const splitNode: ApplyFunc<SplitNodeOperation> = (doc, op) => {
  const [parent, index]: [SyncNode, number] = getParent(doc, op.path);

  const target = SyncNode.getChildren(parent)!.get(index);
  const inject = cloneSyncElement(target);
  SyncNode.getChildren(parent)!.insert(index + 1, [inject]);

  if (SyncNode.getText(target) !== undefined) {
    const targetText = SyncNode.getText(target)!;
    const injectText = SyncNode.getText(inject)!;

    if (targetText.length > op.position) {
      targetText.delete(op.position, targetText.length - op.position);
    }

    if (injectText !== undefined && op.position !== undefined) {
      injectText.delete(0, op.position);
    }
  } else {
    const targetChildren = SyncNode.getChildren(target)!;
    const injectChildren = SyncNode.getChildren(inject)!;

    targetChildren.delete(op.position, targetChildren.length - op.position);

    if (op.position !== undefined) {
      injectChildren.delete(0, op.position);
    }
  }

  return doc;
};

export default splitNode;
