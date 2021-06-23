import * as Y from 'yjs';
export const SyncElement = {
    getText(element) {
        return element === null || element === void 0 ? void 0 : element.get('text');
    },
    getChildren(element) {
        return element === null || element === void 0 ? void 0 : element.get('children');
    },
};
export const SyncNode = {
    getChildren(node) {
        if (node instanceof Y.Array) {
            return node;
        }
        return SyncElement.getChildren(node);
    },
    getText(node) {
        if (node instanceof Y.Array) {
            return undefined;
        }
        return SyncElement.getText(node);
    },
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbW9kZWwvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUM7QUFhekIsTUFBTSxDQUFDLE1BQU0sV0FBVyxHQUFHO0lBQ3pCLE9BQU8sQ0FBQyxPQUFvQjtRQUMxQixPQUFPLE9BQU8sYUFBUCxPQUFPLHVCQUFQLE9BQU8sQ0FBRSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDOUIsQ0FBQztJQUVELFdBQVcsQ0FBQyxPQUFvQjtRQUM5QixPQUFPLE9BQU8sYUFBUCxPQUFPLHVCQUFQLE9BQU8sQ0FBRSxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDbEMsQ0FBQztDQUNGLENBQUM7QUFFRixNQUFNLENBQUMsTUFBTSxRQUFRLEdBQUc7SUFDdEIsV0FBVyxDQUFDLElBQWM7UUFDeEIsSUFBSSxJQUFJLFlBQVksQ0FBQyxDQUFDLEtBQUssRUFBRTtZQUMzQixPQUFPLElBQUksQ0FBQztTQUNiO1FBRUQsT0FBTyxXQUFXLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFFRCxPQUFPLENBQUMsSUFBYztRQUNwQixJQUFJLElBQUksWUFBWSxDQUFDLENBQUMsS0FBSyxFQUFFO1lBQzNCLE9BQU8sU0FBUyxDQUFDO1NBQ2xCO1FBRUQsT0FBTyxXQUFXLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ25DLENBQUM7Q0FDRixDQUFDIn0=