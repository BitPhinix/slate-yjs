import invariant from 'tiny-invariant';
import { SyncNode } from '../../model';
import { getParent } from '../../path';
import { toSyncElement } from '../../utils/convert';
/**
 * Applies an insert node operation to a SharedType.
 *
 * @param doc
 * @param op
 */
export default function insertNode(doc, op) {
    const [parent, index] = getParent(doc, op.path);
    const children = SyncNode.getChildren(parent);
    if (SyncNode.getText(parent) !== undefined || !children) {
        throw new TypeError("Can't insert node into text node");
    }
    invariant(children, 'cannot apply insert node operation to text node');
    children.insert(index, [toSyncElement(op.node)]);
    return doc;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5zZXJ0Tm9kZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9hcHBseVRvWWpzL25vZGUvaW5zZXJ0Tm9kZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLFNBQVMsTUFBTSxnQkFBZ0IsQ0FBQztBQUN2QyxPQUFPLEVBQWMsUUFBUSxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBQ25ELE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFDdkMsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBRXBEOzs7OztHQUtHO0FBQ0gsTUFBTSxDQUFDLE9BQU8sVUFBVSxVQUFVLENBQ2hDLEdBQWUsRUFDZixFQUF1QjtJQUV2QixNQUFNLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxHQUFHLFNBQVMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBRWhELE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDOUMsSUFBSSxRQUFRLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLFNBQVMsSUFBSSxDQUFDLFFBQVEsRUFBRTtRQUN2RCxNQUFNLElBQUksU0FBUyxDQUFDLGtDQUFrQyxDQUFDLENBQUM7S0FDekQ7SUFFRCxTQUFTLENBQUMsUUFBUSxFQUFFLGlEQUFpRCxDQUFDLENBQUM7SUFFdkUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNqRCxPQUFPLEdBQUcsQ0FBQztBQUNiLENBQUMifQ==