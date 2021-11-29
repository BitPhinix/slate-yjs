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
  withYjs,
  WithYjsOptions,
  YjsEditor,
  // History plugin
  withYHistory,
  WithYHistoryOptions,
  YHistoryEditor,
  // Utility functions
  yTextToSlateElement,
  slateNodesToInsertDelta,
};
