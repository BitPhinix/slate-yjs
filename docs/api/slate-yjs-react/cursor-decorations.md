# Cursor Decorations

## useDecorateRemoteCursors

`useDecorateRemoteCursors` provides a simple way to implement an editor overlay displaying remote cursors using [slate decorations](https://docs.slatejs.org/concepts/09-rendering#decorations). Displaying remote cursors using decorations has a few tradeoffs to keep in mind:

Pros:

- They are part of the actual editor content which makes them easier to keep in sync leading to them never visually lagging behind.
- It's easier to customize node rendering/behavior based on remote selection since changes of them cause node re-renders.

Cons:

- Since cursors overlays are part of the by slate rendered content, they change the underlying dom structure causing e.g. different line breaks when a remote user changes his selection.
- They potentially mess with autocorrect
- Animating them is harder
- They potentially provide worse performance since they require re-rendering of parts of the editor content on remote cursor change

<br/>

**`useDecorateRemoteCursors`** takes an optional options parameter with the following options:

**`carets`**

If set to true, useDecorateRemoteCursors will provide explicit decorations for remote carets. Defaults to true. Carets will be decorated
as `` { [`remote-cursor-${id}`]: CursorState<TCursorData> } ``

<br/>

and returns a decorate function meant to be passed to `Editable.decorate`. Cursor ranges will be decorated as `` { [`remote-cursor-${id}`]: CursorState<TCursorData> } `` and carets (if not disabled) as `` { [`remote-caret-${id}`]: CursorState<TCursorData> & { isBackward: boolean } } ``.
Both decoration types can be received on a leaf-level using the `getRemoteCursorsOnLeaf` and `getRemoteCaretsOnLeaf` helpers.

<br/>

`useDecorateRemoteCursors` should be used inside the context of a [CursorEditor](../slate-yjs-core/cursor-plugin.md):

## getRemoteCursorsOnLeaf

Get remote cursor decorations on the given `Leaf`.

## getRemoteCaretsOnLeaf

Get remote caret decorations on the given `Leaf`.
