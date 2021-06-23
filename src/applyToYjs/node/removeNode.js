import invariant from 'tiny-invariant';
import { SyncNode } from '../../model';
import { getParent } from '../../path';
/**
 * Applies a remove node operation to a SharedType.
 *
 * @param doc
 * @param op
 */
export default function removeNode(doc, op) {
    const [parent, index] = getParent(doc, op.path);
    if (SyncNode.getText(parent) !== undefined) {
        throw new TypeError("Can't remove node from text node");
    }
    const children = SyncNode.getChildren(parent);
    invariant(children, 'Parent should have children');
    children.delete(index);
    return doc;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3ZlTm9kZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9hcHBseVRvWWpzL25vZGUvcmVtb3ZlTm9kZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLFNBQVMsTUFBTSxnQkFBZ0IsQ0FBQztBQUN2QyxPQUFPLEVBQWMsUUFBUSxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBQ25ELE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFFdkM7Ozs7O0dBS0c7QUFDSCxNQUFNLENBQUMsT0FBTyxVQUFVLFVBQVUsQ0FDaEMsR0FBZSxFQUNmLEVBQXVCO0lBRXZCLE1BQU0sQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLEdBQUcsU0FBUyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7SUFFaEQsSUFBSSxRQUFRLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLFNBQVMsRUFBRTtRQUMxQyxNQUFNLElBQUksU0FBUyxDQUFDLGtDQUFrQyxDQUFDLENBQUM7S0FDekQ7SUFFRCxNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzlDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsNkJBQTZCLENBQUMsQ0FBQztJQUNuRCxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBRXZCLE9BQU8sR0FBRyxDQUFDO0FBQ2IsQ0FBQyJ9