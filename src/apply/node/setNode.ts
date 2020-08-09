import { SetNodeOperation } from 'slate';
import { SyncElement } from '../../model';
import { getTarget } from '../../path';
import { ApplyFunc } from '../types';

/**
 * Applies a setNode operation to a SyncDoc
 *
 * @param doc
 * @param op
 */
const setNode: ApplyFunc<SetNodeOperation> = (doc, op) => {
  const node = getTarget(doc, op.path) as SyncElement;

  for (const [key, value] of Object.entries(op.newProperties)) {
    if (key === 'children' || key === 'text') {
      throw new Error(`Cannot set the "${key}" property of nodes!`);
    }

    node.set(key, value);
  }

  return doc;
};

export default setNode;
