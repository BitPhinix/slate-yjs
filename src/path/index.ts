import { Path } from 'slate';
import invariant from 'tiny-invariant';
import * as Y from 'yjs';
import { SharedType, SyncElement, SyncNode } from '../model';
import { toSlateDoc } from '../utils/convert';

const isTree = (node: SyncNode): boolean => !!SyncNode.getChildren(node);

/**
 * Returns the SyncNode referenced by the path
 *
 * @param doc
 * @param path
 */
export function getTarget(doc: SharedType, path: Path): SyncNode {
  function iterate(current: SyncNode, idx: number) {
    const children = SyncNode.getChildren(current);

    if (!isTree(current) || !children?.get(idx)) {
      throw new TypeError(
        `path ${path.toString()} does not match doc ${JSON.stringify(
          toSlateDoc(doc)
        )}`
      );
    }

    return children.get(idx);
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
  doc: SharedType,
  path: Path,
  level = 1
): [SyncNode, number] {
  const [idx, parentPath] = getParentPath(path, level);
  const parent = getTarget(doc, parentPath);
  invariant(parent, 'Parent node should exists');
  return [parent, idx];
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
    invariant(parent._item, 'Parent should be associated with a item');
    return [...getSyncItemPath(parent._item), getArrayPosition(item)];
  }

  if (parent instanceof Y.Map) {
    invariant(parent._item, 'Parent should be associated with a item');
    return getSyncItemPath(parent._item);
  }

  throw new Error(`Unknown parent type ${parent}`);
}
