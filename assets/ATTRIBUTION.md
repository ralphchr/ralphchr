# Asset sources and maintenance

## Identity and artwork

The README is entirely image-based, with linked SVGs, responsive pictures and descriptive alt text. The visual identity follows Ralph’s portfolio: near-black #09090F, ivory #F0E9DD, cyan #8EBBEE, silver #C5C6D0, deep purple #8B5CF6 and restrained red #EF7583. The public portfolio and Work in Progress page are unchanged.

Inter Black and JetBrains Mono come from the portfolio’s existing @fontsource packages. Primary lettering is converted to paths, so no custom fonts need to load on GitHub. Original font licenses remain in `licenses/`; outlined geometry is in `scripts/lib/font-outlines.json`. Dim terminal texture uses a system monospace fallback. It is decorative, not a claim about actual system status or security activity.

Technology icons come from [Simple Icons 16.0.0](https://github.com/simple-icons/simple-icons/tree/16.0.0), with Adobe and Canva marks from [Simple Icons 13.21.0](https://github.com/simple-icons/simple-icons/tree/13.21.0). CC0 licenses and trademark guidance are retained in `licenses/`. React Native shares the React mark; C++ GDExtension uses the C++ mark. AI, speech, NLP, extension symbols and social glyphs are original illustrations rather than vendor logos.

## Compact composition

“The build log” contains all six documented projects in their established order, with LazyFill below RELAYA. Descriptions and stacks come from the portfolio, resume, direct user updates and LazyFill source. RELAYA shows its documented AI approach because no implementation language was provided. Unavailable project links are omitted. Previously supplied logos and game screens remain under `projects/` as unused references.

“Instruments of craft” groups the same language, development, security and design icons in a denser grid. “Signals from the lab” groups four independently linked, 198px-wide public-stat cards; they wrap naturally on smaller viewports. A shallow contribution chart sits beneath the cards. No native Markdown table or custom CSS is required.

The large repeated-name biography is replaced with a compact continuation below the banner: “UP CEBU . COMPUTER SCIENCE - II,” a brief monospaced manifesto, and interests. The full name appears in the banner. “Parallel pursuits” compresses the four roles into one desktop row and two columns on phones: UPCSG Marketing Director; seasonal tutor in calculus/programming; freelance graphic designer for Pubmats/VFX; competitive Tier 2 CODM esports player. All role details are supplied directly by Ralph.

“Open a channel” uses original architectural link plates: cut corners, circular icon insets, fine cyan rules and diagonal link arrows. Filled command bars and shell-command captions from the supplied layout reference are not used. At 260px wide, Facebook, LinkedIn and Gmail fit one desktop row and wrap on phones. The destinations and order remain unchanged; Gmail links to `mailto:borbon.rchr@gmail.com`.

## Animation and accessibility

The 1200 × 480 banner retains its 5:2 ratio everywhere. It types individual outlined characters with a blinking cursor, holds the title, and backspaces in a 16-second loop. The prominent portfolio callout remains fully visible and links to https://ralphchr.vercel.app/. Two-second cyan/red glitches use hard cuts rather than panel fades.

Each area retains distinct native SVG SMIL motion: project routing and glitch shifts, traced icon frames, small statistical indicators, the contribution signal, and terminal arrows. Numeric data stays unchanged by animation. Every animated asset has a static reduced-motion alternative. GitHub images cannot use scroll triggers or JavaScript, so animation repeats on a clock. The source SVGs require no external resources or CSS. Older unused artwork remains as reference material.

## Verified statistics

All cards show snapshot dates rather than claiming to be live. Numbers in supplied reference screenshots are never copied.

- GitHub: counts come from the [public calendar](https://github.com/users/ralphchr/contributions). Totals cover the available calendar range, not a lifetime total. Monday-Sunday weekly streaks are computed within that range; the unfinished current week has a grace period. The longest streak can be truncated by the left edge of the calendar. The compact card includes real last-31-day histogram bars; the chart below connects those same daily counts and preserves exact date/count tooltips.
- LeetCode: verified public counts come through [LeetCode Stats Card](https://github.com/JacobLinCool/LeetCode-Stats-Card), using the confirmed ralphchr account. Difficulty bars show the distribution of solved problems rather than completion of the full problem set. Ranking and refresh date remain visible.
- HackerRank: the confirmed [public profile](https://www.hackerrank.com/profile/ralphchr) supplies track data through its [public badge endpoint](https://www.hackerrank.com/rest/hackers/ralphchr/badges). The compact card shows track count and per-track solved counts, with the full ranks preserved in its description and snapshot. Track solves are not summed because sets can overlap. No proficiency ratings or certificates are inferred.
- Monkeytype: the confirmed [public profile](https://monkeytype.com/profile/ralphchr) is read through the [documented public API](https://api.monkeytype.com/docs), without a key. It shows 15s/30s English normal-mode personal bests with punctuation, numbers and lazy mode disabled, preserving each result’s accuracy. Completed tests and typing time are real public fields.

Collectors validate upstream responses before replacing files under `data/`. Only the public username is sent to each service. Failed fetches preserve the last valid snapshot. HackerRank refresh is optional in the workflow so a transient provider error does not block other valid updates.

## Rebuilding

Run `node scripts/build-profile.cjs` with Node 20+ to regenerate local artwork; no npm packages are required. `scripts/lib/compact-stats.cjs` owns the compact statistical cards and chart. Statistical plates use the portfolio’s near-black background, architectural corner cuts, quiet grids and thin rules rather than the reference image’s filled terminal bars or tiled meters. The earlier stats module retains the shared weekly calculation and legacy reference renderers.

Refresh data with `python scripts/update-activity.py`, `python scripts/update-leetcode.py`, `python scripts/update-monkeytype.py` and `python scripts/update-hackerrank.py`, then run `node scripts/build-profile.cjs --stats-only`. The existing GitHub Actions workflow refreshes these daily at 03:17 UTC (11:17 AM Manila), manually and when generator files change. Upstream and GitHub caching can delay display changes. Repository rules must allow bot commits.

## Continuous transparent canvas

All displayed artwork now has transparent container fills, including the banner, project chips, toolkit icon tiles, statistics and socials. Separate card/panel outlines are removed; foreground typography, thin rules, icons and data graphics sit directly on GitHub’s single README surface. The portfolio callout remains a foreground outline. Subtle grid/circuit marks are transparent overlays rather than opaque panels.

The generator emits readable dark-theme originals and light-theme counterparts with ink text and deeper cyan/purple accents. README picture sources select the palette using prefers-color-scheme and preserve reduced-motion and mobile variants. Both palettes retain transparency. The generator’s final rendering step strips legacy opaque container colors from reused icon tiles; foreground data marks remain filled. Daily stats refreshes regenerate both palettes too.

The repeated RC_ stamps are removed from statistics and social links. The original banner keeps a single RC_ signature; no other displayed panel repeats the watermark.
