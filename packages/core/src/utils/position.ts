import { BasePoint, BaseRange, Node, Text } from 'slate';
import * as Y from 'yjs';
import { RelativeRange } from '../model/types';
import { getSlatePath, getYTarget, yOffsetToSlateOffsets } from './location';

export function slatePointToRelativePosition(
  sharedRoot: Y.XmlText,
  slateRoot: Node,
  point: BasePoint
): Y.RelativePosition {
  const { yTarget, yParent, textRange } = getYTarget(
    sharedRoot,
    slateRoot,
    point.path
  );

  if (yTarget) {
    throw new Error(
      'Slate point points to a non-text element inside sharedRoot'
    );
  }

  return Y.createRelativePositionFromTypeIndex(
    yParent,
    textRange.start + point.offset,
    point.offset === textRange.end ? -1 : 0
  );
}

export function absolutePositionToSlatePoint(
  sharedRoot: Y.XmlText,
  slateRoot: Node,
  { type, index, assoc }: Y.AbsolutePosition
): BasePoint | null {
  if (!(type instanceof Y.XmlText)) {
    throw new Error('Absolute position points to a non-XMLText');
  }

  const parentPath = getSlatePath(sharedRoot, slateRoot, type);
  const parent = Node.get(slateRoot, parentPath);

  if (Text.isText(parent)) {
    throw new Error(
      "Absolute position doesn't match slateRoot, cannot descent into text"
    );
  }

  const [pathOffset, textOffset] = yOffsetToSlateOffsets(parent, index, {
    assoc,
  });

  const target = parent.children[pathOffset];
  if (!Text.isText(target)) {
    return null;
  }

  return { path: [...parentPath, pathOffset], offset: textOffset };
}

export function relativePositionToSlatePoint(
  sharedRoot: Y.XmlText,
  slateRoot: Node,
  pos: Y.RelativePosition
): BasePoint | null {
  if (!sharedRoot.doc) {
    throw new Error("sharedRoot isn't attach to a yDoc");
  }

  const absPos = Y.createAbsolutePositionFromRelativePosition(
    pos,
    sharedRoot.doc
  );

  return absPos && absolutePositionToSlatePoint(sharedRoot, slateRoot, absPos);
}

export function relativeRangeToSlateRange(
  sharedRoot: Y.XmlText,
  slateRoot: Node,
  range: RelativeRange
): BaseRange | null {
  const anchor = relativePositionToSlatePoint(
    sharedRoot,
    slateRoot,
    range.anchor
  );

  if (!anchor) {
    return null;
  }

  const focus = relativePositionToSlatePoint(
    sharedRoot,
    slateRoot,
    range.focus
  );

  if (!focus) {
    return null;
  }

  return { anchor, focus };
}
