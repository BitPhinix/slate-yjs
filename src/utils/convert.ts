import { Descendant, Element, Text } from 'slate';
import Y from 'yjs';
import {
  InsertDelta,
  isSharedType,
  isSyncDescendant,
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

  const leaf = new Y.XmlText();
  leaf.applyDelta(delta);
  return leaf;
}

function toSyncElement(element: Element): SyncElement {
  const { children, ...attributes } = element;

  const syncElement = new Y.XmlElement();
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  syncElement.insert(0, toSyncDescendants(children));
  Object.entries(attributes).forEach(([key, value]) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    syncElement.setAttribute(key, value as any)
  );

  return syncElement;
}

export function toSyncDescendants(nodes: Descendant[]): SyncDescendant[] {
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

  return descendants;
}

export function fromSyncLeaf(syncLeaf: SyncLeaf): Text[] {
  const delta = syncLeaf.toDelta() as InsertDelta;
  return delta.map(({ insert, attributes }) => ({
    ...attributes,
    text: insert,
  }));
}

export function fromSyncElement(syncElement: SyncElement): Element {
  const children = syncElement.toArray().flatMap<Descendant>((child) => {
    if (isSyncLeaf(child)) {
      return fromSyncLeaf(child);
    }

    if (!isSyncElement(child)) {
      throw new Error('Unexpected SyncElement child type');
    }

    return fromSyncElement(child);
  });

  return { ...syncElement.getAttributes(), children };
}

export function fromSyncNode(syncNode: SyncNode): Descendant[] {
  if (isSharedType(syncNode)) {
    return syncNode.toArray().flatMap((node) => {
      if (!isSyncDescendant(node)) {
        throw new Error('Unexpected SharedType child type');
      }

      return fromSyncNode(node);
    });
  }

  if (isSyncElement(syncNode)) {
    return [fromSyncElement(syncNode)];
  }

  return fromSyncLeaf(syncNode);
}
