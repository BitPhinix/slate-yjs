# History Plugin

## withYHistory

`withYHistory` facilitates a drop-in replacement for slates default history plugin which only keeps track of local changes and handles transformations, backed by Yjs's [UndoManger](https://docs.yjs.dev/api/undo-manager).

<br/>

`withYHistory` takes an optional second argument with the following options:

**`captureTimeout?: number`**

Time gap in ms after which a change will create a new history entry. Changes with a time gap <= captureTimeout will be merged into a single entry. Defaults to `500`.

**`deleteFilter?: (item: Y.Item) => boolean`**

Filter to specify which items undos/redos can delete. If the filter returns `false` the Y.Item won't be deleted even it's in the undo/redo scope.

**`trackedOrigins?: Set<unkown>`**

Origins to include inside the history. Defaults to `yjsEditor.localOrigin`. For more details take a look [here](https://docs.yjs.dev/api/undo-manager#example-specify-tracked-origins).

<br/>

`withYHistory` should be applied directly after `withYjs/withCursors`. For example:

```javascript
const editor = useMemo(() => withYHistory(withYjs(createEditor(), sharedType)), [])
```

## YHistoryEditor

### Static methods

**`isYHistoryEditor(value: unkown): value is YHistoryEditor`**

Check if a value is a `YHistoryEditor`.

**`canUndo(editor: YHistoryEditor): boolean`**

Check whether the undo stack is non-empty.

**`canRedo(editor: YHistoryEditor): boolean`**

Check whether the redo stack is non-empty.

### Instance methods

Replace these methods to modify the original behavior of the YHistoryEditor when building Plugins. When modifying behavior, call the original method when appropriate.

**`undo(): void`**

Undo a change.

**`redo(): void`**

Redo a change.

### Instance fields

**`undoManager: Y.UndoManager`**

The Yjs UndoManager backing the YHistoryEditor instance.

