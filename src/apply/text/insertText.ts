import { InsertTextOperation } from 'slate';
import { SyncElement } from '../../model';
import { getTarget } from '../../path';
import { ApplyFunc } from '../types';

/**
 * Applies a insert text operation to a SyncDoc.
 *
 * @param doc
 * @param op
 */
export const insertText: ApplyFunc<InsertTextOperation> = (doc, op) => {
  const node = getTarget(doc, op.path) as SyncElement;
  const nodeText = SyncElement.getText(node)!;
  nodeText.insert(op.offset, op.text);
  return doc;
};
