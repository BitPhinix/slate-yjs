import { Editor, Transforms } from 'slate';
import * as Y from 'yjs';
import { RelativeRange } from '../model/types';
import { yTextToSlateElement } from './convert';
import {
  relativeRangeToSlateRange,
  slateRangeToRelativeRange,
} from './position';

export type SyncSkewDirection = 'applyToYjs' | 'applyToSlate';
export type SyncSkewContext = { direction: SyncSkewDirection };
export type OnSyncSkew = (error: unknown, context: SyncSkewContext) => void;

const REPORT_THROTTLE_MS = 1000;
let lastReportTime = 0;

/**
 * Throttled reporter for sync-skew recoveries. Surfaces the skew via the
 * optional onSyncSkew hook (wired to Rollbar by the app) and console.warn so
 * recovery never silently masks the underlying divergence. Throttled so a
 * burst of skews can't spam telemetry.
 */
export function reportSyncSkew(
  onSyncSkew: OnSyncSkew | undefined,
  error: unknown,
  context: SyncSkewContext
): void {
  const now = Date.now();
  if (now - lastReportTime < REPORT_THROTTLE_MS) {
    return;
  }
  lastReportTime = now;

  // eslint-disable-next-line no-console
  console.warn(
    `[slate-yjs] Sync skew detected (${context.direction}), recovering:`,
    error instanceof Error ? error.message : error
  );

  if (onSyncSkew) {
    try {
      onSyncSkew(error, context);
    } catch {
      // Never let a misbehaving telemetry hook break recovery.
    }
  }
}

/**
 * Performs a full re-sync of the Slate editor from the Yjs shared root.
 * Preserves the user's selection if possible by converting to/from relative
 * positions. Y is the source of truth.
 */
export function resyncFromYjs(sharedRoot: Y.XmlText, editor: Editor): void {
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
