import { Editor } from 'slate';
import * as Y from 'yjs';
import applyArrayEvent from './arrayEvent';
import applyMapEvent from './mapEvent';
import applyTextEvent from './textEvent';

/**
 * Applies a yjs event to a slate editor.
 *
 * @param event
 */
function applyYjsEvent(e: Editor, event: Y.YEvent): void {
  if (event instanceof Y.YArrayEvent) {
    return applyArrayEvent(e, event);
  }

  if (event instanceof Y.YMapEvent) {
    return applyMapEvent(e, event);
  }

  if (event instanceof Y.YTextEvent) {
    return applyTextEvent(e, event);
  }

  throw new Error('Unsupported yjs event');
}

/**
 * Applies multiple yjs events to a slate editor.
 *
 * @param event
 */
export default function applyYjsEvents(
  editor: Editor,
  events: Y.YEvent[]
): void {

  Editor.withoutNormalizing(editor, () => {
    events.forEach((event) => applyYjsEvent(editor, event));
  });
}
