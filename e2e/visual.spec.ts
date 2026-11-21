import { expect, test } from '@playwright/test'

import {
  FULL_RACE_DAY_MS,
  FULL_RACE_DAY_TEST_TIMEOUT_MS,
  RaceDayPage,
} from './support/race-day-page'

// Seed + frozen clock make every frame reproducible, so screenshots are stable.
test.describe('visual @visual', () => {
  let game: RaceDayPage

  test.beforeEach(async ({ page }) => {
    game = new RaceDayPage(page)
    await game.open(42)
  })

  test('before a program exists', async ({ page }) => {
    await expect(page).toHaveScreenshot('01-idle.png', { fullPage: true })
  })

  test('program generated, field at the gate', async ({ page }) => {
    await game.generate()
    await expect(page).toHaveScreenshot('02-ready.png', { fullPage: true })
  })

  test('mid-race, paused', async ({ page }) => {
    await game.generate()
    await game.togglePlayback()
    await game.wait(5_000)
    await game.togglePlayback()
    await expect(page).toHaveScreenshot('03-paused.png', { fullPage: true })
  })

  test('race day complete', async ({ page }) => {
    test.setTimeout(FULL_RACE_DAY_TEST_TIMEOUT_MS)
    await game.generate()
    await game.togglePlayback()
    await game.wait(FULL_RACE_DAY_MS)
    await expect(game.status).toHaveText('Race day complete')
    await expect(page).toHaveScreenshot('04-finished.png', { fullPage: true })
  })
})
