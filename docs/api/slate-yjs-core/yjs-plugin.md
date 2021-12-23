# Yjs Plugin

## withYjs

The Yjs plugin facilitates the code yjs binding is acts as the baseline of all other by slate-yjs provided plugins and packages.



`withYjs` expects a `Y.XmlText` acting as the root of the binding as the 2nd parameter. It also takes an optional third argument with the following options:

**`autoConnect?: boolean`**

Whether to automatically connect after plugin creation defaults to `true`.

**`localOrigin?: unkown`**

Yjs origin used when applying local operations. Defaults to the unexported `DEFAULT_LOCAL_ORIGIN` symbol.

**`positionStorageOrigin?: unkown`**

Yjs origin used when creating stored positions. Defaults to the unexported `DEFAULT_POSITION_STORAGE_ORIGIN` symbol.



When used with `withReact`, `withYjs` should be applied inside. For example:

```javascript
const editor = useMemo(() => withReact(withYjs(createEditor(), sharedType)), [])
```

## YjsEditor

### Static methods

#### `isYjsEditor(value: unknown): value is YjsEditor`

Check if a value is a `YjsEditor`

#### `localChanges(editor: YjsEditor): LocalChange[]`

Get the local changes (slate operation + editor state) that haven't been flushed yet.

#### `storeLocalOperation(editor: YjsEditor, op: Operation): void`

Store slate operation as local change.

#### `flushLocalChanges(editor: YjsEditor): void`

Flush local changes by applying them to the shared root.

#### `applyRemoteEvents(editor: YjsEditor, events: Y.YEvent[], origin: unknown): void`

Apply Yjs events to the editor with origin.

#### `connected(editor: YjsEditor): boolean`

Check if the editor is currently being synced with the shared root.

#### `connect(editor: YjsEditor): void`

Connect the editor to the shared type by overwriting the current editor value with the in the shared root contained document and registering the appropriate event listeners.

#### `disconnect(editor: YjsEditor): void`

Disconnect the editor from the shared type by detaching the appropriate event handlers and flushing the local changes.

**`remoteOrigin(editor: YjsEditor): unknown | undefined`**

Get the Yjs origin of the change that caused the operation we are currently applying. `undefined` if the operation origin is caused by a local change.

**`asRemote(editor: YjsEditor, origin: unknown, fn: () => void): void`**

Perform fn as remote with the given origin.

**`storePosition(editor: YjsEditor, key: string, point: Point): void`**

Create a [stored position](../../concepts/stored-positions.md) for a point under a key.

**`position(editor: YjsEditor, key: string): Point | null | undefined`**

Retrieve a [stored position](../../concepts/stored-positions.md) by key. `undefined` if the stored position doesn't exist, `null` if it isn't part of the document anymore.

#### `storedPositionsRelative(editor: YjsEditor): Record<string, Y.RelativePosition>`

Retrieve all [stored positions](../../concepts/stored-positions.md) as a Record of storage key to relative position.

### Instance methods

Replace these methods to modify the original behavior of the yjs editor when building Plugins. When modifying behavior, call the original method when appropriate.

**`applyRemoteEvents: (events: Y.YEvent[], origin: unknown) => void`**

Apply Yjs events to the editor with origin.

**`storeLocalOperation: (op: Operation) => void`**

Store slate operation as local change.

**`flushLocalChanges: () => void`**

Flush local changes by applying them to the shared root.

**`connect: () => void`**

Connect the editor to the shared type by overwriting the current editor value with the in the shared root contained document and registering the appropriate event listeners.

**`disconnect: () => void`**

Disconnect the editor from the shared type by detaching the appropriate event handlers and flushing the local changes.

### Instance fields

**`sharedRoot: Y.XmlText`**

Shared type the binding is bound to.&#x20;

**`localOrigin: unknown`**

Yjs origin used when applying local changes.

**`positionStorageOrigin: unknown`**

Yjs origin used when creating stored positions.
