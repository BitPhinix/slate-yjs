import { MergeNodeOperation, Node, Path, Text } from 'slate';
import * as Y from 'yjs';
import { Delta } from '../../model/types';
import { cloneInsertDeltaDeep } from '../../utils/clone';
import { yTextToInsertDelta } from '../../utils/delta';
import { getYTarget } from '../../utils/location';
import {
  getStoredPositionsInDeltaAbsolute,
  restoreStoredPositionsWithDeltaAbsolute,
} from '../../utils/position';
import { getProperties } from '../../utils/slate';

export function mergeNode(
  sharedRoot: Y.XmlText,
  slateRoot: Node,
  op: MergeNodeOperation
): void {
  const target = getYTarget(sharedRoot, slateRoot, op.path);
  const prev = getYTarget(
    target.yParent,
    target.slateParent,
    Path.previous(op.path.slice(-1))
  );

  if (!target.yTarget !== !prev.yTarget) {
    throw new Error('Cannot merge y text with y element');
  }

  if (!prev.yTarget || !target.yTarget) {
    const { yParent: parent, textRange, slateTarget } = target;
    if (!Text.isText(slateTarget)) {
      throw new Error('Expected Slate target text node for merge op.');
    }

    const prevSibling = Node.get(slateRoot, Path.previous(op.path));
    if (!Text.isText(prevSibling)) {
      throw new Error('Path points to Y.Text but not a Slate text node.');
    }

    parent.delete(textRange.start, textRange.end - textRange.start);
    parent.insert(textRange.start, slateTarget.text);
    return;
  }

  const deltaApplyYOffset = prev.yTarget.length;
  const targetDelta = yTextToInsertDelta(target.yTarget);
  const clonedDelta = cloneInsertDeltaDeep(targetDelta);

  const storedPositions = getStoredPositionsInDeltaAbsolute(
    sharedRoot,
    target.yTarget,
    targetDelta,
    deltaApplyYOffset
  );

  const applyDelta: Delta = [{ retain: deltaApplyYOffset }, ...clonedDelta];

  prev.yTarget.applyDelta(applyDelta, {
    sanitize: false,
  });

  target.yParent.delete(
    target.textRange.start,
    target.textRange.end - target.textRange.start
  );

  restoreStoredPositionsWithDeltaAbsolute(
    sharedRoot,
    prev.yTarget,
    storedPositions,
    clonedDelta,
    deltaApplyYOffset
  );
}
