import { Editor, Transforms } from 'slate';

export function withNormalize(editor: Editor) {
  const { normalizeNode } = editor;

  // Ensure editor always has at least one child.
  editor.normalizeNode = (entry) => {
    const [node] = entry;
    if (!Editor.isEditor(node) || node.children.length > 0) {
      return normalizeNode(entry);
    }

    Transforms.insertNodes(
      editor,
      {
        type: 'paragraph',
        children: [{ text: '' }],
      },
      { at: [0] }
    );
  };

  return editor;
}
