import { applySlateOp } from './applyToYjs';
import { applyYjsEvents, translateYjsEvents } from './applyToSlate';
import { withYjs, WithYjsOptions, YjsEditor } from './plugins';

export {
  // Core plugin
  withYjs,
  WithYjsOptions,
  YjsEditor,
  
  // Utility functions
  applySlateOp as applySlateOps,
  applyYjsEvents as applyYEvents,
  translateYjsEvents as translateYEvents,
};
