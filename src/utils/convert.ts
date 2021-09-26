import { Element, Node, Text } from 'slate';
import Y from 'yjs';
import { InsertDelta } from '../model/types';
import { getMarks } from './slate';

export function toInsertNodesDelta(nodes: Node[]): InsertDelta {
  return nodes.map((node) => {
    if (Text.isText(node)) {
      return { insert: node.text, attributes: getMarks(node) };
    }

    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return { insert: fromSlateElement(node) };
  });
}

export function fromSlateElement({
  children,
  ...attributes
}: Element): Y.XmlText {
  const yElement = new Y.XmlText();

  Object.entries(attributes).forEach(([key, value]) => {
    yElement.setAttribute(key, value);
  });

  yElement.applyDelta(toInsertNodesDelta(children), { sanitize: false });
  return yElement;
}
