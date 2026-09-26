import type { RaceResult, ScoredRace, SeriesConfig } from '../types';

export function certificateResults(series: SeriesConfig, race: ScoredRace): RaceResult[] {
  const setting = series.certificates ?? 'off';
  if (setting === 'off') return [];
  if (setting !== 'all' && (!Number.isInteger(setting.top) || setting.top < 1)) {
    throw new Error(`Invalid certificate top limit for ${series.slug}: ${setting.top}`);
  }

  return race.results.filter((result) =>
    result.position > 0
    && result.status !== 'disqualified'
    && (setting === 'all' || result.position <= setting.top),
  );
}

export function certificateUrl(seriesSlug: string, roundId: string, driverId: string): string {
  return `/certificates/${encodeURIComponent(seriesSlug)}/${encodeURIComponent(roundId)}/${encodeURIComponent(driverId)}.pdf`;
}
