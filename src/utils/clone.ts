import * as Y from 'yjs';
import { SyncElement } from '../model';

export default function cloneSyncElement(element: SyncElement): SyncElement {
  const text = SyncElement.getText(element);
  const children = SyncElement.getChildren(element);

  const clone = new Y.Map();

  if (text !== undefined) {
    const textElement = new Y.Text(text.toString());
    clone.set('text', textElement);
  }

  if (children !== undefined) {
    const childElements = children.map(cloneSyncElement);
    const childContainer = new Y.Array();
    childContainer.insert(0, childElements);
    clone.set('children', childContainer);
  }

  Array.from(element.entries()).forEach(([key, value]) => {
    if (key !== 'children' && key !== 'text') {
      clone.set(key, value);
    }
  });

  return clone;
}
