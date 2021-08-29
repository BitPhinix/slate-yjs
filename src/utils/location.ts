import { Path, Point } from 'slate';
import {
  InsertDelta,
  isSyncLeaf,
  SharedType,
  SyncDescendant,
  SyncElement,
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

export function toYOffset(
  leaf: SyncLeaf,
  pathOffset: number,
  edge: 'start' | 'end' = 'start'
): number {
  if (edge === 'start' && pathOffset === 0) {
    return 0;
  }

  const delta = leaf.toDelta() as InsertDelta;

  if (delta.length < pathOffset) {
    throw new Error('path offset out of bounds');
  }

  return delta
    .slice(0, pathOffset + (edge === 'start' ? 0 : 1))
    .reduce((current, element) => current + element.insert.length, 0);
}

export function getPathLength(descendant: SyncDescendant): number {
  if (isSyncLeaf(descendant)) {
    return descendant.toDelta().length;
  }

  return 1;
}

export function toYPathOffset(
  root: SyncElement | SharedType,
  pathOffset: number,
  edge: 'start' | 'end' = 'start'
): [number, number] {
  let currentOffset = 0;

  for (let i = 0; i < root.length; i++) {
    const child = root.get(i);
    const pathLength = getPathLength(child);

    if (currentOffset + pathLength >= pathOffset) {
      if (!isSyncLeaf(child)) {
        return [i, 0];
      }

      return [i, toYOffset(child, pathOffset - i, edge)];
    }

    currentOffset += pathLength;
  }

  throw new Error('Path offset does not match node, out of bounds');
}

function getSyncNode(root: SyncNode, yPath: YPath): [Path, SyncNode] {
  if (yPath.length === 0) {
    return [[], root];
  }

  if (isSyncLeaf(root)) {
    throw new Error('Path does not match node, path is to long');
  }

  let currentPathOffset = 0;
  const [pathOffset, ...childPath] = yPath;

  if (typeof pathOffset !== 'number') {
    throw new Error(
      `Unexpected yPath element, expected number got '${pathOffset}'`
    );
  }

  for (let i = 0; i < root.length; i++) {
    const child = root.get(i);
    const length = getPathLength(child);

    if (pathOffset + length >= yPath[0]) {
      const [subPath, syncNode] = getSyncNode(child, childPath);
      return [[currentPathOffset, ...subPath], syncNode];
    }

    currentPathOffset += length;
  }

  throw new Error('Path does not match node, position out of bounds');
}

export function toSlatePath(root: SyncNode, yPath: YPath): Path {
  const [path] = getSyncNode(root, yPath);
  return path;
}

export function toSlatePoint(
  root: SyncNode,
  yPath: YPath,
  offset: number
): Point {
  const [leafPath, leaf] = getSyncNode(root, yPath);

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

// TODO: Fix
export function getTarget<TThrowInvalid extends boolean = true>(
  root: SyncNode,
  path: Path,
  {
    edge = 'start',
    throwInvalid,
  }: { edge?: 'start' | 'end'; throwInvalid?: TThrowInvalid } = {}
): TThrowInvalid extends true ? [SyncNode, number] : [SyncNode, number] | null {
  if (path.length === 0) {
    return [root, 0];
  }

  const [pathOffset, ...subPath] = path;

  if (isSyncLeaf(root)) {
    if (subPath.length !== 1) {
      if (throwInvalid) {
        throw new Error('Path does not match node, path is to long');
      }

      return null as TThrowInvalid extends true
        ? [SyncNode, number]
        : [SyncNode, number] | null;
    }

    return [root, toYOffset(root, pathOffset, edge)];
  }

  let currentOffset = 0;

  for (let i = 0; i < root.length; i++) {
    const child = root.get(i);
    const pathLength = getPathLength(child);

    if (currentOffset + pathLength >= pathOffset) {
      return getTarget(child, subPath);
    }

    currentOffset += pathLength;
  }

  if (throwInvalid) {
    throw new Error('Path does not match node, child position out of bounds');
  }

  return null as TThrowInvalid extends true
    ? [SyncNode, number]
    : [SyncNode, number] | null;
}
