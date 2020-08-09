import { NodeOperation } from 'slate';
import * as Y from 'yjs';
import { SyncElement } from '../model';
import { getArrayPosition } from '../path';
import { toSlateNode, toSlatePath } from '../utils/convert';

/**
 * Converts a YJS Array event into Slate operations.
 *
 * @param event
 */
export const arrayEvent = (
  event: Y.YArrayEvent<SyncElement>
): NodeOperation[] => {
  const eventTargetPath = toSlatePath(event.path);

  const createOpMatter = (type: 'insert_node' | 'remove_node') => (
    item: Y.Item
  ): NodeOperation => {
    const { content } = item;

    if (!(content instanceof Y.ContentType)) {
      throw new TypeError('Unknown content type in array operation');
    }

    const path = [...eventTargetPath, getArrayPosition(item)];
    const node =
      type === 'insert_node'
        ? toSlateNode(content.type as SyncElement)
        : { type: 'paragraph', children: [{ text: '' }] };

    return { type, path, node };
  };

  const sortFunc = (a: NodeOperation, b: NodeOperation) =>
    a.path[a.path.length - 1] > b.path[b.path.length - 1] ? 1 : 0;

  const removeOps = Array.from(
    event.changes.deleted.values(),
    createOpMatter('remove_node')
  ).sort(sortFunc);
  const addOps = Array.from(
    event.changes.added.values(),
    createOpMatter('insert_node')
  ).sort(sortFunc);

  return [...removeOps, ...addOps];
};

export default arrayEvent;
