import { Editor, Node, Operation, Path, Text } from 'slate';
import Y from 'yjs';
import { SharedType, SyncDescendant } from '../model/types';
import { toSlatePath, toSlatePoint } from '../utils/location';
import { deepEqual } from '../utils/object';
import { getMarks } from '../utils/slate';

/**
 * Translates a YTextEvent event into a slate operations.
 *
 * @param event
 */
export function translateTextEvent(
  editor: Editor,
  sharedType: SharedType,
  event: Y.YTextEvent
): Operation[] {
  const parent = event.target.parent as SyncDescendant;
  const parentPath = toSlatePath(sharedType, event.path.slice(0, -1));
  const textPath = event.path.slice(-1);

  let offset = 0;
  const ops: Operation[] = [];

  event.changes.delta.forEach((change) => {
    if ('retain' in change) {
      offset += change.retain ?? 0;
    }

    if ('delete' in change) {
      const start = toSlatePoint(parent, textPath, offset);
      const end = toSlatePoint(parent, textPath, offset + (change.delete ?? 0));

      // Start and end path length are always 1 since we move
      // relative from the text parent
      const [startPathOffset] = start.path;
      const [endPathOffset] = end.path;

      for (
        let pathOffset = endPathOffset;
        pathOffset >= startPathOffset;
        pathOffset--
      ) {
        const targetPath = [...parentPath, pathOffset];
        const targetNode = Node.get(editor, targetPath);

        if (!Text.isText(targetNode)) {
          throw new Error('Cannot apply text action to non-text node');
        }

        if (pathOffset !== startPathOffset && pathOffset !== endPathOffset) {
          ops.push({
            type: 'remove_node',
            node: targetNode,
            path: targetPath,
          });
          continue;
        }

        const startOffset = pathOffset === startPathOffset ? start.offset : 0;
        const endOffset =
          pathOffset === endPathOffset ? end.offset : targetNode.text.length;

        ops.push({
          type: 'remove_text',
          offset: startOffset,
          path: targetPath,
          text: targetNode.text.slice(startOffset, endOffset),
        });
      }
    }

    if ('insert' in change && change.insert) {
      const insertPoint = toSlatePoint(parent, textPath, offset);
      const targetNode = Node.get(editor, insertPoint.path);

      if (typeof change.insert !== 'string') {
        throw new Error(
          `Unexpected insert type: expected string got '${change.insert}'`
        );
      }

      // Yjs typings are wrong
      const insertAttributes = (
        change as { attributes: Record<string, unknown> }
      ).attributes;

      // Insert of a new text node
      if (!Text.isText(targetNode)) {
        if (insertPoint.offset !== 0) {
          throw new Error(
            'Cannot insert text in the middle of a non-text node'
          );
        }

        return ops.push({
          type: 'insert_node',
          node: { ...insertAttributes, text: change.insert },
          path: insertPoint.path,
        });
      }

      const targetAttributes = getMarks(targetNode);

      // Plain text insert
      if (deepEqual(targetAttributes, insertAttributes)) {
        return ops.push({
          type: 'insert_text',
          offset: insertPoint.offset,
          path: insertPoint.path,
          text: change.insert,
        });
      }

      // Insert of a text node in the middle of an existing one
      if (insertPoint.offset > 0) {
        ops.push({
          type: 'split_node',
          path: insertPoint.path,
          position: insertPoint.offset,
          properties: {},
        });
      }

      const path =
        insertPoint.offset > 0 ? Path.next(insertPoint.path) : insertPoint.path;

      ops.push({
        type: 'insert_node',
        path,
        node: { ...insertAttributes, text: change.insert },
      });
    }
  });

  return ops;
}
