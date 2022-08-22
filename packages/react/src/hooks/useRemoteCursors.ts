import { CursorState } from '@slate-yjs/core';
import { useSyncExternalStore } from 'use-sync-external-store';
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/with-selector';
import { useRemoteCursorStore } from './useRemoteCursorStore';

export function useRemoteCursors<
  TCursorData extends Record<string, unknown> = Record<string, unknown>
>() {
  const store = useRemoteCursorStore<TCursorData>();
  return useSyncExternalStore(store.subscribe, store.getSnapshot);
}

export function useRemoteCursorSelector<
  TCursorData extends Record<string, unknown> = Record<string, unknown>,
  TSelection = unknown
>(
  selector: (cursors: Record<string, CursorState<TCursorData>>) => TSelection,
  isEqual?: (a: TSelection, b: TSelection) => boolean
): TSelection {
  const store = useRemoteCursorStore<TCursorData>();
  return useSyncExternalStoreWithSelector(
    store.subscribe,
    store.getSnapshot,
    null,
    selector,
    isEqual
  );
}
