import { Descendant, RemoveTextOperation } from 'slate';

import { isSyncLeaf, SharedType } from '../../model/types';
import { getTarget } from '../../utils/location';

/**
 * Applies a remove text operation to a SharedType.
 *
 * @param doc
 * @param op
 */
export function removeText(
  sharedType: SharedType,
  _doc: Descendant[],
  op: RemoveTextOperation
): void {
  const [syncLeaf, startOffset] = getTarget(sharedType, op.path);

  if (!isSyncLeaf(syncLeaf)) {
    throw new Error('Operation does not point to a leaf');
  }

  syncLeaf.delete(startOffset + op.offset, op.text.length);
}
