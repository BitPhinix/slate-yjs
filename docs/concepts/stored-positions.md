# Stored positions

## Why stored positions?

Due to current limitations in yjs, slate-yjs performs `move_node` and some `split_node` operations as inserts and deletes. This might cause some unexpected behavior when it comes to [relative positions](https://docs.yjs.dev/api/relative-positions)

> Slate-yjs represents the document in a way to minimize these cases

Let's say you have the following slate document:

```json
[
   {
      "type": "paragraph",
      "children": [
         {
            "text":"some text"
         }
      ]
   },
]
```

And want to keep track of the point at the path `[0, 0]` offset `4` using the provided `slatePointToRelativePosition` helper.

Everything seems to work fine for basic edits like inserting and formatting text. But now you split the paragraph at the path `[0, 0]` at offset `1` to end up in the following state:

```json
[
   {
      "type": "paragraph",
      "children": [
         {
            "text":"s"
         }
      ]
   },
   {
      "type": "paragraph",
      "children": [
         {
            "text":"ome text"
         }
      ]
   }
]
```

The relative position now resolves to the path `[0, 0]` offset `[1]` and not to the path `[1, 0]` offset `3` as you'd probably expect. This is due to the way slate-yjs represents the slate document as shared types. Since there is currently no way to move ranges of text inside yjs, this operation is performed as a delete of "ome text" and an insert of a new paragraph (= a Y.XmlText). This is where stored positions come in.

> In the future, yjs might introduce a way of moving ranges of text making stored positions obsolete

## How they work

Stored positions are in fact backed by relative positions but are updated by slate-yjs on certain operations (like `move_node` and some `split_node` operations).

Once you store a position, slate-yjs encodes it as a relative position and stores it in the shared root under using a prefixed version of the provided storage key.

If you now perform a specific `split_node` or `move_node` operation, the binding checks if there are any stored positions in the moved range and updates them accordingly by encoding the position where the stored position should point to after the operation as a relative position and overwriting the relative position stored in the shared root.

## Caveats

There are a few caveats to keep in mind when using stored positions:

* When merging 2 updates that result in the duplication of a node, the stored position will only point to one of them (but always the same for both clients)
* When undoing operations that occurred before the creation of a stored position, they will always be treated as inserts/deletes.
* When a client applies a `move_node` / specific `split_node` operation before receiving an update containing the stored position the change will be treated as inserts/deletes.
* In comparison to relative positions, stored positions add a minimal overhead when applying changes to the shared type. While this overhead is tiny, it might cause a noticeable delay if the document contains thousands of stored locations.
