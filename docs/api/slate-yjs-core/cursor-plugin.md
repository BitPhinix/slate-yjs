# Cursor Plugin

## withCursors

`withCursors` facilitates the base layer used by frontend specific implementations/utils like `@slate-yjs/react'`s `useRemoteCursorOverlayPositions`. It contains a common way to send and subscribe to cursor data backed by Yjs's [awareness](https://docs.yjs.dev/getting-started/adding-awareness) feature.

> Not all yjs transports support awareness yet. Depending on which transport you use, this feature might not be available.

<br/>

`withCursors` expects a [y-protocols Awareness](https://github.com/yjs/y-protocols#awarenessprotocolawareness-class) used to send and retrieve cursor data as the 2nd argument. It also takes an optional third argument with the following options:

**`selectionStateField?: string`**

Local state field used for storing the current selection state. Defaults to `selection`. If you have multiple slate docs inside the same Y.Doc, you might want to prefix this with the path of the shared root inside the Y.Doc.

**`cursorDataField?: string`**

Local state field used for storing data attached to the current client. Defaults to `data`.

**`data?: TCursorData`**

Data attached to the current client. Useful for storing user ids, cursor colors, and/or labels. Only will be sent to other clients if `autoSend` is enabled.

**`autoSend?: boolean`**

Whether to automatically send cursor data and selection information on change. Defaults to `true`.

<br/>

`withCursors` should be applied directly after `withYjs`/`withYHistory`. For example:

```javascript
const editor = useMemo(
  () => withCursors(withYjs(createEditor(), sharedType)),
  []
);
```

## CursorEditor

### Static methods

**`isCursorEditor(value: unkown): value is CursorEditor`**

Check if a value is a `CursorEditor`.

**`sendCursorPosition(editor: CursorEditor, range?: Range | null): void`**

Send current selection or specific range as selection state to other clients.

**`sendCursorData(editor: CursorEditor, data: TCursorData): void`**

Send cursor data to other clients.

**`on(editor: CursorEditor, event: 'change', handler: RemoteCursorChangeEventListener): void`**

Add an event listener for remote selection state/data changes. Will only be called while the editor is connected. Will be called with all current cursors on editor connect/disconnect.

**`off(editor: CursorEditor, event: 'change', handler: RemoteCursorChangeEventListener): void`**

Remove an event listener for remote selection state/data changes.

**`cursorState(editor: CursorEditor, clientId: number): CursorState | null`**

Get the cursor state (selection + data) of a client. Returns null if the editor is disconnected or no awareness state exists for the client.

**`cursorStates(editor: CursorEditor): Record<string, CursorState>`**

Get cursor states of all remote clients. Returns an object mapping from client id to the corresponding state. Returns `{}` if the editor is disconnected.

### Instance methods

Replace these methods to modify the original behavior of the YCursorEditor when building Plugins. When modifying behavior, call the original method when appropriate.

**`sendCursorPosition(range: Range | null): void`**

Send specific range as selection state to other clients.

**`sendCursorData(data: TCursorData): void`**

Send cursor data to other clients.

### Instance fields

**`awarness: Awareness`**

The Awareness backing the YCursorEditor instance.

**`cursorDataField: string`**

Local state field used for storing data attached to the current client.

**`selectionStateField: string`**

Local state field used for storing the current selection state.
