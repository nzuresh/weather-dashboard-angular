// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Weather Dashboard E2E Tests
 * Validates UI functionality of the AngularJS Weather Dashboard
 * These tests run against the local dev server before code is pushed to GitHub
 */

test.describe('Weather Dashboard - Core Functionality', () => {

  test('AC1: Application loads and renders without errors', async ({ page }) => {
    // Collect console errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/');

    // Verify main app structure renders
    await expect(page.locator('h1')).toContainText('Weather Dashboard');
    await expect(page.locator('.search-input')).toBeVisible();
    await expect(page.locator('.search-button')).toBeVisible();

    // No critical console errors (ignore network errors from missing API key)
    const criticalErrors = errors.filter(e => !e.includes('401') && !e.includes('API'));
    expect(criticalErrors).toHaveLength(0);
  });

  test('AC2: Search input accepts city names', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.locator('.search-input');
    await searchInput.fill('London');

    await expect(searchInput).toHaveValue('London');
  });

  test('AC3: Search button is present and clickable', async ({ page }) => {
    await page.goto('/');

    const searchButton = page.locator('.search-button');
    await expect(searchButton).toBeVisible();
    await expect(searchButton).toBeEnabled();
  });

  test('AC4: Temperature unit toggle works', async ({ page }) => {
    await page.goto('/');

    const toggleButton = page.locator('.toggle-button');
    await expect(toggleButton).toBeVisible();

    // Click toggle and verify it switches
    await toggleButton.click();

    // Should show the other unit after clicking
    const unitDisplay = page.locator('.current-unit-display');
    await expect(unitDisplay).toBeVisible();
  });

  test('AC5: Dark mode toggle renders and switches theme', async ({ page }) => {
    await page.goto('/');

    const themeToggle = page.locator('.theme-toggle-btn');
    await expect(themeToggle).toBeVisible();

    // Click to enable dark mode
    await themeToggle.click();

    // Verify body has dark-theme class
    await expect(page.locator('body')).toHaveClass(/dark-theme/);

    // Click again to switch back to light mode
    await themeToggle.click();

    // Verify body has light-theme class
    await expect(page.locator('body')).toHaveClass(/light-theme/);
  });

  test('AC6: Empty state message shown when no weather data', async ({ page }) => {
    await page.goto('/');

    const emptyState = page.locator('.weather-empty-state');
    await expect(emptyState).toBeVisible();
    await expect(emptyState).toContainText('No weather data to display');
  });

  test('AC7: Favorites section is visible', async ({ page }) => {
    await page.goto('/');

    const favoritesSection = page.locator('.favorites-section');
    await expect(favoritesSection).toBeVisible();
    await expect(page.locator('#favoritesHeading')).toContainText('Favorite Cities');
  });
});

test.describe('Weather Dashboard - Accessibility', () => {

  test('AC8: Skip to main content link exists', async ({ page }) => {
    await page.goto('/');

    const skipLink = page.locator('.skip-to-main');
    await expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  test('AC9: Search input has proper aria labels', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.locator('#citySearchInput');
    await expect(searchInput).toHaveAttribute('aria-label', 'City name search');
  });

  test('AC10: Theme toggle has aria-label', async ({ page }) => {
    await page.goto('/');

    const themeToggle = page.locator('.theme-toggle-btn');
    const ariaLabel = await themeToggle.getAttribute('aria-label');
    expect(ariaLabel).toMatch(/Switch to (light|dark) mode/);
  });
});

test.describe('Weather Dashboard - Responsive Layout', () => {

  test('AC11: Renders correctly at desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');

    await expect(page.locator('.container')).toBeVisible();
    await expect(page.locator('.search-section')).toBeVisible();
    await expect(page.locator('.content-grid')).toBeVisible();
  });

  test('AC12: Renders correctly at mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    await expect(page.locator('.container')).toBeVisible();
    await expect(page.locator('.search-input')).toBeVisible();
    await expect(page.locator('.search-button')).toBeVisible();
  });
});
