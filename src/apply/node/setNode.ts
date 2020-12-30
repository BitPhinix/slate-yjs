import { SetNodeOperation } from 'slate';
import { SyncDoc, SyncElement } from '../../model';
import { getTarget } from '../../path';

/**
 * Applies a setNode operation to a SyncDoc
 *
 * @param doc
 * @param op
 */
export default function setNode(doc: SyncDoc, op: SetNodeOperation): SyncDoc {
  const node = getTarget(doc, op.path) as SyncElement;

  Object.entries(op.newProperties).forEach(([key, value]) => {
    if (key === 'children' || key === 'text') {
      throw new Error(`Cannot set the "${key}" property of nodes!`);
    }

    node.set(key, value);
  });

  return doc;
}
