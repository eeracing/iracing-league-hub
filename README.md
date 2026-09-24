# LeagueHub

**English** | [简体中文](README_zh-CN.md)

LeagueHub is a ready-to-use website template for iRacing leagues. Built with Astro, it generates a static site from your league configuration and iRacing race results. You can publish your own league site without building a page for every race.

The template includes:

- **League home page:** Shows series, recent results, and upcoming races.
- **Sponsors:** Shows configurable sponsor logos and links on the home page.
- **Series pages:** Show schedules, championship standings, the latest race results, and optional series information.
- **Race result pages:** Show race, qualifying, and practice results, including pole position and fastest lap data.
- **Automatic points calculation:** Applies configurable scoring rules and supports position penalties, points deductions, and disqualifications.
- **Multiple series and static builds:** Add a series by adding configuration and data; navigation and pages are generated at build time.

The repository includes fictional examples for a completed series and an upcoming series, so you can preview the site immediately after installing dependencies. To use it for your league, replace the examples and update the site settings, scoring rules, and race data.

## Quick start

Requires Node.js 22.12.0 or later.

```bash
npm install
npm run dev
```

Open the local URL shown in your terminal to see the example site. To set up your league, first edit the site settings in `config/site.ts`. Then use `series/demo-gt3/` or `series/demo-upcoming/` as a starting point for your series configuration and schedule. After a race, add its original iRacing result file and reference it from the corresponding round. The files involved are described below.

Check and build the static site:

```bash
npm run check
npm run build
```

The build output is in `dist/`. Run `npm run preview` to preview the built site locally. `npm run build` also runs the Astro checks before building.

## Data and configuration

| Path | Purpose |
| --- | --- |
| `config/site.ts` | Site name, logo, site season, locale, display time zone, accent color, and default table columns |
| `config/sponsors.ts` | Home page sponsor names, logos, optional links, and display order |
| `config/points.ts` | Shared scoring rules for finishing positions, pole position, and fastest lap |
| `series/<slug>/config.ts` | Series name, route, scoring system, and optional season name, order, visibility, display overrides, and logo |
| `series/<slug>/series.json` | Car class (`carClass`) and ordered schedule (`rounds`) |
| `series/<slug>/info.md` | Optional series introduction and rules, displayed on the site |
| `series/<slug>/eventresult-*.json` | Unmodified iRacing race result API responses |
| `series/<slug>/penalties/<roundId>.json` | Optional stewarding decisions for a round |

Each series `config.ts` must export a default configuration with `id`, `name`, `shortName`, `slug`, and `pointsSystem`. The `slug` must match the directory name, and `pointsSystem` must reference a key in `config/points.ts`. Use `display` to override the site-wide table options. Do not enter race result rows manually in the configuration.

Set `site.timeZone` in `config/site.ts` (for example, `Pacific/Auckland`) to display schedule dates consistently across builds. Keep `date` values in `series.json` as ISO 8601 timestamps with `Z` or an explicit UTC offset. Rebuild the site after changing the configuration.

Set `seasonName` in a series configuration to show it on that series' home page card and series page. If omitted or blank, no season name appears for that series. The home page heading and footer use the independent site-wide season name. Use numeric `order` to sort series on the home page and in navigation, with lower values first. Its default is `0`, and ties use directory path order. Set `visible: false` to remove a series from the home page cards, latest results, upcoming races, and navigation; series are visible by default. Hidden series and result pages are still generated and remain accessible through direct links.

Put series logos in `public/series/` and reference them with a site-root path, such as `logo: '/series/demo-gt3.svg'`. A logo appears in the home page series list and at the top of the series page; if none is configured, text is shown instead. The main navigation always uses text.

The `sponsors` array in `config/sponsors.ts` controls the home page partner section. Each entry needs `name` and `logo`; `url` and numeric `order` are optional (lower values appear first). Put logo files in `public/sponsors/` and reference them with paths such as `/sponsors/example.svg`. Cards with a URL are clickable; an empty array hides the entire section. Replace the three `DEMO` entries and logos before publishing your league site.

Use `info.md` for the league's purpose, entry requirements, format, cars, prizes, broadcasts, and rules. When the file exists, the series page displays a “Series information” section and a link to it in the page navigation. Scoring rules and other conditions used in calculations must still be defined in structured configuration rather than only in prose.

### Schedule and result files

Each round in `series.json` can reference an original result file in the same directory through `resultFile`. Omit the `.json` extension from the value. For example:

```json
{
  "carClass": "DEMO GT3 · Fictional data",
  "rounds": [
    {
      "id": "round-1",
      "round": 1,
      "name": "DEMO Round 01 · Spa-Francorchamps",
      "track": "Spa-Francorchamps",
      "layout": "Grand Prix",
      "date": "2026-07-05T10:00:00Z",
      "resultFile": "eventresult-demo-01"
    }
  ]
}
```

Leave out `resultFile` for rounds that have not taken place. The first scheduled round without a result is treated as the next race. After adding or replacing a result file, rebuild the site to update the official results, standings, series progress, and home page automatically.

### Penalty files

Put stewarding decisions in `series/<slug>/penalties/<roundId>.json` and leave the original result file unchanged. Position drops, points deductions, and disqualifications are supported. See the [penalty file reference](series/penalties.md) for the full JSON format (in Chinese).

Position changes and disqualifications take effect before points are calculated. A disqualified driver scores zero points for that round, including pole position and fastest lap bonuses; their lap times are also excluded from the official fastest lap statistics.

## Managing series

### Add a series

1. Create `series/<slug>/` and use an existing series as a guide for its default-exported `config.ts`. Make sure `slug` matches the directory name. If you need a logo, put it in `public/series/` and reference it from the configuration.
2. Add `series.json` with `carClass` and `rounds`. Add `info.md` if you want an introduction.
3. Put the original `eventresult-*.json` files for completed races in the series directory and set `resultFile` on the corresponding rounds. Add `penalties/<roundId>.json` files if needed.
4. Run `npm run build` and inspect the generated pages.

`src/lib/data.ts` automatically discovers `series/*/config.ts`; pages also read an optional `info.md` from the same directory. Navigation, the home page series list, recent results, and upcoming races include visible series, while series pages and result pages for completed races are generated for every series during the build.

### Remove or archive a series

Delete its `series/<slug>/` directory or move it outside `series/` to archive it. On the next build, that series disappears from the generated pages, home page, and navigation.

### Included examples

- `series/demo-gt3/`: **DEMO / fictional data** with 12 simulated rounds, three sessions per round, and separate penalty files. It demonstrates the pages, standings, and penalty workflow and does not represent real races.
- `series/demo-upcoming/`: **DEMO / fictional data** with six scheduled rounds and no results. It demonstrates series progress before the first race, the next race, empty standings, and the upcoming schedule. No result pages or “Race results” page navigation are generated for this series.

## How results are generated

```text
Original iRacing JSON → adapter → penalties → official race results → points → standings
```

`src/lib/iracing-adapter.ts` parses Practice, Qualifying, and Race sessions. Only Race sessions affect penalties, championship points, and official fastest lap statistics. Qualifying results are also used to determine the race pole sitter. Practice and qualifying results do not affect which round is current or which race is next.

The adapter converts iRacing time values from ten-thousandths of a second into display text and milliseconds. It converts valid zero-based positions to one-based positions (`-1` still means no valid position). Race results retain starting and finishing positions, class positions, laps led, status, and the original retirement reason. Timed sessions retain the driver, car number, car, fastest lap, and gap to the session's fastest lap; an invalid lap time is displayed as “—”. Drivers are identified by their iRacing `cust_id`.

`getStaticPaths()` generates pages from the discovered configurations and schedules. The default result route, `/racing/<slug>/results/<roundId>`, shows the race. When the corresponding session data exists, `/qualifying` and `/practice` subpages are also generated. The three session pages share a header and navigation; the race table also shows starting positions.

The main implementation lives in `src/lib/`: `data.ts` loads data, `penalties.ts` applies penalties, `points.ts` calculates points, and `standings.ts` builds standings. `src/components/` contains shared navigation, cards, tables, and result sections; `src/pages/` defines the home, series, and result routes. Page components do not depend directly on iRacing API fields.
