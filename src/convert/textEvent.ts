import { TextOperation } from 'slate';
import * as Y from 'yjs';
import { toSlatePath } from '../utils/convert';

/**
 * Converts a Yjs Text event into Slate operations.
 *
 * @param event
 */
export default function textEvent(event: Y.YTextEvent): TextOperation[] {
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

  event.changes.delta.forEach((delta) => {
    if ('retain' in delta && delta.retain !== undefined) {
      removeOffset += delta.retain;
      addOffset += delta.retain;
      return;
    }

    if ('delete' in delta && delta.delete !== undefined) {
      let text = '';

      while (text.length < delta.delete) {
        const item = removedValues.next().value;
        const { content } = item;
        if (!(content instanceof Y.ContentString)) {
          throw new TypeError(`Unsupported content type ${item.content}`);
        }
        text = text.concat(content.str);
      }

      if (text.length !== delta.delete) {
        throw new Error(
          `Unexpected length: expected ${delta.delete}, got ${text.length}`
        );
      }

      removeOps.push(createTextOp('remove_text', removeOffset, text));
      return;
    }

    if ('insert' in delta && delta.insert !== undefined) {
      addOps.push(
        createTextOp('insert_text', addOffset, delta.insert.join(''))
      );
      addOffset += delta.insert.length;
    }
  });

  return [...removeOps, ...addOps];
}
