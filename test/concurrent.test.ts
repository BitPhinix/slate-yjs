import { Node } from 'slate';
import { toSlateDoc } from '../src';
import { TestEditor, TransformFunc } from './testEditor';
import { createNode, createTestEditor, wait } from './utils';

const initialState: Node[] = [
  createNode('paragraph', 'alfa bravo'),
  createNode('paragraph', 'charlie delta'),
  createNode('paragraph', 'echo foxtrot'),
  createNode('paragraph', 'golf hotel'),
];

interface Test {
  name: string;
  transform: TransformFunc;
}

const tests: Test[] = [
  {
    name: 'Insert text into 1st paragraph',
    transform: TestEditor.makeInsertText('india ', { path: [0, 0], offset: 5 }),
  },
  {
    name: 'Insert text into 2nd paragraph',
    transform: TestEditor.makeInsertText('juliett ', {
      path: [1, 0],
      offset: 8,
    }),
  },
  {
    name: 'Insert text into 3rd paragraph',
    transform: TestEditor.makeInsertText('kilo ', { path: [2, 0], offset: 5 }),
  },
  {
    name: 'Insert text into 4th paragraph',
    transform: TestEditor.makeInsertText('lima ', { path: [3, 0], offset: 5 }),
  },
  {
    name: 'Delete text from 1st paragraph',
    transform: TestEditor.makeRemoveCharacters(5, { path: [0, 0], offset: 2 }),
  },
  {
    name: 'Delete text from 2nd paragraph',
    transform: TestEditor.makeRemoveCharacters(6, { path: [1, 0], offset: 4 }),
  },
  {
    name: 'Delete text from 3nd paragraph',
    transform: TestEditor.makeRemoveCharacters(5, { path: [2, 0], offset: 3 }),
  },
  {
    name: 'Delete text from 4th paragraph',
    transform: TestEditor.makeRemoveCharacters(7, { path: [3, 0], offset: 1 }),
  },
  {
    name: 'Insert new paragraph before 1st',
    transform: TestEditor.makeInsertNodes(createNode('paragraph', 'mike'), [0]),
  },
  {
    name: 'Insert new paragraph between 1st and 2nd',
    transform: TestEditor.makeInsertNodes(createNode('paragraph', 'november'), [
      1,
    ]),
  },
  {
    name: 'Insert new paragraph between 2nd and 3rd',
    transform: TestEditor.makeInsertNodes(createNode('paragraph', 'oscar'), [
      2,
    ]),
  },
  {
    name: 'Insert new paragraph between 3rd and 4th',
    transform: TestEditor.makeInsertNodes(createNode('paragraph', 'papa'), [3]),
  },
  {
    name: 'Insert new paragraph after 4th',
    transform: TestEditor.makeInsertNodes(createNode('paragraph', 'quebec'), [
      4,
    ]),
  },
  {
    name: 'Insert new text node into 1st paragraph',
    transform: TestEditor.makeInsertNodes({ text: 'romeo' }, [0, 0]),
  },
  {
    name: 'Insert new text node into 2nd paragraph',
    transform: TestEditor.makeInsertNodes({ text: 'sierra' }, [1, 0]),
  },
  {
    name: 'Insert new text node into 3rd paragraph',
    transform: TestEditor.makeInsertNodes({ text: 'tango' }, [2, 0]),
  },
  {
    name: 'Insert new text node into 4th paragraph',
    transform: TestEditor.makeInsertNodes({ text: 'uniform' }, [3, 0]),
  },
  {
    name: 'Merge 1st and 2nd paragraphs',
    transform: TestEditor.makeMergeNodes([1]),
  },
  {
    name: 'Merge 2nd and 3rd paragraphs',
    transform: TestEditor.makeMergeNodes([2]),
  },
  {
    name: 'Merge 3nd and 4th paragraphs',
    transform: TestEditor.makeMergeNodes([3]),
  },
  {
    name: 'Remove 1st paragraph',
    transform: TestEditor.makeRemoveNodes([0]),
  },
  {
    name: 'Remove 2nd paragraph',
    transform: TestEditor.makeRemoveNodes([1]),
  },
  {
    name: 'Remove 3rd paragraph',
    transform: TestEditor.makeRemoveNodes([2]),
  },
  {
    name: 'Remove 4th paragraph',
    transform: TestEditor.makeRemoveNodes([3]),
  },
  {
    name: 'Remove text node from 1st paragraph',
    transform: TestEditor.makeRemoveNodes([0, 0]),
  },
  {
    name: 'Remove text node from 2nd paragraph',
    transform: TestEditor.makeRemoveNodes([1, 0]),
  },
  {
    name: 'Remove text node from 3nd paragraph',
    transform: TestEditor.makeRemoveNodes([2, 0]),
  },
  {
    name: 'Remove text node from 4th paragraph',
    transform: TestEditor.makeRemoveNodes([3, 0]),
  },
  {
    name: 'Split 1st paragraph',
    transform: TestEditor.makeSplitNodes({ path: [0, 0], offset: 4 }),
  },
  {
    name: 'Split 2nd paragraph',
    transform: TestEditor.makeSplitNodes({ path: [1, 0], offset: 5 }),
  },
  {
    name: 'Split 3rd paragraph',
    transform: TestEditor.makeSplitNodes({ path: [2, 0], offset: 6 }),
  },
  {
    name: 'Split 4th paragraph',
    transform: TestEditor.makeSplitNodes({ path: [3, 0], offset: 7 }),
  },
  {
    name: 'Move 1st paragraph',
    transform: TestEditor.makeMoveNodes([0], [3]),
  },
  {
    name: 'Move 2nd paragraph',
    transform: TestEditor.makeMoveNodes([3], [2]),
  },
  {
    name: 'Move 3rd paragraph',
    transform: TestEditor.makeMoveNodes([2], [1]),
  },
  {
    name: 'Move 4th paragraph',
    transform: TestEditor.makeMoveNodes([1], [0]),
  },
];

const runOneTest = async (ti: Test, tj: Test) => {
  // Create two editors.
  const ei = createTestEditor();
  const ej = createTestEditor();

  // Set initial state for 1st editor, propagate changes to 2nd.
  TestEditor.applyTransform(
    ei,
    TestEditor.makeInsertNodes(initialState as Node[], [0])
  );
  await wait();

  const updates = TestEditor.getCapturedYjsUpdates(ei);
  TestEditor.applyYjsUpdatesToYjs(ej, updates);
  await wait();

  // Verify initial states match.
  expect(ei.children).toEqual(ej.children);
  expect(toSlateDoc(ei.sharedType)).toEqual(toSlateDoc(ej.sharedType));

  // Apply 1st transform to 1st editor, capture updates.
  TestEditor.applyTransform(ei, ti.transform);
  await wait();

  const updatesFromI = TestEditor.getCapturedYjsUpdates(ei);

  // Apply 2nd transform to 2nd editor, capture updates.
  TestEditor.applyTransform(ej, tj.transform);
  await wait();

  const updatesFromJ = TestEditor.getCapturedYjsUpdates(ej);

  // Cross-propagate updates between editors.
  TestEditor.applyYjsUpdatesToYjs(ei, updatesFromJ);
  TestEditor.applyYjsUpdatesToYjs(ej, updatesFromI);
  await wait();

  // Verify final states match.
  expect(ei.children).toEqual(ej.children);
  expect(toSlateDoc(ei.sharedType)).toEqual(toSlateDoc(ej.sharedType));
};

describe('model concurrent edits in separate editors', () => {
  tests.forEach((test) => {
    describe(`Test:${test.name}`, () => {
      tests.forEach((concurrentTest) => {
        it(`Concurrent:${concurrentTest.name}`, async () => {
          await runOneTest(test, concurrentTest);
        });
      });
    });
  });
});
