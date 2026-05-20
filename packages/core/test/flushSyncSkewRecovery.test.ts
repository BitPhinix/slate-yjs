/* eslint-disable import/no-extraneous-dependencies */
import { createEditor } from 'slate';
import { describe, expect, it, vi } from 'vitest';
import * as Y from 'yjs';
import { withYjs } from '../src';

describe('flush-path sync-skew recovery', () => {
  it('stores the onSyncSkew option on the editor', () => {
    const doc = new Y.Doc();
    const sharedRoot = doc.get('content', Y.XmlText) as Y.XmlText;
    const onSyncSkew = vi.fn();
    const editor = withYjs(createEditor(), sharedRoot, { onSyncSkew });
    expect(editor.onSyncSkew).toBe(onSyncSkew);
  });
});
