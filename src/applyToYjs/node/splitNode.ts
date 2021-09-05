import { Editor, Node, SplitNodeOperation } from 'slate';
import Y from 'yjs';
import {
  InsertDelta,
  isSyncLeaf,
  SharedType,
  SyncLeaf,
} from '../../model/types';
import { getYTarget } from '../../utils/location';

function splitLeafGroup(leaf: SyncLeaf, offset: number): SyncLeaf | null {
  if (offset === leaf.length) {
    return null;
  }

  const delta = leaf.toDelta() as InsertDelta;

  let currentOffset = 0;
  const toInsert = delta
    .map(({ insert, attributes }) => {
      if (offset + insert.length >= currentOffset) {
        return {
          attributes,
          insert: insert.slice(Math.max(0, offset - currentOffset)),
        };
      }

      currentOffset += insert.length;
      return null;
    })
    .filter(Boolean);

  const newLeaf = new Y.XmlText();
  newLeaf.applyDelta(toInsert);
  return newLeaf;
}

/**
 * Applies a set node operation to a SharedType.
 *
 * @param sharedType
 * @param op
 */
export function splitNode(
  sharedType: SharedType,
  editor: Editor,
  op: SplitNodeOperation
): void {
  const { element, parent, pathOffset } = getYTarget(
    sharedType,
    editor,
    op.path
  );

  // Since we combine leafs into a single group this is a noop.
  if (isSyncLeaf(element)) {
    return;
  }

  if (!element) {
    throw new Error('Offset out of bounds');
  }

  const node = Node.get(editor, op.path);
  const {
    pathOffset: childOffset,
    textRange,
    element: leaf,
  } = getYTarget(element, node, [op.position]);

  const moveOffset = textRange ? childOffset - 1 : childOffset;
  const toInsert = element.slice(moveOffset, element.length - moveOffset);

  if (textRange) {
    if (!isSyncLeaf(leaf)) {
      throw new Error('Cannot split non-leaf at text range');
    }

    // TODO: Handle empty texts at the end of a group
    const splitLeaf = splitLeafGroup(leaf, textRange.startOffset);
    if (splitLeaf) {
      toInsert.unshift(splitLeaf);
    }
  }

  const split = new Y.XmlElement();
  split.insert(0, toInsert);
  parent.insert(pathOffset, [split]);
}
