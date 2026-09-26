import type { OfficialRace, RaceResult } from '../src/types';

type PointsSystem = {
  positions: readonly number[];
  poleBonus: number;
  fastestLapBonus: number;
  customBonus?: (race: OfficialRace) => Record<string, number>;
};

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
  custom: {
    positions: [32, 24, 18, 14, 12, 10, 8, 6, 4, 2],
    poleBonus: 1,
    fastestLapBonus: 1,
    customBonus: (race: OfficialRace) => {
      const bonuses: Record<string, number> = {};
      const award = (driverId: string) => { bonuses[driverId] = (bonuses[driverId] ?? 0) + 1; };
      const classified = race.results.filter((result) => result.position > 0 && result.status !== 'disqualified');

      const mostImproved = classified
        .filter((result) => result.startPosition > 0 && result.startPosition > result.position)
        .reduce<RaceResult | undefined>((best, result) =>
          !best || result.startPosition - result.position > best.startPosition - best.position
            || (result.startPosition - result.position === best.startPosition - best.position
              && result.position < best.position) ? result : best, undefined);
      if (mostImproved) award(mostImproved.driverId);

      const cleanest = classified.reduce<RaceResult | undefined>((best, result) =>
        !best || result.incidents < best.incidents
          || (result.incidents === best.incidents && result.position < best.position)
          ? result : best, undefined);
      if (cleanest) award(cleanest.driverId);

      for (const result of classified) {
        if (result.position >= 11 && result.status === 'finished') award(result.driverId);
      }
      return bonuses;
    },
  },
} satisfies Record<string, PointsSystem>;
