import { TextOperation } from 'slate';
import * as Y from 'yjs';
import { toSlatePath } from '../utils/convert';

/**
 * Converts a Yjs Text event into Slate operations.
 *
 * @param event
 */
export const textEvent = (event: Y.YTextEvent): TextOperation[] => {
  const eventTargetPath = toSlatePath(event.path);

  const createTextOp = (
    type: 'insert_text' | 'remove_text',
    offset: number,
    text: string
  ): TextOperation => {
    return {
      type,
      offset,
      text,
      path: eventTargetPath,
    };
  };

  const removedValues = event.changes.deleted.values();
  let removeOffset = 0;
  let addOffset = 0;
  const removeOps: TextOperation[] = [];
  const addOps: TextOperation[] = [];
  for (const delta of event.changes.delta) {
    const d = delta as any;
    if (d.retain !== undefined) {
      removeOffset += d.retain;
      addOffset += d.retain;
    } else if (d.delete !== undefined) {
      const item = removedValues.next().value;
      const { content } = item;
      if (!(content instanceof Y.ContentString)) {
        throw new TypeError(`Unsupported content type ${item.content}`);
      }
      removeOps.push(createTextOp('remove_text', removeOffset, content.str));
    } else if (d.insert !== undefined) {
      addOps.push(createTextOp('insert_text', addOffset, d.insert.join('')));
      addOffset += d.insert.length;
    }
  }

  return [...removeOps, ...addOps];
};

export default textEvent;
