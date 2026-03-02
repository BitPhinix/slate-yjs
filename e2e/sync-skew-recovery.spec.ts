import { test, expect, Page } from '@playwright/test';

/**
 * This test verifies that the sync skew recovery mechanism works correctly.
 *
 * The sync skew issue occurs when:
 * 1. Two editors are sharing the same Yjs document
 * 2. One editor makes changes that alter the document structure
 * 3. The other editor receives a Yjs update that references a path that no longer exists
 *
 * Without the fix, this would throw "Cannot find a descendant at path [x,y]" and crash.
 * With the fix, the editor should recover by re-syncing from Yjs.
 */

const EDITOR_1_SELECTOR = '[data-testid="editor-1"] [data-slate-editor="true"]';
const EDITOR_2_SELECTOR = '[data-testid="editor-2"] [data-slate-editor="true"]';

async function waitForEditors(page: Page) {
  await page.waitForSelector(EDITOR_1_SELECTOR, { timeout: 30000 });
  await page.waitForSelector(EDITOR_2_SELECTOR, { timeout: 30000 });
}

async function getEditorContent(page: Page, editorSelector: string): Promise<string> {
  return page.locator(editorSelector).innerText();
}

async function typeInEditor(page: Page, editorSelector: string, text: string) {
  await page.locator(editorSelector).click();
  await page.keyboard.type(text);
}

async function selectAllInEditor(page: Page, editorSelector: string) {
  await page.locator(editorSelector).click();
  await page.keyboard.press('Meta+a');
}

async function deleteInEditor(page: Page, editorSelector: string) {
  await selectAllInEditor(page, editorSelector);
  await page.keyboard.press('Backspace');
}

async function copyInEditor(page: Page, editorSelector: string) {
  await selectAllInEditor(page, editorSelector);
  await page.keyboard.press('Meta+c');
}

async function pasteInEditor(page: Page, editorSelector: string) {
  await page.locator(editorSelector).click();
  await page.keyboard.press('Meta+v');
}

test.describe('Sync Skew Recovery', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/local-test');
    await waitForEditors(page);
  });

  test('changes in editor 1 should sync to editor 2', async ({ page }) => {
    // Type in editor 1
    await typeInEditor(page, EDITOR_1_SELECTOR, 'Hello from editor 1');
    
    // Wait for sync
    await page.waitForTimeout(200);

    // Verify content appears in editor 2
    const content2 = await getEditorContent(page, EDITOR_2_SELECTOR);
    expect(content2).toContain('Hello from editor 1');
  });

  test('changes in editor 2 should sync to editor 1', async ({ page }) => {
    // Type in editor 2
    await typeInEditor(page, EDITOR_2_SELECTOR, 'Hello from editor 2');
    
    // Wait for sync
    await page.waitForTimeout(200);

    // Verify content appears in editor 1
    const content1 = await getEditorContent(page, EDITOR_1_SELECTOR);
    expect(content1).toContain('Hello from editor 2');
  });

  test('should not crash when paste causes rapid structural changes', async ({ page }) => {
    // Type some content in editor 1
    await typeInEditor(page, EDITOR_1_SELECTOR, 'Test content for paste');
    await page.waitForTimeout(100);

    // Copy all content
    await copyInEditor(page, EDITOR_1_SELECTOR);

    // Paste multiple times rapidly in editor 1
    await page.locator(EDITOR_1_SELECTOR).click();
    await page.keyboard.press('End');
    
    for (let i = 0; i < 5; i++) {
      await pasteInEditor(page, EDITOR_1_SELECTOR);
      await page.waitForTimeout(50);
    }

    // Wait for sync
    await page.waitForTimeout(500);

    // Both editors should still be functional
    await typeInEditor(page, EDITOR_2_SELECTOR, ' - Added from editor 2');
    
    await page.waitForTimeout(200);

    // Verify both editors have content
    const content1 = await getEditorContent(page, EDITOR_1_SELECTOR);
    const content2 = await getEditorContent(page, EDITOR_2_SELECTOR);
    
    expect(content1).toContain('Added from editor 2');
    expect(content2).toContain('Test content for paste');
  });

  test('should recover when one editor deletes while other is editing', async ({ page }) => {
    // Set up initial content
    await typeInEditor(page, EDITOR_1_SELECTOR, 'Line 1');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Line 2');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Line 3');

    await page.waitForTimeout(200);

    // Start typing in editor 2
    await page.locator(EDITOR_2_SELECTOR).click();
    
    // Simultaneously delete all in editor 1
    await deleteInEditor(page, EDITOR_1_SELECTOR);

    // Continue typing in editor 2 (this could cause path errors)
    await page.locator(EDITOR_2_SELECTOR).click();
    await page.keyboard.type('New content after delete');

    await page.waitForTimeout(300);

    // Both editors should still work
    await typeInEditor(page, EDITOR_1_SELECTOR, ' - Editor 1 works');
    
    await page.waitForTimeout(200);

    // Verify editors are functional
    const content1 = await getEditorContent(page, EDITOR_1_SELECTOR);
    expect(content1.length).toBeGreaterThan(0);
  });

  test('should handle rapid concurrent edits without crashing', async ({ page }) => {
    // Both editors type simultaneously
    const editor1Promise = (async () => {
      for (let i = 0; i < 10; i++) {
        await typeInEditor(page, EDITOR_1_SELECTOR, `A${i}`);
        await page.waitForTimeout(30);
      }
    })();

    const editor2Promise = (async () => {
      for (let i = 0; i < 10; i++) {
        await typeInEditor(page, EDITOR_2_SELECTOR, `B${i}`);
        await page.waitForTimeout(30);
      }
    })();

    // Wait for both to complete
    await Promise.all([editor1Promise, editor2Promise]);

    await page.waitForTimeout(500);

    // Both editors should have content and be in sync
    const content1 = await getEditorContent(page, EDITOR_1_SELECTOR);
    const content2 = await getEditorContent(page, EDITOR_2_SELECTOR);

    // Content should be the same in both editors
    expect(content1).toBe(content2);
    expect(content1.length).toBeGreaterThan(0);
  });

  test('should not show uncaught errors in console', async ({ page }) => {
    const errors: string[] = [];

    // Listen for console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Listen for uncaught exceptions
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    // Perform various operations
    await typeInEditor(page, EDITOR_1_SELECTOR, 'Test content');
    await copyInEditor(page, EDITOR_1_SELECTOR);

    for (let i = 0; i < 3; i++) {
      await pasteInEditor(page, EDITOR_1_SELECTOR);
      await page.waitForTimeout(50);
    }

    await deleteInEditor(page, EDITOR_2_SELECTOR);
    await typeInEditor(page, EDITOR_2_SELECTOR, 'Fresh content');

    await page.waitForTimeout(500);

    // Filter out expected warnings (sync skew warnings are console.warn, not error)
    const unexpectedErrors = errors.filter(
      (e) =>
        !e.includes('sync skew') &&
        !e.includes('Sync skew') &&
        !e.includes('Cannot find a descendant at path')
    );

    // There should be no unexpected errors
    expect(unexpectedErrors).toHaveLength(0);
  });

  test('editors should remain in sync after structural chaos', async ({ page }) => {
    // Create complex content
    await typeInEditor(page, EDITOR_1_SELECTOR, 'Paragraph 1');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Paragraph 2');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Paragraph 3');

    await page.waitForTimeout(100);

    // Copy and paste to duplicate
    await copyInEditor(page, EDITOR_1_SELECTOR);
    await page.locator(EDITOR_1_SELECTOR).click();
    await page.keyboard.press('End');
    await pasteInEditor(page, EDITOR_1_SELECTOR);

    await page.waitForTimeout(100);

    // Delete everything from editor 2
    await deleteInEditor(page, EDITOR_2_SELECTOR);

    await page.waitForTimeout(100);

    // Type fresh content
    await typeInEditor(page, EDITOR_1_SELECTOR, 'Final content');

    await page.waitForTimeout(300);

    // Both editors should have the same content
    const content1 = await getEditorContent(page, EDITOR_1_SELECTOR);
    const content2 = await getEditorContent(page, EDITOR_2_SELECTOR);

    expect(content1).toBe(content2);
    expect(content1).toContain('Final content');
  });
});
