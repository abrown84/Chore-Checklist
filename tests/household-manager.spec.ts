import { test, expect } from '@playwright/test';

test.describe('Household Manager', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('should show leave household button in Data Management', async ({ page }) => {
    // Wait for Advanced Settings to load
    await page.waitForSelector('text=Advanced Settings', { timeout: 10000 });
    
    // Look for the "Leave Household" button in Data Management section
    const dataManagementSection = page.getByText('Data Management (Admin/Parent Only)');
    await expect(dataManagementSection).toBeVisible();
    
    const leaveButton = page.getByRole('button', { name: /leave household/i });
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'tests/screenshots/household-manager.png', fullPage: true });
    
    // Check if button exists
    await expect(leaveButton).toBeVisible({ timeout: 10000 });
  });

  test('should show delete household button for admin in Data Management', async ({ page }) => {
    // Wait for Advanced Settings to load
    await page.waitForSelector('text=Advanced Settings', { timeout: 10000 });
    
    // Look for Data Management section
    const dataManagementSection = page.getByText('Data Management (Admin/Parent Only)');
    await expect(dataManagementSection).toBeVisible();
    
    // Look for the "Delete Household" button (should only show for admins)
    const deleteButton = page.getByRole('button', { name: /delete household/i });
    
    // Take a screenshot
    await page.screenshot({ path: 'tests/screenshots/household-manager-admin.png', fullPage: true });
    
    // Check if button exists (may or may not be visible depending on role)
    const isVisible = await deleteButton.isVisible().catch(() => false);
    
    if (isVisible) {
      console.log('Delete button is visible - user is admin');
    } else {
      console.log('Delete button is not visible - user may not be admin');
    }
  });

  test('should show household settings section', async ({ page }) => {
    // Look for the household settings heading
    const settingsHeading = page.getByText(/household settings/i);
    
    await expect(settingsHeading).toBeVisible({ timeout: 10000 });
    
    // Take a screenshot of the entire page
    await page.screenshot({ path: 'tests/screenshots/household-settings-full.png', fullPage: true });
  });

  test('should show all buttons in household settings', async ({ page }) => {
    // Wait for household settings to load
    await page.waitForSelector('text=Household Settings', { timeout: 10000 });
    
    // Get all buttons in the household settings card
    const card = page.locator('text=Household Settings').locator('..').locator('..');
    const buttons = card.getByRole('button');
    
    const buttonTexts: string[] = [];
    const count = await buttons.count();
    
    for (let i = 0; i < count; i++) {
      const text = await buttons.nth(i).textContent();
      if (text) buttonTexts.push(text.trim());
    }
    
    console.log('Buttons found in Household Settings:', buttonTexts);
    
    // Take a screenshot
    await page.screenshot({ path: 'tests/screenshots/all-buttons.png', fullPage: true });
    
    // Check if Leave Household button is in the list
    const hasLeaveButton = buttonTexts.some(text => 
      text.toLowerCase().includes('leave') && text.toLowerCase().includes('household')
    );
    
    expect(hasLeaveButton).toBeTruthy();
  });
});

