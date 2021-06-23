import invariant from 'tiny-invariant';
import { SyncNode } from '../../model';
import { getParent } from '../../path';
import { cloneSyncElement } from '../../utils';
/**
 * Applies a merge node operation to a SharedType.
 *
 * @param doc
 * @param op
 */
export default function mergeNode(doc, op) {
    const [parent, index] = getParent(doc, op.path);
    const children = SyncNode.getChildren(parent);
    invariant(children, 'Parent of element should have children');
    const prev = children.get(index - 1);
    const next = children.get(index);
    const prevText = SyncNode.getText(prev);
    const nextText = SyncNode.getText(next);
    if (prevText && nextText) {
        prevText.insert(prevText.length, nextText.toString());
    }
    else {
        const nextChildren = SyncNode.getChildren(next);
        const prevChildren = SyncNode.getChildren(prev);
        invariant(nextChildren, 'Next element should have children');
        invariant(prevChildren, 'Prev element should have children');
        const toPush = nextChildren.map(cloneSyncElement);
        prevChildren.push(toPush);
    }
    children.delete(index, 1);
    return doc;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVyZ2VOb2RlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2FwcGx5VG9ZanMvbm9kZS9tZXJnZU5vZGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxTQUFTLE1BQU0sZ0JBQWdCLENBQUM7QUFDdkMsT0FBTyxFQUFjLFFBQVEsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUNuRCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQ3ZDLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUUvQzs7Ozs7R0FLRztBQUNILE1BQU0sQ0FBQyxPQUFPLFVBQVUsU0FBUyxDQUMvQixHQUFlLEVBQ2YsRUFBc0I7SUFFdEIsTUFBTSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsR0FBRyxTQUFTLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUVoRCxNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzlDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsd0NBQXdDLENBQUMsQ0FBQztJQUU5RCxNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztJQUNyQyxNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBRWpDLE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDeEMsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUV4QyxJQUFJLFFBQVEsSUFBSSxRQUFRLEVBQUU7UUFDeEIsUUFBUSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0tBQ3ZEO1NBQU07UUFDTCxNQUFNLFlBQVksR0FBRyxRQUFRLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2hELE1BQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFaEQsU0FBUyxDQUFDLFlBQVksRUFBRSxtQ0FBbUMsQ0FBQyxDQUFDO1FBQzdELFNBQVMsQ0FBQyxZQUFZLEVBQUUsbUNBQW1DLENBQUMsQ0FBQztRQUU3RCxNQUFNLE1BQU0sR0FBRyxZQUFZLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDbEQsWUFBWSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUMzQjtJQUVELFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzFCLE9BQU8sR0FBRyxDQUFDO0FBQ2IsQ0FBQyJ9