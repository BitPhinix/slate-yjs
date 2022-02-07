/** @jsx jsx */
import { Editor } from 'slate';
import { jsx } from '../../../../../support/jsx';

export const input = (
  <editor>
    <unstyled id="block1">Hello world!</unstyled>
    <ul>
      <ul-li>
        <cursor />
        Welcome to slate-yjs!
      </ul-li>
    </ul>
  </editor>
);

export const expected = (
  <editor>
    <unstyled id="block1">
      Hello world!
      <cursor />
      Welcome to slate-yjs!
    </unstyled>
  </editor>
);

export function run(editor: Editor) {
  editor.deleteBackward('character');
}
