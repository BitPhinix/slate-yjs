import { Operation } from 'slate';
import * as Y from 'yjs';
import arrayEvent from './arrayEvent';
import mapEvent from './mapEvent';
import textEvent from './textEvent';

/**
 * Converts a yjs event into slate operations.
 *
 * @param event
 */
export function toSlateOp(event: Y.YEvent): Operation[] {
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
}

/**
 * Converts yjs events into slate operations.
 *
 * @param events
 */
export function toSlateOps(events: Y.YEvent[]): Operation[] {
  return events.flatMap(toSlateOp);
}
