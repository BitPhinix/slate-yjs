# Utils

`@slate-yjs/core` provides several helpers for converting from and to slate nodes, and for working with locations. They are used for initializing documents and act as a baseline for other by slate-yjs provided packages.

<br/>

**`yTextToSlateElement(yText: Y.XmlText): Element`**

Convert a Y.XmlText to a slate element. Useful when serializing documents from shared roots.

**`slateNodesToInsertDelta(nodes: Node[]): InsertDelta`**

Convert slate nodes to an `InsertDelta`. Useful when initializing documents.

**`slateRangeToRelativeRange(sharedRoot: Y.XmlText, slateRoot: Node, range: BaseRange): RelativeRange`**

Get a relative range for a slate range.

**`relativeRangeToSlateRange(sharedRoot: Y.XmlText, slateRoot: Node, range: RelativeRange): BaseRange | null`**

Get a slate range for a relative range. Returns null if the anchor/focus or both aren't part of the document anymore.

**`slatePointToRelativePosition(sharedRoot: Y.XmlText, slateRoot: Node, point: BasePoint): Y.RelativePosition`**

Get a [relative position](https://docs.yjs.dev/api/relative-positions) for a slate point.

**`relativePositionToSlatePoint( sharedRoot: Y.XmlText, slateRoot: Node, pos: Y.RelativePosition ): BasePoint | null`**

Get a slate point for a relative position. Returns null if the relative position isn't part of the document anymore.

