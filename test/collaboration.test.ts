import { Node } from 'slate';
import { toSlateDoc } from '../src';
import { TestEditor, TransformFunc } from './testEditor';
import { createNode, createTestEditor, createValue, wait } from './utils';

const tests = [
  [
    'Insert text into a paragraph node',
    [createNode('paragraph', '')],
    [
      TestEditor.makeInsertText('Hello ', { path: [0, 0], offset: 0 }),
      TestEditor.makeInsertText('collaborator', { path: [0, 0], offset: 6 }),
      TestEditor.makeInsertText('!', { path: [0, 0], offset: 18 }),
    ],
    [createNode('paragraph', 'Hello collaborator!')],
  ],
  [
    'Delete characters from a paragraph node',
    [createNode('paragraph', 'Hello collaborator!')],
    [
      TestEditor.makeRemoveCharacters(7, { path: [0, 0], offset: 11 }),
      TestEditor.makeRemoveCharacters(6, { path: [0, 0], offset: 5 }),
    ],
    [createNode('paragraph', 'Hello!')],
  ],
  [
    'Insert new nodes (both paragraph and text)',
    [createNode()],
    [
      TestEditor.makeInsertNodes({ type: 'paragraph', children: [] }, [1]),
      TestEditor.makeInsertNodes({ text: 'Hello collaborator!' }, [1, 0]),
    ],
    [createNode(), createNode('paragraph', 'Hello collaborator!')],
  ],
  [
    'Insert new nodes (two paragraphs)',
    [
      createNode('paragraph', 'alfa'),
      createNode('paragraph', 'bravo'),
      createNode('paragraph', 'charlie'),
      createNode('paragraph', 'delta'),
    ],
    [
      TestEditor.makeInsertNodes(createNode('paragraph', 'echo'), [1]),
      TestEditor.makeInsertNodes(createNode('paragraph', 'foxtrot'), [4]),
    ],
    [
      createNode('paragraph', 'alfa'),
      createNode('paragraph', 'echo'),
      createNode('paragraph', 'bravo'),
      createNode('paragraph', 'charlie'),
      createNode('paragraph', 'foxtrot'),
      createNode('paragraph', 'delta'),
    ],
  ],
  [
    'Insert new nodes (three paragraphs)',
    [
      createNode('paragraph', 'one'),
      createNode('paragraph', 'two'),
      createNode('paragraph', 'three'),
      createNode('paragraph', 'four'),
    ],
    [
      TestEditor.makeInsertNodes(createNode('paragraph', 'five'), [1]),
      TestEditor.makeInsertNodes(createNode('paragraph', 'six'), [3]),
      TestEditor.makeInsertNodes(createNode('paragraph', 'seven'), [5]),
    ],
    [
      createNode('paragraph', 'one'),
      createNode('paragraph', 'five'),
      createNode('paragraph', 'two'),
      createNode('paragraph', 'six'),
      createNode('paragraph', 'three'),
      createNode('paragraph', 'seven'),
      createNode('paragraph', 'four'),
    ],
  ],
  [
    'Merge two paragraph nodes',
    [
      createNode('paragraph', 'Hello '),
      createNode('paragraph', 'collaborator!'),
    ],
    [TestEditor.makeMergeNodes([1])],
    [createNode('paragraph', 'Hello collaborator!')],
  ],
  [
    'Move a paragraph node to an existing position',
    [
      createNode('paragraph', 'first'),
      createNode('paragraph', 'second'),
      createNode('paragraph', 'third'),
    ],
    [TestEditor.makeMoveNodes([1], [0])],
    [
      createNode('paragraph', 'second'),
      createNode('paragraph', 'first'),
      createNode('paragraph', 'third'),
    ],
  ],
  [
    'Move a paragraph node to the end',
    [
      createNode('paragraph', 'first'),
      createNode('paragraph', 'second'),
      createNode('paragraph', 'third'),
    ],
    [TestEditor.makeMoveNodes([0], [3])],
    [
      createNode('paragraph', 'second'),
      createNode('paragraph', 'third'),
      createNode('paragraph', 'first'),
    ],
  ],
  [
    'Move a paragraph node far past the end',
    [
      createNode('paragraph', 'first'),
      createNode('paragraph', 'second'),
      createNode('paragraph', 'third'),
    ],
    [TestEditor.makeMoveNodes([0], [1000])],
    [
      createNode('paragraph', 'second'),
      createNode('paragraph', 'third'),
      createNode('paragraph', 'first'),
    ],
  ],
  [
    'Move a text node',
    [
      createNode('paragraph', 'first'),
      createNode('paragraph', 'second'),
      createNode('paragraph', 'third'),
    ],
    [TestEditor.makeMoveNodes([1, 0], [2, 0])],
    [
      createNode('paragraph', 'first'),
      createNode('paragraph', ''),
      createNode('paragraph', 'secondthird'),
    ],
  ],
  [
    'Remove a paragraph node',
    [
      createNode('paragraph', 'first'),
      createNode('paragraph', 'second'),
      createNode('paragraph', 'third'),
    ],
    [TestEditor.makeRemoveNodes([0])],
    [createNode('paragraph', 'second'), createNode('paragraph', 'third')],
  ],
  [
    'Remove two non-consecutive paragraph nodes',
    [
      createNode('paragraph', 'first'),
      createNode('paragraph', 'second'),
      createNode('paragraph', 'third'),
      createNode('paragraph', 'fourth'),
    ],
    [TestEditor.makeRemoveNodes([0]), TestEditor.makeRemoveNodes([1])],
    [createNode('paragraph', 'second'), createNode('paragraph', 'fourth')],
  ],
  [
    'Remove two consecutive paragraph nodes',
    [
      createNode('paragraph', 'first'),
      createNode('paragraph', 'second'),
      createNode('paragraph', 'third'),
      createNode('paragraph', 'fourth'),
    ],
    [TestEditor.makeRemoveNodes([1]), TestEditor.makeRemoveNodes([1])],
    [createNode('paragraph', 'first'), createNode('paragraph', 'fourth')],
  ],
  [
    'Remove a text node',
    [
      createNode('paragraph', 'first'),
      createNode('paragraph', 'second'),
      createNode('paragraph', 'third'),
    ],
    [TestEditor.makeRemoveNodes([1, 0])],
    [
      createNode('paragraph', 'first'),
      createNode('paragraph', ''),
      createNode('paragraph', 'third'),
    ],
  ],
  [
    'Set properties of a paragraph node',
    [
      createNode('paragraph', 'first', { test: '1234' }),
      createNode('paragraph', 'second'),
    ],
    [TestEditor.makeSetNodes([0], { test: '4567' })],
    [
      createNode('paragraph', 'first', { test: '4567' }),
      createNode('paragraph', 'second'),
    ],
  ],
  [
    'Set properties of a text node',
    [
      createNode('paragraph', 'first', { test: '1234' }),
      createNode('paragraph', 'second'),
    ],
    [TestEditor.makeSetNodes([1, 0], { data: '4567' })],
    [
      createNode('paragraph', 'first', { test: '1234' }),
      {
        type: 'paragraph',
        children: [
          {
            data: '4567',
            text: 'second',
          },
        ],
      },
    ],
  ],
  [
    'Split an existing paragraph',
    [createNode('paragraph', 'Hello collaborator!')],
    [TestEditor.makeSplitNodes({ path: [0, 0], offset: 6 })],
    [
      createNode('paragraph', 'Hello '),
      createNode('paragraph', 'collaborator!'),
    ],
  ],
  [
    'Insert and remove text in the same paragraph',
    [createNode('paragraph', 'abc def')],
    [
      TestEditor.makeInsertText('ghi ', { path: [0, 0], offset: 4 }),
      TestEditor.makeRemoveCharacters(2, { path: [0, 0], offset: 1 }),
      TestEditor.makeInsertText('jkl ', { path: [0, 0], offset: 6 }),
      TestEditor.makeRemoveCharacters(1, { path: [0, 0], offset: 11 }),
      TestEditor.makeInsertText(' mno', { path: [0, 0], offset: 12 }),
    ],
    [createNode('paragraph', 'a ghi jkl df mno')],
  ],
  [
    'Remove first paragraph, insert text into second paragraph',
    [createNode('paragraph', 'abcd'), createNode('paragraph', 'efgh')],
    [
      TestEditor.makeRemoveNodes([0]),
      TestEditor.makeInsertText(' ijkl ', { path: [0, 0], offset: 2 }),
    ],
    [createNode('paragraph', 'ef ijkl gh')],
  ],
  [
    'More complex case: insert text, both insert and remove nodes',
    [
      createNode('paragraph', 'abcd'),
      createNode('paragraph', 'efgh'),
      createNode('paragraph', 'ijkl'),
    ],
    [
      TestEditor.makeInsertText(' mnop ', { path: [0, 0], offset: 2 }),
      TestEditor.makeRemoveNodes([1]),
      TestEditor.makeInsertText(' qrst ', { path: [1, 0], offset: 2 }),
      TestEditor.makeInsertNodes(createNode('paragraph', 'uvxw'), [1]),
    ],
    [
      createNode('paragraph', 'ab mnop cd'),
      createNode('paragraph', 'uvxw'),
      createNode('paragraph', 'ij qrst kl'),
    ],
  ],
  [
    'Insert text, then insert node that affects the path to the affected text',
    [createNode('paragraph', 'abcd')],
    [
      TestEditor.makeInsertText(' efgh ', { path: [0, 0], offset: 2 }),
      TestEditor.makeInsertNodes(createNode('paragraph', 'ijkl'), [0]),
    ],
    [createNode('paragraph', 'ijkl'), createNode('paragraph', 'ab efgh cd')],
  ],
  [
    'Set properties, then insert node that affects path to the affected node',
    [createNode('paragraph', 'abcd')],
    [
      TestEditor.makeSetNodes([0], { test: '1234' }),
      TestEditor.makeInsertNodes(createNode('paragraph', 'ijkl'), [0]),
    ],
    [
      createNode('paragraph', 'ijkl'),
      createNode('paragraph', 'abcd', { test: '1234' }),
    ],
  ],
  [
    'Insert node, then insert second node that affects path to the first node',
    [
      createValue([
        createNode('paragraph', 'abc'),
        createNode('paragraph', 'def'),
      ]),
    ],
    [
      TestEditor.makeInsertNodes(createNode('paragraph', 'jkl'), [0, 1]),
      TestEditor.makeInsertNodes(createNode('paragraph', 'ghi'), [0]),
    ],
    [
      createNode('paragraph', 'ghi'),
      createValue([
        createNode('paragraph', 'abc'),
        createNode('paragraph', 'jkl'),
        createNode('paragraph', 'def'),
      ]),
    ],
  ],
  [
    'remove_text op spans location of previous remove_text op',
    [createNode('paragraph', 'abc defg ijklm')],
    [TestEditor.makeRemoveCharacters(5, { path: [0, 0], offset: 4 })],
    [createNode('paragraph', 'abc ijklm')],
    [TestEditor.makeRemoveCharacters(6, { path: [0, 0], offset: 1 })],
    [createNode('paragraph', 'alm')],
  ],
  [
    'remove_text op spans locations of two previous remove_text ops',
    [createNode('paragraph', 'abcdefghijklmnopqrst')],
    [TestEditor.makeRemoveCharacters(3, { path: [0, 0], offset: 2 })],
    [createNode('paragraph', 'abfghijklmnopqrst')],
    [TestEditor.makeRemoveCharacters(8, { path: [0, 0], offset: 5 })],
    [createNode('paragraph', 'abfghqrst')],
    [TestEditor.makeRemoveCharacters(7, { path: [0, 0], offset: 1 })],
    [createNode('paragraph', 'at')],
  ],
  [
    'set_selection op is a null op',
    [createNode('paragraph', 'abcdefghijklmnopqrst')],
    [
      TestEditor.makeSetSelection(
        { path: [0, 0], offset: 2 },
        { path: [0, 0], offset: 4 }
      ),
    ],
    [createNode('paragraph', 'abcdefghijklmnopqrst')],
  ],
];

describe('slate operations propagate between editors', () => {
  tests.forEach(([testName, input, ...cases]) => {
    it(`${testName}`, async () => {
      // Create two editors.
      const src = createTestEditor();
      const dst = createTestEditor();

      // Set initial state for src editor, propagate changes to dst editor.
      TestEditor.applyTransform(
        src,
        TestEditor.makeInsertNodes(input as Node[], [0])
      );
      await wait();

      let updates = TestEditor.getCapturedYjsUpdates(src);
      TestEditor.applyYjsUpdatesToYjs(dst, updates);
      await wait();

      // Verify initial states.
      expect(src.children).toEqual(input);
      expect(toSlateDoc(src.sharedType)).toEqual(input);
      expect(toSlateDoc(dst.sharedType)).toEqual(input);
      expect(dst.children).toEqual(input);

      // Allow for multiple rounds of applying transforms and verifying state.
      const toTest = cases.slice();
      while (toTest.length > 0) {
        const [transforms, output] = toTest.splice(0, 2);

        // Apply transforms to src editor, propagate changes to dst editor.
        TestEditor.applyTransforms(src, transforms as TransformFunc[]);
        // eslint-disable-next-line no-await-in-loop
        await wait();

        updates = TestEditor.getCapturedYjsUpdates(src);
        TestEditor.applyYjsUpdatesToYjs(dst, updates);
        // eslint-disable-next-line no-await-in-loop
        await wait();

        // Verify final states.
        expect(src.children).toEqual(output);
        expect(toSlateDoc(src.sharedType)).toEqual(output);
        expect(toSlateDoc(dst.sharedType)).toEqual(output);
        expect(dst.children).toEqual(output);
      }
    });
  });
});
