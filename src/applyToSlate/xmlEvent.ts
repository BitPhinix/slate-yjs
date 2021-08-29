import { Editor, Node, NodeOperation, Text } from 'slate';
import Y from 'yjs';
import { isSyncElement, SharedType, SyncElement } from '../model/types';
import { fromSyncNode } from '../utils/convert';
import { toSlatePath } from '../utils/location';

/**
 * Translates a YXmlEvent into a slate operations.
 *
 * @param event
 */
export function translateXmlEvent(
  editor: Editor,
  sharedType: SharedType,
  event: Y.YXmlEvent
): NodeOperation[] {
  const targetPath = toSlatePath(sharedType, event.path);
  const targetElement = Node.get(editor, targetPath);
  const targetSyncElement = event.target as SyncElement | SharedType;

  if (Text.isText(targetElement)) {
    throw new Error('Cannot apply xml event to text node');
  }

  const ops: NodeOperation[] = [];

  // Attribute changes
  const changedAttributes = Array.from(event.changes.keys.keys());
  if (changedAttributes.length > 0) {
    if (!isSyncElement(targetSyncElement)) {
      throw new Error('Cannot apply attribute changes to a non-element');
    }

    const newProperties: Partial<Node> = {};
    const properties: Partial<Node> = {};

    changedAttributes.forEach((key) => {
      newProperties[key] = targetSyncElement.getAttribute(key) ?? null;
      properties[key] = targetElement[key];
    });

    ops.push({
      type: 'set_node',
      newProperties,
      properties,
      path: targetPath,
    });
  }

  // Child inserts/deletes
  let offset = 0;
  const children = Array.from(targetElement.children);

  event.changes.delta.forEach((delta) => {
    if ('retain' in delta) {
      offset += delta.retain ?? 0;
    }

    if ('delete' in delta && delta.delete) {
      const path = [...targetPath, offset];

      const [startOffset] = toSlatePath(targetSyncElement, [offset]);
      const [endOffset] = toSlatePath(targetSyncElement, [
        offset + delta.delete,
      ]);

      children.splice(startOffset, endOffset - startOffset).forEach((node) => {
        ops.push({ type: 'remove_node', path, node });
      });
    }

    if ('insert' in delta) {
      if (!Array.isArray(delta.insert)) {
        throw new Error(
          `Unexpected array insert content type: expected array, got '${delta.insert}'`
        );
      }

      const toInsert = delta.insert.flatMap(fromSyncNode);

      toInsert.forEach((node, i) => {
        const childPath = toSlatePath(targetSyncElement, [offset + i]);
        ops.push({
          type: 'insert_node',
          path: [...targetPath, ...childPath],
          node,
        });
      });

      children.splice(offset, 0, ...toInsert);
      offset += delta.insert.length;
    }
  });

  return ops;
}
