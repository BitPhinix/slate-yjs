/* eslint-disable import/no-extraneous-dependencies */
import { createEditor, Descendant } from 'slate';
import { describe, expect, it, vi } from 'vitest';
import * as Y from 'yjs';
import { withYjs, YjsEditor, slateNodesToInsertDelta } from '../src';
import { reportSyncSkew, resyncFromYjs } from '../src/utils/sync';

const wait = (ms = 0) => new Promise<void>((r) => setTimeout(r, ms));

describe('utils/sync', () => {
  it('reportSyncSkew calls the hook and console.warn once per throttle window', () => {
    vi.useFakeTimers();
    // A timestamp far beyond any real Date.now() previously stored in the
    // module-level throttle, so the first call is always allowed through.
    const base = 1e15;
    vi.setSystemTime(base);

    const hook = vi.fn();
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const err = new Error(
      "Path doesn't match yText, yTarget spans multiple nodes"
    );

    reportSyncSkew(hook, err, { direction: 'applyToYjs' }); // allowed
    reportSyncSkew(hook, err, { direction: 'applyToYjs' }); // within window -> throttled
    expect(hook).toHaveBeenCalledTimes(1);
    expect(hook).toHaveBeenCalledWith(err, { direction: 'applyToYjs' });
    expect(warn).toHaveBeenCalledTimes(1);

    // Past the window -> allowed again.
    vi.setSystemTime(base + 2000);
    reportSyncSkew(hook, err, { direction: 'applyToYjs' });
    expect(hook).toHaveBeenCalledTimes(2);

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
    ] as unknown as Descendant[];
    resyncFromYjs(sharedRoot, editor);

    expect(editor.children.length).toBe(2);
    expect(
      (editor.children[1] as unknown as { children: { text: string }[] })
        .children[0].text
    ).toBe('two');
    YjsEditor.disconnect(editor);
  });
});
