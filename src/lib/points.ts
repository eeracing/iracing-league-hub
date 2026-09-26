import { pointsSystems } from '../../config/points';
import type { OfficialRace, Race, RaceResult, ScoredRace, SeriesConfig } from '../types';

export function getFastestLap(race?: Race): RaceResult | undefined {
  if (!race?.results.length) return undefined;
  const validResults = race.results.filter(
    (result) => result.status !== 'disqualified'
      && Number.isFinite(result.bestLapMs) && result.bestLapMs > 0,
  );
  if (!validResults.length) return undefined;
  return validResults.reduce((best, result) =>
    result.bestLapMs < best.bestLapMs ? result : best,
  );
}

export function calculateRacePoints(race: OfficialRace, series: SeriesConfig): ScoredRace {
  const rules = pointsSystems[series.pointsSystem];
  const fastest = getFastestLap(race);
  const customBonuses = 'customBonus' in rules ? rules.customBonus(race) : {};

  const championshipPoints = race.results.map((result) => {
    const isDisqualified = result.status === 'disqualified';
    const positionPoints = isDisqualified ? 0 : (rules.positions[result.position - 1] ?? 0);
    const poleBonus = !isDisqualified && race.poleDriverId === result.driverId ? rules.poleBonus : 0;
    const fastestLapBonus = !isDisqualified && fastest?.driverId === result.driverId
      ? rules.fastestLapBonus
      : 0;
    const customBonus = isDisqualified ? 0 : (customBonuses[result.driverId] ?? 0);
    const penalty = race.penalties
      .reduce((total, item) => item.type === 'points' && item.driverId === result.driverId
        ? total + item.points
        : total, 0);

    return {
      driverId: result.driverId,
      positionPoints,
      poleBonus,
      fastestLapBonus,
      customBonus,
      penalty,
      points: isDisqualified ? 0 : positionPoints + poleBonus + fastestLapBonus + customBonus - penalty,
    };
  });

  return { ...race, championshipPoints };
}
