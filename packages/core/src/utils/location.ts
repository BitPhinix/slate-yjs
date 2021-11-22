import { Element, Node, Path, Point, Range, Text } from 'slate';
import * as Y from 'yjs';
import {
  InsertDelta,
  RelativeRange,
  TextRange,
  YNodePath,
} from '../model/types';
import { sliceInsertDelta } from './delta';

export function getSlateNodeYLength(node: Node): number {
  if (!node) {
    return 0;
  }

  return Text.isText(node) ? node.text.length : 1;
}

export function slatePathToYOffset(element: Element, pathOffset: number) {
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

  const yOffset = slatePathToYOffset(slateRoot, pathOffset);
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
  insert = false
): [number, number] {
  let currentOffset = 0;
  for (let pathOffset = 0; pathOffset < parent.children.length; pathOffset++) {
    const child = parent.children[pathOffset];
    const nodeLength = Text.isText(child) ? child.text.length : 1;

    if (
      (currentOffset + nodeLength > yOffset && nodeLength > 0) ||
      (!insert && pathOffset === parent.children.length - 1)
    ) {
      return [pathOffset, yOffset - currentOffset];
    }

    currentOffset += nodeLength;
  }

  if (currentOffset + 1 < yOffset) {
    throw new Error('yOffset out of bounds');
  }

  return [parent.children.length, 0];
}

function getYNodePath(sharedRoot: Y.XmlText, yText: Y.XmlText) {
  const pathNodes = [yText];
  while (pathNodes[0] !== sharedRoot) {
    const { parent } = pathNodes[0];

    if (!parent) {
      throw new Error("yText isn't a descendant of root element");
    }

    if (!(parent instanceof Y.XmlText)) {
      throw new Error('Unexpected y parent type');
    }

    pathNodes.unshift(parent);
  }

  return pathNodes;
}

function yNodeToSlatePath(slateRoot: Node, yNodePath: YNodePath): Path {
  if (yNodePath.length < 2) {
    return [];
  }

  const [current, yChild] = yNodePath;
  const currentDelta = current.toDelta() as InsertDelta;

  let yOffset = 0;
  for (const element of currentDelta) {
    if (element.insert === yChild) {
      break;
    }

    yOffset += typeof element.insert === 'string' ? element.insert.length : 1;
  }

  if (Text.isText(slateRoot)) {
    throw new Error('Cannot descend into text');
  }

  const [pathOffset] = yOffsetToSlateOffsets(slateRoot, yOffset);
  return [
    pathOffset,
    ...yNodeToSlatePath(slateRoot.children[pathOffset], yNodePath.slice(-1)),
  ];
}

export function getSlatePath(
  root: Y.XmlText,
  slateRoot: Node,
  yText: Y.XmlText
): Path {
  const yNodePath = getYNodePath(root, yText);
  const path = yNodeToSlatePath(slateRoot, yNodePath);
  return path;
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
    textRange.start + point.offset
  );
}

export function absolutePositionToSlatePoint(
  sharedRoot: Y.XmlText,
  slateRoot: Node,
  { type, index }: Y.AbsolutePosition
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

  const [pathOffset, textOffset] = yOffsetToSlateOffsets(parent, index);
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

export function slateToRelativeRange<T extends Range>(
  sharedRoot: Y.XmlText,
  slateRoot: Node,
  { anchor, focus, ...data }: T
): RelativeRange<T> {
  return {
    anchor: slatePointToRelativePosition(sharedRoot, slateRoot, anchor),
    focus: slatePointToRelativePosition(sharedRoot, slateRoot, focus),
    ...data,
  };
}

export function relativeToSlateRange<T extends Range>(
  sharedRoot: Y.XmlText,
  slateRoot: Node,
  { anchor, focus, ...data }: RelativeRange<T>
): T | null {
  const slateAnchor = relativePositionToSlatePoint(
    sharedRoot,
    slateRoot,
    anchor
  );
  if (!slateAnchor) {
    return null;
  }

  const slateFocus = relativePositionToSlatePoint(sharedRoot, slateRoot, focus);
  if (!slateFocus) {
    return null;
  }

  return {
    anchor: slateAnchor,
    focus: slateFocus,
    ...data,
  } as unknown as T;
}
