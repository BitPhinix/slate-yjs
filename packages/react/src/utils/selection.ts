import { BaseRange, Editor, Path, Range, Text } from 'slate';
import { ReactEditor } from 'slate-react';

export type SelectionRect = {
  position: {
    width: number;
    height: number;
    top: number;
    left: number;
  };
  isCaret: boolean;
  isForward: boolean;
  isCollapsed: boolean;
};

export function getSelectionRects(
  editor: ReactEditor,
  range: BaseRange,
  containerRect: DOMRect
): SelectionRect[] {
  const [start, end] = Range.edges(range);
  const isForward = Range.isForward(range);
  const isCollapsed = Range.isCollapsed(range);
  const domRange = ReactEditor.toDOMRange(editor, range);

  const selectionRects: SelectionRect[] = [];
  const nodeIterator = Editor.nodes(editor, { at: range, match: Text.isText });

  for (const [node, path] of nodeIterator) {
    const domNode = ReactEditor.toDOMNode(editor, node);

    const isStartNode = Path.equals(path, start.path);
    const isEndNode = Path.equals(path, end.path);

    let clientRects: DOMRectList | null = null;
    if (isStartNode || isEndNode) {
      const nodeRange = document.createRange();
      nodeRange.selectNode(domNode);

      if (isStartNode) {
        nodeRange.setStart(domRange.startContainer, domRange.startOffset);
      }
      if (isEndNode) {
        nodeRange.setEnd(domRange.endContainer, domRange.endOffset);
      }

      clientRects = nodeRange.getClientRects();
    } else {
      clientRects = domNode.getClientRects();
    }

    for (let i = 0; i < clientRects.length; i++) {
      const clientRect = clientRects.item(i);
      if (!clientRect) {
        continue;
      }

      selectionRects.push({
        position: {
          width: clientRect.width,
          height: clientRect.height,
          top: clientRect.top - containerRect.top,
          left: clientRect.left - containerRect.left,
        },
        isCaret: isForward
          ? isEndNode && i === clientRects.length - 1
          : isStartNode && i === 0,
        isForward,
        isCollapsed,
      });
    }
  }

  return selectionRects;
}
