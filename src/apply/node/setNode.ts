import { SetNodeOperation } from 'slate';
import { SharedType, SyncElement } from '../../model';
import { getTarget } from '../../path';

/**
 * Applies a setNode operation to a SharedType
 *
 * @param doc
 * @param op
 */
export default function setNode(
  doc: SharedType,
  op: SetNodeOperation
): SharedType {
  const node = getTarget(doc, op.path) as SyncElement;

  Object.entries(op.newProperties).forEach(([key, value]) => {
    if (key === 'children' || key === 'text') {
      throw new Error(`Cannot set the "${key}" property of nodes!`);
    }

    node.set(key, value);
  });

  return doc;
}
