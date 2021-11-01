import { Editor, Operation } from 'slate';
import * as Y from 'yjs';
import { translateYTextEvent } from './textEvent';

/**
 * Translates yjs events into slate operations. The
 * editor state has to match the yText state before the events occurred.
 *
 * @param sharedType
 * @param op
 */
export function translateYjsEvents(
  root: Y.XmlText,
  editor: Editor,
  events: Y.YEvent[]
): Operation[] {
  return events.flatMap((event) => {
    if (event instanceof Y.YTextEvent) {
      return translateYTextEvent(root, editor, event);
    }

    throw new Error('Unexpected Y event type');
  });
}

/**
 * Translates yjs events into slate operations and applies them to the editor. The
 * editor state has to match the yText state before the events occurred.
 *
 * @param root
 * @param editor
 * @param events
 */
export function applyYjsEvents(
  root: Y.XmlText,
  editor: Editor,
  events: Y.YEvent[]
) {
  Editor.withoutNormalizing(editor, () => {
    translateYjsEvents(root, editor, events).forEach((op) => editor.apply(op));
  });
}
