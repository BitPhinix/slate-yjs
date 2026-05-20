import { Editor, Operation } from 'slate';
import * as Y from 'yjs';
import { isSyncSkewError } from '../utils/errors';
import { reportSyncSkew, resyncFromYjs } from '../utils/sync';
import type { OnSyncSkew } from '../utils/sync';
import { translateYTextEvent } from './textEvent';

// Throttle for the remote-path resync itself (avoids resync storms during a
// burst of remote events). Intentionally separate from the reporting throttle
// inside reportSyncSkew: this one gates the expensive document rebuild, the
// other gates telemetry/console noise. Do NOT collapse them.
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
            resyncFromYjs(sharedRoot, editor);
          }
          reportSyncSkew(
            (editor as { onSyncSkew?: OnSyncSkew }).onSyncSkew,
            error,
            { direction: 'applyToSlate' }
          );
          return;
        }
        throw error;
      }
    }
  });
}
