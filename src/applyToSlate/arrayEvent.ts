import { Editor, Transforms } from 'slate';
import invariant from 'tiny-invariant';
import * as Y from 'yjs';
import { SyncElement } from '../model';
import { toSlateNode, toSlatePath } from '../utils/convert';

/**
 * Applies a Yjs Array event to a Slate editor.
 *
 * @param event
 */
export default function applyArrayEvent(
  editor: Editor,
  event: Y.YArrayEvent<SyncElement>
): void {
  let offset = 0;
  const targetPath = toSlatePath(event.path);

  Editor.withoutNormalizing(editor, () => {
    event.changes.delta.forEach((delta) => {
      if ('retain' in delta) {
        offset += delta.retain ?? 0;
      }

      if ('delete' in delta) {
        for (let i = 0; i < (delta.delete ?? 0); i += 1) {
          Transforms.removeNodes(editor, {
            at: [...targetPath, offset],
            voids: true,
          });
        }
      }

      if ('insert' in delta) {
        invariant(
          Array.isArray(delta.insert),
          `Unexpected array insert content type: expected array, got ${JSON.stringify(
            delta.insert
          )}`
        );

        Transforms.insertNodes(editor, delta.insert.map(toSlateNode), {
          at: [...targetPath, offset],
          voids: true,
        });

        offset += delta.insert.length;
      }
    });
  });
}
