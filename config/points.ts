export const pointsSystems = {
  standard: {
    positions: [25, 20, 16, 13, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
    poleBonus: 1,
    fastestLapBonus: 1,
  },
  endurance: {
    positions: [40, 35, 32, 30, 28, 26, 24, 22, 20, 18, 16, 14, 12, 10, 8],
    poleBonus: 0,
    fastestLapBonus: 1,
  },
} as const;
