import { Path } from 'slate';
import * as Y from 'yjs';
import { SyncDoc, SyncElement, SyncNode } from '../model';
import { toSlateDoc } from '../utils/convert';

const isTree = (node: SyncNode): boolean => !!SyncNode.getChildren(node);

/**
 * Returns the SyncNode referenced by the path
 *
 * @param doc
 * @param path
 */
export function getTarget(doc: SyncDoc, path: Path): SyncNode {
  function iterate(current: SyncNode, idx: number) {
    if (!isTree(current) || !SyncNode.getChildren(current)?.get(idx)) {
      throw new TypeError(
        `path ${path.toString()} does not match doc ${JSON.stringify(
          toSlateDoc(doc)
        )}`
      );
    }

    return SyncNode.getChildren(current)!.get(idx);
  }

  return path.reduce<SyncNode>(iterate, doc);
}

function getParentPath(path: Path, level = 1): [number, Path] {
  if (level > path.length) {
    throw new TypeError('requested ancestor is higher than root');
  }

  return [path[path.length - level], path.slice(0, path.length - level)];
}

export function getParent(
  doc: SyncDoc,
  path: Path,
  level = 1
): [SyncNode, number] {
  const [idx, parentPath] = getParentPath(path, level);
  return [getTarget(doc, parentPath)!, idx];
}

/**
 * Returns the position of the sync item inside inside it's parent array.
 *
 * @param item
 */
export function getArrayPosition(item: Y.Item): number {
  let i = 0;
  let c = (item.parent as Y.Array<SyncElement>)._start;

  while (c !== item && c !== null) {
    if (!c.deleted) {
      i += 1;
    }
    c = c.right;
  }

  return i;
}

/**
 * Returns the document path of a sync item
 *
 * @param item
 */
export function getSyncItemPath(item: Y.Item): Path {
  if (!item) {
    return [];
  }

  const { parent } = item;
  if (parent instanceof Y.Array) {
    return [...getSyncItemPath(parent._item!), getArrayPosition(item)];
  }

  if (parent instanceof Y.Map) {
    return getSyncItemPath(parent._item!);
  }

  throw new Error(`Unknown parent type ${parent}`);
}
