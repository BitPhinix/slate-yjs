import { Editor, Node, NodeOperation, Text } from 'slate';
import invariant from 'tiny-invariant';
import Y from 'yjs';
import { SharedType, SyncElement } from '../model/types';
import { fromSyncNode } from '../utils/convert';
import { toSlatePath } from '../utils/location';

/**
 * Translates a Yjs array event into a slate operations.
 *
 * @param event
 */
export function translateArrayEvent(
  editor: Editor,
  sharedType: SharedType,
  event: Y.YArrayEvent<SyncElement>
): NodeOperation[] {
  const targetPath = toSlatePath(sharedType, event.path);
  const targetElement = Node.get(editor, targetPath);

  invariant(
    !Text.isText(targetElement),
    'Cannot apply array event to text node'
  );

  let offset = 0;
  const ops: NodeOperation[] = [];
  const children = Array.from(targetElement.children);

  event.changes.delta.forEach((delta) => {
    if ('retain' in delta) {
      offset += delta.retain ?? 0;
    }

    if ('delete' in delta) {
      const path = [...targetPath, offset];
      children.splice(offset, delta.delete ?? 0).forEach((node) => {
        ops.push({ type: 'remove_node', path, node });
      });
    }

    if ('insert' in delta) {
      invariant(
        Array.isArray(delta.insert),
        `Unexpected array insert content type: expected array, got ${JSON.stringify(
          delta.insert
        )}`
      );

      const toInsert = delta.insert.flatMap(fromSyncNode);
      toInsert.forEach((node, i) => {
        ops.push({
          type: 'insert_node',
          path: [...targetPath, offset + i],
          node,
        });
      });

      children.splice(offset, 0, ...toInsert);
      offset += delta.insert.length;
    }
  });

  return ops;
}
