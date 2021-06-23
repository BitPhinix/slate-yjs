import invariant from 'tiny-invariant';
import { absolutePositionToRelativePosition } from '../cursor/utils';
import { YjsEditor } from './yjsEditor';
const AWARENESS = new WeakMap();
export const CursorEditor = {
    awareness(editor) {
        const awareness = AWARENESS.get(editor);
        invariant(awareness, 'CursorEditor without attaches awareness');
        return awareness;
    },
    updateCursor: (editor) => {
        const sharedType = YjsEditor.sharedType(editor);
        const { selection } = editor;
        const anchor = selection &&
            absolutePositionToRelativePosition(sharedType, selection.anchor);
        const focus = selection &&
            absolutePositionToRelativePosition(sharedType, selection.focus);
        const awareness = CursorEditor.awareness(editor);
        awareness.setLocalState(Object.assign(Object.assign({}, awareness.getLocalState()), { anchor, focus }));
    },
};
export function withCursor(editor, awareness) {
    const e = editor;
    AWARENESS.set(e, awareness);
    e.awareness = awareness;
    const { onChange } = editor;
    e.onChange = () => {
        setTimeout(() => CursorEditor.updateCursor(e), 0);
        if (onChange) {
            onChange();
        }
    };
    return e;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3Vyc29yRWRpdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3BsdWdpbi9jdXJzb3JFZGl0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxTQUFTLE1BQU0sZ0JBQWdCLENBQUM7QUFFdkMsT0FBTyxFQUFFLGtDQUFrQyxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDckUsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUV4QyxNQUFNLFNBQVMsR0FBK0IsSUFBSSxPQUFPLEVBQUUsQ0FBQztBQU01RCxNQUFNLENBQUMsTUFBTSxZQUFZLEdBQUc7SUFDMUIsU0FBUyxDQUFDLE1BQW9CO1FBQzVCLE1BQU0sU0FBUyxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDeEMsU0FBUyxDQUFDLFNBQVMsRUFBRSx5Q0FBeUMsQ0FBQyxDQUFDO1FBQ2hFLE9BQU8sU0FBUyxDQUFDO0lBQ25CLENBQUM7SUFFRCxZQUFZLEVBQUUsQ0FBQyxNQUFvQixFQUFRLEVBQUU7UUFDM0MsTUFBTSxVQUFVLEdBQUcsU0FBUyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNoRCxNQUFNLEVBQUUsU0FBUyxFQUFFLEdBQUcsTUFBTSxDQUFDO1FBRTdCLE1BQU0sTUFBTSxHQUNWLFNBQVM7WUFDVCxrQ0FBa0MsQ0FBQyxVQUFVLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRW5FLE1BQU0sS0FBSyxHQUNULFNBQVM7WUFDVCxrQ0FBa0MsQ0FBQyxVQUFVLEVBQUUsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRWxFLE1BQU0sU0FBUyxHQUFHLFlBQVksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDakQsU0FBUyxDQUFDLGFBQWEsaUNBQU0sU0FBUyxDQUFDLGFBQWEsRUFBRSxLQUFFLE1BQU0sRUFBRSxLQUFLLElBQUcsQ0FBQztJQUMzRSxDQUFDO0NBQ0YsQ0FBQztBQUVGLE1BQU0sVUFBVSxVQUFVLENBQ3hCLE1BQVMsRUFDVCxTQUFvQjtJQUVwQixNQUFNLENBQUMsR0FBRyxNQUEwQixDQUFDO0lBRXJDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQzVCLENBQUMsQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO0lBRXhCLE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxNQUFNLENBQUM7SUFFNUIsQ0FBQyxDQUFDLFFBQVEsR0FBRyxHQUFHLEVBQUU7UUFDaEIsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFFbEQsSUFBSSxRQUFRLEVBQUU7WUFDWixRQUFRLEVBQUUsQ0FBQztTQUNaO0lBQ0gsQ0FBQyxDQUFDO0lBRUYsT0FBTyxDQUFDLENBQUM7QUFDWCxDQUFDIn0=