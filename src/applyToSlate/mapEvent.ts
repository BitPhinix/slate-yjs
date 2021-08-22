import { Editor, Node, NodeOperation } from 'slate';
import Y from 'yjs';
import { SharedType, SyncElement } from '../model/types';
import { toSlatePath } from '../utils/location';

/**
 * Translates a Yjs map event into a slate operations.
 *
 * @param event
 */
export function translateMapEvent(
  editor: Editor,
  sharedType: SharedType,
  event: Y.YMapEvent<unknown>
): NodeOperation[] {
  const targetPath = toSlatePath(sharedType, event.path);
  const targetSyncElement = event.target as SyncElement;
  const targetElement = Node.get(editor, targetPath);

  const keyChanges = Array.from(event.changes.keys.entries());
  const newProperties = Object.fromEntries(
    keyChanges.map(([key, info]) => [
      key,
      info.action === 'delete' ? null : targetSyncElement.get(key),
    ])
  );

  const properties = Object.fromEntries(
    keyChanges.map(([key]) => [key, targetElement[key]])
  );

  return [{ type: 'set_node', newProperties, properties, path: targetPath }];
}
