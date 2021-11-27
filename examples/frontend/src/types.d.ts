import { YHistoryEditor, YjsEditor } from '@slate-yjs/core';
import { Descendant } from 'slate';
import { ReactEditor } from 'slate-react';

export type CustomText = {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  text: string;
};

export type Paragraph = {
  type: 'paragraph';
  children: Descendant[];
};

export type InlineCode = {
  type: 'inline-code';
  children: Descendant[];
};

export type HeadingOne = {
  type: 'heading-one';
  children: Descendant[];
};

export type HeadingTwo = {
  type: 'heading-two';
  children: Descendant[];
};

export type BlockQuote = {
  type: 'block-quote';
  children: Descendant[];
};

export type CustomElement =
  | Paragraph
  | InlineCode
  | HeadingOne
  | HeadingTwo
  | BlockQuote;

export type CustomEditor = ReactEditor & YjsEditor & YHistoryEditor;

declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}
