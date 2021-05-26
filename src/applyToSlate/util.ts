import { Editor } from 'slate';

export const withoutSelectionMod = (editor: Editor, cb: () => any): void => {
  const { apply } = editor;
  // eslint-disable-next-line no-param-reassign
  editor.apply = (op) => {
    if (op.type === 'set_selection') return;

    apply(op);
  };
  cb();

  // eslint-disable-next-line no-param-reassign
  editor.apply = apply;
};

export const withoutNormalizingAndSelectionMod = (
  editor: Editor,
  cb: () => any
): void => {
  Editor.withoutNormalizing(editor, () => {
    withoutSelectionMod(editor, () => {
      cb();
    });
  });
};
