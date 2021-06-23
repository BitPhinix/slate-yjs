import invariant from 'tiny-invariant';
import * as Y from 'yjs';
import { SyncNode } from '../model';
import { toSlateDoc } from '../utils/convert';
const isTree = (node) => !!SyncNode.getChildren(node);
/**
 * Returns the SyncNode referenced by the path
 *
 * @param doc
 * @param path
 */
export function getTarget(doc, path) {
    function iterate(current, idx) {
        const children = SyncNode.getChildren(current);
        if (!isTree(current) || !(children === null || children === void 0 ? void 0 : children.get(idx))) {
            throw new TypeError(`path ${path.toString()} does not match doc ${JSON.stringify(toSlateDoc(doc))}`);
        }
        return children.get(idx);
    }
    return path.reduce(iterate, doc);
}
function getParentPath(path, level = 1) {
    if (level > path.length) {
        throw new TypeError('requested ancestor is higher than root');
    }
    return [path[path.length - level], path.slice(0, path.length - level)];
}
export function getParent(doc, path, level = 1) {
    const [idx, parentPath] = getParentPath(path, level);
    const parent = getTarget(doc, parentPath);
    invariant(parent, 'Parent node should exists');
    return [parent, idx];
}
/**
 * Returns the position of the sync item inside inside it's parent array.
 *
 * @param item
 */
export function getArrayPosition(item) {
    let i = 0;
    let c = item.parent._start;
    while (c !== item && c !== null) {
        if (!c.deleted) {
            i += 1;
        }
        c = c.right;
    }
    return i;
}
/**
 * Returns the document path of a sync item
 *
 * @param node
 */
export function getSyncNodePath(node) {
    if (!node) {
        return [];
    }
    const { parent } = node;
    if (!parent) {
        return [];
    }
    if (parent instanceof Y.Array) {
        invariant(node._item, 'Parent should be associated with a item');
        return [...getSyncNodePath(parent), getArrayPosition(node._item)];
    }
    if (parent instanceof Y.Map) {
        return getSyncNodePath(parent);
    }
    throw new Error(`Unknown parent type ${parent}`);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcGF0aC9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLFNBQVMsTUFBTSxnQkFBZ0IsQ0FBQztBQUN2QyxPQUFPLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQztBQUN6QixPQUFPLEVBQTJCLFFBQVEsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUM3RCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFFOUMsTUFBTSxNQUFNLEdBQUcsQ0FBQyxJQUFjLEVBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBRXpFOzs7OztHQUtHO0FBQ0gsTUFBTSxVQUFVLFNBQVMsQ0FBQyxHQUFlLEVBQUUsSUFBVTtJQUNuRCxTQUFTLE9BQU8sQ0FBQyxPQUFpQixFQUFFLEdBQVc7UUFDN0MsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUUvQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQSxRQUFRLGFBQVIsUUFBUSx1QkFBUixRQUFRLENBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBLEVBQUU7WUFDM0MsTUFBTSxJQUFJLFNBQVMsQ0FDakIsUUFBUSxJQUFJLENBQUMsUUFBUSxFQUFFLHVCQUF1QixJQUFJLENBQUMsU0FBUyxDQUMxRCxVQUFVLENBQUMsR0FBRyxDQUFDLENBQ2hCLEVBQUUsQ0FDSixDQUFDO1NBQ0g7UUFFRCxPQUFPLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDM0IsQ0FBQztJQUVELE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBVyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDN0MsQ0FBQztBQUVELFNBQVMsYUFBYSxDQUFDLElBQVUsRUFBRSxLQUFLLEdBQUcsQ0FBQztJQUMxQyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFO1FBQ3ZCLE1BQU0sSUFBSSxTQUFTLENBQUMsd0NBQXdDLENBQUMsQ0FBQztLQUMvRDtJQUVELE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDekUsQ0FBQztBQUVELE1BQU0sVUFBVSxTQUFTLENBQ3ZCLEdBQWUsRUFDZixJQUFVLEVBQ1YsS0FBSyxHQUFHLENBQUM7SUFFVCxNQUFNLENBQUMsR0FBRyxFQUFFLFVBQVUsQ0FBQyxHQUFHLGFBQWEsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDckQsTUFBTSxNQUFNLEdBQUcsU0FBUyxDQUFDLEdBQUcsRUFBRSxVQUFVLENBQUMsQ0FBQztJQUMxQyxTQUFTLENBQUMsTUFBTSxFQUFFLDJCQUEyQixDQUFDLENBQUM7SUFDL0MsT0FBTyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztBQUN2QixDQUFDO0FBRUQ7Ozs7R0FJRztBQUNILE1BQU0sVUFBVSxnQkFBZ0IsQ0FBQyxJQUFZO0lBQzNDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNWLElBQUksQ0FBQyxHQUFJLElBQUksQ0FBQyxNQUErQixDQUFDLE1BQU0sQ0FBQztJQUVyRCxPQUFPLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxLQUFLLElBQUksRUFBRTtRQUMvQixJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRTtZQUNkLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDUjtRQUNELENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDO0tBQ2I7SUFFRCxPQUFPLENBQUMsQ0FBQztBQUNYLENBQUM7QUFFRDs7OztHQUlHO0FBQ0gsTUFBTSxVQUFVLGVBQWUsQ0FBQyxJQUFjO0lBQzVDLElBQUksQ0FBQyxJQUFJLEVBQUU7UUFDVCxPQUFPLEVBQUUsQ0FBQztLQUNYO0lBRUQsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQztJQUN4QixJQUFJLENBQUMsTUFBTSxFQUFFO1FBQ1gsT0FBTyxFQUFFLENBQUM7S0FDWDtJQUVELElBQUksTUFBTSxZQUFZLENBQUMsQ0FBQyxLQUFLLEVBQUU7UUFDN0IsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUseUNBQXlDLENBQUMsQ0FBQztRQUNqRSxPQUFPLENBQUMsR0FBRyxlQUFlLENBQUMsTUFBTSxDQUFDLEVBQUUsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7S0FDbkU7SUFFRCxJQUFJLE1BQU0sWUFBWSxDQUFDLENBQUMsR0FBRyxFQUFFO1FBQzNCLE9BQU8sZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQ2hDO0lBRUQsTUFBTSxJQUFJLEtBQUssQ0FBQyx1QkFBdUIsTUFBTSxFQUFFLENBQUMsQ0FBQztBQUNuRCxDQUFDIn0=