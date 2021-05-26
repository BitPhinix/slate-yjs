import { Editor, Transforms } from 'slate';

export const withoutSelectionMod = (editor: Editor, cb: () => any): void => {
  const { selection } = editor;
  cb();
  if (selection) Transforms.select(editor, selection);
  else Transforms.deselect(editor);
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
