import { Descendant, Element, Text } from 'slate';
import Y from 'yjs';
import {
  InsertDelta,
  isSharedType,
  isSyncElement,
  isSyncLeaf,
  SyncDescendant,
  SyncElement,
  SyncLeaf,
  SyncNode,
} from '../model/types';

export function toSyncLeaf(texts: Text[]): SyncLeaf {
  const delta = texts.map(({ text, ...attributes }) => ({
    insert: text,
    attributes,
  }));

  const leaf = new Y.Text();
  leaf.applyDelta(delta);
  return leaf;
}

function toSyncElement(element: Element): SyncElement {
  const { children, ...attributes } = element;

  const syncElement = new Y.Map();
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  syncElement.set('children', toSyncDescendants(children));
  Object.entries(attributes).forEach(([key, value]) =>
    syncElement.set(key, value)
  );

  return syncElement;
}

export function toSyncDescendants(
  nodes: Descendant[]
): Y.Array<SyncDescendant> {
  const descendants: SyncDescendant[] = [];
  let leafGroup: Text[] = [];

  const flushLeafGroup = () => {
    if (leafGroup.length === 0) {
      return;
    }

    descendants.push(toSyncLeaf(leafGroup));
    leafGroup = [];
  };

  nodes.forEach((node) => {
    if (Element.isElement(node)) {
      flushLeafGroup();
      descendants.push(toSyncElement(node));
      return;
    }

    leafGroup.push(node);
  });

  flushLeafGroup();

  const syncDescendants: Y.Array<SyncDescendant> = new Y.Array();
  syncDescendants.push(descendants);
  return syncDescendants;
}

export function fromSyncLeaf(syncLeaf: SyncLeaf): Text[] {
  const delta = syncLeaf.toDelta() as InsertDelta;
  return delta.map(({ insert, attributes }) => ({
    ...attributes,
    text: insert,
  }));
}

export function fromSyncElement(syncElement: SyncElement): Element {
  const slateElement: Element = { children: [] };

  for (const [key, value] of syncElement.entries()) {
    if (key !== 'children') {
      slateElement[key] = value;
      continue;
    }

    const children = value as SyncDescendant[];
    children.forEach((child) => {
      if (isSyncLeaf(child)) {
        slateElement.children.concat(fromSyncLeaf(child));
        return;
      }

      slateElement.children.push(fromSyncElement(child));
    });
  }

  return slateElement;
}

export function fromSyncNode(syncNode: SyncNode): Descendant[] {
  if (isSharedType(syncNode)) {
    return syncNode.map(fromSyncNode).flat();
  }

  if (isSyncElement(syncNode)) {
    return [fromSyncElement(syncNode)];
  }

  return fromSyncLeaf(syncNode);
}
