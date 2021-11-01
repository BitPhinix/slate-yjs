import { Editor, MergeNodeOperation, Node, Path, Text } from 'slate';
import * as Y from 'yjs';
import { Delta, InsertDelta } from '../../model/types';
import { cloneInsertDeltaDeep } from '../../utils/clone';
import { getYTarget } from '../../utils/location';
import { getMarks } from '../../utils/slate';

/**
 * Applies a merge node operation to a Y.XmlText.
 *
 * @param sharedType
 * @param op
 */
export function mergeNode(
  root: Y.XmlText,
  editor: Editor,
  op: MergeNodeOperation
): void {
  const target = getYTarget(root, editor, op.path);
  const prev = getYTarget(
    target.parent,
    target.parentNode,
    Path.previous(op.path.slice(-1))
  );

  if (!target.target !== !prev.target) {
    throw new Error('Cannot merge y text with y element');
  }

  if (!prev.target || !target.target) {
    const { parent, textRange } = target;

    const node = Node.get(editor, Path.previous(op.path));
    if (!Text.isText(node)) {
      throw new Error('Path points to a y text but not a slate node');
    }

    return parent.format(
      textRange.start,
      textRange.start - textRange.end,
      getMarks(node)
    );
  }

  const delta = cloneInsertDeltaDeep(target.target.toDelta() as InsertDelta);
  const applyDelta: Delta = [{ retain: prev.target.length }, ...delta];

  prev.target.applyDelta(applyDelta, {
    sanitize: false,
  });

  target.parent.delete(
    target.textRange.start,
    target.textRange.end - target.textRange.start
  );
}
