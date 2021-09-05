import {
  Editor,
  MoveNodeOperation,
  Node,
  Path,
  RemoveNodeOperation,
} from 'slate';
import { SharedType } from '../../model/types';
import { insertNode } from './insertNode';
import { removeNode } from './removeNode';

/**
 * Applies a move node operation to a SharedType.
 *
 * @param sharedType
 * @param op
 */
export function moveNode(
  sharedType: SharedType,
  editor: Editor,
  op: MoveNodeOperation
): void {
  const node = Node.get(editor, op.path);
  const removeOp: RemoveNodeOperation = {
    node,
    path: op.path,
    type: 'remove_node',
  };

  removeNode(sharedType, editor, removeOp);
  const to = Path.transform(op.newPath, removeOp);
  if (!to) {
    throw new Error('Operation moves node into itself');
  }

  insertNode(sharedType, editor, {
    node,
    path: to,
    type: 'insert_node',
  });
}
