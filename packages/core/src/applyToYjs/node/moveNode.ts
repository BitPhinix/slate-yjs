import { MoveNodeOperation, Node, Path, Text } from 'slate';
import * as Y from 'yjs';
import { Delta, InsertDelta } from '../../model/types';
import { cloneInsertDeltaDeep } from '../../utils/clone';
import { getInsertDeltaLength } from '../../utils/delta';
import { getYTarget } from '../../utils/location';
import {
  getStoredPositionsInTextRangeAbsolute,
  setStoredPosition,
} from '../../utils/position';

export function moveNode(
  sharedRoot: Y.XmlText,
  slateRoot: Node,
  op: MoveNodeOperation
): void {
  const newParentPath = Path.parent(op.newPath);
  const newPathOffset = op.newPath[op.newPath.length - 1];
  const parent = Node.get(slateRoot, newParentPath);
  if (Text.isText(parent)) {
    throw new Error('Cannot move slate node into text element');
  }
  const normalizedNewPath = [
    ...newParentPath,
    Math.min(newPathOffset, parent.children.length),
  ];

  const origin = getYTarget(sharedRoot, slateRoot, op.path);
  const target = getYTarget(sharedRoot, slateRoot, normalizedNewPath);
  const insertDelta = cloneInsertDeltaDeep(origin.targetDelta);

  const storedPositions = getStoredPositionsInTextRangeAbsolute(
    sharedRoot,
    origin.yParent,
    origin.textRange
  );

  origin.yParent.delete(
    origin.textRange.start,
    origin.textRange.end - origin.textRange.start
  );

  const targetLength = getInsertDeltaLength(
    target.yParent.toDelta() as InsertDelta
  );

  const targetYOffset = Math.min(target.textRange.start, targetLength);
  const applyDelta: Delta = [{ retain: targetYOffset }, ...insertDelta];

  target.yParent.applyDelta(applyDelta, { sanitize: false });

  // Update stored positions to point to the new slate node position
  Object.entries(storedPositions).forEach(([key, position]) => {
    if (!position) {
      return;
    }

    setStoredPosition(
      sharedRoot,
      key,
      Y.createRelativePositionFromTypeIndex(
        target.yParent,
        targetYOffset + (origin.textRange.start - position.index),
        position.assoc
      )
    );
  });
}
