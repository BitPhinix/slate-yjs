/* eslint-disable import/no-extraneous-dependencies */
import { createEditor } from 'slate';
import { describe, expect, it, vi } from 'vitest';
import * as Y from 'yjs';
import { withYjs, YjsEditor, slateNodesToInsertDelta } from '../src';

const wait = (ms = 0) => new Promise<void>((r) => setTimeout(r, ms));

describe('flush-path sync-skew recovery', () => {
  it('stores the onSyncSkew option on the editor', () => {
    const doc = new Y.Doc();
    const sharedRoot = doc.get('content', Y.XmlText) as Y.XmlText;
    const onSyncSkew = vi.fn();
    const editor = withYjs(createEditor(), sharedRoot, { onSyncSkew });
    expect(editor.onSyncSkew).toBe(onSyncSkew);
  });

  it('recovers from "yTarget spans multiple nodes" thrown during local flush', async () => {
    const doc = new Y.Doc();
    const sharedRoot = doc.get('content', Y.XmlText) as Y.XmlText;

    // Seed Y with a paragraph whose children are: text "A", an inline link,
    // and a trailing empty text (already-normalized inline form, so connect's
    // normalize is a no-op and does not mutate Y).
    sharedRoot.applyDelta(
      slateNodesToInsertDelta([
        {
          type: 'paragraph',
          children: [
            { text: 'A' },
            { type: 'link', children: [{ text: 'B' }] },
            { text: '' },
          ],
        },
      ] as never)
    );

    const onSyncSkew = vi.fn();
    const editor = withYjs(createEditor(), sharedRoot, { onSyncSkew });
    editor.isInline = (el) => (el as { type?: string }).type === 'link';
    YjsEditor.connect(editor);
    await wait(20);
    expect(editor.children.length).toBe(1);

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Corrupt local Slate: collapse the paragraph into a single text node of
    // length 2. Y still has text(1) + link(1) + text(0). A local op inside that
    // text node now slices [0,2) across the text+link boundary in Y on flush ->
    // getYTarget throws "yTarget spans multiple nodes".
    editor.children = [
      { type: 'paragraph', children: [{ text: 'AB' }] },
    ] as never;
    editor.apply({ type: 'insert_text', path: [0, 0], offset: 1, text: 'x' });
    editor.onChange();
    await wait(20);

    // With the fix: no uncaught throw, the editor resynced to Y, hook fired once.
    expect(onSyncSkew).toHaveBeenCalledTimes(1);
    expect(onSyncSkew.mock.calls[0][1]).toEqual({ direction: 'applyToYjs' });

    // The editor resynced to Y's content: 1 paragraph whose text + link survived.
    expect(editor.children.length).toBe(1);
    const para = editor.children[0] as unknown as {
      children: {
        type?: string;
        text?: string;
        children?: { text: string }[];
      }[];
    };
    expect(para.children.some((c) => c.text === 'A')).toBe(true);
    const link = para.children.find((c) => c.type === 'link');
    expect(link).toBeDefined();
    expect(link?.children?.[0].text).toBe('B');

    warn.mockRestore();
    YjsEditor.disconnect(editor);
  });

  it('rethrows non-sync-skew errors from flush instead of swallowing them', async () => {
    const doc = new Y.Doc();
    const sharedRoot = doc.get('content', Y.XmlText) as Y.XmlText;
    sharedRoot.applyDelta(
      slateNodesToInsertDelta([
        { type: 'paragraph', children: [{ text: 'hi' }] },
      ])
    );
    const editor = withYjs(createEditor(), sharedRoot);
    YjsEditor.connect(editor);
    await wait(20);

    // Force a NON-sync-skew failure inside the flush by making the Yjs
    // transaction throw an unrelated error. flushLocalChanges must rethrow it.
    const boom = new Error('totally unrelated failure');
    const spy = vi
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      .spyOn(sharedRoot.doc!, 'transact')
      .mockImplementation((() => {
        throw boom;
      }) as never);

    editor.apply({ type: 'insert_text', path: [0, 0], offset: 0, text: 'x' });
    expect(() => editor.flushLocalChanges()).toThrow(
      'totally unrelated failure'
    );

    spy.mockRestore();
    YjsEditor.disconnect(editor);
  });

  it('throttles reporting but still resyncs on every flush skew', async () => {
    const doc = new Y.Doc();
    const sharedRoot = doc.get('content', Y.XmlText) as Y.XmlText;
    sharedRoot.applyDelta(
      slateNodesToInsertDelta([
        {
          type: 'paragraph',
          children: [
            { text: 'A' },
            { type: 'link', children: [{ text: 'B' }] },
            { text: '' },
          ],
        },
      ] as never)
    );
    const onSyncSkew = vi.fn();
    const editor = withYjs(createEditor(), sharedRoot, { onSyncSkew });
    editor.isInline = (el) => (el as { type?: string }).type === 'link';
    YjsEditor.connect(editor);
    await wait(20);
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const skewOnce = () => {
      editor.children = [
        { type: 'paragraph', children: [{ text: 'AB' }] },
      ] as never;
      editor.apply({ type: 'insert_text', path: [0, 0], offset: 1, text: 'x' });
      editor.flushLocalChanges();
    };

    skewOnce();
    skewOnce(); // within the ~1s reporting window

    // Reporting is throttled (module-level), so at most one report in the window.
    expect(onSyncSkew.mock.calls.length).toBeLessThanOrEqual(1);
    // But the editor recovered to a consistent state both times (link survived).
    const para = editor.children[0] as unknown as {
      children: { type?: string; children?: { text: string }[] }[];
    };
    const link = para.children.find((c) => c.type === 'link');
    expect(link).toBeDefined();
    expect(link?.children?.[0].text).toBe('B');

    warn.mockRestore();
    YjsEditor.disconnect(editor);
  });
});
