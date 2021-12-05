import {
  CursorEditor,
  CursorState,
  CursorStateChangeEvent,
} from '@slate-yjs/core';
import React, {
  PropsWithChildren,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useSlate } from 'slate-react';
import { throttleAnimationFrame } from '../utils/throttle';
import { RemoteSelection } from './RemoteSelection';
import { SelectionRectComponent } from './types';

export type RemoteCursorOverlayProps<
  TCursorData extends Record<string, unknown> = Record<string, unknown>
> = PropsWithChildren<{
  style?: React.CSSProperties;
  className?: string;

  SelectionRectComponent: SelectionRectComponent<TCursorData>;
}>;

export function RemoteCursorOverlay<
  TCursorData extends Record<string, unknown> = Record<string, unknown>
>({
  children,
  SelectionRectComponent,
  className,
  style,
}: RemoteCursorOverlayProps<TCursorData>) {
  const editor = useSlate();

  if (!CursorEditor.isCursorEditor(editor)) {
    throw new Error(
      'Cannot use RemoteCursorOverlay outside the context of a cursor editor'
    );
  }

  const [cursors, setCursors] = useState<
    Record<string, CursorState<TCursorData>>
  >({});

  useEffect(() => {
    const updateCursors = ({
      added,
      removed,
      updated,
    }: CursorStateChangeEvent) => {
      setCursors((state) => {
        const changeKeys = [...added, ...updated, ...removed];

        const updatedStates = Object.fromEntries(
          changeKeys.map(
            (id) => [id, CursorEditor.remoteCursor(editor, id)] as const
          )
        );

        return Object.fromEntries(
          Object.entries({ ...state, ...updatedStates }).filter(
            ([, value]) => value !== null
          )
        ) as Record<string, CursorState<TCursorData>>;
      });
    };

    CursorEditor.on(editor, 'change', updateCursors);
    return () => CursorEditor.off(editor, 'change', updateCursors);
  }, [editor]);

  // The only real reason we store the bounding rect to force a re-render when
  // resizing the container
  const [containerBoundingRect, setContainerBoundingRect] =
    useState<DOMRectReadOnly | null>(null);
  const updateContainerRect = useMemo(
    () =>
      throttleAnimationFrame(() => {
        setContainerBoundingRect(
          containerRef.current?.getBoundingClientRect() ?? null
        );
      }),
    []
  );

  const resizeObserver = useMemo(
    () => new ResizeObserver(updateContainerRect),
    []
  );

  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const { current: container } = containerRef;

    if (!container) {
      return;
    }

    resizeObserver.observe(container);
    return () => {
      resizeObserver.unobserve(container);
      updateContainerRect.cancel();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', ...style }}
      className={className}
    >
      {children}
      {Object.entries(cursors).map(([clientId, { data, selection }]) => {
        if (!containerBoundingRect || !selection) {
          return;
        }

        const parsedClientId = parseInt(clientId, 10);
        if (isNaN(parsedClientId)) {
          throw new Error('Encountered non-numeric client id');
        }

        return (
          <RemoteSelection
            key={clientId}
            data={data}
            clientId={parsedClientId}
            selection={selection}
            containerBoundingRect={containerBoundingRect}
            SelectionRectComponent={SelectionRectComponent}
            containerRef={containerRef}
          />
        );
      })}
    </div>
  );
}
