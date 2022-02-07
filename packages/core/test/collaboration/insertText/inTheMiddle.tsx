/** @jsx jsx */
import { Editor } from 'slate';
import { jsx } from '../../../../../support/jsx';

export const input = (
  <editor>
    <unstyled>
      Hello <cursor />!
    </unstyled>
  </editor>
);

export const expected = (
  <editor>
    <unstyled>
      Hello world
      <cursor />!
    </unstyled>
  </editor>
);

export const inputRemoteEditor = (
  <editor>
    <unstyled>
      Hello !<cursor />
    </unstyled>
  </editor>
);

export function run(editor: Editor) {
  editor.insertText('world');
}
