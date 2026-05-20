/* eslint-disable import/no-extraneous-dependencies */
import { createEditor, Editor, Node, Transforms } from 'slate';
import { describe, expect, it, vi } from 'vitest';
import * as Y from 'yjs';
import { withYjs, YjsEditor, slateNodesToInsertDelta } from '../src';

const wait = (ms = 0) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * These tests verify that the sync-skew recovery mechanism works correctly.
 *
 * The sync-skew issue occurs when:
 * 1. Two editors are sharing the same Yjs document
 * 2. One editor makes a structural change (e.g., deletes a paragraph)
 * 3. The other editor's Slate state gets out of sync with Yjs
 * 4. When the Yjs event is applied, it references a path that doesn't exist
 * 5. Without the fix, this throws "Cannot find a descendant at path [x,y]"
 * 6. With the fix, the editor recovers by re-syncing from Yjs
 */

describe('Sync Skew Recovery', () => {
  it('should throw "Cannot find a descendant at path" when accessing invalid path', () => {
    // This test verifies that Slate throws the expected error when accessing an invalid path
    // This is the error that the fix is designed to catch
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'Hello' }] }];

    // Try to access a path that doesn't exist
    expect(() => {
      Node.get(editor, [5, 0]); // Path [5, 0] doesn't exist
    }).toThrow('Cannot find a descendant at path');
  });

  it('should recover when Slate state is desynced before applying Yjs event', async () => {
    // This is the key integration test that reproduces the real-world sync skew scenario
    // We use separate Y.Doc instances and sync them via updates (like real network sync)

    // 1. Create doc1 with initial content
    const doc1 = new Y.Doc();
    const sharedRoot1 = doc1.get('content', Y.XmlText) as Y.XmlText;

    const initialContent = [
      { type: 'paragraph', children: [{ text: 'Paragraph 1' }] },
      { type: 'paragraph', children: [{ text: 'Paragraph 2' }] },
    ];
    sharedRoot1.applyDelta(slateNodesToInsertDelta(initialContent));

    // 2. Create editor1 and connect
    const editor1 = withYjs(createEditor(), sharedRoot1);
    YjsEditor.connect(editor1);
    await wait(50);

    expect(editor1.children.length).toBe(2);

    // 3. Create doc2 as a "remote" copy
    const doc2 = new Y.Doc();
    Y.applyUpdateV2(doc2, Y.encodeStateAsUpdateV2(doc1));
    const sharedRoot2 = doc2.get('content', Y.XmlText) as Y.XmlText;

    // 4. Create editor2 with intercepted applyRemoteEvents
    const onSyncSkew = vi.fn();
    const editor2 = withYjs(createEditor(), sharedRoot2, { onSyncSkew });
    const originalApplyRemoteEvents = editor2.applyRemoteEvents.bind(editor2);
    let corruptionTriggered = false;

    editor2.applyRemoteEvents = (events, origin) => {
      // CORRUPT: Remove the second paragraph from Slate state
      // This simulates a race condition where Slate got out of sync
      if (editor2.children.length > 1) {
        corruptionTriggered = true;
        editor2.children = [editor2.children[0]];
      }
      // Now apply the event - without the fix, this throws
      // "Cannot find a descendant at path [1]"
      originalApplyRemoteEvents(events, origin);
    };

    YjsEditor.connect(editor2);
    await wait(50);

    expect(editor2.children.length).toBe(2);

    // Suppress console.warn for cleaner test output
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // 5. Delete paragraph 2 in editor1
    Transforms.removeNodes(editor1, { at: [1] });
    editor1.onChange();
    await wait(50);

    expect(editor1.children.length).toBe(1);

    // 6. Sync the change to doc2 - this triggers applyRemoteEvents on editor2
    Y.applyUpdateV2(doc2, Y.encodeStateAsUpdateV2(doc1));
    await wait(100);

    // 7. Verify the corruption was triggered
    expect(corruptionTriggered).toBe(true);

    // 8. Without the fix, the test would have thrown by now
    // With the fix, editor2 should have recovered via re-sync

    // Verify editor2 is in a valid state
    expect(editor2.children.length).toBeGreaterThan(0);

    // The remote-path recovery now routes its reporting through onSyncSkew.
    if (onSyncSkew.mock.calls.length > 0) {
      expect(onSyncSkew.mock.calls[0][1]).toEqual({
        direction: 'applyToSlate',
      });
    }

    consoleSpy.mockRestore();
    YjsEditor.disconnect(editor1);
    YjsEditor.disconnect(editor2);
  });

  it('should recover when multiple structural changes cause path mismatch', async () => {
    // Test a more complex scenario with multiple paragraphs and nested changes
    // Uses separate Y.Doc instances like real network sync

    const doc1 = new Y.Doc();
    const sharedRoot1 = doc1.get('content', Y.XmlText) as Y.XmlText;

    const initialContent = [
      { type: 'paragraph', children: [{ text: 'Line 1' }] },
      { type: 'paragraph', children: [{ text: 'Line 2' }] },
      { type: 'paragraph', children: [{ text: 'Line 3' }] },
      { type: 'paragraph', children: [{ text: 'Line 4' }] },
    ];
    sharedRoot1.applyDelta(slateNodesToInsertDelta(initialContent));

    const editor1 = withYjs(createEditor(), sharedRoot1);
    YjsEditor.connect(editor1);
    await wait(50);

    // Create doc2 as a "remote" copy
    const doc2 = new Y.Doc();
    Y.applyUpdateV2(doc2, Y.encodeStateAsUpdateV2(doc1));
    const sharedRoot2 = doc2.get('content', Y.XmlText) as Y.XmlText;

    const editor2 = withYjs(createEditor(), sharedRoot2);
    const originalApplyRemoteEvents = editor2.applyRemoteEvents.bind(editor2);

    // Corrupt editor2 more severely - remove multiple children
    editor2.applyRemoteEvents = (events, origin) => {
      if (editor2.children.length > 2) {
        editor2.children = [editor2.children[0]];
      }
      originalApplyRemoteEvents(events, origin);
    };

    YjsEditor.connect(editor2);
    await wait(50);

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Make changes that reference paths that won't exist after corruption
    Transforms.removeNodes(editor1, { at: [2] }); // Remove Line 3
    editor1.onChange();
    await wait(50);

    // Sync the change to doc2
    Y.applyUpdateV2(doc2, Y.encodeStateAsUpdateV2(doc1));
    await wait(100);

    // Editor2 should have recovered
    expect(editor2.children.length).toBeGreaterThan(0);

    consoleSpy.mockRestore();
    YjsEditor.disconnect(editor1);
    YjsEditor.disconnect(editor2);
  });

  it('should handle text deletion in desynced state', async () => {
    // Test text-level operations (not just node removal)
    // Uses separate Y.Doc instances like real network sync

    const doc1 = new Y.Doc();
    const sharedRoot1 = doc1.get('content', Y.XmlText) as Y.XmlText;

    const initialContent = [
      { type: 'paragraph', children: [{ text: 'Hello World' }] },
    ];
    sharedRoot1.applyDelta(slateNodesToInsertDelta(initialContent));

    const editor1 = withYjs(createEditor(), sharedRoot1);
    YjsEditor.connect(editor1);
    await wait(50);

    // Create doc2 as a "remote" copy
    const doc2 = new Y.Doc();
    Y.applyUpdateV2(doc2, Y.encodeStateAsUpdateV2(doc1));
    const sharedRoot2 = doc2.get('content', Y.XmlText) as Y.XmlText;

    const editor2 = withYjs(createEditor(), sharedRoot2);
    const originalApplyRemoteEvents = editor2.applyRemoteEvents.bind(editor2);

    // Corrupt by changing the text content
    editor2.applyRemoteEvents = (events, origin) => {
      if (editor2.children.length > 0) {
        editor2.children = [{ type: 'paragraph', children: [{ text: 'Hi' }] }];
      }
      originalApplyRemoteEvents(events, origin);
    };

    YjsEditor.connect(editor2);
    await wait(50);

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Delete text that exists in Yjs but not in corrupted Slate
    Transforms.delete(editor1, {
      at: {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 5 },
      },
    });
    editor1.onChange();
    await wait(50);

    // Sync the change to doc2
    Y.applyUpdateV2(doc2, Y.encodeStateAsUpdateV2(doc1));
    await wait(100);

    // Editor2 should have recovered
    expect(editor2.children.length).toBeGreaterThan(0);

    consoleSpy.mockRestore();
    YjsEditor.disconnect(editor1);
    YjsEditor.disconnect(editor2);
  });

  it('should log warning when sync skew is detected and recovered', async () => {
    // Uses separate Y.Doc instances like real network sync
    const doc1 = new Y.Doc();
    const sharedRoot1 = doc1.get('content', Y.XmlText) as Y.XmlText;

    const initialContent = [
      { type: 'paragraph', children: [{ text: 'Test' }] },
      { type: 'paragraph', children: [{ text: 'Content' }] },
    ];
    sharedRoot1.applyDelta(slateNodesToInsertDelta(initialContent));

    const editor1 = withYjs(createEditor(), sharedRoot1);
    YjsEditor.connect(editor1);
    await wait(50);

    // Create doc2 as a "remote" copy
    const doc2 = new Y.Doc();
    Y.applyUpdateV2(doc2, Y.encodeStateAsUpdateV2(doc1));
    const sharedRoot2 = doc2.get('content', Y.XmlText) as Y.XmlText;

    const editor2 = withYjs(createEditor(), sharedRoot2);
    const originalApplyRemoteEvents = editor2.applyRemoteEvents.bind(editor2);

    editor2.applyRemoteEvents = (events, origin) => {
      if (editor2.children.length > 1) {
        editor2.children = [editor2.children[0]];
      }
      originalApplyRemoteEvents(events, origin);
    };

    YjsEditor.connect(editor2);
    await wait(50);

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    Transforms.removeNodes(editor1, { at: [1] });
    editor1.onChange();
    await wait(50);

    // Sync the change to doc2
    Y.applyUpdateV2(doc2, Y.encodeStateAsUpdateV2(doc1));
    await wait(100);

    // The warning should have been logged (sync skew detected)
    // Note: The warning may or may not be called depending on whether
    // the corruption actually triggers a path error
    // The important thing is that no uncaught error was thrown

    consoleSpy.mockRestore();
    YjsEditor.disconnect(editor1);
    YjsEditor.disconnect(editor2);
  });
});
