import { Node, Path, Point } from 'slate';
import {
  InsertDelta,
  isSyncLeaf,
  SyncDescendant,
  SyncNode,
  SyncParent,
  TextRange,
  YPath,
  YRange,
} from '../model/types';

export function isCollapsed(yRange: YRange): boolean {
  const { start, end } = yRange;

  if (start.offset !== end.offset || start.path.length !== end.path.length) {
    return false;
  }

  return start.path.every((entry, i) => entry === end.path[i]);
}

function getPathLength(descendant: SyncDescendant): number {
  if (isSyncLeaf(descendant)) {
    return descendant.toDelta().length;
  }

  return 1;
}

// Return the parent sync node and the to the parent relative target child range
// targeted by a operation with the given slate path.
//
// GetYTarget has a "next" affinity. E.g. if a path points to either the end of
// a leaf group or the next element, getTarget will return the next element.
//
// TODO: Handle empty slate texts, following texts with the same marks.
export function getYTarget(
  root: SyncNode,
  node: Node,
  path: Path
): {
  parent: SyncParent;
  pathOffset: number;
  textRange?: TextRange;
  element?: SyncNode;
} {
  if (path.length === 0) {
    throw new Error('Path has a have a length >= 1');
  }

  if (isSyncLeaf(root)) {
    throw new Error(
      "Path doesn't match element, cannot descent into sync leaf"
    );
  }

  let currentPathOffset = 0;
  for (let i = 0; i < root.length; i++) {
    const child = root.get(i);
    const pathLength = getPathLength(child);

    if (currentPathOffset + pathLength > path[0]) {
      currentPathOffset += pathLength;
      continue;
    }

    if (!isSyncLeaf(child)) {
      if (path.length === 1) {
        return {
          element: child,
          parent: root,
          pathOffset: currentPathOffset,
        };
      }

      return getYTarget(child, path.slice(1));
    }

    if (path.length > 1) {
      throw new Error(
        "Path doesn't match element, cannot descent into sync leaf"
      );
    }

    const delta = child.toDelta() as InsertDelta;
    const deltaOffset = path[0] - currentPathOffset;
    const anchorOffset = delta
      .slice(0, deltaOffset)
      .reduce((length, { insert }) => length + insert.length, 0);

    return {
      element: child,
      parent: root,
      pathOffset: currentPathOffset,
      textRange: {
        startOffset: anchorOffset,
        endOffset: delta[deltaOffset].insert.length + anchorOffset,
      },
    };
  }

  // Insert new element at the end
  if (path.length === 1 && currentPathOffset === path[0]) {
    return { parent: root, pathOffset: path[0] };
  }

  throw new Error("Path doesn't match root element, offset out of bounds");
}

export function toSlatePoint(
  root: SyncNode,
  yPath: YPath,
  offset: number
): Point {
  let current: SyncNode = root;
  const path = yPath.map((pathOffset) => {
    if (isSyncLeaf(current)) {
      throw new Error(
        "YPath doesn't match element, cannot descent into sync leaf"
      );
    }

    if (typeof pathOffset === 'string') {
      throw new Error(
        "YPath doesn't match element, YPath contains string element"
      );
    }

    if (pathOffset > current.length) {
      throw new Error("YPath doesn't match element, offset out of bounds");
    }

    let currentPathOffset = 0;
    for (let i = 0; i < yPath[0]; i++) {
      currentPathOffset += getPathLength(current.get(i));
    }

    current = current.get(pathOffset);
    return currentPathOffset;
  });

  if (offset === 0) {
    return { path, offset: 0 };
  }

  if (!isSyncLeaf(current)) {
    throw new Error(
      "YPath doesn't match element, text offset in non-leaf element"
    );
  }

  const delta = current.toDelta() as InsertDelta;

  let startTextOffset = 0;
  const leafPathOffset = delta.findIndex(({ insert }) => {
    if (startTextOffset + insert.length >= offset) {
      return true;
    }

    startTextOffset += insert.length;
    return false;
  });

  if (leafPathOffset === -1) {
    throw new Error("YPath doesn't match element, text offset out of bounds");
  }

  return {
    path: [...path.slice(0, -1), path[path.length - 1] + leafPathOffset],
    offset: offset - startTextOffset,
  };
}

export function toSlatePath(root: SyncNode, yPath: YPath): Path {
  return toSlatePoint(root, yPath, 0).path;
}
