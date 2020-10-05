import { createEditor } from 'slate';
import { TestEditor, withTest } from './testEditor';
import { toSlateDoc } from '../src';

describe('test', () => {
  it('test', async () => {
    // Create source document, make some edits, extract the resulting Yjs updates.
    const src = withTest(createEditor());
    await TestEditor.applySlateOpsToSlate(src, [
      {
        type: 'insert_node',
        path: [0],
        node: { type: 'paragraph', children: [] },
      },
      {
        type: 'insert_text',
        marks: [],
        offset: 0,
        path: [0, 0],
        text: 'test',
      },
    ]);
    const updates = TestEditor.getCapturedYjsUpdates(src);

    // Apply those Yjs updates against a different editor.
    const dst = withTest(createEditor());
    TestEditor.applyYjsUpdatesToYjs(dst, updates);

    expect(toSlateDoc(dst.syncDoc)).toEqual(toSlateDoc(src.syncDoc));
    expect(dst.children).toEqual(src.children);
  });
});
