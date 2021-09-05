import { Editor, MergeNodeOperation, Node, Path, Text } from 'slate';
import {
  isSyncElement,
  isSyncLeaf,
  SharedType,
  SyncDescendant,
} from '../../model/types';
import { getYTarget } from '../../utils/location';
import { getMarks } from '../../utils/slate';

/**
 * Applies a merge node operation to a SharedType.
 *
 * @param sharedType
 * @param op
 */
export function mergeNode(
  sharedType: SharedType,
  editor: Editor,
  op: MergeNodeOperation
): void {
  const target = getYTarget(sharedType, editor, op.path);
  const prev = getYTarget(
    target.parent,
    editor,
    Path.previous(op.path.slice(-1))
  );

  if (isSyncLeaf(target.element)) {
    const { element, textRange } = target;
    if (prev.element !== target.element || !textRange) {
      throw new Error('Cannot merge leaf with non-leaf node');
    }

    const node = Node.get(editor, Path.previous(op.path));
    if (!Text.isText(node)) {
      throw new Error(
        'Path points to a leaf in the shared type but not a text node in slate'
      );
    }

    return element.format(
      textRange?.startOffset,
      textRange.startOffset - textRange.endOffset,
      getMarks(node)
    );
  }

  if (!target.element) {
    throw new Error('Offset out of bounds');
  }

  if (!isSyncElement(prev.element)) {
    throw new Error('Cannot merge element with leaf group');
  }

  prev.element.insert(
    prev.element.length,
    target.element.toArray() as SyncDescendant[]
  );
  prev.parent.delete(target.pathOffset);
}
