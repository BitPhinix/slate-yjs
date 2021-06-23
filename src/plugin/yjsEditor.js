import { Editor } from 'slate';
import invariant from 'tiny-invariant';
import { applyYjsEvents } from '../applyToSlate';
import applySlateOps from '../applyToYjs';
import { toSlateDoc } from '../utils/convert';
const IS_REMOTE = new WeakSet();
const IS_LOCAL = new WeakSet();
const SHARED_TYPES = new WeakMap();
export const YjsEditor = {
    /**
     * Set the editor value to the content of the to the editor bound shared type.
     */
    synchronizeValue: (e) => {
        Editor.withoutNormalizing(e, () => {
            e.children = toSlateDoc(e.sharedType);
            e.onChange();
        });
    },
    /**
     * Returns whether the editor currently is applying remove changes.
     */
    sharedType: (editor) => {
        const sharedType = SHARED_TYPES.get(editor);
        invariant(sharedType, 'YjsEditor without attached shared type');
        return sharedType;
    },
    /**
     * Applies a slate operations to the bound shared type.
     */
    applySlateOperations: (editor, operations) => {
        YjsEditor.asLocal(editor, () => {
            applySlateOps(YjsEditor.sharedType(editor), operations);
        });
    },
    /**
     * Returns whether the editor currently is applying remove changes.
     */
    isRemote: (editor) => {
        return IS_REMOTE.has(editor);
    },
    /**
     * Performs an action as a remote operation.
     */
    asRemote: (editor, fn) => {
        const wasRemote = YjsEditor.isRemote(editor);
        IS_REMOTE.add(editor);
        fn();
        if (!wasRemote) {
            Promise.resolve().then(() => IS_REMOTE.delete(editor));
        }
    },
    /**
     * Apply Yjs events to slate
     */
    applyYjsEvents: (editor, events) => {
        YjsEditor.asRemote(editor, () => {
            applyYjsEvents(editor, events);
        });
    },
    /**
     * Performs an action as a local operation.
     */
    asLocal: (editor, fn) => {
        const wasLocal = YjsEditor.isLocal(editor);
        IS_LOCAL.add(editor);
        fn();
        if (!wasLocal) {
            IS_LOCAL.delete(editor);
        }
    },
    /**
     * Returns whether the editor currently is applying a remove change to the yjs doc.
     */
    isLocal: (editor) => {
        return IS_LOCAL.has(editor);
    },
};
export function withYjs(editor, sharedType) {
    const e = editor;
    e.sharedType = sharedType;
    SHARED_TYPES.set(editor, sharedType);
    setTimeout(() => {
        YjsEditor.synchronizeValue(e);
    });
    sharedType.observeDeep((events) => {
        if (!YjsEditor.isLocal(e)) {
            YjsEditor.applyYjsEvents(e, events);
        }
    });
    const { onChange } = editor;
    e.onChange = () => {
        if (!YjsEditor.isRemote(e)) {
            YjsEditor.applySlateOperations(e, e.operations);
        }
        onChange();
    };
    return e;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieWpzRWRpdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3BsdWdpbi95anNFZGl0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sRUFBYSxNQUFNLE9BQU8sQ0FBQztBQUMxQyxPQUFPLFNBQVMsTUFBTSxnQkFBZ0IsQ0FBQztBQUV2QyxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDakQsT0FBTyxhQUFhLE1BQU0sZUFBZSxDQUFDO0FBRTFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUU5QyxNQUFNLFNBQVMsR0FBb0IsSUFBSSxPQUFPLEVBQUUsQ0FBQztBQUNqRCxNQUFNLFFBQVEsR0FBb0IsSUFBSSxPQUFPLEVBQUUsQ0FBQztBQUNoRCxNQUFNLFlBQVksR0FBZ0MsSUFBSSxPQUFPLEVBQUUsQ0FBQztBQU1oRSxNQUFNLENBQUMsTUFBTSxTQUFTLEdBQUc7SUFDdkI7O09BRUc7SUFDSCxnQkFBZ0IsRUFBRSxDQUFDLENBQVksRUFBUSxFQUFFO1FBQ3ZDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFO1lBQ2hDLENBQUMsQ0FBQyxRQUFRLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUN0QyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDZixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRDs7T0FFRztJQUNILFVBQVUsRUFBRSxDQUFDLE1BQWlCLEVBQWMsRUFBRTtRQUM1QyxNQUFNLFVBQVUsR0FBRyxZQUFZLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzVDLFNBQVMsQ0FBQyxVQUFVLEVBQUUsd0NBQXdDLENBQUMsQ0FBQztRQUNoRSxPQUFPLFVBQVUsQ0FBQztJQUNwQixDQUFDO0lBRUQ7O09BRUc7SUFDSCxvQkFBb0IsRUFBRSxDQUFDLE1BQWlCLEVBQUUsVUFBdUIsRUFBUSxFQUFFO1FBQ3pFLFNBQVMsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRTtZQUM3QixhQUFhLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUMxRCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRDs7T0FFRztJQUNILFFBQVEsRUFBRSxDQUFDLE1BQWlCLEVBQVcsRUFBRTtRQUN2QyxPQUFPLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDL0IsQ0FBQztJQUVEOztPQUVHO0lBQ0gsUUFBUSxFQUFFLENBQUMsTUFBaUIsRUFBRSxFQUFjLEVBQVEsRUFBRTtRQUNwRCxNQUFNLFNBQVMsR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzdDLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFdEIsRUFBRSxFQUFFLENBQUM7UUFFTCxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQ2QsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7U0FDeEQ7SUFDSCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxjQUFjLEVBQUUsQ0FBQyxNQUFpQixFQUFFLE1BQWtCLEVBQVEsRUFBRTtRQUM5RCxTQUFTLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUU7WUFDOUIsY0FBYyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztRQUNqQyxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRDs7T0FFRztJQUNILE9BQU8sRUFBRSxDQUFDLE1BQWlCLEVBQUUsRUFBYyxFQUFRLEVBQUU7UUFDbkQsTUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMzQyxRQUFRLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRXJCLEVBQUUsRUFBRSxDQUFDO1FBRUwsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNiLFFBQVEsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDekI7SUFDSCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxPQUFPLEVBQUUsQ0FBQyxNQUFpQixFQUFXLEVBQUU7UUFDdEMsT0FBTyxRQUFRLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzlCLENBQUM7Q0FDRixDQUFDO0FBRUYsTUFBTSxVQUFVLE9BQU8sQ0FDckIsTUFBUyxFQUNULFVBQXNCO0lBRXRCLE1BQU0sQ0FBQyxHQUFHLE1BQXVCLENBQUM7SUFFbEMsQ0FBQyxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7SUFDMUIsWUFBWSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFFckMsVUFBVSxDQUFDLEdBQUcsRUFBRTtRQUNkLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNoQyxDQUFDLENBQUMsQ0FBQztJQUVILFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRTtRQUNoQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUN6QixTQUFTLENBQUMsY0FBYyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztTQUNyQztJQUNILENBQUMsQ0FBQyxDQUFDO0lBRUgsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLE1BQU0sQ0FBQztJQUU1QixDQUFDLENBQUMsUUFBUSxHQUFHLEdBQUcsRUFBRTtRQUNoQixJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUMxQixTQUFTLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQztTQUNqRDtRQUVELFFBQVEsRUFBRSxDQUFDO0lBQ2IsQ0FBQyxDQUFDO0lBRUYsT0FBTyxDQUFDLENBQUM7QUFDWCxDQUFDIn0=