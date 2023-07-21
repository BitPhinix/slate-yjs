/** @jsx jsx */
import { Editor } from 'slate';
import { jsx } from '../../../../support/jsx';
import { YjsEditor, yTextToSlateElement } from '../../src';

export const input = (
  <editor>
    <unstyled>
      <text bold />
    </unstyled>
  </editor>
);

export const expected = {
  children: [
    <unstyled>
      <text bold />
    </unstyled>,
  ],
};

export function run(editor: Editor) {
  const isYJSEditor = YjsEditor.isYjsEditor(editor);
  if (!isYJSEditor) return;

  return yTextToSlateElement(editor.sharedRoot);
}
