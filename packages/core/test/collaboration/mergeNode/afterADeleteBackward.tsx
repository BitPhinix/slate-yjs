/** @jsx jsx */
import { Editor } from 'slate';
import { jsx } from '../../../../../support/jsx';

export const input = (
  <editor>
    <unstyled>Hello world!</unstyled>
    <unstyled>
      <cursor />
      Welcome to slate-yjs!
    </unstyled>
  </editor>
);

export const expected = (
  <editor>
    <unstyled>
      Hello world!
      <cursor />
      Welcome to slate-yjs!
    </unstyled>
  </editor>
);

export function run(editor: Editor) {
  editor.deleteBackward('character');
}
