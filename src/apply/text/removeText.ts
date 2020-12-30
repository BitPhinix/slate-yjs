import { RemoveTextOperation } from 'slate';
import { SyncDoc, SyncElement } from '../../model';
import { getTarget } from '../../path';

/**
 * Applies a remove text operation to a SyncDoc.
 *
 * @param doc
 * @param op
 */
export default function removeText(
  doc: SyncDoc,
  op: RemoveTextOperation
): SyncDoc {
  const node = getTarget(doc, op.path) as SyncElement;
  const nodeText = SyncElement.getText(node)!;
  nodeText.delete(op.offset, op.text.length);
  return doc;
}
