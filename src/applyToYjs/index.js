import invariant from 'tiny-invariant';
import node from './node';
import text from './text';
const nullOp = (doc) => doc;
const opMappers = Object.assign(Object.assign(Object.assign({}, text), node), { 
    // SetSelection is currently a null op since we don't support cursors
    set_selection: nullOp });
/**
 * Applies a slate operation to a SharedType
 *
 * @param sharedType
 * @param op
 */
export function applySlateOp(sharedType, op) {
    const apply = opMappers[op.type];
    if (!apply) {
        throw new Error(`Unknown operation: ${op.type}`);
    }
    return apply(sharedType, op);
}
/**
 * Applies slate operations to a SharedType
 *
 * @param sharedType
 * @param op
 */
export default function applySlateOps(sharedType, ops) {
    invariant(sharedType.doc, 'Shared type without attached document');
    if (ops.length > 0) {
        sharedType.doc.transact(() => {
            ops.forEach((op) => applySlateOp(sharedType, op));
        });
    }
    return sharedType;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBwbHlUb1lqcy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLFNBQVMsTUFBTSxnQkFBZ0IsQ0FBQztBQUV2QyxPQUFPLElBQUksTUFBTSxRQUFRLENBQUM7QUFDMUIsT0FBTyxJQUFJLE1BQU0sUUFBUSxDQUFDO0FBRzFCLE1BQU0sTUFBTSxHQUFjLENBQUMsR0FBZSxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUM7QUFFbkQsTUFBTSxTQUFTLGlEQUNWLElBQUksR0FDSixJQUFJO0lBRVAscUVBQXFFO0lBQ3JFLGFBQWEsRUFBRSxNQUFNLEdBQ3RCLENBQUM7QUFFRjs7Ozs7R0FLRztBQUNILE1BQU0sVUFBVSxZQUFZLENBQzFCLFVBQXNCLEVBQ3RCLEVBQWE7SUFFYixNQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBeUIsQ0FBQztJQUN6RCxJQUFJLENBQUMsS0FBSyxFQUFFO1FBQ1YsTUFBTSxJQUFJLEtBQUssQ0FBQyxzQkFBc0IsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7S0FDbEQ7SUFFRCxPQUFPLEtBQUssQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDL0IsQ0FBQztBQUVEOzs7OztHQUtHO0FBQ0gsTUFBTSxDQUFDLE9BQU8sVUFBVSxhQUFhLENBQ25DLFVBQXNCLEVBQ3RCLEdBQWdCO0lBRWhCLFNBQVMsQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLHVDQUF1QyxDQUFDLENBQUM7SUFFbkUsSUFBSSxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtRQUNsQixVQUFVLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUU7WUFDM0IsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ3BELENBQUMsQ0FBQyxDQUFDO0tBQ0o7SUFFRCxPQUFPLFVBQVUsQ0FBQztBQUNwQixDQUFDIn0=