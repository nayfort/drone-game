# Drone Game

A browser game built with React and TypeScript. Guide a drone through a winding cave, avoid the walls, and reach the exit. Choose a player name and difficulty level before starting a run.

## Requirements

- Node.js 22.12+ (22.x) or 24+
- npm
- A compatible game API with HTTP and WebSocket support

## Getting started

```bash
git clone https://github.com/nayfort/drone-game.git
cd drone-game
npm ci
cp .env.example .env
npm run dev
```

Open the local URL printed by Vite. Set `VITE_API_URL` in `.env` to the game API base URL. The WebSocket URL is derived from the same address using `/cave` and the matching `ws:` or `wss:` protocol. Restart Vite after changing environment variables.

## Playing

Enter your name, select a difficulty from 0 to 10, and press **Start**.

| Key | Action |
| --- | --- |
| Left arrow | Increase leftward velocity |
| Right arrow | Increase rightward velocity |
| Up arrow | Increase descent speed |
| Down arrow | Reduce descent speed |

The drone starts stationary. Horizontal velocity is limited to five pixels per update in either direction; descent speed ranges from zero to five. The simulation updates every 50 milliseconds. During descent, each update adds `10 × (descent speed + difficulty)` points. A wall collision ends the run; passing the cave's final row completes it. Choose **Play again** to return to setup.

## Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Type-check and produce a production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |
| `npm test` | Run collision regression tests |
| `npm run test:e2e` | Run browser integration tests |

Install the browser before running integration tests:

```bash
npx playwright install chromium
npm run test:e2e
```

Browser tests exercise game setup, movement, completion, restart, and network error handling using controlled HTTP and WebSocket responses.

## API contract

- `POST /init` receives `{ "name": "Pilot", "complexity": 0 }` and returns `{ "id": "player-id" }`.
- `GET /token/1?id=player-id` through `/token/4?id=player-id` each return a string `chunk`. Chunks are concatenated in numerical order.
- `/cave` accepts a WebSocket connection. The client sends `player:<id>-<token>`. Each incoming `left,right` message describes the corridor boundaries for a ten-pixel-high row. The `finished` message marks the end of the cave stream.

The API must permit requests from the frontend origin. `VITE_` variables are included in the client bundle and must contain only public configuration.

## Project structure

```text
src/
  components/    Setup form, cave rendering, drone, and keyboard controls
  pages/         Route-level views
  services/      HTTP and WebSocket communication
  styles/        Shared styles
  utils/         Game geometry and collision detection
tests/
  browser/       Playwright integration tests
  game.test.ts   Collision regression tests
```

## Production

Set `VITE_API_URL` for the target environment before running `npm run build`. Deploy `dist/` to a static host configured to serve `index.html` for application routes such as `/game/:playerId`. Use an HTTPS API when hosting the frontend over HTTPS.
