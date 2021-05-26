import { Editor, Transforms } from 'slate';
import * as Y from 'yjs';
import { SyncElement } from '../model';
import { toSlatePath } from '../utils/convert';
import { withoutNormalizingAndSelectionMod } from './util';

/**
 * Applies a Yjs map event to a Slate editor.
 *
 * @param event
 */
export default function applyMapEvent(
  editor: Editor,
  event: Y.YMapEvent<unknown>
): void {
  const targetPath = toSlatePath(event.path);
  const targetElement = event.target as SyncElement;

  const keyChanges = Array.from(event.changes.keys.entries());

  const removedProperties = keyChanges
    .filter(([, info]) => info.action === 'delete')
    .map(([key]) => key);

  const newProperties: Record<string, unknown> = keyChanges
    .filter(([, info]) => info.action !== 'delete')
    .reduce(
      (curr, [key]) => ({
        ...curr,
        [key]: targetElement.get(key),
      }),
      {}
    );

  withoutNormalizingAndSelectionMod(editor, () => {
    if (removedProperties.length > 0) {
      Transforms.unsetNodes(editor, removedProperties, { at: targetPath });
    }

    if (Object.keys(newProperties).length > 0) {
      Transforms.setNodes(editor, newProperties, { at: targetPath });
    }
  });
}
