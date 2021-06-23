import invariant from 'tiny-invariant';
import * as Y from 'yjs';
import { SyncElement } from '../model';
import { getSyncNodePath, getTarget } from '../path';
export function absolutePositionToRelativePosition(sharedType, point) {
    const target = getTarget(sharedType, point.path);
    const text = SyncElement.getText(target);
    invariant(text, 'Slate point should point to Text node');
    return Y.createRelativePositionFromTypeIndex(text, point.offset);
}
export function relativePositionToAbsolutePosition(sharedType, relativePosition) {
    invariant(sharedType.doc, 'Shared type should be bound to a document');
    const pos = Y.createAbsolutePositionFromRelativePosition(relativePosition, sharedType.doc);
    if (!pos) {
        return null;
    }
    return {
        path: getSyncNodePath(pos.type.parent),
        offset: pos.index,
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY3Vyc29yL3V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sU0FBUyxNQUFNLGdCQUFnQixDQUFDO0FBQ3ZDLE9BQU8sS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDO0FBQ3pCLE9BQU8sRUFBYyxXQUFXLEVBQVksTUFBTSxVQUFVLENBQUM7QUFDN0QsT0FBTyxFQUFFLGVBQWUsRUFBRSxTQUFTLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFFckQsTUFBTSxVQUFVLGtDQUFrQyxDQUNoRCxVQUFzQixFQUN0QixLQUFZO0lBRVosTUFBTSxNQUFNLEdBQUcsU0FBUyxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDakQsTUFBTSxJQUFJLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQyxNQUFxQixDQUFDLENBQUM7SUFDeEQsU0FBUyxDQUFDLElBQUksRUFBRSx1Q0FBdUMsQ0FBQyxDQUFDO0lBQ3pELE9BQU8sQ0FBQyxDQUFDLG1DQUFtQyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDbkUsQ0FBQztBQUVELE1BQU0sVUFBVSxrQ0FBa0MsQ0FDaEQsVUFBc0IsRUFDdEIsZ0JBQW9DO0lBRXBDLFNBQVMsQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLDJDQUEyQyxDQUFDLENBQUM7SUFFdkUsTUFBTSxHQUFHLEdBQUcsQ0FBQyxDQUFDLDBDQUEwQyxDQUN0RCxnQkFBZ0IsRUFDaEIsVUFBVSxDQUFDLEdBQUcsQ0FDZixDQUFDO0lBRUYsSUFBSSxDQUFDLEdBQUcsRUFBRTtRQUNSLE9BQU8sSUFBSSxDQUFDO0tBQ2I7SUFFRCxPQUFPO1FBQ0wsSUFBSSxFQUFFLGVBQWUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQWtCLENBQUM7UUFDbEQsTUFBTSxFQUFFLEdBQUcsQ0FBQyxLQUFLO0tBQ2xCLENBQUM7QUFDSixDQUFDIn0=