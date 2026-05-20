import { BaseEditor, Descendant, Editor, Operation, Point } from 'slate';
import * as Y from 'yjs';
import { applyYjsEvents } from '../applyToSlate';
import { applySlateOp } from '../applyToYjs';
import { yTextToSlateElement } from '../utils/convert';
import {
  getStoredPosition,
  getStoredPositions,
  relativePositionToSlatePoint,
  removeStoredPosition,
  setStoredPosition,
  slatePointToRelativePosition,
} from '../utils/position';
import { isSyncSkewError } from '../utils/errors';
import { OnSyncSkew, reportSyncSkew, resyncFromYjs } from '../utils/sync';
import { assertDocumentAttachment } from '../utils/yjs';

type LocalChange = {
  op: Operation;
  doc: Descendant[];
  origin: unknown;
};

const DEFAULT_LOCAL_ORIGIN = Symbol('slate-yjs-operation');
const DEFAULT_POSITION_STORAGE_ORIGIN = Symbol('slate-yjs-position-storage');
const RECOVERY_ORIGIN = Symbol('slate-yjs-recovery');

const ORIGIN: WeakMap<Editor, unknown> = new WeakMap();
const LOCAL_CHANGES: WeakMap<Editor, LocalChange[]> = new WeakMap();
const CONNECTED: WeakSet<Editor> = new WeakSet();

export type YjsEditor = BaseEditor & {
  sharedRoot: Y.XmlText;

  localOrigin: unknown;
  positionStorageOrigin: unknown;
  onSyncSkew?: OnSyncSkew;

  applyRemoteEvents: (events: Y.YEvent<Y.XmlText>[], origin: unknown) => void;

  storeLocalChange: (op: Operation) => void;
  flushLocalChanges: () => void;

  isLocalOrigin: (origin: unknown) => boolean;

  connect: () => void;
  disconnect: () => void;
};

export const YjsEditor = {
  isYjsEditor(value: unknown): value is YjsEditor {
    return (
      Editor.isEditor(value) &&
      (value as YjsEditor).sharedRoot instanceof Y.XmlText &&
      'localOrigin' in value &&
      'positionStorageOrigin' in value &&
      typeof (value as YjsEditor).applyRemoteEvents === 'function' &&
      typeof (value as YjsEditor).storeLocalChange === 'function' &&
      typeof (value as YjsEditor).flushLocalChanges === 'function' &&
      typeof (value as YjsEditor).isLocalOrigin === 'function' &&
      typeof (value as YjsEditor).connect === 'function' &&
      typeof (value as YjsEditor).disconnect === 'function'
    );
  },

  localChanges(editor: YjsEditor): LocalChange[] {
    return LOCAL_CHANGES.get(editor) ?? [];
  },

  applyRemoteEvents(
    editor: YjsEditor,
    events: Y.YEvent<Y.XmlText>[],
    origin: unknown
  ): void {
    editor.applyRemoteEvents(events, origin);
  },

  storeLocalChange(editor: YjsEditor, op: Operation): void {
    editor.storeLocalChange(op);
  },

  flushLocalChanges(editor: YjsEditor): void {
    editor.flushLocalChanges();
  },

  connected(editor: YjsEditor): boolean {
    return CONNECTED.has(editor);
  },

  connect(editor: YjsEditor): void {
    editor.connect();
  },

  disconnect(editor: YjsEditor): void {
    editor.disconnect();
  },

  isLocal(editor: YjsEditor): boolean {
    return editor.isLocalOrigin(YjsEditor.origin(editor));
  },

  origin(editor: YjsEditor): unknown {
    const origin = ORIGIN.get(editor);
    return origin !== undefined ? origin : editor.localOrigin;
  },

  withOrigin(editor: YjsEditor, origin: unknown, fn: () => void): void {
    const prev = YjsEditor.origin(editor);
    ORIGIN.set(editor, origin);
    try {
      fn();
    } finally {
      ORIGIN.set(editor, prev);
    }
  },

  storePosition(editor: YjsEditor, key: string, point: Point): void {
    const { sharedRoot, positionStorageOrigin: locationStorageOrigin } = editor;
    assertDocumentAttachment(sharedRoot);

    const position = slatePointToRelativePosition(sharedRoot, editor, point);

    sharedRoot.doc.transact(() => {
      setStoredPosition(sharedRoot, key, position);
    }, locationStorageOrigin);
  },

  removeStoredPosition(editor: YjsEditor, key: string): void {
    const { sharedRoot, positionStorageOrigin: locationStorageOrigin } = editor;
    assertDocumentAttachment(sharedRoot);

    sharedRoot.doc.transact(() => {
      removeStoredPosition(sharedRoot, key);
    }, locationStorageOrigin);
  },

  position(editor: YjsEditor, key: string): Point | null | undefined {
    const position = getStoredPosition(editor.sharedRoot, key);
    if (!position) {
      return undefined;
    }

    return relativePositionToSlatePoint(editor.sharedRoot, editor, position);
  },

  storedPositionsRelative(
    editor: YjsEditor
  ): Record<string, Y.RelativePosition> {
    return getStoredPositions(editor.sharedRoot);
  },
};

export type WithYjsOptions = {
  autoConnect?: boolean;

  // Origin used when applying local slate operations to yjs
  localOrigin?: unknown;

  // Origin used when storing positions
  positionStorageOrigin?: unknown;

  // Invoked (throttled) when a sync-skew is detected and recovered, in either
  // direction. Wire to your error reporter (e.g. Rollbar).
  onSyncSkew?: OnSyncSkew;
};

export function withYjs<T extends Editor>(
  editor: T,
  sharedRoot: Y.XmlText,
  {
    localOrigin,
    positionStorageOrigin,
    autoConnect = false,
    onSyncSkew,
  }: WithYjsOptions = {}
): T & YjsEditor {
  const e = editor as T & YjsEditor;

  e.sharedRoot = sharedRoot;

  e.localOrigin = localOrigin ?? DEFAULT_LOCAL_ORIGIN;
  e.positionStorageOrigin =
    positionStorageOrigin ?? DEFAULT_POSITION_STORAGE_ORIGIN;
  e.onSyncSkew = onSyncSkew;

  e.applyRemoteEvents = (events, origin) => {
    YjsEditor.flushLocalChanges(e);

    Editor.withoutNormalizing(e, () => {
      YjsEditor.withOrigin(e, origin, () => {
        applyYjsEvents(e.sharedRoot, e, events);
      });
    });
  };

  e.isLocalOrigin = (origin) => origin === e.localOrigin;

  const handleYEvents = (
    events: Y.YEvent<Y.XmlText>[],
    transaction: Y.Transaction
  ) => {
    if (e.isLocalOrigin(transaction.origin)) {
      return;
    }

    YjsEditor.applyRemoteEvents(e, events, transaction.origin);
  };

  let autoConnectTimeoutId: ReturnType<typeof setTimeout> | null = null;
  if (autoConnect) {
    autoConnectTimeoutId = setTimeout(() => {
      autoConnectTimeoutId = null;
      YjsEditor.connect(e);
    });
  }

  e.connect = () => {
    if (YjsEditor.connected(e)) {
      throw new Error('already connected');
    }

    e.sharedRoot.observeDeep(handleYEvents);
    const content = yTextToSlateElement(e.sharedRoot);
    e.children = content.children;
    CONNECTED.add(e);

    Editor.normalize(editor, { force: true });
    if (!editor.operations.length) {
      editor.onChange();
    }
  };

  e.disconnect = () => {
    if (autoConnectTimeoutId) {
      clearTimeout(autoConnectTimeoutId);
    }

    YjsEditor.flushLocalChanges(e);
    e.sharedRoot.unobserveDeep(handleYEvents);
    CONNECTED.delete(e);
  };

  e.storeLocalChange = (op) => {
    LOCAL_CHANGES.set(e, [
      ...YjsEditor.localChanges(e),
      { op, doc: editor.children, origin: YjsEditor.origin(e) },
    ]);
  };

  e.flushLocalChanges = () => {
    assertDocumentAttachment(e.sharedRoot);
    const localChanges = YjsEditor.localChanges(e);
    LOCAL_CHANGES.delete(e);

    // Group local changes by origin so we can apply them in the correct order
    // with the correct origin with a minimal amount of transactions.
    const txGroups: LocalChange[][] = [];
    localChanges.forEach((change) => {
      const currentGroup = txGroups[txGroups.length - 1];
      if (currentGroup && currentGroup[0].origin === change.origin) {
        return currentGroup.push(change);
      }

      txGroups.push([change]);
    });

    try {
      txGroups.forEach((txGroup) => {
        assertDocumentAttachment(e.sharedRoot);

        e.sharedRoot.doc.transact(() => {
          txGroup.forEach((change) => {
            assertDocumentAttachment(e.sharedRoot);
            applySlateOp(e.sharedRoot, { children: change.doc }, change.op);
          });
        }, txGroup[0].origin);
      });
    } catch (error) {
      if (!isSyncSkewError(error)) {
        throw error;
      }

      // A local op could not be translated to Y: the local Slate tree has
      // diverged from Y.XmlText. Recover by rebuilding Slate from Y (source of
      // truth). Run under a non-local origin so the resync's own ops are not
      // re-queued as local changes that would flush back into this same path.
      try {
        YjsEditor.withOrigin(e, RECOVERY_ORIGIN, () => {
          resyncFromYjs(e.sharedRoot, e);
        });
      } catch (resyncError) {
        // Recovery itself failed (e.g. Y is genuinely unreadable). Surface the
        // failure, but still report the original skew below — that is the
        // signal explaining why recovery was attempted, and keeps telemetry
        // consistent with the happy path.
        // eslint-disable-next-line no-console
        console.warn('[slate-yjs] Resync after sync skew failed:', resyncError);
      }

      reportSyncSkew(e.onSyncSkew, error, { direction: 'applyToYjs' });
    }
  };

  const { apply, onChange } = e;
  e.apply = (op) => {
    if (YjsEditor.connected(e) && YjsEditor.isLocal(e)) {
      YjsEditor.storeLocalChange(e, op);
    }

    apply(op);
  };

  e.onChange = () => {
    if (YjsEditor.connected(e)) {
      YjsEditor.flushLocalChanges(e);
    }

    onChange();
  };

  return e;
}
