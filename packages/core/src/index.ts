import {
  CursorEditor,
  CursorState,
  CursorStateChangeEvent,
  RemoteCursorChangeEventListener,
  withCursors,
  WithCursorsOptions,
  withYHistory,
  WithYHistoryOptions,
  withYjs,
  WithYjsOptions,
  YHistoryEditor,
  YjsEditor
} from './plugins';
import { slateNodesToInsertDelta } from './utils/convert';

export {
  withYjs,
  WithYjsOptions,
  YjsEditor,
  // History plugin
  withYHistory,
  WithYHistoryOptions,
  YHistoryEditor,
  // Base cursor plugin
  CursorEditor,
  WithCursorsOptions,
  withCursors,
  CursorState,
  RemoteCursorChangeEventListener,
  CursorStateChangeEvent,
  // TODO: Export, make the exported versions delta cache independent
  // yTextToSlateElement,
  slateNodesToInsertDelta,
  // slateRangeToRelativeRange,
  // relativeRangeToSlateRange,
  // slatePointToRelativePosition,
  // relativePositionToSlatePoint,
};
