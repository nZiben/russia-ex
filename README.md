# russia-ex – interactive footprint map of Russian regions

**russia-ex** is a single-page web app.  
It lets you mark where you’ve lived, stayed, travelled, worked or just passed through across the federal subjects commonly listed for the Russian Federation, and then export a shareable PNG image of your personalized block map.

> Note on geography  
> The list of regions is based on commonly used internal Russian administrative lists (85 federal subjects, including the Republic of Crimea and the federal city of Sevastopol). Some of these territories have internationally disputed status; this project is purely a visualization / toy and does not take a political position.

---

## Features

- Stylized block / grid map of Russian federal subjects
- Six visit levels:
  - Lived, Short stay, Travel, Business trip, Transit, Never
- Local, browser-only storage using `localStorage`
- Live score based on visit levels
- PNG export using `<canvas>` – generates a shareable image of your current map
- Basic i18n (English / Russian) with runtime toggle
- Keyboard-accessible UI (focus, Enter/Space, Escape)
- Clean TypeScript + Vite architecture
- Unit tests with Vitest
- Linting with ESLint and formatting with Prettier

---

## Tech stack

- Language: TypeScript
- Build/dev: Vite
- UI: Vanilla DOM + TypeScript (no heavy frameworks)
- Styling: CSS with custom properties (CSS variables)
- Testing: Vitest (jsdom environment)
- Linting/formatting: ESLint + Prettier

The final build is static and can be deployed to any static host (for example GitHub Pages).

---

## Visit levels

Each region can be marked with one of six levels:

| Level         | Meaning (roughly)                         | Score |
| ------------- | ----------------------------------------- | ----- |
| Lived         | Lived here for ≥ 1 year                   | 5     |
| Short stay    | Lived here for about a month or longer    | 4     |
| Travel        | Visited for leisure / tourism             | 3     |
| Business trip | Came mainly for work                      | 2     |
| Transit       | Only passed through (train, car, airport) | 1     |
| Never         | Never been                                | 0     |

Scores are summed across regions to give your total.

---

Inspiration
Inspired by [itorr/china-ex](https://github.com/itorr/china-ex)
Implementation details, code and styling in russia-ex are written from scratch and do not reuse code or assets from china-ex.

License
MIT
