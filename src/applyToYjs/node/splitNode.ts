import { Editor, SplitNodeOperation, Text } from 'slate';
import Y from 'yjs';
import { cloneInsertDeltaDeep } from '../../utils/clone';
import { sliceInsertDelta } from '../../utils/delta';
import { getYTarget } from '../../utils/location';
import { getMarks } from '../../utils/slate';

/**
 * Applies a split node operation to a Y.XmlText.
 *
 * @param sharedType
 * @param op
 */
export function splitNode(
  root: Y.XmlText,
  editor: Editor,
  op: SplitNodeOperation
): void {
  const { parent, target, targetNode, textRange } = getYTarget(
    root,
    editor,
    op.path
  );

  if (!targetNode) {
    throw new Error('Y target without corresponding slate node');
  }

  if (!target) {
    if (!Text.isText(targetNode)) {
      throw new Error('Mismatch node type between y target and slate node');
    }

    const unsetMarks = Object.fromEntries(
      Object.keys(getMarks(targetNode)).map(([key]) => [key, null])
    );

    return parent.format(
      textRange.start + op.position,
      textRange.end - textRange.start - op.position,
      { ...unsetMarks, ...op.properties }
    );
  }

  const splitTarget = getYTarget(target, targetNode, [op.position]);
  const splitDelta = sliceInsertDelta(
    splitTarget.targetDelta,
    splitTarget.textRange.start,
    target.length - splitTarget.textRange.start
  );

  target.delete(
    splitTarget.textRange.start,
    target.length - splitTarget.textRange.start
  );

  const split = new Y.XmlText();
  split.applyDelta(cloneInsertDeltaDeep(splitDelta), { sanitize: false });

  Object.entries(op.properties).forEach(([key, value]) => {
    split.setAttribute(key, value);
  });

  return parent.insertEmbed(textRange.end, split);
}
