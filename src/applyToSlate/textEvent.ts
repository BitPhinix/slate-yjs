import { Editor, Transforms } from 'slate';
import invariant from 'tiny-invariant';
import * as Y from 'yjs';
import { toSlatePath } from '../utils/convert';
import { withoutNormalizingAndSelectionMod } from './util';

/**
 * Applies a Yjs Text event to a slate editor.
 *
 * @param event
 */
export default function applyTextEvent(
  editor: Editor,
  event: Y.YTextEvent
): void {
  const targetPath = toSlatePath(event.path);
  let offset = 0;

  withoutNormalizingAndSelectionMod(editor, () => {
    event.changes.delta.forEach((delta) => {
      if ('retain' in delta) {
        offset += delta.retain ?? 0;
      }

      if ('delete' in delta) {
        Transforms.insertText(editor, '', {
          at: {
            anchor: { path: targetPath, offset },
            focus: { path: targetPath, offset: offset + (delta.delete ?? 0) },
          },
        });
      }

      if ('insert' in delta) {
        invariant(
          typeof delta.insert === 'string',
          `Unexpected text insert content type: expected string, got ${typeof delta.insert}`
        );

        Transforms.insertText(editor, delta.insert, {
          at: { path: targetPath, offset },
        });

        offset += delta.insert.length;
      }
    });
  });
}
