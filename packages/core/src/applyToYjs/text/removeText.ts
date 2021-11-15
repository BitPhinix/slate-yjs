import { Node, RemoveTextOperation } from 'slate';
import type Y from 'yjs';
import { getYTarget } from '../../utils/location';

export function removeText(
  root: Y.XmlText,
  slateRoot: Node,
  op: RemoveTextOperation
): void {
  const { parent: target, textRange } = getYTarget(root, slateRoot, op.path);
  target.delete(textRange.start + op.offset, op.text.length);
}
