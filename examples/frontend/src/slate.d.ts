import { RemoteCursorDecoratedRange } from '@slate-yjs/react';
import { BaseRange } from 'slate';
import { CursorData } from './types';

declare module 'slate' {
  interface CustomTypes {
    Range: BaseRange | RemoteCursorDecoratedRange<CursorData>;
  }
}
