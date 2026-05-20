import { RelativeRange } from './model/types';
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
  YjsEditor,
} from './plugins';
import { slateNodesToInsertDelta, yTextToSlateElement } from './utils/convert';
import {
  relativePositionToSlatePoint,
  relativeRangeToSlateRange,
  slatePointToRelativePosition,
  slateRangeToRelativeRange,
} from './utils/position';
import { OnSyncSkew, SyncSkewContext, SyncSkewDirection } from './utils/sync';

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
  // Utils
  RelativeRange,
  yTextToSlateElement,
  slateNodesToInsertDelta,
  slateRangeToRelativeRange,
  relativeRangeToSlateRange,
  slatePointToRelativePosition,
  relativePositionToSlatePoint,
  // Sync skew
  OnSyncSkew,
  SyncSkewContext,
  SyncSkewDirection,
};
