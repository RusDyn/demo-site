import { test, expect } from '@playwright/test';

test.describe('User Registration Flow', () => {
  test('should register new user successfully', async ({ page }) => {
    // Navigate to registration
    await page.goto('/register');
    
    // Fill form
    await page.fill('[name="email"]', 'testuser@example.com');
    await page.fill('[name="password"]', 'SecurePass123!');
    await page.fill('[name="confirmPassword"]', 'SecurePass123!');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Verify success
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Welcome');
  });

  test('should show validation errors', async ({ page }) => {
    await page.goto('/register');
    
    // Submit empty form
    await page.click('button[type="submit"]');
    
    // Check errors
    await expect(page.locator('.error')).toContainText('Email is required');
    await expect(page.locator('.error')).toContainText('Password is required');
  });
});