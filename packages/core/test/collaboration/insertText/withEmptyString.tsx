/** @jsx jsx */
import { Editor } from 'slate';
import { jsx } from '../../../../../support/jsx';

export const input = (
  <editor>
    <unstyled>
      Hello world!
      <cursor />
    </unstyled>
  </editor>
);

export const expected = input;

export function run(editor: Editor) {
  editor.insertText('');
}
