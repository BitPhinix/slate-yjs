/** @jsx jsx */
import { Editor } from 'slate';
import { jsx } from '../../../../../support/jsx';

export const input = (
  <editor>
    <unstyled>Hello world!</unstyled>
    <unstyled>
      Welcome to slate-yjs!
      <cursor />
    </unstyled>
  </editor>
);

export const expected = (
  <editor>
    <unstyled>Hello world!</unstyled>
    <unstyled>Welcome to slate-yjs!</unstyled>
    <h1>
      Foo bar!
      <cursor />
    </h1>
  </editor>
);

export function run(editor: Editor) {
  editor.insertNode(<h1>Foo bar!</h1>);
}
