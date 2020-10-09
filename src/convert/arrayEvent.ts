import { NodeOperation } from 'slate';
import * as Y from 'yjs';
import { SyncElement } from '../model';
import { toSlateNode, toSlatePath } from '../utils/convert';

/**
 * Converts a Yjs Array event into Slate operations.
 *
 * @param event
 */
export const arrayEvent = (
  event: Y.YArrayEvent<SyncElement>
): NodeOperation[] => {
  const eventTargetPath = toSlatePath(event.path);

  const createRemoveNode = (index: number): NodeOperation => {
    const path = [...eventTargetPath, index];
    const node = { type: 'paragraph', children: [{ text: '' }] };
    return { type: 'remove_node', path, node };
  };

  const createInsertNode = (index: number, element: SyncElement) => {
    const path = [...eventTargetPath, index];
    const node = toSlateNode(element as SyncElement);
    return { type: 'insert_node', path, node };
  };

  const sortFunc = (a: NodeOperation, b: NodeOperation) =>
    a.path[a.path.length - 1] > b.path[b.path.length - 1] ? 1 : 0;

  let retain = 0;
  let removeOps: NodeOperation[] = [];
  let addOps: NodeOperation[] = [];
  for (const delta of event.changes.delta) {
    const d = delta as any;
    if (d.retain !== undefined) {
      retain += d.retain;
    } else if (d.delete !== undefined) {
      removeOps.push(createRemoveNode(retain));
    } else if (d.insert !== undefined) {
      addOps = addOps.concat(
        d.insert.map((e: SyncElement, i: number) =>
          createInsertNode(retain + i, e)
        )
      );
    }
  }

  removeOps = removeOps.sort(sortFunc);
  addOps = addOps.sort(sortFunc);

  return [...removeOps, ...addOps];
};

export default arrayEvent;
