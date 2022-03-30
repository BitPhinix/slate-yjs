/* eslint-disable import/no-extraneous-dependencies */
import { createEditor, Editor } from 'slate';
import { describe, expect } from 'vitest';
import * as Y from 'yjs';
import { fixtures } from '../../../support/fixtures';
import { yTextToSlateElement } from '../src';
import { withTestingElements } from './withTestingElements';

export type FixtureModule = {
  module: {
    input: Editor;
    expected: Editor;
    run: (e: Editor) => void;
  };
};

async function normalizedSlateDoc(sharedRoot: Y.XmlText) {
  const editor = createEditor();
  editor.children = yTextToSlateElement(sharedRoot).children;
  const e = await withTestingElements(editor);
  Editor.normalize(e, { force: true });
  return e.children;
}

async function runCollaborationTest({ module }: FixtureModule) {
  // Setup 'local' editor
  const { input, run, expected } = module;
  const editor = await withTestingElements(input);

  // Keep the 'local' editor state before applying run.
  const baseState = Y.encodeStateAsUpdateV2(editor.sharedRoot.doc);

  Editor.normalize(editor, { force: true });

  // The normalized editor state should match the shared root.
  expect(await normalizedSlateDoc(editor.sharedRoot)).toEqual(editor.children);

  run(editor);
  editor.onChange();

  // Editor state after run should match shared root.
  expect(await normalizedSlateDoc(editor.sharedRoot)).toEqual(editor.children);

  // Setup remote editor with input base state
  const remoteDoc = new Y.Doc();
  Y.applyUpdateV2(remoteDoc, baseState);
  const remote = await withTestingElements(createEditor(), remoteDoc);

  // Apply changes from 'run'
  Y.applyUpdateV2(remoteDoc, Y.encodeStateAsUpdateV2(editor.sharedRoot.doc));

  // Verify remote and editor state are equal
  expect(await normalizedSlateDoc(remote.sharedRoot)).toEqual(remote.children);
  expect(editor.children).toEqual(remote.children);
  expect(await normalizedSlateDoc(editor.sharedRoot)).toEqual(editor.children);

  // Verify editor is in expected state
  const expectedEditor = await withTestingElements(expected);
  Editor.normalize(expectedEditor, { force: true });
  expect(editor.children).toEqual(expectedEditor.children);
}

describe('adapter', () => {
  fixtures(__dirname, 'collaboration', runCollaborationTest);
});
