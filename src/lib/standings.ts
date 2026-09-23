import type { ScoredRace, Standing } from '../types';
import { getFastestLap } from './points';

export function calculateStandings(races: ScoredRace[]): Standing[] {
  const drivers = new Map<string, Omit<Standing, 'position'>>();

  for (const race of races) {
    const fastest = getFastestLap(race);
    for (const result of race.results) {
      const racePoints = race.championshipPoints.find((entry) => entry.driverId === result.driverId);
      if (!racePoints) continue;

      const standing = drivers.get(result.driverId) ?? {
        driverId: result.driverId,
        driver: result.driver,
        carNumber: result.carNumber,
        car: result.car,
        roundPoints: {},
        points: 0,
        wins: 0,
        poles: 0,
        fastestLaps: 0,
      };
      standing.roundPoints[race.roundId] = racePoints.points;
      standing.points += racePoints.points;
      standing.wins += result.position === 1 && result.status !== 'disqualified' ? 1 : 0;
      standing.poles += race.poleDriverId === result.driverId ? 1 : 0;
      standing.fastestLaps += fastest?.driverId === result.driverId ? 1 : 0;
      drivers.set(result.driverId, standing);
    }
  }

  return [...drivers.values()]
    .sort((a, b) => b.points - a.points || b.wins - a.wins || a.driver.localeCompare(b.driver))
    .map((standing, index) => ({ ...standing, position: index + 1 }));
}
