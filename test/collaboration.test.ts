import { createEditor } from 'slate';
import { YjsEditorTest, withYjsTest } from './yjsEditorTest';
import { toSlateDoc } from '../src';

describe('test', () => {
  it('test', async () => {
    // Create source document, make some edits, extract the resulting Yjs updates.
    const src = withYjsTest(createEditor());
    await YjsEditorTest.applySlateOpsToSlate(src, [
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
    const updates = YjsEditorTest.getCapturedYjsUpdates(src);

    // Apply those Yjs updates against a different editor.
    const dst = withYjsTest(createEditor());
    YjsEditorTest.applyYjsUpdatesToYjs(dst, updates);

    expect(toSlateDoc(dst.syncDoc)).toEqual(toSlateDoc(src.syncDoc));
    expect(dst.children).toEqual(src.children);
  });
});
