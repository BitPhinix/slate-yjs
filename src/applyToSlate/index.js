import { Editor } from 'slate';
import * as Y from 'yjs';
import translateArrayEvent from './arrayEvent';
import translateMapEvent from './mapEvent';
import translateTextEvent from './textEvent';
/**
 * Translates a Yjs event into slate editor operations.
 *
 * @param event
 */
export function translateYjsEvent(editor, event) {
    if (event instanceof Y.YArrayEvent) {
        return translateArrayEvent(editor, event);
    }
    if (event instanceof Y.YMapEvent) {
        return translateMapEvent(editor, event);
    }
    if (event instanceof Y.YTextEvent) {
        return translateTextEvent(editor, event);
    }
    throw new Error('Unsupported yjs event');
}
/**
 * Applies multiple yjs events to a slate editor.
 *
 * @param event
 */
export function applyYjsEvents(editor, events) {
    Editor.withoutNormalizing(editor, () => {
        events.forEach((event) => translateYjsEvent(editor, event).forEach(editor.apply));
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvYXBwbHlUb1NsYXRlL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxNQUFNLEVBQWEsTUFBTSxPQUFPLENBQUM7QUFDMUMsT0FBTyxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUM7QUFDekIsT0FBTyxtQkFBbUIsTUFBTSxjQUFjLENBQUM7QUFDL0MsT0FBTyxpQkFBaUIsTUFBTSxZQUFZLENBQUM7QUFDM0MsT0FBTyxrQkFBa0IsTUFBTSxhQUFhLENBQUM7QUFFN0M7Ozs7R0FJRztBQUNILE1BQU0sVUFBVSxpQkFBaUIsQ0FDL0IsTUFBYyxFQUNkLEtBQWU7SUFFZixJQUFJLEtBQUssWUFBWSxDQUFDLENBQUMsV0FBVyxFQUFFO1FBQ2xDLE9BQU8sbUJBQW1CLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO0tBQzNDO0lBRUQsSUFBSSxLQUFLLFlBQVksQ0FBQyxDQUFDLFNBQVMsRUFBRTtRQUNoQyxPQUFPLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztLQUN6QztJQUVELElBQUksS0FBSyxZQUFZLENBQUMsQ0FBQyxVQUFVLEVBQUU7UUFDakMsT0FBTyxrQkFBa0IsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7S0FDMUM7SUFFRCxNQUFNLElBQUksS0FBSyxDQUFDLHVCQUF1QixDQUFDLENBQUM7QUFDM0MsQ0FBQztBQUVEOzs7O0dBSUc7QUFDSCxNQUFNLFVBQVUsY0FBYyxDQUFDLE1BQWMsRUFBRSxNQUFrQjtJQUMvRCxNQUFNLENBQUMsa0JBQWtCLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRTtRQUNyQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FDdkIsaUJBQWlCLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQ3ZELENBQUM7SUFDSixDQUFDLENBQUMsQ0FBQztBQUNMLENBQUMifQ==