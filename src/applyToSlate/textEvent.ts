import { Editor, Node, Operation, Text } from 'slate';
import invariant from 'tiny-invariant';
import Y from 'yjs';
import { SharedType, SyncDescendant } from '../model/types';
import { toSlatePath, toSlatePoint } from '../utils/location';

/**
 * Translates a Yjs text event into a slate operations.
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
      invariant(start.path.length === 1);
      invariant(end.path.length === 1);

      const [startPathOffset] = start.path;
      const [endPathOffset] = end.path;

      for (
        let pathOffset = endPathOffset;
        pathOffset >= startPathOffset;
        pathOffset--
      ) {
        const targetPath = [...parentPath, pathOffset];
        const targetNode = Node.get(editor, targetPath);

        invariant(Text.isText(targetNode));

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

    if ('insert' in change) {
      invariant(
        typeof change.insert === 'string',
        `Unexpected text insert content type: expected string, got ${typeof change.insert}`
      );

      console.log(change);

      throw new Error('TODO');
    }
  });

  return ops;
}
