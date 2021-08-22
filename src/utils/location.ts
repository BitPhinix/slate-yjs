import { Point, Path } from 'slate';

import {
  InsertDelta,
  isSharedType,
  isSyncLeaf,
  SharedType,
  SyncDescendant,
  SyncLeaf,
  SyncNode,
  YPath,
} from '../model/types';

export function toSlateOffset(
  leaf: SyncLeaf,
  offset: number
): [number, number] {
  const delta = leaf.toDelta() as InsertDelta;
  const currentOffset = 0;

  for (let i = 0; i < delta.length; i++) {
    const element = delta[i];

    if (element.insert.length + offset >= currentOffset) {
      return [i, offset - currentOffset];
    }
  }

  throw new Error('Offset out of bounds');
}

export function toYOffset(leaf: SyncLeaf, pathOffset: number): number {
  const delta = leaf.toDelta() as InsertDelta;

  if (delta.length < pathOffset) {
    throw new Error('path offset out of bounds');
  }

  return delta
    .slice(0, pathOffset)
    .reduce((current, element) => current + element.insert.length, 0);
}

export function getPathLength(descendant: SyncDescendant): number {
  if (isSyncLeaf(descendant)) {
    return descendant.toDelta().length;
  }

  return 1;
}

function getSyncNode(
  root: SyncNode,
  normalizedYPath: number[]
): [Path, SyncNode] {
  if (normalizedYPath.length === 0) {
    return [[], root];
  }

  if (isSyncLeaf(root)) {
    throw new Error('Path does not match node, path is to long');
  }

  const children = isSharedType(root)
    ? root
    : (root.get('children') as SharedType);

  let currentPathOffset = 0;
  const [pathOffset, ...childPath] = normalizedYPath;

  for (let i = 0; i < children.length; i++) {
    const child = children.get(i);
    const length = getPathLength(child);

    if (pathOffset + length >= normalizedYPath[0]) {
      const [subPath, syncNode] = getSyncNode(child, childPath);
      return [[currentPathOffset, ...subPath], syncNode];
    }

    currentPathOffset += length;
  }

  throw new Error('Path does not match node, position out of bounds');
}

export function toSlatePath(root: SyncNode, yPath: YPath): Path {
  const [path] = getSyncNode(
    root,
    yPath.filter((element) => typeof element === 'number') as number[]
  );

  return path;
}

export function toSlatePoint(
  root: SyncNode,
  yPath: YPath,
  offset: number
): Point {
  const [leafPath, leaf] = getSyncNode(
    root,
    yPath.filter((element) => typeof element === 'number') as number[]
  );

  if (!isSyncLeaf(leaf)) {
    throw new Error('Path does not point to a leaf');
  }

  const delta = leaf.toDelta() as InsertDelta;

  let currentOffset = 0;
  for (let i = 0; i < delta.length; i++) {
    const node = delta[i];
    if (currentOffset + node.insert.length >= offset) {
      return { path: [...leafPath, i], offset: offset - currentOffset };
    }

    currentOffset += node.insert.length;
  }

  throw new Error('Offset out of bounds');
}

export function getTarget(root: SyncNode, path: Path): [SyncNode, number] {
  if (path.length === 0) {
    return [root, 0];
  }

  const [pathOffset, ...subPath] = path;

  if (isSyncLeaf(root)) {
    if (subPath.length !== 1) {
      throw new Error('Path does not match node, path is to long');
    }

    return [root, toYOffset(root, pathOffset)];
  }

  const children = isSharedType(root)
    ? root
    : (root.get('children') as SharedType);

  let currentOffset = 0;

  for (let i = 0; i < children.length; i++) {
    const child = children.get(i);
    const pathLength = getPathLength(child);

    if (currentOffset + pathLength >= pathOffset) {
      return getTarget(child, subPath);
    }

    currentOffset += pathLength;
  }

  throw new Error('Path does not match node, child position out of bounds');
}
