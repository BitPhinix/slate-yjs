/**
 * Very crude markdown shortcuts plugin - you can totally ignore this file, it has
 * nothing to do with slate-yjs itself
 */

import { Editor, Element, Point, Range, Text, Transforms } from 'slate';

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function inlineRegex(trigger: string) {
  const escaped = escapeRegExp(trigger);
  return new RegExp(`(${escaped}).+?(${escaped})$`);
}

function blockRegex(trigger: string): RegExp {
  const escaped = escapeRegExp(trigger);
  return new RegExp(`^(${escaped})$`);
}

function createSetBlockApply(type: Element['type']) {
  return (editor: Editor, range: Range) => {
    Transforms.setNodes(
      editor,
      { type },
      {
        match: (n) => Editor.isBlock(editor, n),
        at: range,
      }
    );
  };
}

function createSetInlineApply(type: Element['type']) {
  return (editor: Editor, range: Range) => {
    const rangeRef = Editor.rangeRef(editor, range);

    Transforms.unwrapNodes(editor, {
      at: range,
      match: (n) => Editor.isInline(editor, n),
      mode: 'all',
      split: true,
    });

    if (rangeRef.current) {
      Transforms.insertNodes(
        editor,
        { text: ' ' },
        {
          match: Text.isText,
          at: Range.end(rangeRef.current),
          select: true,
        }
      );
    }

    const targetRange = rangeRef.unref();
    if (targetRange) {
      Transforms.wrapNodes(
        editor,
        { type, children: [] },
        {
          at: targetRange,
          split: true,
        }
      );
    }
  };
}

function createSetMarkApply(key: Exclude<keyof Text, 'text'>) {
  return (editor: Editor, range: Range) => {
    Transforms.insertNodes(
      editor,
      { text: ' ' },
      {
        match: Text.isText,
        at: Range.end(range),
        select: true,
      }
    );
    Transforms.setNodes(
      editor,
      { [key]: true },
      {
        match: Text.isText,
        at: range,
        split: true,
      }
    );
  };
}

const SHORTCUTS = [
  { trigger: blockRegex('#'), apply: createSetBlockApply('heading-one') },
  { trigger: blockRegex('##'), apply: createSetBlockApply('heading-two') },
  { trigger: blockRegex('>'), apply: createSetBlockApply('block-quote') },
  { trigger: inlineRegex('`'), apply: createSetInlineApply('inline-code') },
  { trigger: inlineRegex('**'), apply: createSetMarkApply('bold') },
  { trigger: inlineRegex('__'), apply: createSetMarkApply('bold') },
  { trigger: inlineRegex('*'), apply: createSetMarkApply('italic') },
  { trigger: inlineRegex('_'), apply: createSetMarkApply('italic') },
  { trigger: inlineRegex('~~'), apply: createSetMarkApply('strikethrough') },
];

function before(
  editor: Editor,
  at: Point,
  stringOffset: number
): Point | undefined {
  if (at.offset >= stringOffset) {
    return { offset: at.offset - stringOffset, path: at.path };
  }

  const entry = Editor.previous(editor, { at: at.path, match: Text.isText });
  if (!entry) {
    return undefined;
  }

  const [node, path] = entry;
  return before(
    editor,
    { offset: node.text.length, path },
    stringOffset - at.offset
  );
}

export function withMarkdown(editor: Editor) {
  const { deleteBackward, insertText, isInline } = editor;

  editor.insertText = (insert) => {
    const { selection } = editor;

    if (insert !== ' ' || !selection || !Range.isCollapsed(selection)) {
      return insertText(insert);
    }

    const { anchor } = selection;
    const block = Editor.above(editor, {
      match: (n) => Editor.isBlock(editor, n),
    });
    const path = block ? block[1] : [];
    const blockRange = { anchor, focus: Editor.start(editor, path) };
    const beforeText = Editor.string(editor, blockRange);

    for (const { trigger, apply } of SHORTCUTS) {
      const match = trigger.exec(beforeText);
      if (!match) {
        continue;
      }

      const [text, startText, endText] = match;
      Editor.withoutNormalizing(editor, () => {
        const matchEnd = anchor;
        const endMatchStart =
          endText && before(editor, matchEnd, endText.length);
        const startMatchEnd =
          startText && before(editor, matchEnd, text.length - startText.length);
        const matchStart = before(editor, matchEnd, text.length);

        if (!matchEnd || !matchStart) {
          return;
        }

        const matchRangeRef = Editor.rangeRef(editor, {
          anchor: matchStart,
          focus: matchEnd,
        });

        if (endMatchStart) {
          Transforms.delete(editor, {
            at: { anchor: endMatchStart, focus: matchEnd },
          });
        }
        if (startMatchEnd) {
          Transforms.delete(editor, {
            at: { anchor: matchStart, focus: startMatchEnd },
          });
        }

        const applyRange = matchRangeRef.unref();
        if (applyRange) {
          apply(editor, applyRange);
        }
      });

      return;
    }

    insertText(insert);
  };

  editor.insertBreak = () => {
    const { selection } = editor;

    if (selection) {
      const block = Editor.above(editor, {
        match: (n) => Editor.isBlock(editor, n),
      });
      const path = block ? block[1] : [];
      const end = Editor.end(editor, path);
      const wasSelectionAtEnd = Point.equals(end, Range.end(selection));

      Transforms.splitNodes(editor, { always: true });

      if (wasSelectionAtEnd) {
        Transforms.unwrapNodes(editor, {
          match: (n) => Editor.isInline(editor, n),
          mode: 'all',
        });
        Transforms.setNodes(
          editor,
          { type: 'paragraph' },
          { match: (n) => Editor.isBlock(editor, n) }
        );
        const marks = Editor.marks(editor) ?? {};
        Transforms.unsetNodes(editor, Object.keys(marks), {
          match: Text.isText,
        });
      }
    }
  };

  editor.deleteBackward = (...args) => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const match = Editor.above(editor, {
        match: (n) => Editor.isBlock(editor, n),
      });

      if (match) {
        const [block, path] = match;
        const start = Editor.start(editor, path);

        if (
          !Editor.isEditor(block) &&
          Element.isElement(block) &&
          block.type !== 'paragraph' &&
          Point.equals(selection.anchor, start)
        ) {
          const newProperties: Partial<Element> = {
            type: 'paragraph',
          };
          Transforms.setNodes(editor, newProperties);
          return;
        }
      }

      deleteBackward(...args);
    }
  };

  editor.isInline = (n) =>
    (Element.isElement(n) && n.type === 'inline-code') || isInline(n);

  return editor;
}
