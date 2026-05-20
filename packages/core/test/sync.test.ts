/* eslint-disable import/no-extraneous-dependencies */
import { createEditor } from 'slate';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import * as Y from 'yjs';
import { withYjs, YjsEditor, slateNodesToInsertDelta } from '../src';
import { reportSyncSkew, resyncFromYjs } from '../src/utils/sync';

const wait = (ms = 0) => new Promise<void>((r) => setTimeout(r, ms));

describe('utils/sync', () => {
  beforeEach(() => {
    // reset the module-level reporting throttle between tests
    reportSyncSkew(undefined, new Error('warmup reset'), {
      direction: 'applyToYjs',
    });
  });

  it('reportSyncSkew calls the hook and console.warn, throttled within the window', () => {
    const hook = vi.fn();
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const err = new Error(
      "Path doesn't match yText, yTarget spans multiple nodes"
    );

    // First call after warmup is throttled out; advance time to allow one through.
    vi.useFakeTimers();
    vi.advanceTimersByTime(2000);
    reportSyncSkew(hook, err, { direction: 'applyToYjs' });
    reportSyncSkew(hook, err, { direction: 'applyToYjs' }); // within window -> throttled

    expect(hook).toHaveBeenCalledTimes(1);
    expect(hook).toHaveBeenCalledWith(err, { direction: 'applyToYjs' });
    expect(warn).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
    warn.mockRestore();
  });

  it('resyncFromYjs rebuilds editor.children from the shared root', async () => {
    const doc = new Y.Doc();
    const sharedRoot = doc.get('content', Y.XmlText) as Y.XmlText;
    sharedRoot.applyDelta(
      slateNodesToInsertDelta([
        { type: 'paragraph', children: [{ text: 'one' }] },
        { type: 'paragraph', children: [{ text: 'two' }] },
      ])
    );
    const editor = withYjs(createEditor(), sharedRoot);
    YjsEditor.connect(editor);
    await wait(20);

    // Corrupt local Slate, then resync from Y.
    editor.children = [
      { type: 'paragraph', children: [{ text: 'corrupt' }] },
    ] as never;
    resyncFromYjs(sharedRoot, editor);

    expect(editor.children.length).toBe(2);
    expect(
      (editor.children[1] as never as { children: { text: string }[] })
        .children[0].text
    ).toBe('two');
    YjsEditor.disconnect(editor);
  });
});
