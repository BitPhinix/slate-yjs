import { Editor, SetNodeOperation } from 'slate';
import { isSyncElement, isSyncLeaf, SharedType } from '../../model/types';
import { getYTarget } from '../../utils/location';

/**
 * Applies a set node operation to a SharedType.
 *
 * @param sharedType
 * @param op
 */
export function setNode(
  sharedType: SharedType,
  editor: Editor,
  op: SetNodeOperation
): void {
  const { element, textRange } = getYTarget(sharedType, editor, op.path);

  if (textRange) {
    if (!isSyncLeaf(element)) {
      throw new Error('Cannot format text range of non-leaf');
    }

    return element.format(
      textRange.startOffset,
      textRange.endOffset - textRange.startOffset,
      op.newProperties
    );
  }

  if (!isSyncElement(element)) {
    throw new Error('Cannot set attributes on a non-element');
  }

  Object.entries(op.newProperties).forEach(([key, value]) => {
    if (value === null) {
      return element.removeAttribute(key);
    }

    // Yjs typings are incorrect
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return element.setAttribute(key, value as any);
  });
}
