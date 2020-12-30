import { InsertTextOperation } from 'slate';
import { SyncDoc, SyncElement } from '../../model';
import { getTarget } from '../../path';

/**
 * Applies a insert text operation to a SyncDoc.
 *
 * @param doc
 * @param op
 */
export default function insertText(
  doc: SyncDoc,
  op: InsertTextOperation
): SyncDoc {
  const node = getTarget(doc, op.path) as SyncElement;
  const nodeText = SyncElement.getText(node)!;
  nodeText.insert(op.offset, op.text);
  return doc;
}
