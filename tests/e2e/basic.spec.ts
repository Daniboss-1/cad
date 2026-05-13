import { test, expect } from '@playwright/test';

test('has title and main components', async ({ page }) => {
  await page.goto('/');

  // Wait for the custom header text
  await expect(page.locator('text=AETHER')).toBeVisible();

  // Verify Command-K functionality
  await page.keyboard.press('Control+k');
  await expect(page.locator('text=EXCAVATE PRIMITIVE')).toBeVisible();

  // Verify Sidebar presence
  await expect(page.locator('text=Phase 1: Core Modeling')).toBeVisible();
});
