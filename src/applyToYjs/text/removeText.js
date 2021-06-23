import { SyncElement } from '../../model';
import { getTarget } from '../../path';
/**
 * Applies a remove text operation to a SharedType.
 *
 * @param doc
 * @param op
 */
export default function removeText(doc, op) {
    const node = getTarget(doc, op.path);
    const nodeText = SyncElement.getText(node);
    nodeText.delete(op.offset, op.text.length);
    return doc;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3ZlVGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9hcHBseVRvWWpzL3RleHQvcmVtb3ZlVGV4dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQWMsV0FBVyxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBQ3RELE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFFdkM7Ozs7O0dBS0c7QUFDSCxNQUFNLENBQUMsT0FBTyxVQUFVLFVBQVUsQ0FDaEMsR0FBZSxFQUNmLEVBQXVCO0lBRXZCLE1BQU0sSUFBSSxHQUFHLFNBQVMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBZ0IsQ0FBQztJQUNwRCxNQUFNLFFBQVEsR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBRSxDQUFDO0lBQzVDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzNDLE9BQU8sR0FBRyxDQUFDO0FBQ2IsQ0FBQyJ9