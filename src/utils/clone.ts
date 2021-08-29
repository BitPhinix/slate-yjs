import Y from 'yjs';
import {
  isSyncDescendant,
  isSyncElement,
  isSyncLeaf,
  SyncDescendant,
  SyncNode,
} from '../model/types';

export function clone(node: SyncNode): SyncNode {
  if (isSyncLeaf(node)) {
    const leaf = new Y.XmlText();
    leaf.applyDelta(node.toDelta(), { sanitize: false });
    return leaf;
  }

  if (isSyncElement(node)) {
    const element = new Y.XmlElement();

    const children = node.toArray().map((child) => {
      if (!isSyncDescendant(child)) {
        throw new Error('Unexpected sync element child type');
      }

      return clone(child) as SyncDescendant;
    });

    element.insert(0, children);
    Object.entries(node.getAttributes()).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });

    return element;
  }

  const sharedType = new Y.XmlFragment();
  sharedType.insert(0, node.toArray() as SyncDescendant[]);
  return sharedType;
}
