import { Editor, SetNodeOperation } from 'slate';
import * as Y from 'yjs';
import { getYTarget } from '../../utils/location';

/**
 * Applies a set node operation to a Y.XmlText.
 *
 * @param sharedType
 * @param op
 */
export function setNode(
  root: Y.XmlText,
  editor: Editor,
  op: SetNodeOperation
): void {
  const { target, textRange, parent } = getYTarget(root, editor, op.path);

  if (target) {
    Object.entries(op.newProperties).forEach(([key, value]) => {
      if (value === null) {
        return target.removeAttribute(key);
      }

      target.setAttribute(key, value);
    });

    return Object.entries(op.properties).forEach(([key]) => {
      if (!op.newProperties.hasOwnProperty(key)) {
        target.removeAttribute(key);
      }
    });
  }

  parent.format(
    textRange.start,
    textRange.end - textRange.start,
    op.newProperties
  );
}
