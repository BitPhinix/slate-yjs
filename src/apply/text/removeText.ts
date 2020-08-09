import { RemoveTextOperation } from 'slate';
import { SyncElement } from '../../model';
import { getTarget } from '../../path';
import { ApplyFunc } from '../types';

/**
 * Applies a remove text operation to a SyncDoc.
 *
 * @param doc
 * @param op
 */
export const removeText: ApplyFunc<RemoveTextOperation> = (doc, op) => {
  const node = getTarget(doc, op.path) as SyncElement;
  const nodeText = SyncElement.getText(node)!;
  nodeText.delete(op.offset, op.text.length);
  return doc;
};
