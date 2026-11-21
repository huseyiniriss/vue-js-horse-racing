import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import {
  FULL_RACE_DAY_MS,
  FULL_RACE_DAY_TEST_TIMEOUT_MS,
  RaceDayPage,
} from './support/race-day-page'

test.describe('race day', () => {
  let game: RaceDayPage
  const errors: string[] = []

  test.beforeEach(async ({ page }) => {
    errors.length = 0
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text())
    })
    game = new RaceDayPage(page)
    await game.open()
  })

  test.afterEach(() => {
    expect(errors, 'no console errors').toEqual([])
  })

  test('opens with a stable of 20 horses and nothing to start yet', async () => {
    await expect(game.horseRows).toHaveCount(20)
    await expect(game.status).toHaveText('Waiting for a program')
    await expect(game.playbackButton).toBeDisabled()
    await expect(game.generateButton).toBeEnabled()
  })

  test('generating draws six rounds of ten horses and lines up round 1', async () => {
    await game.generate()

    await expect(game.programRounds).toHaveCount(6)
    for (const round of await game.programRounds.all()) {
      await expect(round.locator('tbody tr')).toHaveCount(10)
    }
    await expect(game.roundTitle).toHaveText('Round 1 of 6')
    await expect(game.runners).toHaveCount(10)
    await expect(game.playbackButton).toHaveText('Start')
  })

  test('horses move while racing and freeze exactly while paused', async () => {
    await game.generate()
    await game.togglePlayback()
    await expect(game.status).toHaveText('Racing')
    await expect(game.generateButton).toBeDisabled()

    await game.wait(2_000)
    const moving = await game.runnerProgress()
    expect(moving.every((progress) => progress > 0)).toBe(true)

    await game.togglePlayback()
    await expect(game.playbackButton).toHaveText('Resume')
    const paused = await game.runnerProgress()
    await game.wait(5_000)
    expect(await game.runnerProgress()).toEqual(paused)

    await game.togglePlayback()
    await game.wait(1_000)
    const resumed = await game.runnerProgress()
    expect(resumed).toHaveLength(paused.length)
    resumed.forEach((progress, index) => {
      expect(progress).toBeGreaterThan(paused[index] ?? 1)
    })
  })

  test('results arrive round by round and match the finish on the track', async () => {
    await game.generate()
    await game.togglePlayback()

    await game.waitUntil(async () => (await game.resultRounds.count()) === 1)

    // The horse wearing the "1st" badge on the track tops the result table.
    const winnerLane = game.lanes.filter({ has: game.runners.filter({ hasText: '1st' }) })
    await expect(winnerLane).toHaveCount(1)
    const winnerName = await game.horseNameIn(winnerLane)
    await expect(game.resultRounds.first().locator('tbody tr').first()).toContainText(winnerName)
    await expect(game.announcer).toContainText(`${winnerName} wins`)
  })

  test('a full race day runs all six rounds in order', async () => {
    test.setTimeout(FULL_RACE_DAY_TEST_TIMEOUT_MS)
    await game.generate()
    await game.togglePlayback()
    await game.wait(FULL_RACE_DAY_MS)

    await expect(game.status).toHaveText('Race day complete')
    await expect(game.resultRounds).toHaveCount(6)
    const headings = await game.resultRounds
      .locator('h3')
      .evaluateAll((elements) =>
        elements.map((element) => [...element.children].map((child) => child.textContent.trim())),
      )
    expect(headings).toEqual([
      ['Round 1', '1,200 m'],
      ['Round 2', '1,400 m'],
      ['Round 3', '1,600 m'],
      ['Round 4', '1,800 m'],
      ['Round 5', '2,000 m'],
      ['Round 6', '2,200 m'],
    ])
    await expect(game.playbackButton).toBeDisabled()
    await expect(game.generateButton).toBeEnabled()
  })

  test('the same seed replays the same race day', async ({ page }) => {
    await game.generate()
    const program = await game.programRounds.allTextContents()

    await page.reload()
    await game.generate()
    expect(await game.programRounds.allTextContents()).toEqual(program)
  })

  test('has no detectable accessibility violations', async ({ page }) => {
    await game.generate()
    await game.togglePlayback()
    await game.wait(1_000)
    await game.togglePlayback()

    const { violations } = await new AxeBuilder({ page }).analyze()
    expect(violations.map((violation) => `${violation.id}: ${violation.help}`)).toEqual([])
  })
})
