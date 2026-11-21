import { formatDistance } from '@/shared/lib/format'

// User-facing text of the race feature.
export const RACE_COPY = {
  generate: 'Generate program',
  start: 'Start',
  pause: 'Pause',
  resume: 'Resume',
  generateLocked: 'A new program can be generated when the current race day ends.',

  trackTitle: 'Race track',
  trackIdle: 'Generate a program to line up the first field.',
  roundOf: (round: number, total: number) => `Round ${round} of ${total}`,
  distance: (metres: number) => formatDistance(metres),
  lane: (lane: number) => `Lane ${lane}`,
  finish: 'Finish',
  statusLabel: {
    idle: 'Waiting for a program',
    ready: 'Ready to start',
    running: 'Racing',
    paused: 'Paused',
    finished: 'Race day complete',
  },

  programTitle: 'Program',
  programEmpty: 'Generate a program to draw six rounds of ten horses.',
  resultsTitle: 'Results',
  resultsEmpty: 'Results appear here as each round finishes.',
  roundTitle: (round: number) => `Round ${round}`,
  columnLane: 'Lane',
  columnPosition: 'Pos',
  columnHorse: 'Horse',
  columnTime: 'Time or gap',
  roundsDone: (done: number, total: number) => `${done} of ${total}`,
  announceRoundStart: (round: number, metres: number) =>
    `Round ${round} is off, ${formatDistance(metres)}.`,
  announceWinner: (round: number, winner: string) => `Round ${round} finished. ${winner} wins.`,
  announceDayComplete: 'All rounds are finished.',

  photoTitle: (round: number) => `Photo finish, round ${round}`,
  photoVerdict: (winner: string, margin: string) => `${winner} wins by ${margin} s`,
  photoWinnerTick: 'Winner',
  photoEmptyTitle: 'Photo finish',
  photoEmpty: 'The finish-line camera prints each round here as soon as it ends.',
  photoGapTick: (seconds: number) => `+${seconds} s`,
} as const
