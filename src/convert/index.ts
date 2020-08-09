import _ from 'lodash';
import { Operation } from 'slate';
import * as Y from 'yjs';
import arrayEvent from './arrayEvent';
import mapEvent from './mapEvent';
import textEvent from './textEvent';

/**
 * Converts yjs events into slate operations.
 *
 * @param events
 */
export const toSlateOps = (events: Y.YEvent[]): Operation[] => {
  return _.flatten(events.map(toSlateOp));
};

/**
 * Converts a yjs event into slate operations.
 *
 * @param event
 */
export const toSlateOp = (event: Y.YEvent): Operation[] => {
  if (event instanceof Y.YArrayEvent) {
    return arrayEvent(event);
  }

  if (event instanceof Y.YMapEvent) {
    return mapEvent(event);
  }

  if (event instanceof Y.YTextEvent) {
    return textEvent(event);
  }

  throw new Error('Unsupported yjs event');
};
