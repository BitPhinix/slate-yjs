/* eslint-disable react/void-dom-elements-no-children */
/** @jsx jsx */
import { Editor, Transforms } from 'slate';
import { jsx } from '../../../../../support/jsx';

export const input = (
  <editor>
    <unstyled id="block1">
      slate-yjs
      <cursor />
      slate-yjs
      <link url="https://slate-yjs.dev">slate-yjs</link>
      <link url="https://slate-yjs.dev">slate-yjs</link>
    </unstyled>
  </editor>
);

export const expected = (
  <editor>
    <unstyled id="block1">slate-yjs</unstyled>
    <unstyled id="block1">
      <cursor />
      slate-yjs
      <link url="https://slate-yjs.dev">slate-yjs</link>
      <link url="https://slate-yjs.dev">slate-yjs</link>
    </unstyled>
  </editor>
);

export function run(editor: Editor) {
  Transforms.splitNodes(editor, { always: true });
}
