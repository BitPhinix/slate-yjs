import invariant from 'tiny-invariant';
import { SyncElement } from '../../model';
import { getTarget } from '../../path';
/**
 * Applies a insert text operation to a SharedType.
 *
 * @param doc
 * @param op
 */
export default function insertText(doc, op) {
    const node = getTarget(doc, op.path);
    const nodeText = SyncElement.getText(node);
    invariant(nodeText, 'Apply text operation to non text node');
    nodeText.insert(op.offset, op.text);
    return doc;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5zZXJ0VGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9hcHBseVRvWWpzL3RleHQvaW5zZXJ0VGV4dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLFNBQVMsTUFBTSxnQkFBZ0IsQ0FBQztBQUN2QyxPQUFPLEVBQWMsV0FBVyxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBQ3RELE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFFdkM7Ozs7O0dBS0c7QUFDSCxNQUFNLENBQUMsT0FBTyxVQUFVLFVBQVUsQ0FDaEMsR0FBZSxFQUNmLEVBQXVCO0lBRXZCLE1BQU0sSUFBSSxHQUFHLFNBQVMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBZ0IsQ0FBQztJQUNwRCxNQUFNLFFBQVEsR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBRTNDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsdUNBQXVDLENBQUMsQ0FBQztJQUU3RCxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3BDLE9BQU8sR0FBRyxDQUFDO0FBQ2IsQ0FBQyJ9