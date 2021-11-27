import { translateYjsEvent } from './applyToSlate';
import { applySlateOp } from './applyToYjs';
import {
  withYHistory,
  WithYHistoryOptions,
  withYjs,
  WithYjsOptions,
  YHistoryEditor,
  YjsEditor,
} from './plugins';
import { slateNodesToInsertDelta, yTextToSlateElement } from './utils/convert';

export {
  // Core binding
  withYjs,
  WithYjsOptions,
  YjsEditor,
  // History plugin
  withYHistory,
  WithYHistoryOptions,
  YHistoryEditor,
  // Utility functions
  applySlateOp,
  translateYjsEvent,
  yTextToSlateElement,
  slateNodesToInsertDelta,
};
