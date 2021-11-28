import { MergeNodeOperation, Node, Path, Text } from 'slate';
import * as Y from 'yjs';
import { Delta, InsertDelta } from '../../model/types';
import { cloneInsertDeltaDeep } from '../../utils/clone';
import { getYTarget } from '../../utils/location';
import {
  getStoredPositionsInTextRangeAbsolute,
  setStoredPosition,
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
    const { yParent: parent, textRange } = target;

    const previousSibling = Node.get(slateRoot, Path.previous(op.path));
    if (!Text.isText(previousSibling)) {
      throw new Error('Path points to a y text but not a slate node');
    }

    return parent.format(
      textRange.start,
      textRange.start - textRange.end,
      getProperties(previousSibling)
    );
  }

  const storedPositions = getStoredPositionsInTextRangeAbsolute(
    sharedRoot,
    target.yTarget
  );

  const prevYOffset = prev.yTarget.length;
  const delta = cloneInsertDeltaDeep(target.yTarget.toDelta() as InsertDelta);
  const applyDelta: Delta = [{ retain: prevYOffset }, ...delta];

  prev.yTarget.applyDelta(applyDelta, {
    sanitize: false,
  });

  target.yParent.delete(
    target.textRange.start,
    target.textRange.end - target.textRange.start
  );

  // Update stored positions to point to the merged position
  Object.entries(storedPositions).forEach(([key, position]) => {
    setStoredPosition(
      sharedRoot,
      key,
      Y.createRelativePositionFromTypeIndex(
        prev.yParent,
        prevYOffset + (position.index - target.textRange.start),
        position.assoc
      )
    );
  });
}
