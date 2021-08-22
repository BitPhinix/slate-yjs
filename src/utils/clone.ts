import Y from 'yjs';
import {
  isSharedType,
  isSyncLeaf,
  SyncDescendant,
  SyncNode,
} from '../model/types';

export function clone(node: SyncNode): SyncNode {
  if (isSyncLeaf(node)) {
    const leaf = new Y.Text();
    leaf.applyDelta(node.toDelta(), { sanitize: false });
    return leaf;
  }

  if (isSharedType(node)) {
    const sharedType = new Y.Array<SyncDescendant>();
    sharedType.insert(0, node.toArray());
    return sharedType;
  }

  const element = new Y.Map<unknown>();
  for (const [key, value] of node.entries()) {
    if (key !== 'children') {
      element.set(key, value);
      continue;
    }

    const children = new Y.Array();
    children.insert(0, value.map(clone));
    element.set('children', children);
  }

  return element;
}
