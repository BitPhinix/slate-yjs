import { Node, Text } from 'slate';
import invariant from 'tiny-invariant';
import { toSlateNode, toSlatePath } from '../utils/convert';
/**
 * Translates a Yjs array event into a slate operations.
 *
 * @param event
 */
export default function translateArrayEvent(editor, event) {
    const targetPath = toSlatePath(event.path);
    const targetElement = Node.get(editor, targetPath);
    invariant(!Text.isText(targetElement), 'Cannot apply array event to text node');
    let offset = 0;
    const ops = [];
    const children = Array.from(targetElement.children);
    event.changes.delta.forEach((delta) => {
        var _a, _b;
        if ('retain' in delta) {
            offset += (_a = delta.retain) !== null && _a !== void 0 ? _a : 0;
        }
        if ('delete' in delta) {
            const path = [...targetPath, offset];
            children.splice(offset, (_b = delta.delete) !== null && _b !== void 0 ? _b : 0).forEach((node) => {
                ops.push({ type: 'remove_node', path, node });
            });
        }
        if ('insert' in delta) {
            invariant(Array.isArray(delta.insert), `Unexpected array insert content type: expected array, got ${JSON.stringify(delta.insert)}`);
            const toInsert = delta.insert.map(toSlateNode);
            toInsert.forEach((node, i) => {
                ops.push({
                    type: 'insert_node',
                    path: [...targetPath, offset + i],
                    node,
                });
            });
            children.splice(offset, 0, ...toInsert);
            offset += delta.insert.length;
        }
    });
    return ops;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJyYXlFdmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9hcHBseVRvU2xhdGUvYXJyYXlFdmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQVUsSUFBSSxFQUFpQixJQUFJLEVBQUUsTUFBTSxPQUFPLENBQUM7QUFDMUQsT0FBTyxTQUFTLE1BQU0sZ0JBQWdCLENBQUM7QUFHdkMsT0FBTyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUU1RDs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLE9BQU8sVUFBVSxtQkFBbUIsQ0FDekMsTUFBYyxFQUNkLEtBQWlDO0lBRWpDLE1BQU0sVUFBVSxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDM0MsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFFbkQsU0FBUyxDQUNQLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsRUFDM0IsdUNBQXVDLENBQ3hDLENBQUM7SUFFRixJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUM7SUFDZixNQUFNLEdBQUcsR0FBb0IsRUFBRSxDQUFDO0lBQ2hDLE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRXBELEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFOztRQUNwQyxJQUFJLFFBQVEsSUFBSSxLQUFLLEVBQUU7WUFDckIsTUFBTSxJQUFJLE1BQUEsS0FBSyxDQUFDLE1BQU0sbUNBQUksQ0FBQyxDQUFDO1NBQzdCO1FBRUQsSUFBSSxRQUFRLElBQUksS0FBSyxFQUFFO1lBQ3JCLE1BQU0sSUFBSSxHQUFHLENBQUMsR0FBRyxVQUFVLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDckMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsTUFBQSxLQUFLLENBQUMsTUFBTSxtQ0FBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTtnQkFDMUQsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7WUFDaEQsQ0FBQyxDQUFDLENBQUM7U0FDSjtRQUVELElBQUksUUFBUSxJQUFJLEtBQUssRUFBRTtZQUNyQixTQUFTLENBQ1AsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQzNCLDZEQUE2RCxJQUFJLENBQUMsU0FBUyxDQUN6RSxLQUFLLENBQUMsTUFBTSxDQUNiLEVBQUUsQ0FDSixDQUFDO1lBRUYsTUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7WUFFL0MsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDM0IsR0FBRyxDQUFDLElBQUksQ0FBQztvQkFDUCxJQUFJLEVBQUUsYUFBYTtvQkFDbkIsSUFBSSxFQUFFLENBQUMsR0FBRyxVQUFVLEVBQUUsTUFBTSxHQUFHLENBQUMsQ0FBQztvQkFDakMsSUFBSTtpQkFDTCxDQUFDLENBQUM7WUFDTCxDQUFDLENBQUMsQ0FBQztZQUVILFFBQVEsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxHQUFHLFFBQVEsQ0FBQyxDQUFDO1lBQ3hDLE1BQU0sSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztTQUMvQjtJQUNILENBQUMsQ0FBQyxDQUFDO0lBRUgsT0FBTyxHQUFHLENBQUM7QUFDYixDQUFDIn0=