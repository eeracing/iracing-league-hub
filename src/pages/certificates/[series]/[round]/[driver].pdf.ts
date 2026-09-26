import type { APIRoute } from 'astro';
import { getSeriesConfigs, getSeriesView } from '../../../../lib/data';
import { certificateResults } from '../../../../lib/certificates';
import { createCertificatePdf } from '../../../../lib/certificate-pdf';
import type { RaceResult, Round, SeriesConfig } from '../../../../types';

export function getStaticPaths() {
  return getSeriesConfigs().flatMap((seriesConfig) => {
    const series = getSeriesView(seriesConfig);
    return series.races.flatMap((race) => {
      const round = series.data.rounds.find((item) => item.id === race.roundId)!;
      return certificateResults(seriesConfig, race).map((result) => ({
        params: { series: seriesConfig.slug, round: round.id, driver: result.driverId },
        props: { seriesConfig, round, result },
      }));
    });
  });
}

export const GET: APIRoute = async ({ props }) => {
  const { seriesConfig, round, result } = props as {
    seriesConfig: SeriesConfig;
    round: Round;
    result: RaceResult;
  };
  const pdf = await createCertificatePdf(seriesConfig, round, result);
  return new Response(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
    },
  });
};
