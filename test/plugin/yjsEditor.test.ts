import { Node } from 'slate';
import { toSlateDoc, toSyncElement, YjsEditor } from '../../src';
import { CustomElement } from '../../src/model';
import { createTestEditor } from '../utils';

// onChange fires in the next tick, see slate createEditor
async function waitForSlateOnChangeAround(callback: () => void) {
  await callback();
  await Promise.resolve();
}

describe('YjsEditor', () => {
  let yjsEditor: YjsEditor;

  const initialValue: CustomElement[] = [
    { type: 'paragraph', children: [{ text: '' }] },
  ];

  beforeEach(async () => {
    yjsEditor = await createTestEditor(initialValue);
  });

  describe('initial editor value sync', () => {
    it('should set editor.children to the value of the shared type', async () => {
      expect(yjsEditor.children).toEqual<Node[]>(initialValue);
    });

    it('should be optional', async () => {
      yjsEditor = await createTestEditor(initialValue, {
        synchronizeValue: false,
      });

      expect(yjsEditor.children).toEqual<Node[]>([]);
    });
  });

  describe('shared type <=> slate sync', () => {
    const newElement: CustomElement = {
      type: 'paragraph',
      children: [{ text: 'new' }],
    };

    it('should sync changes to the shared type with slate', async () => {
      await waitForSlateOnChangeAround(() =>
        yjsEditor.sharedType.push([toSyncElement(newElement)])
      );

      // make sure we didn't erroneously add elements to the shared type - can happen
      // if the observer we have for it applies "local" events
      expect(toSlateDoc(yjsEditor.sharedType)).toEqual<Node[]>([
        ...initialValue,
        newElement,
      ]);
      expect(yjsEditor.children).toEqual<Node[]>([...initialValue, newElement]);
    });

    it('should apply slate operations to yjs', async () => {
      await waitForSlateOnChangeAround(() => yjsEditor.insertNode(newElement));

      expect(toSlateDoc(yjsEditor.sharedType)).toEqual<Node[]>([
        ...initialValue,
        newElement,
      ]);
    });

    it('should apply slate normalizations to yjs', async () => {
      const normalization: CustomElement = {
        type: 'paragraph',
        children: [{ text: 'some normalization' }],
      };

      const { normalizeNode } = yjsEditor;

      yjsEditor.normalizeNode = (entry) => {
        const isNewElement =
          (entry[0] as CustomElement).text ===
          (newElement.children[0] as CustomElement).text;
        if (isNewElement) {
          yjsEditor.insertNode(normalization);
        }

        normalizeNode(entry);
      };

      await waitForSlateOnChangeAround(() =>
        yjsEditor.sharedType.push([toSyncElement(newElement)])
      );

      expect(toSlateDoc(yjsEditor.sharedType)).toEqual<Node[]>([
        ...initialValue,
        newElement,
        normalization,
      ]);
    });
  });
});
