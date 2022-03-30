/** @jsx jsx */
import { Editor, Transforms } from 'slate';
import { jsx } from '../../../../../support/jsx';

export const input = (
  <editor>
    <unstyled id="myBlockId">
      <cursor />
      Hello world!
    </unstyled>
    <ul>
      <ul-li>Welcome to slate-yjs!</ul-li>
    </ul>
  </editor>
);

export const expected = (
  <editor>
    <unstyled id="myBlockId">
      <cursor />
      Hello world!
    </unstyled>
  </editor>
);

export function run(editor: Editor) {
  Transforms.removeNodes(editor, { at: [1] });
}
