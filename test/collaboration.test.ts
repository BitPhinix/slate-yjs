import { Node, Operation } from 'slate';
import { createEditor } from 'slate';
import { TestEditor, withTest } from './testEditor';
import { toSlateDoc } from '../src';
import { createNode } from './utils';

// Partial copy of transforms from apply/apply.test.ts.
//
// Verbatim copies of 'merge_node', 'move_node', 'remove_node', 'set_node' and
// 'split_node' sections currently cause tests to fail and need further
// investigation.
const transforms = [
  // Insert text into an existing paragraph.
  [
    'insert_text',
    [createNode('paragraph', '')],
    [
      {
        marks: [],
        offset: 0,
        path: [0, 0],
        text: 'Hello ',
        type: 'insert_text',
      },
      {
        marks: [],
        offset: 6,
        path: [0, 0],
        text: 'collaborator',
        type: 'insert_text',
      },
      {
        marks: [],
        offset: 18,
        path: [0, 0],
        text: '!',
        type: 'insert_text',
      },
    ],
    [createNode('paragraph', 'Hello collaborator!')],
  ],
  // Remove text from an existing paragraph.
  [
    'remove_text',
    [createNode('paragraph', 'Hello collaborator!')],
    [
      {
        offset: 11,
        path: [0, 0],
        text: 'borator',
        type: 'remove_text',
      },
      {
        offset: 5,
        path: [0, 0],
        text: ' colla',
        type: 'remove_text',
      },
    ],
    [createNode('paragraph', 'Hello!')],
  ],
  // Insert new nodes.
  [
    'insert_node',
    [createNode()],
    [
      {
        type: 'insert_node',
        path: [1],
        node: { type: 'paragraph', children: [] },
      },
      {
        type: 'insert_node',
        path: [1, 0],
        node: { text: 'Hello collaborator!' },
      },
    ],
    [createNode(), createNode('paragraph', 'Hello collaborator!')],
  ]
];

describe('slate operations propagate between editors', () => {
  transforms.forEach(([op, input, operations, output]) => {
    it(`apply ${op} operations`, async () => {
      // Create two editors.
      const src = withTest(createEditor());
      const dst = withTest(createEditor());

      // Set initial state for src editor, propagate changes to dst editor.
      await TestEditor.insertSlateNodes(src, input as Node[], [0]);
      let updates = TestEditor.getCapturedYjsUpdates(src);
      await TestEditor.applyYjsUpdatesToYjs(dst, updates);

      // Verify initial states.
      expect(toSlateDoc(src.syncDoc)).toEqual(input);
      expect(toSlateDoc(dst.syncDoc)).toEqual(input);
      expect(src.children).toEqual(input);
      expect(dst.children).toEqual(input);

      // Apply test ops to src editor, propagate changes to dst editor.
      await TestEditor.applySlateOpsToSlate(src, operations as Operation[]);
      updates = TestEditor.getCapturedYjsUpdates(src);
      await TestEditor.applyYjsUpdatesToYjs(dst, updates);

      // Verify final states.
      expect(toSlateDoc(src.syncDoc)).toEqual(output);
      expect(toSlateDoc(dst.syncDoc)).toEqual(output);
      expect(src.children).toEqual(output);
      expect(dst.children).toEqual(output);
    });
  });
});
