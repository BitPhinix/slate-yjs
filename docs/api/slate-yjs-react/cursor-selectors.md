# Cursor selectors

`@slate-yjs/react` provides various helper hooks to allow for custom rendering of remote selections on/inside editor elements. All these
helper hooks are based upon a per-editor unique store to allow for good performance even when rendering 100s of elements reacting to
remote changes.

## useRemoteCursorStatesSelector

Hook to react to all cursor changes inside a component using a selector.

## useRemoteCursorStates

Hook to react to all cursor changes inside a component. Returns a `Record<string, CursorState<TCursorData>>` containing all remote cursor states.
