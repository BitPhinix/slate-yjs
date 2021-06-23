import invariant from 'tiny-invariant';
import { SyncNode } from '../../model';
import { getParent } from '../../path';
import { cloneSyncElement } from '../../utils';
/**
 * Applies a move node operation to a SharedType.
 *
 * @param doc
 * @param op
 */
export default function moveNode(doc, op) {
    const [from, fromIndex] = getParent(doc, op.path);
    const [to, toIndex] = getParent(doc, op.newPath);
    if (SyncNode.getText(from) !== undefined ||
        SyncNode.getText(to) !== undefined) {
        throw new TypeError("Can't move node as child of a text node");
    }
    const fromChildren = SyncNode.getChildren(from);
    const toChildren = SyncNode.getChildren(to);
    invariant(fromChildren, 'From element should not be a text node');
    invariant(toChildren, 'To element should not be a text node');
    const toMove = fromChildren.get(fromIndex);
    const toInsert = cloneSyncElement(toMove);
    fromChildren.delete(fromIndex);
    toChildren.insert(Math.min(toIndex, toChildren.length), [toInsert]);
    return doc;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW92ZU5vZGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvYXBwbHlUb1lqcy9ub2RlL21vdmVOb2RlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sU0FBUyxNQUFNLGdCQUFnQixDQUFDO0FBQ3ZDLE9BQU8sRUFBYyxRQUFRLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFDbkQsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUN2QyxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFFL0M7Ozs7O0dBS0c7QUFDSCxNQUFNLENBQUMsT0FBTyxVQUFVLFFBQVEsQ0FDOUIsR0FBZSxFQUNmLEVBQXFCO0lBRXJCLE1BQU0sQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLEdBQUcsU0FBUyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDbEQsTUFBTSxDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsR0FBRyxTQUFTLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUVqRCxJQUNFLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssU0FBUztRQUNwQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxLQUFLLFNBQVMsRUFDbEM7UUFDQSxNQUFNLElBQUksU0FBUyxDQUFDLHlDQUF5QyxDQUFDLENBQUM7S0FDaEU7SUFFRCxNQUFNLFlBQVksR0FBRyxRQUFRLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2hELE1BQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUM7SUFFNUMsU0FBUyxDQUFDLFlBQVksRUFBRSx3Q0FBd0MsQ0FBQyxDQUFDO0lBQ2xFLFNBQVMsQ0FBQyxVQUFVLEVBQUUsc0NBQXNDLENBQUMsQ0FBQztJQUU5RCxNQUFNLE1BQU0sR0FBRyxZQUFZLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzNDLE1BQU0sUUFBUSxHQUFHLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBRTFDLFlBQVksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDL0IsVUFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxVQUFVLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBRXBFLE9BQU8sR0FBRyxDQUFDO0FBQ2IsQ0FBQyJ9