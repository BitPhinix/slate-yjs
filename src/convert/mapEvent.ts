import { SetNodeOperation } from 'slate';
import * as Y from 'yjs';
import { SyncElement } from '../model';
import { toSlatePath } from '../utils/convert';

type MapAction = { action: 'add' | 'update' | 'delete'; oldValue: unknown };
type SetNodeOperationProperties = Pick<
  SetNodeOperation,
  'newProperties' | 'properties'
>;

/**
 * Converts a Yjs Map event into Slate operations.
 *
 * @param event
 */
export default function mapEvent(
  event: Y.YMapEvent<unknown>
): SetNodeOperation[] {
  const convertMapOp = (
    actionEntry: [string, MapAction]
  ): SetNodeOperationProperties => {
    const [key, action] = actionEntry;
    const targetElement = event.target as SyncElement;

    return {
      newProperties: { [key]: targetElement.get(key) },
      properties: { [key]: action.oldValue },
    };
  };

  const combineMapOp = (
    op: SetNodeOperation,
    props: SetNodeOperationProperties
  ): SetNodeOperation => {
    return {
      ...op,
      newProperties: { ...op.newProperties, ...props.newProperties },
      properties: { ...op.properties, ...props.properties },
    };
  };

  const { keys } = event.changes;
  const changes = Array.from(keys.entries(), convertMapOp);

  const baseOp: SetNodeOperation = {
    type: 'set_node',
    newProperties: {},
    properties: {},
    path: toSlatePath(event.path),
  };

  // Combine changes into a single set node operation
  return [changes.reduce<SetNodeOperation>(combineMapOp, baseOp)];
}
