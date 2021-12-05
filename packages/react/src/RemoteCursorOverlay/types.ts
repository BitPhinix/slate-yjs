import { ComponentType } from 'react';
import { SelectionRect } from '../utils/selection';

export type SelectionRectComponentProps<
  TCursorData extends Record<string, unknown> = Record<string, unknown>
> = SelectionRect & {
  data: TCursorData;
  clientId: number;

  isCaret: boolean;
  isForward: boolean;
};

export type SelectionRectComponent<
  TCursorData extends Record<string, unknown> = Record<string, unknown>
> = ComponentType<SelectionRectComponentProps<TCursorData>>;
