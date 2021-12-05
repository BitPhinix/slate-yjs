import { CursorEditor } from '@slate-yjs/core';
import React, { useLayoutEffect, useState } from 'react';
import { BaseRange } from 'slate';
import { ReactEditor, useSlate } from 'slate-react';
import { getSelectionRects, SelectionRect } from '../utils/selection';
import { SelectionRectComponent } from './types';

export type RemoteSelectionProps<TCursorData extends Record<string, unknown>> =
  {
    clientId: number;
    selection: BaseRange;
    data: TCursorData;

    containerRef: React.RefObject<HTMLDivElement>;
    containerBoundingRect: DOMRectReadOnly;

    SelectionRectComponent: SelectionRectComponent<TCursorData>;
  };

export function RemoteSelection<TCursorData extends Record<string, unknown>>({
  // eslint-disable-next-line @typescript-eslint/no-shadow
  SelectionRectComponent,
  clientId,
  containerRef,
  data,
  selection,
  containerBoundingRect,
}: RemoteSelectionProps<TCursorData>) {
  const [selectionRects, setSelectionRects] = useState<SelectionRect[]>([]);

  const editor = useSlate() as ReactEditor;
  if (!CursorEditor.isCursorEditor(editor)) {
    throw new Error(
      'Cannot use CursorContainer inside the context of a non-cursor editor'
    );
  }

  useLayoutEffect(() => {
    const { current: container } = containerRef;
    const state = CursorEditor.remoteCursor(editor, clientId);
    if (!container || !state?.selection) {
      return setSelectionRects([]);
    }

    // Always calculate cursor positions based on up-to-date data
    setSelectionRects(
      getSelectionRects(
        editor,
        state.selection,
        container.getBoundingClientRect()
      )
    );
  }, [
    editor.children,
    selection,
    containerBoundingRect,
    clientId,
    containerRef,
    editor,
  ]);

  return (
    <React.Fragment>
      {selectionRects.map((selectionRect, i) => (
        <SelectionRectComponent
          // Always give the caret the same key in order to be able to animate it
          key={selectionRect.isCaret ? 'caret' : i}
          clientId={clientId}
          data={data}
          {...selectionRect}
        />
      ))}
    </React.Fragment>
  );
}
