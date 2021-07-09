import { Editor, Operation } from 'slate';
import * as Y from 'yjs';
import translateArrayEvent from './arrayEvent';
import translateMapEvent from './mapEvent';
import translateTextEvent from './textEvent';

/**
 * Translates a Yjs event into slate editor operations.
 *
 * @param event
 */
export function translateYjsEvent(
  editor: Editor,
  event: Y.YEvent
): Operation[] {
  if (event instanceof Y.YArrayEvent) {
    return translateArrayEvent(editor, event);
  }

  if (event instanceof Y.YMapEvent) {
    return translateMapEvent(editor, event);
  }

  if (event instanceof Y.YTextEvent) {
    return translateTextEvent(editor, event);
  }

  throw new Error('Unsupported yjs event');
}

/**
 * Applies multiple yjs events to a slate editor.
 */
export function applyYjsEvents(editor: Editor, events: Y.YEvent[]): void {
  Editor.withoutNormalizing(editor, () => {
    events.forEach((event) =>
      translateYjsEvent(editor, event).forEach(editor.apply)
    );
  });
}
