import { expect, type Locator, type Page } from '@playwright/test'

/** Longest possible race day with the default rules and timing, plus margin. */
export const FULL_RACE_DAY_MS = 150_000
/** Rendering ~9,000 animation frames takes a while in CI; give full-day tests room. */
export const FULL_RACE_DAY_TEST_TIMEOUT_MS = 180_000

/**
 * Page object for the race day screen. Tests talk in user terms
 * ("generate", "start", "results") instead of selectors.
 */
export class RaceDayPage {
  readonly generateButton: Locator
  readonly playbackButton: Locator
  readonly status: Locator
  readonly roundTitle: Locator
  readonly horseRows: Locator
  readonly programRounds: Locator
  readonly resultRounds: Locator
  readonly runners: Locator
  readonly announcer: Locator

  constructor(private readonly page: Page) {
    this.generateButton = page.getByTestId('generate')
    this.playbackButton = page.getByTestId('playback')
    this.status = page.getByTestId('race-status')
    this.roundTitle = page.getByTestId('round-title')
    this.horseRows = page.getByTestId('horse-row')
    this.programRounds = page.getByTestId('program-round')
    this.resultRounds = page.getByTestId('result-round')
    this.runners = page.getByTestId('runner')
    this.announcer = page.getByTestId('announcer')
  }

  /** Opens the game with a fixed seed and a controllable clock. */
  async open(seed = 42): Promise<void> {
    await this.page.clock.install()
    await this.page.goto(`/?seed=${seed}`)
    await documentReady(this.page)
  }

  async generate(): Promise<void> {
    await this.generateButton.click()
  }

  async togglePlayback(): Promise<void> {
    await this.playbackButton.click()
  }

  /** Lets race time pass: animation frames fire as if `ms` real milliseconds went by. */
  async wait(ms: number): Promise<void> {
    await this.page.clock.runFor(ms)
  }

  /** Advances race time in small steps until `done` holds (fails after `maxMs`). */
  async waitUntil(done: () => Promise<boolean>, stepMs = 250, maxMs = 60_000): Promise<void> {
    for (let waited = 0; waited <= maxMs; waited += stepMs) {
      if (await done()) return
      await this.wait(stepMs)
    }
    throw new Error(`Condition not reached within ${maxMs} ms of race time`)
  }

  async runnerProgress(): Promise<number[]> {
    return this.runners.evaluateAll((elements) =>
      elements.map((element) =>
        Number((element as HTMLElement).style.getPropertyValue('--progress')),
      ),
    )
  }

  lane(lane: number): Locator {
    return this.page.getByTestId(`lane-${lane}`)
  }
}

async function documentReady(page: Page): Promise<void> {
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
}
