import * as Y from 'yjs';
import { InsertDelta } from '../model/types';

export function cloneInsertDeltaDeep(delta: InsertDelta): InsertDelta {
  return delta.map((element) => {
    if (typeof element.insert === 'string') {
      return element;
    }

    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return { ...element, insert: cloneDeep(element.insert) };
  });
}

export function cloneDeep(yText: Y.XmlText): Y.XmlText {
  const clone = new Y.XmlText();

  const attributes = yText.getAttributes();
  Object.entries(attributes).forEach(([key, value]) => {
    clone.setAttribute(key, value);
  });

  clone.applyDelta(cloneInsertDeltaDeep(yText.toDelta() as InsertDelta), {
    sanitize: false,
  });

  return clone;
}
