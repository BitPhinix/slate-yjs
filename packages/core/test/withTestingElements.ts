import { Editor, Element, Transforms } from 'slate';
import * as Y from 'yjs';
import { wait } from '../../../support/utils';
import { slateNodesToInsertDelta, withYjs } from '../src';

const INLINE_ELEMENTS = ['note-link', 'link'];

export async function withTestingElements(
  editor: Editor,
  doc: Y.Doc = new Y.Doc()
) {
  const { normalizeNode, isInline } = editor;

  // normalizations needed for nested tests
  editor.normalizeNode = (entry) => {
    const [node, path] = entry;

    // remove empty list
    if (
      Element.isElement(node) &&
      !Editor.isEditor(node) &&
      node.type === 'unordered-list'
    ) {
      if (!node.children.length) {
        return Transforms.removeNodes(editor, { at: path });
      }
    }

    normalizeNode(entry);
  };

  editor.isInline = (element) =>
    INLINE_ELEMENTS.includes(element.type as string) || isInline(element);

  const sharedType = doc.get('sharedRoot', Y.XmlText) as Y.XmlText;
  if (sharedType.toDelta().length === 0) {
    sharedType.applyDelta(slateNodesToInsertDelta(editor.children));
  }

  const e = withYjs(editor, sharedType, { autoConnect: true });

  // Wait for editor to be initialized
  await wait();

  return e;
}
