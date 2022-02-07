/** @jsx jsx */
import { Editor, Transforms } from 'slate';
import { jsx } from '../../../../../support/jsx';

export const input = (
  <editor>
    <unstyled>
      <cursor />
      Hello world!
    </unstyled>
    <unstyled id="myBlockId">Welcome to slate-yjs!</unstyled>
  </editor>
);

export const expected = (
  <editor>
    <unstyled>
      <cursor />
      Hello world!
    </unstyled>
  </editor>
);

export function run(editor: Editor) {
  Transforms.removeNodes(editor, { at: [1] });
}
