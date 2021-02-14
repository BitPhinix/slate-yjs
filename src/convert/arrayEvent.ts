import { InsertNodeOperation, NodeOperation, RemoveNodeOperation } from 'slate';
import * as Y from 'yjs';
import { SyncElement } from '../model';
import { toSlateNode, toSlatePath } from '../utils/convert';

/**
 * Converts a Yjs Array event into Slate operations.
 *
 * @param event
 */
export default function arrayEvent(
  event: Y.YArrayEvent<SyncElement>
): NodeOperation[] {
  const eventTargetPath = toSlatePath(event.path);

  function createRemoveNode(index: number): RemoveNodeOperation {
    const path = [...eventTargetPath, index];
    const node = { type: 'paragraph', children: [{ text: '' }] };
    return { type: 'remove_node', path, node };
  }

  function createInsertNode(
    index: number,
    element: SyncElement
  ): InsertNodeOperation {
    const path = [...eventTargetPath, index];
    const node = toSlateNode(element as SyncElement);
    return { type: 'insert_node', path, node };
  }

  let removeIndex = 0;
  let addIndex = 0;
  const removeOps: NodeOperation[] = [];
  const addOps: NodeOperation[] = [];

  event.changes.delta.forEach((delta) => {
    if ('retain' in delta) {
      removeIndex += delta.retain;
      addIndex += delta.retain;
      return;
    }

    if ('delete' in delta) {
      for (let i = 0; i < delta.delete; i += 1) {
        removeOps.push(createRemoveNode(removeIndex));
      }

      return;
    }

    if ('insert' in delta) {
      addOps.push(
        // eslint-disable-next-line no-loop-func
        ...delta.insert.map((e: SyncElement, i: number) =>
          createInsertNode(addIndex + i, e)
        )
      );

      addIndex += delta.insert.length;
    }
  });

  return [...removeOps, ...addOps];
}
