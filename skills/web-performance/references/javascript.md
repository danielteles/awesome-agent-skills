# JavaScript Cost and Code Splitting — why

The rules are in the `web-performance` Ruleset (`javascript` group). This file is the reasoning and
a `❌ / ✅` example — it adds no rule the Ruleset does not state.

- **JavaScript is the most expensive byte.** A KB of JS costs more than a KB of image: it downloads,
  parses, compiles, and executes, all on the main thread, all before the page is interactive. The
  entry bundle is the number to defend.
- **Look before you ship.** A bundle analyzer shows what is actually in there — a moment library,
  two copies of a dependency, a whole icon set for three icons, a locale file for every language.
  Most wins are deletions.
- **Split at the route.** The checkout route should not carry the dashboard's charting library.
  Route-level splitting plus lazy-loading below-the-fold widgets keeps the initial download to what
  the first screen needs.
- **Import narrowly.** `import { debounce } from 'lodash-es'` tree-shakes; `import _ from 'lodash'`
  does not. For a small need, a platform API (`structuredClone`, `Intl`, `URLSearchParams`) or a
  1 KB package beats a 70 KB one.
- **Target modern browsers.** Transpiling to ES5 and polyfilling for browsers you do not support
  inflates every file. Set `browserslist` to the real baseline and serve a modern build.
- **Preload the split graph.** Naive splitting creates a waterfall: the route chunk is discovered
  only after the entry runs. `modulepreload` the critical chunks so they download in parallel.

```tsx
// ❌ whole libraries in the entry bundle; heavy widget eager; default import
import moment from 'moment';
import * as Icons from 'react-icons/fa';
import { HeavyChart } from './heavy-chart';

// ✅ platform API, lazy widget, narrow imports
import { FaUser } from 'react-icons/fa';
const HeavyChart = lazy(() => import('./heavy-chart'));
const when = new Intl.DateTimeFormat(locale).format(date);
```
