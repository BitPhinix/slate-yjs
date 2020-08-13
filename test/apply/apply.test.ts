import { applySlateOps, SyncDoc, toSlateDoc } from '../../src';
import { createDoc, createNode, createText } from '../utils';

const transforms = [
  [
    'insert_text',
    [createNode('paragraph', '')],
    [
      {
        marks: [],
        offset: 0,
        path: [0, 0],
        text: 'Hello ',
        type: 'insert_text'
      },
      {
        marks: [],
        offset: 6,
        path: [0, 0],
        text: 'collaborator',
        type: 'insert_text'
      },
      {
        marks: [],
        offset: 18,
        path: [0, 0],
        text: '!',
        type: 'insert_text'
      }
    ],
    [createNode('paragraph', 'Hello collaborator!')]
  ],
  [
    'remove_text',
    [createNode('paragraph', 'Hello collaborator!')],
    [
      {
        offset: 11,
        path: [0, 0],
        text: 'borator',
        type: 'remove_text'
      },
      {
        offset: 5,
        path: [0, 0],
        text: ' colla',
        type: 'remove_text'
      }
    ],
    [createNode('paragraph', 'Hello!')]
  ],
  [
    'insert_node',
    null,
    [
      {
        type: 'insert_node',
        path: [1],
        node: { type: 'paragraph', children: [] }
      },
      {
        type: 'insert_node',
        path: [1, 0],
        node: { text: 'Hello collaborator!' }
      }
    ],
    [createNode(), createNode('paragraph', 'Hello collaborator!')]
  ],
  [
    'merge_node',
    [
      createNode('paragraph', 'Hello '),
      createNode('paragraph', 'collaborator!')
    ],
    [
      {
        path: [1],
        position: 1,
        properties: { type: 'paragraph' },
        target: null,
        type: 'merge_node'
      },
      {
        path: [0, 1],
        position: 6,
        properties: {},
        target: null,
        type: 'merge_node'
      }
    ],
    [createNode('paragraph', 'Hello collaborator!')]
  ],
  [
    'move_node',
    [
      createNode('paragraph', 'first'),
      createNode('paragraph', 'second'),
      createNode('paragraph', 'third'),
      createNode('paragraph', 'fourth')
    ],
    [
      {
        newPath: [0],
        path: [1],
        type: 'move_node'
      },
      {
        newPath: [3, 0],
        path: [2, 0],
        type: 'move_node'
      }
    ],
    [
      createNode('paragraph', 'second'),
      createNode('paragraph', 'first'),
      {
        type: 'paragraph',
        children: []
      },
      {
        type: 'paragraph',
        children: [createText('third'), createText('fourth')]
      }
    ]
  ],
  [
    'remove_node',
    [
      createNode('paragraph', 'first'),
      createNode('paragraph', 'second'),
      createNode('paragraph', 'third')
    ],
    [
      {
        path: [1, 0],
        type: 'remove_node'
      },
      {
        path: [0],
        type: 'remove_node'
      }
    ],
    [
      {
        type: 'paragraph',
        children: []
      },
      createNode('paragraph', 'third')
    ]
  ],
  [
    'set_node',
    [
      createNode('paragraph', 'first', { test: '1234' }),
      createNode('paragraph', 'second')
    ],
    [
      {
        path: [0],
        type: 'set_node',
        properties: {
          test: '1234'
        },
        newProperties: {
          test: '4567'
        }
      },
      {
        path: [1, 0],
        type: 'set_node',
        newProperties: {
          data: '4567'
        }
      }
    ],
    [
      createNode('paragraph', 'first', { test: '4567' }),
      {
        type: 'paragraph',
        children: [
          {
            data: '4567',
            text: 'second'
          }
        ]
      }
    ]
  ],
  [
    'split_node',
    [createNode('paragraph', 'Hello collaborator!')],
    [
      {
        path: [0, 0],
        position: 6,
        target: null,
        type: 'split_node'
      },
      {
        path: [0],
        position: 1,
        properties: {
          type: 'paragraph'
        },
        target: 6,
        type: 'split_node'
      }
    ],
    [
      createNode('paragraph', 'Hello '),
      createNode('paragraph', 'collaborator!')
    ]
  ]
];

describe('apply slate operations to Automerge document', () => {
  transforms.forEach(([op, input, operations, output]) => {
    it(`apply ${op} operations`, () => {
      const doc = createDoc(input);
      const syncDoc = doc.getArray('content') as SyncDoc;

      doc.transact(() => {
        applySlateOps(syncDoc, operations as any);
      });

      expect(output).toStrictEqual(toSlateDoc(syncDoc));
    });
  });
});
