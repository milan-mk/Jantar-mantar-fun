# Democracy Dash

> Run for your voice. Play for the people.

A behind-the-runner 2.5D street-dash built with **React + TypeScript + Vite + Tailwind CSS + Phaser 3**.
Run 1,200 metres down a busy Delhi-inspired street to the finish arch at **Jantar Mantar**, weaving between lanes,
jumping barricades and dodging the (fictional) paperwork officials who want to hold you up in the queue.

**Democracy Dash is fictional and satirical.** All characters, slogans, scores and events are invented game content,
not reporting about any real person, group, organisation or event. The villains are generic red-tape officials, not
any real service, uniform or party.

Everything runs in the browser. There is no server, database, login, paid service or API key. Cost: ₹0.

> ## Verification status (please read)
> This project was written in an environment that **could not reach the npm registry**, so `npm install`,
> `npm run build` and the game itself were **never run in Phaser or a browser**. What was actually checked:
> - A static TypeScript pass (syntax, unused imports/locals, undefined names): clean.
> - A headless simulation of the spawner over 200 full runs with a stand-in world: no row ever blocks all four lanes,
>   rows stay 15+ m apart, nothing spawns near the finish, and every jumpable hazard has 4-10 m of jump-timing slack
>   at both the slowest and fastest speed.
> - A rendered composite frame and an art contact sheet (SVG art + the real projection maths, drawn outside Phaser)
>   to check the artwork and perspective layout by eye.
>
> **Not checked:** dependency install, the full type-check (needs Phaser/React typings), the production build, real
> gameplay feel, Phaser particle/camera calls, touch joystick, audio, localStorage in a browser, responsive layout,
> and Vercel deployment. Expect a few small fixes on the first run. See [Known limitations](#known-limitations).

## Requirements
- Node.js 18.18+ (20 or 22 recommended) and npm 9+

## Install, run, build
```bash
npm install          # 1. install dependencies (creates package-lock.json: commit it)
npm run dev          # 2. start the dev server (http://localhost:5173)
npm run typecheck    #    optional: TypeScript check only
npm run build        # 3. type-check + production build into dist/
npm run preview      # 4. serve the production build locally (http://localhost:4173)
```

## Controls
| Action | Keyboard | Touch |
| --- | --- | --- |
| Steer left / right | Arrow keys or A / D | Drag the joystick sideways |
| Sprint / slow down | Arrow Up / Down or W / S | Drag the joystick up / down (further = faster) |
| Jump | Space | **JUMP** button |
| Pause / resume | Escape | Pause button |
| Start / play again | Enter | Buttons |

The joystick and Jump button appear on touch devices only. Keyboard and touch both go through the same React handler,
so an input can never fire twice.

## How the game works
- **Goal:** reach the finish arch (1,200 m) before your **stamina** (the red bar) hits zero.
- **Hazards (5+ types):**
  - **Paperwork officials** walk toward you. If one catches you: stuck in the queue for 5 seconds.
  - **Rubber-stamp squad** (later in the run): a REJECTED stamp costs 50% stamina.
  - **Barricades** (a full-width wall): jump them, or lose 15%.
  - **Rickshaws** (-20%) and **paper piles** (-15%) block lanes: side-step. **Cones** (-6%): jump or dodge.
  - **Puddles:** slow you down for a moment.
- **Collect:** tokens 10, megaphones 25, placards 40, fact-check tokens 60 (plus 8% stamina). High tokens above
  barricade walls reward a jump.
- **Power-ups:** Fact Check Shield (absorbs one hit, 12 s), Community Boost (double item points, 10 s), Energy Boost
  (faster, higher jumps, +50% distance score, 7 s). Timers appear in the HUD.
- **Difficulty:** speed rises from 11 to 17 m/s over the run; hazard rows get busier in four stages. Spacing is
  distance-based, so it stays fair at every speed.
- **Score:** distance + items (with multiplier) + small bonuses (nice jumps, power-ups) + a finish bonus (stamina left
  and time). Best score is saved in the browser.
- **Characters:** Student Runner (balanced), Street Artist (nimble: faster sidesteps, slightly slower), Fact Checker
  (shields last 40% longer). Small, fair trade-offs; nothing can be bought or unlocked.

## Project structure
```
src/
  app/         App shell: screens, keyboard, persistence, React<->Phaser wiring
  components/  Menu, character select, how-to, settings, HUD, pause, game over, joystick
  game/
    art/       Procedural SVG artwork (characters, street, obstacles, pickups) -> Phaser textures
    config/    Constants, character stats, entity specs, shared options
    entities/  Runner (movement, speed, jump, pose animation)
    scenes/    BootScene (builds textures), GameScene (the run)
    systems/   Projection, Road (perspective drawing), World (pooled sprites), Spawner, Difficulty, PowerUps, Score
  lib/         Typed event bridge, localStorage, synthesized audio, share, result titles
  types/       Shared TypeScript types
```
Architecture notes:
- **Pseudo-3D:** the street is a flat plane. A point `z` metres ahead has scale `Z_CAM / (Z_CAM + z)`. The road is drawn
  as perspective quads each frame; sprites are scaled and placed with the same maths and depth-sorted by distance.
  No physics engine is used: movement, jumping and collisions are simple, deterministic kinematics.
- **React/Phaser boundary:** a small typed event emitter (`lib/bridge.ts`). React sends commands (move, jump, pause...);
  Phaser sends throttled HUD snapshots (10 per second) and the final result.
- **One game instance:** `GameCanvas` creates Phaser once per mount and destroys it on unmount. Restart resets the same
  scene (sprite pool reused; tweens and popups cleared).
- **Pause** uses Phaser's scene pause, which stops spawning, timers, tweens and particles together.

## Assets and licences
No external assets are used and no network requests are made during play.
- **Artwork:** all drawn in code as SVG (`src/game/art/`), original to this project, rasterised into Phaser textures at
  start-up. Shop signs and slogans are generic. The skyline is a loose, decorative nod to central Delhi shapes, not a
  depiction of any specific structure.
- **Audio:** all effects and the music loop are synthesized live with the Web Audio API (`src/lib/audio.ts`). Nothing
  plays until you press Play.
- **Fonts:** system fonts only (Devanagari text uses your system's font).
- **Libraries:** React, Phaser, Vite, Tailwind CSS, Lucide (check each package's licence).
- Original game code: choose a licence you like (MIT is common for student projects).

## Saved data
`localStorage` key `democracy-dash:v1` stores best score, selected character and settings. Data is validated field by
field on load; corrupt or blocked storage falls back to defaults and an in-memory copy for the session.

## Deploy for free on Vercel (Hobby plan)
1. Create a GitHub repository and push:
   ```bash
   git init
   git add .
   git commit -m "Democracy Dash"
   git branch -M main
   git remote add origin https://github.com/<your-username>/democracy-dash.git
   git push -u origin main
   ```
2. Go to https://vercel.com, sign in with GitHub, click **Add New... > Project**, and import the repository.
3. Vercel detects Vite. Keep the defaults (Build `npm run build`, Output `dist`); `vercel.json` already sets them.
4. Click **Deploy**, open the URL, and play a full run (also on your phone).
5. Every later `git push` to `main` redeploys automatically.

Vercel's Hobby plan is for **personal, non-commercial use**. If you ever monetise the game, review Vercel's current
terms and move to a suitable plan or host.

## Known limitations
- **Nothing here has been run in a browser.** Install, build, real gameplay feel, touch controls, audio and deployment
  are untested. Most likely first-run fixes: a Lucide icon name, a Phaser particle option, or a type error.
- Difficulty numbers (speeds, gaps, damage) are calculated, not play-tested; expect tuning in `config/constants.ts`.
- Roadside buildings are flat facades squeezed to look side-on, so they read as a "paper theatre" up close.
- Characters use a four-frame run cycle plus jump and hurt poses (procedural, not hand-animated).
- Dependency versions use caret ranges and there is no `package-lock.json` yet. Run `npm install` and commit it.
- The FPS counter appears only in development (`npm run dev`).
- No automated tests exist. Manual checklist below.

## Manual test checklist
1. Start a run; the runner moves and the street scrolls. 2. Steer across all four lanes; sprint and slow down.
3. Jump a barricade wall without damage. 4. Collect tokens (score rises); jump for the high ones.
5. Grab each power-up (HUD timer appears; the shield absorbs one hit). 6. Let an official catch you: 5-second
countdown, then released. 7. Pause with Esc and resume; nothing moves while paused. 8. Run out of stamina: game-over
screen. 9. Play Again without reloading. 10. Reach the finish arch: win screen with time. 11. Refresh: best score
persists. 12. Main Menu, change character, play again. 13. Settings toggles persist. 14. Phone: joystick and Jump
button work, page does not scroll. 15. Share Score confirms only when the browser reports success.
