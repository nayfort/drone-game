import { test, expect } from '@playwright/test';

test('setup, controls, cave exit and restart', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/init', async route => {
    expect(route.request().postDataJSON()).toEqual({ name: 'Pilot', complexity: 0 });
    await route.fulfill({ json: { id: 'pilot-1' } });
  });
  await page.route('**/token/*?*', route => route.fulfill({ json: { chunk: 'token' } }));
  await page.routeWebSocket('**/cave', socket => {
    socket.onMessage(message => {
      expect(message).toBe('player:pilot-1-tokentokentokentoken');
      for (let row = 0; row < 10; row++) socket.send('100,500');
      socket.send('finished');
    });
  });
  await page.goto('/');
  await page.getByPlaceholder('Enter your name').fill('Pilot');
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await expect(page.locator('.drone')).toBeVisible();
  await page.waitForTimeout(150);
  await expect(page.locator('.drone')).toHaveCSS('top', '0px');
  await page.keyboard.press('ArrowUp');
  await expect(page.getByText('Congratulations!', { exact: true })).toBeVisible({ timeout: 10000 });
  const result = await page.locator('.ant-modal-body').innerText();
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(150);
  await expect(page.locator('.ant-modal-body')).toHaveText(result);
  await page.getByRole('button', { name: 'Play again' }).click();
  await expect(page.getByRole('heading', { name: 'Drone Game' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('initialization failure is visible and can be retried', async ({ page }) => {
  await page.route('**/init', route => route.fulfill({ status: 503, body: 'Unavailable' }));
  await page.goto('/');
  await page.getByPlaceholder('Enter your name').fill('Pilot');
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Unable to start');
  await expect(page.getByRole('button', { name: 'Start', exact: true })).toBeEnabled();
});

test('incomplete cave stream fails instead of starting a partial game', async ({ page }) => {
  await page.route('**/token/*?*', route => route.fulfill({ json: { chunk: 'token' } }));
  await page.routeWebSocket('**/cave', socket => socket.onMessage(() => {
    socket.send('100,500');
    socket.close();
  }));
  await page.goto('/game/pilot');
  await expect(page.getByRole('alert')).toContainText('Unable to load');
  await expect(page.locator('.drone')).toHaveCount(0);
});

test('a wall collision stops movement and scoring', async ({ page }) => {
  await page.route('**/token/*?*', route => route.fulfill({ json: { chunk: 'token' } }));
  await page.routeWebSocket('**/cave', socket => socket.onMessage(() => {
    for (let row = 0; row < 50; row++) socket.send('100,200');
    socket.send('finished');
  }));
  await page.goto('/game/pilot');
  await expect(page.locator('.drone')).toBeVisible();
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByText('Game Over', { exact: true })).toBeVisible();
  const left = await page.locator('.drone').evaluate(element => (element as HTMLElement).style.left);
  await page.keyboard.press('ArrowUp');
  await page.waitForTimeout(200);
  await expect(page.locator('.drone')).toHaveCSS('left', left);
  await expect(page.locator('.ant-modal-body')).toContainText('score is: 0');
});

test('selected difficulty reaches the API', async ({ page }) => {
  let difficulty: number | undefined;
  await page.route('**/init', route => {
    difficulty = route.request().postDataJSON().complexity;
    return route.fulfill({ status: 503 });
  });
  await page.goto('/');
  await page.getByPlaceholder('Enter your name').fill('Pilot');
  await page.locator('.ant-select-selector').click();
  await page.getByTitle('7', { exact: true }).click();
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  expect(difficulty).toBe(7);
});
