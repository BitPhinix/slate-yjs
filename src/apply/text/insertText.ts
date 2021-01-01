import { InsertTextOperation } from 'slate';
import { SharedType, SyncElement } from '../../model';
import { getTarget } from '../../path';

/**
 * Applies a insert text operation to a SharedType.
 *
 * @param doc
 * @param op
 */
export default function insertText(
  doc: SharedType,
  op: InsertTextOperation
): SharedType {
  const node = getTarget(doc, op.path) as SyncElement;
  const nodeText = SyncElement.getText(node)!;
  nodeText.insert(op.offset, op.text);
  return doc;
}
