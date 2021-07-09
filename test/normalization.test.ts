import { toSlateDoc } from '../src/utils/convert';
import { TestEditor } from './testEditor';
import { createTestEditor, wait } from './utils';

describe('slate operations propagate between editors', () => {
  it(`test`, async () => {
    // Create two editors.
    const src = createTestEditor();
    const dest = createTestEditor();

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    src.normalizeNode = () => {};

    TestEditor.applyTransform(
      src,
      TestEditor.makeInsertNodes(
        { children: [{ text: 'this should' }, { text: ' be combined' }] },
        [0]
      )
    );
    await wait();

    const srcUpdates = TestEditor.getCapturedYjsUpdates(src);
    TestEditor.applyYjsUpdatesToYjs(dest, srcUpdates);
    await wait();

    const destUpdates = TestEditor.getCapturedYjsUpdates(dest);
    TestEditor.applyYjsUpdatesToYjs(src, destUpdates);
    await wait();

    expect(toSlateDoc(dest.sharedType)).toEqual([
      { children: [{ text: 'this should be combined' }] },
    ]);

    expect(toSlateDoc(src.sharedType)).toEqual(toSlateDoc(dest.sharedType));
  });
});
