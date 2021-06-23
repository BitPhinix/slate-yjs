import { Element, Text } from 'slate';
import * as Y from 'yjs';
import { SyncElement } from '../model';
/**
 * Converts a sync element to a slate node
 *
 * @param element
 */
export function toSlateNode(element) {
    const text = SyncElement.getText(element);
    const children = SyncElement.getChildren(element);
    const node = {};
    if (text !== undefined) {
        node.text = text.toString();
    }
    if (children !== undefined) {
        node.children = children.map(toSlateNode);
    }
    Array.from(element.entries()).forEach(([key, value]) => {
        if (key !== 'children' && key !== 'text') {
            node[key] = value;
        }
    });
    return node;
}
/**
 * Converts a SharedType to a Slate doc
 * @param doc
 */
export function toSlateDoc(doc) {
    return doc.map(toSlateNode);
}
/**
 * Converts a slate node to a sync element
 *
 * @param node
 */
export function toSyncElement(node) {
    const element = new Y.Map();
    if (Element.isElement(node)) {
        const childElements = node.children.map(toSyncElement);
        const childContainer = new Y.Array();
        childContainer.insert(0, childElements);
        element.set('children', childContainer);
    }
    if (Text.isText(node)) {
        const textElement = new Y.Text(node.text);
        element.set('text', textElement);
    }
    Object.entries(node).forEach(([key, value]) => {
        if (key !== 'children' && key !== 'text') {
            element.set(key, value);
        }
    });
    return element;
}
/**
 * Converts all elements int a Slate doc to SyncElements and adds them
 * to the SharedType
 *
 * @param sharedType
 * @param doc
 */
export function toSharedType(sharedType, doc) {
    sharedType.insert(0, doc.map(toSyncElement));
}
/**
 * Converts a SharedType path the a slate path
 *
 * @param path
 */
export function toSlatePath(path) {
    return path.filter((node) => typeof node === 'number');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udmVydC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91dGlscy9jb252ZXJ0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxPQUFPLEVBQWMsSUFBSSxFQUFFLE1BQU0sT0FBTyxDQUFDO0FBQ2xELE9BQU8sS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDO0FBQ3pCLE9BQU8sRUFBYyxXQUFXLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFbkQ7Ozs7R0FJRztBQUNILE1BQU0sVUFBVSxXQUFXLENBQUMsT0FBb0I7SUFDOUMsTUFBTSxJQUFJLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUMxQyxNQUFNLFFBQVEsR0FBRyxXQUFXLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBRWxELE1BQU0sSUFBSSxHQUFrQixFQUFFLENBQUM7SUFDL0IsSUFBSSxJQUFJLEtBQUssU0FBUyxFQUFFO1FBQ3RCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO0tBQzdCO0lBQ0QsSUFBSSxRQUFRLEtBQUssU0FBUyxFQUFFO1FBQzFCLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztLQUMzQztJQUVELEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEVBQUUsRUFBRTtRQUNyRCxJQUFJLEdBQUcsS0FBSyxVQUFVLElBQUksR0FBRyxLQUFLLE1BQU0sRUFBRTtZQUN4QyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDO1NBQ25CO0lBQ0gsQ0FBQyxDQUFDLENBQUM7SUFFSCxPQUFPLElBQVksQ0FBQztBQUN0QixDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsTUFBTSxVQUFVLFVBQVUsQ0FBQyxHQUFlO0lBQ3hDLE9BQU8sR0FBRyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUM5QixDQUFDO0FBRUQ7Ozs7R0FJRztBQUNILE1BQU0sVUFBVSxhQUFhLENBQUMsSUFBVTtJQUN0QyxNQUFNLE9BQU8sR0FBZ0IsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7SUFFekMsSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQzNCLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ3ZELE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3JDLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQ3hDLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLGNBQWMsQ0FBQyxDQUFDO0tBQ3pDO0lBRUQsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQ3JCLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDMUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUM7S0FDbEM7SUFFRCxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxFQUFFLEVBQUU7UUFDNUMsSUFBSSxHQUFHLEtBQUssVUFBVSxJQUFJLEdBQUcsS0FBSyxNQUFNLEVBQUU7WUFDeEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7U0FDekI7SUFDSCxDQUFDLENBQUMsQ0FBQztJQUVILE9BQU8sT0FBTyxDQUFDO0FBQ2pCLENBQUM7QUFFRDs7Ozs7O0dBTUc7QUFDSCxNQUFNLFVBQVUsWUFBWSxDQUFDLFVBQXNCLEVBQUUsR0FBVztJQUM5RCxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7QUFDL0MsQ0FBQztBQUVEOzs7O0dBSUc7QUFDSCxNQUFNLFVBQVUsV0FBVyxDQUFDLElBQXlCO0lBQ25ELE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsT0FBTyxJQUFJLEtBQUssUUFBUSxDQUFTLENBQUM7QUFDakUsQ0FBQyJ9