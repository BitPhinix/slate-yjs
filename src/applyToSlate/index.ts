import { Editor, Operation } from 'slate';
import Y from 'yjs';
import { SharedType } from '../model/types';
import { translateArrayEvent } from './arrayEvent';
import { translateMapEvent } from './mapEvent';
import { translateTextEvent } from './textEvent';

/**
 * Translates a Yjs event into slate editor operations.
 *
 * @param event
 */
export function translateYjsEvent(
  editor: Editor,
  sharedType: SharedType,
  event: Y.YEvent
): Operation[] {
  if (event instanceof Y.YArrayEvent) {
    return translateArrayEvent(editor, sharedType, event);
  }

  if (event instanceof Y.YMapEvent) {
    return translateMapEvent(editor, sharedType, event);
  }

  if (event instanceof Y.YTextEvent) {
    return translateTextEvent(editor, sharedType, event);
  }

  throw new Error('Unsupported yjs event');
}

/**
 * Applies multiple yjs events to a slate editor.
 */
export function applyYjsEvents(
  editor: Editor,
  sharedType: SharedType,
  events: Y.YEvent[]
): void {
  Editor.withoutNormalizing(editor, () => {
    events.forEach((event) =>
      translateYjsEvent(editor, sharedType, event).forEach(editor.apply)
    );
  });
}
