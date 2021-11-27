import { Element, Node, Path, Point, Range, Text } from 'slate';
import * as Y from 'yjs';
import { InsertDelta, RelativeRange, TextRange } from '../model/types';
import { sliceInsertDelta } from './delta';

export function getSlateNodeYLength(node: Node | undefined): number {
  if (!node) {
    return 0;
  }

  return Text.isText(node) ? node.text.length : 1;
}

export function slatePathOffsetToYOffset(element: Element, pathOffset: number) {
  return element.children
    .slice(0, pathOffset)
    .reduce((yOffset, node) => yOffset + getSlateNodeYLength(node), 0);
}

export function getYTarget(
  yRoot: Y.XmlText,
  slateRoot: Node,
  path: Path
): {
  textRange: TextRange;
  parent: Y.XmlText;
  parentNode: Node;
  target?: Y.XmlText;
  targetNode?: Node;
  targetDelta: InsertDelta;
} {
  if (path.length === 0) {
    throw new Error('Path has to a have a length >= 1');
  }

  if (Text.isText(slateRoot)) {
    throw new Error('Cannot descent into slate text');
  }

  const [pathOffset, ...childPath] = path;

  const yOffset = slatePathOffsetToYOffset(slateRoot, pathOffset);
  const targetNode = slateRoot.children[pathOffset];

  // TODO: Perf, we don't need the entire delta here.
  const delta = yRoot.toDelta() as InsertDelta;
  const targetLength = getSlateNodeYLength(targetNode);

  const targetDelta = sliceInsertDelta(delta, yOffset, targetLength);
  if (targetDelta.length > 1) {
    throw new Error("Path doesn't match yText, yTarget spans multiple nodes");
  }

  const yTarget = targetDelta[0]?.insert;
  if (childPath.length > 0) {
    if (!(yTarget instanceof Y.XmlText)) {
      throw new Error(
        "Path doesn't match yText, cannot descent into non-yText"
      );
    }

    return getYTarget(yTarget, targetNode, childPath);
  }

  return {
    parent: yRoot,
    textRange: { start: yOffset, end: yOffset + targetLength },
    target: yTarget instanceof Y.XmlText ? yTarget : undefined,
    parentNode: slateRoot,
    targetNode,
    targetDelta,
  };
}

export function yOffsetToSlateOffsets(
  parent: Element,
  yOffset: number,
  opts: { assoc?: number; insert?: boolean } = {}
): [number, number] {
  const { assoc = 0, insert = false } = opts;

  let currentOffset = 0;
  let lastNonEmptyPathOffset = 0;
  for (let pathOffset = 0; pathOffset < parent.children.length; pathOffset++) {
    const child = parent.children[pathOffset];
    const nodeLength = Text.isText(child) ? child.text.length : 1;

    if (nodeLength > 0) {
      lastNonEmptyPathOffset = pathOffset;
    }

    const endOffset = currentOffset + nodeLength;
    if (
      nodeLength > 0 &&
      (assoc >= 0 ? endOffset > yOffset : endOffset >= yOffset)
    ) {
      return [pathOffset, yOffset - currentOffset];
    }

    currentOffset += nodeLength;
  }

  if (yOffset > currentOffset + (insert ? 1 : 0)) {
    throw new Error('yOffset out of bounds');
  }

  if (insert) {
    return [parent.children.length, 0];
  }

  const child = parent.children[lastNonEmptyPathOffset];
  const textOffset = Text.isText(child) ? child.text.length : 1;
  return [lastNonEmptyPathOffset, textOffset];
}

export function getSlatePath(
  sharedRoot: Y.XmlText,
  slateRoot: Node,
  yText: Y.XmlText
): Path {
  const yNodePath = [yText];
  while (yNodePath[0] !== sharedRoot) {
    const { parent: yParent } = yNodePath[0];

    if (!yParent) {
      throw new Error("yText isn't a descendant of root element");
    }

    if (!(yParent instanceof Y.XmlText)) {
      throw new Error('Unexpected y parent type');
    }

    yNodePath.unshift(yParent);
  }

  if (yNodePath.length < 2) {
    return [];
  }

  let slateParent = slateRoot;
  return yNodePath.reduce<Path>((path, yParent, idx) => {
    const yChild = yNodePath[idx + 1];
    if (!yChild) {
      return path;
    }

    let yOffset = 0;
    const currentDelta = yParent.toDelta() as InsertDelta;
    for (const element of currentDelta) {
      if (element.insert === yChild) {
        break;
      }

      yOffset += typeof element.insert === 'string' ? element.insert.length : 1;
    }

    if (Text.isText(slateParent)) {
      throw new Error('Cannot descent into slate text');
    }

    const [pathOffset] = yOffsetToSlateOffsets(slateParent, yOffset);
    slateParent = slateParent.children[pathOffset];
    return path.concat(pathOffset);
  }, []);
}

export function slatePointToRelativePosition(
  sharedRoot: Y.XmlText,
  slateRoot: Node,
  point: Point
) {
  const { target, parent, textRange } = getYTarget(
    sharedRoot,
    slateRoot,
    point.path
  );

  if (target) {
    throw new Error(
      'Slate point points to a non-text element inside sharedRoot'
    );
  }

  return Y.createRelativePositionFromTypeIndex(
    parent,
    textRange.start + point.offset,
    point.offset === textRange.end ? -1 : 0
  );
}

export function absolutePositionToSlatePoint(
  sharedRoot: Y.XmlText,
  slateRoot: Node,
  { type, index, assoc }: Y.AbsolutePosition
): Point {
  if (!(type instanceof Y.XmlText)) {
    throw new Error('Absolute position points to a non-XMLText');
  }

  const parentPath = getSlatePath(sharedRoot, slateRoot, type);
  const parent = Node.get(slateRoot, parentPath);

  if (!Element.isElement(parent)) {
    throw new Error(
      "Absolute position doesn't match slateRoot, cannot descent into text"
    );
  }

  const [pathOffset, textOffset] = yOffsetToSlateOffsets(parent, index, {
    assoc,
  });
  return { path: [...parentPath, pathOffset], offset: textOffset };
}

export function relativePositionToSlatePoint(
  sharedRoot: Y.XmlText,
  slateRoot: Node,
  pos: Y.RelativePosition
) {
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
  relativeRange: RelativeRange
) {
  const {
    anchor: relativeAnchor,
    focus: relativeFocus,
    ...data
  } = relativeRange;

  const anchor = relativePositionToSlatePoint(
    sharedRoot,
    slateRoot,
    relativeAnchor
  );

  if (!anchor) {
    return null;
  }

  const focus = relativePositionToSlatePoint(
    sharedRoot,
    slateRoot,
    relativeFocus
  );

  if (!focus) {
    return null;
  }

  return { anchor, focus, ...data };
}

export function slateRangeToRelativeRange(
  sharedRoot: Y.XmlText,
  slateRoot: Node,
  range: Range
): RelativeRange {
  const { anchor, focus, ...data } = range;

  const relativeAnchor = slatePointToRelativePosition(
    sharedRoot,
    slateRoot,
    anchor
  );

  const relativeFocus = slatePointToRelativePosition(
    sharedRoot,
    slateRoot,
    focus
  );

  return { anchor: relativeAnchor, focus: relativeFocus, ...data };
}
