import { Editor, Operation, Transforms } from 'slate';
import * as Y from 'yjs';
import { RelativeRange } from '../model/types';
import { yTextToSlateElement } from '../utils/convert';
import { isSyncSkewError } from '../utils/errors';
import {
  relativeRangeToSlateRange,
  slateRangeToRelativeRange,
} from '../utils/position';
import { translateYTextEvent } from './textEvent';

let lastResyncTime = 0;
const RESYNC_THROTTLE_MS = 1000;

/**
 * Translate a yjs event into slate operations. The editor state has to match the
 * yText state before the event occurred.
 *
 * @param sharedType
 * @param op
 */
export function translateYjsEvent(
  sharedRoot: Y.XmlText,
  editor: Editor,
  event: Y.YEvent<Y.XmlText>
): Operation[] {
  if (event instanceof Y.YTextEvent) {
    return translateYTextEvent(sharedRoot, editor, event);
  }

  throw new Error('Unexpected Y event type');
}

/**
 * Performs a full re-sync of the Slate editor from the Yjs shared root.
 * Preserves the user's selection if possible by converting to/from relative positions.
 */
function resyncFromYjs(sharedRoot: Y.XmlText, editor: Editor): void {
  let savedSelection: RelativeRange | null = null;

  try {
    if (editor.selection) {
      savedSelection = slateRangeToRelativeRange(
        sharedRoot,
        editor,
        editor.selection
      );
    }
  } catch {
    // Selection conversion failed; we'll lose the selection but continue with re-sync
  }

  const content = yTextToSlateElement(sharedRoot);
  editor.children = content.children;
  Editor.normalize(editor, { force: true });

  if (savedSelection) {
    try {
      const newSelection = relativeRangeToSlateRange(
        sharedRoot,
        editor,
        savedSelection
      );
      if (newSelection) {
        Transforms.select(editor, newSelection);
      }
    } catch {
      // Selection restoration failed; cursor position is lost but document is correct
    }
  }
}

/**
 * Translates yjs events into slate operations and applies them to the editor. The
 * editor state has to match the yText state before the events occurred.
 *
 * If a sync-skew error occurs (e.g. invalid path due to Yjs/Slate mismatch),
 * the editor is re-synced from the Yjs shared root to recover gracefully.
 *
 * @param sharedRoot
 * @param editor
 * @param events
 */
export function applyYjsEvents(
  sharedRoot: Y.XmlText,
  editor: Editor,
  events: Y.YEvent<Y.XmlText>[]
) {
  Editor.withoutNormalizing(editor, () => {
    for (const event of events) {
      try {
        const ops = translateYjsEvent(sharedRoot, editor, event);
        for (const op of ops) {
          editor.apply(op);
        }
      } catch (error) {
        if (isSyncSkewError(error)) {
          const now = Date.now();
          if (now - lastResyncTime >= RESYNC_THROTTLE_MS) {
            lastResyncTime = now;
            console.warn(
              '[slate-yjs] Sync skew detected, re-syncing from Yjs:',
              error instanceof Error ? error.message : error
            );
            resyncFromYjs(sharedRoot, editor);
          } else {
            console.warn(
              '[slate-yjs] Sync skew detected (throttled, skipping re-sync):',
              error instanceof Error ? error.message : error
            );
          }
          return;
        }
        throw error;
      }
    }
  });
}
