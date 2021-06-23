import { Node, Text } from 'slate';
import invariant from 'tiny-invariant';
import { toSlatePath } from '../utils/convert';
/**
 * Translates a Yjs text event into a slate operations.
 *
 * @param event
 */
export default function translateTextEvent(editor, event) {
    const targetPath = toSlatePath(event.path);
    const targetText = Node.get(editor, targetPath);
    invariant(Text.isText(targetText), 'Cannot apply text event to non-text node');
    let offset = 0;
    let { text } = targetText;
    const ops = [];
    event.changes.delta.forEach((delta) => {
        var _a, _b;
        if ('retain' in delta) {
            offset += (_a = delta.retain) !== null && _a !== void 0 ? _a : 0;
        }
        if ('delete' in delta) {
            const endOffset = offset + ((_b = delta.delete) !== null && _b !== void 0 ? _b : 0);
            ops.push({
                type: 'remove_text',
                offset,
                path: targetPath,
                text: text.slice(offset, endOffset),
            });
            text = text.slice(0, offset) + text.slice(endOffset);
        }
        if ('insert' in delta) {
            invariant(typeof delta.insert === 'string', `Unexpected text insert content type: expected string, got ${typeof delta.insert}`);
            ops.push({
                type: 'insert_text',
                offset,
                text: delta.insert,
                path: targetPath,
            });
            offset += delta.insert.length;
            text = text.slice(0, offset) + delta.insert + text.slice(offset);
        }
    });
    return ops;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dEV2ZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2FwcGx5VG9TbGF0ZS90ZXh0RXZlbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFVLElBQUksRUFBRSxJQUFJLEVBQWlCLE1BQU0sT0FBTyxDQUFDO0FBQzFELE9BQU8sU0FBUyxNQUFNLGdCQUFnQixDQUFDO0FBRXZDLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUUvQzs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLE9BQU8sVUFBVSxrQkFBa0IsQ0FDeEMsTUFBYyxFQUNkLEtBQW1CO0lBRW5CLE1BQU0sVUFBVSxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDM0MsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFFaEQsU0FBUyxDQUNQLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEVBQ3ZCLDBDQUEwQyxDQUMzQyxDQUFDO0lBRUYsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDO0lBQ2YsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLFVBQVUsQ0FBQztJQUMxQixNQUFNLEdBQUcsR0FBb0IsRUFBRSxDQUFDO0lBRWhDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFOztRQUNwQyxJQUFJLFFBQVEsSUFBSSxLQUFLLEVBQUU7WUFDckIsTUFBTSxJQUFJLE1BQUEsS0FBSyxDQUFDLE1BQU0sbUNBQUksQ0FBQyxDQUFDO1NBQzdCO1FBRUQsSUFBSSxRQUFRLElBQUksS0FBSyxFQUFFO1lBQ3JCLE1BQU0sU0FBUyxHQUFHLE1BQU0sR0FBRyxDQUFDLE1BQUEsS0FBSyxDQUFDLE1BQU0sbUNBQUksQ0FBQyxDQUFDLENBQUM7WUFFL0MsR0FBRyxDQUFDLElBQUksQ0FBQztnQkFDUCxJQUFJLEVBQUUsYUFBYTtnQkFDbkIsTUFBTTtnQkFDTixJQUFJLEVBQUUsVUFBVTtnQkFDaEIsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQzthQUNwQyxDQUFDLENBQUM7WUFFSCxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUN0RDtRQUVELElBQUksUUFBUSxJQUFJLEtBQUssRUFBRTtZQUNyQixTQUFTLENBQ1AsT0FBTyxLQUFLLENBQUMsTUFBTSxLQUFLLFFBQVEsRUFDaEMsNkRBQTZELE9BQU8sS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUNuRixDQUFDO1lBRUYsR0FBRyxDQUFDLElBQUksQ0FBQztnQkFDUCxJQUFJLEVBQUUsYUFBYTtnQkFDbkIsTUFBTTtnQkFDTixJQUFJLEVBQUUsS0FBSyxDQUFDLE1BQU07Z0JBQ2xCLElBQUksRUFBRSxVQUFVO2FBQ2pCLENBQUMsQ0FBQztZQUVILE1BQU0sSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztZQUM5QixJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQ2xFO0lBQ0gsQ0FBQyxDQUFDLENBQUM7SUFFSCxPQUFPLEdBQUcsQ0FBQztBQUNiLENBQUMifQ==