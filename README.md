# russia-ex – interactive footprint map of Russian regions

**russia-ex** is a single-page web app inspired by [itorr/china-ex](https://github.com/itorr/china-ex).  
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

## Getting started

### 1. Install dependencies

```bash
npm install
# or
pnpm install
# or
yarn install
2. Run the dev server
bash
Copy code
npm run dev
Then open the printed local URL (usually http://localhost:5173/).

3. Build for production
bash
Copy code
npm run build
This outputs a static bundle in dist/.

4. Preview the production build
bash
Copy code
npm run preview
Running tests
bash
Copy code
npm run test
This runs Vitest with the jsdom environment.

Linting
bash
Copy code
npm run lint
Prettier is configured via .prettierrc. You can run Prettier separately if desired.

Deploying to GitHub Pages
A simple GitHub Pages flow:

Push this repository to GitHub.

Make sure vite.config.ts has:

ts
Copy code
export default defineConfig({
  base: '/russia-ex/',
  // other options...
});
If your repo has a different name, replace /russia-ex/ with /<your-repo-name>/.

Build the project locally:

bash
Copy code
npm run build
Deploy the dist/ folder to GitHub Pages:

Either use a GitHub Action that builds and deploys dist/ to a gh-pages branch, or

Use a tool like gh-pages to push the dist folder to a gh-pages branch.

In your repo’s Settings → Pages, choose the branch (for example gh-pages) and folder as the publishing source.

Your app will be available at:

text
Copy code
https://<your-username>.github.io/<your-repo-name>/
Inspiration
This project is inspired by 「中国制霸生成器」 / china-ex, an open-source “China footprint” map by itorr.

Implementation details, code and styling in russia-ex are written from scratch and do not reuse code or assets from china-ex.

License
MIT
