/** @jsx jsx */
import { Editor } from 'slate';
import { jsx } from '../../../../../support/jsx';

export const input = (
  <editor>
    <unstyled>
      <text bold>
        Hello <cursor />!
      </text>
    </unstyled>
  </editor>
);

export const expected = (
  <editor>
    <unstyled>
      <text bold>
        Hello world
        <cursor />!
      </text>
    </unstyled>
  </editor>
);

export function run(editor: Editor) {
  editor.insertText('world');
}
