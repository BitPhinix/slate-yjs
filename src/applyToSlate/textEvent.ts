import { Editor, Node, Text, TextOperation } from 'slate';
import invariant from 'tiny-invariant';
import * as Y from 'yjs';
import { toSlatePath } from '../utils/convert';

/**
 * Translates a Yjs text event into a slate operations.
 *
 * @param event
 */
export default function translateTextEvent(
  editor: Editor,
  event: Y.YTextEvent
): TextOperation[] {
  const targetPath = toSlatePath(event.path);
  const targetText = Node.get(editor, targetPath);

  invariant(
    Text.isText(targetText),
    'Cannot apply text event to non-text node'
  );

  let offset = 0;
  let { text } = targetText;
  const ops: TextOperation[] = [];

  event.changes.delta.forEach((delta) => {
    if ('retain' in delta) {
      offset += delta.retain ?? 0;
    }

    if ('delete' in delta) {
      const endOffset = offset + (delta.delete ?? 0);

      ops.push({
        type: 'remove_text',
        offset,
        path: targetPath,
        text: text.slice(offset, endOffset),
      });

      text = text.slice(0, offset) + text.slice(endOffset);
    }

    if ('insert' in delta) {
      invariant(
        typeof delta.insert === 'string',
        `Unexpected text insert content type: expected string, got ${typeof delta.insert}`
      );

      ops.push({
        type: 'insert_text',
        offset,
        text: delta.insert,
        path: targetPath,
      });

      offset += delta.insert.length;
      text = text.slice(0, offset) + delta.insert + text.slice(offset);
    }
  });

  return ops;
}
