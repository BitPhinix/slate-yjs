import { Node, SplitNodeOperation, Text } from 'slate';
import * as Y from 'yjs';
import { InsertDelta } from '../../model/types';
import { cloneInsertDeltaDeep } from '../../utils/clone';
import { sliceInsertDelta } from '../../utils/delta';
import { getSlateNodeYLength, getYTarget } from '../../utils/location';
import {
  getStoredPositionsInTextRangeAbsolute,
  setStoredPosition,
} from '../../utils/position';

export function splitNode(
  sharedRoot: Y.XmlText,
  slateRoot: Node,
  op: SplitNodeOperation
): void {
  const target = getYTarget(sharedRoot, slateRoot, op.path);
  if (!target.slateTarget) {
    throw new Error('Y target without corresponding slate node');
  }

  if (!target.yTarget) {
    if (!Text.isText(target.slateTarget)) {
      throw new Error('Mismatch node type between y target and slate node');
    }

    const unset: Record<string, null> = {};
    target.targetDelta.forEach((element) => {
      if (element.attributes) {
        Object.keys(element.attributes).forEach((key) => {
          unset[key] = null;
        });
      }
    });

    return target.yParent.format(
      target.textRange.start,
      target.textRange.end - target.textRange.start,
      { ...unset, ...op.properties }
    );
  }

  if (Text.isText(target.slateTarget)) {
    throw new Error('Mismatch node type between y target and slate node');
  }

  const splitTarget = getYTarget(target.yTarget, target.slateTarget, [
    op.position,
  ]);

  const ySplitOffset = target.slateTarget.children
    .slice(0, op.position)
    .reduce((length, child) => length + getSlateNodeYLength(child), 0);

  const length = target.slateTarget.children.reduce(
    (current, child) => current + getSlateNodeYLength(child),
    0
  );

  const splitDelta = sliceInsertDelta(
    target.yTarget.toDelta() as InsertDelta,
    ySplitOffset,
    length - ySplitOffset
  );

  const storedPositions = getStoredPositionsInTextRangeAbsolute(
    sharedRoot,
    target.yTarget,
    { start: ySplitOffset, end: length }
  );

  const toInsert = new Y.XmlText();
  toInsert.applyDelta(cloneInsertDeltaDeep(splitDelta), {
    sanitize: false,
  });

  Object.entries(op.properties).forEach(([key, value]) => {
    toInsert.setAttribute(key, value);
  });

  target.yTarget.delete(
    splitTarget.textRange.start,
    target.yTarget.length - splitTarget.textRange.start
  );

  target.yParent.insertEmbed(target.textRange.end, toInsert);

  // Update stored positions to point to the split position
  Object.entries(storedPositions).forEach(([key, position]) => {
    setStoredPosition(
      sharedRoot,
      key,
      Y.createRelativePositionFromTypeIndex(
        target.yParent,
        position.index - ySplitOffset,
        position.assoc
      )
    );
  });
}
