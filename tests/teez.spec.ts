import { expect, test } from '@playwright/test';

test('every time cap is honored and a briefing ends after its last unique card', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.clock.install();
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('The internet,');
  await page.screenshot({ path: 'test-results/teez-desktop.png' });
  const sizes: number[] = [];
  for (const minutes of [5, 10, 15, 20]) {
    const radio = page.getByRole('radio', { name: new RegExp(`^${minutes}\\s*min$`) });
    await page.locator('.duration').filter({ has: radio }).click();
    await expect(radio).toBeChecked();
    const summary = page.getByText(/stories · \d+:\d+ max/);
    const match = (await summary.innerText()).match(/(\d+) stories · (\d+):(\d+) max/)!;
    sizes.push(Number(match[1]));
    expect(Number(match[2]) * 60 + Number(match[3])).toBeLessThanOrEqual(minutes * 60);
  }
  expect(sizes).toEqual([...new Set(sizes)].sort((a, b) => a - b));
  await page.locator('.duration').filter({ has: page.getByRole('radio', { name: /^5\s*min$/ }) }).click();
  await page.getByRole('button', { name: 'Start briefing' }).click();
  await expect(page.getByRole('heading', { name: 'Looksmaxxing' })).toBeVisible();
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await page.clock.fastForward(12_000);
  await expect(page.getByText('Paused', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Resume', exact: true }).click();
  await page.clock.fastForward(7_000);
  await expect(page.getByText('Reading time', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Replay clip' }).click();
  await expect(page.getByText('Playing clip', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Save Looksmaxxing' }).click();
  const seen = new Set<string>();
  for (let index = 0; index < sizes[0]; index++) {
    await expect(page.getByText(new RegExp(`Card ${String(index + 1).padStart(2, '0')} /`))).toBeVisible();
    seen.add(await page.getByRole('heading', { level: 1 }).innerText());
    await page.clock.fastForward(46_000);
  }
  await expect(page.getByRole('heading', { name: 'You’re caught up.' })).toBeVisible();
  expect(seen.size).toBe(sizes[0]);
  await page.getByRole('button', { name: 'Open archive' }).click();
  await expect(page.getByText(`${sizes[0]} learned`, { exact: true })).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'Saved', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Preview Looksmaxxing' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('mobile archive persists a dated cover, tags, and a note', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  await page.screenshot({ path: 'test-results/teez-mobile.png' });
  await page.getByRole('button', { name: 'Archive', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Archive.' })).toBeVisible();
  await page.getByRole('button', { name: 'Today’s entry' }).click();
  await page.getByLabel(/Tags/).fill('slang, music');
  await page.getByLabel('Note', { exact: true }).fill('A little culture catch-up.');
  const image = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 80; canvas.height = 60;
    const context = canvas.getContext('2d')!;
    context.fillStyle = '#dcf856'; context.fillRect(0, 0, 80, 60);
    return canvas.toDataURL().split(',')[1];
  });
  await page.getByLabel(/Cover photo/).setInputFiles({ name: 'cover.png', mimeType: 'image/png', buffer: Buffer.from(image, 'base64') });
  await page.getByRole('button', { name: 'Save entry' }).click();
  await page.reload();
  await page.getByRole('button', { name: 'Archive', exact: true }).click();
  await expect(page.getByText('#slang', { exact: true })).toBeVisible();
  await expect(page.getByText('A little culture catch-up.', { exact: true })).toBeVisible();
  await expect(page.locator('.journal-cover img')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});
