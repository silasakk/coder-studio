# Coder Studio — AI Navigation Guide

## Project Overview
Next.js 16 + TypeScript + Tailwind v4 + Three.js isometric 3D editor.
Learning platform for coding ("Duolingo for coding") with a 3D character placement studio.

## Stack
- **Framework**: Next.js 16 App Router (`src/app/`)
- **Styling**: Tailwind CSS v4 (config in `postcss.config.mjs`)
- **3D Engine**: Three.js (orthographic isometric camera, orbiteable Y-axis)
- **UI Components**: Custom `Button3D` etc. in `src/components/game/`
- **Icons**: Lucide React (no emoji anywhere in codebase)

---

## File Map

### Pages
| File | Lines | Purpose |
|------|-------|---------|
| `src/app/page.tsx` | ~140 | Landing page — mascot showcase, nav links |
| `src/app/player/page.tsx` | **~4500** | Main 3D studio editor (see detailed map below) |
| `src/app/design-system/page.tsx` | — | Component catalog / storybook |
| `src/app/layout.tsx` | ~47 | Root layout — dark-mode init via `next/script` external file |

### Components
| File | Purpose |
|------|---------|
| `src/components/game/Button3D.tsx` | Primary CTA button with 3D border effect |
| `src/components/game/Sidebar3D.tsx` | Sidebar shell |
| `src/components/game/AssetPanel.tsx` | Bottom asset browser — 7 collections (~615 models): blocky chars + 6 Kenney kits. Per-collection search, Brick Kit style sub-filter. |
| `src/components/game/ModelThumbnail.tsx` | Lazy GLB thumbnail renderer. Shared WebGL context + bounded queue (max 3). Caches to webp data URL per session. |
| `src/components/game/*.tsx` | Full DaisyUI-style component set in "game" theme |
| `src/components/ui/CodeHighlight.tsx` | Syntax highlighted code block |

### Static Assets
| File | Purpose |
|------|---------|
| `public/theme-init.js` | Dark mode init script (read localStorage + system preference). Injected via `next/script strategy="beforeInteractive"` in layout.tsx. External file to avoid React 19 inline-script warning. |

---

## `src/app/player/page.tsx` — Detailed Map

This is the largest file. Grep by section name or line range before reading.

### Interface & Constants (L1–62)
```
L28–41   PlacedCharacter interface
           fields: id, mascotId, gridX, gridZ, offsetX/Y/Z, scaleX/Y/Z, rotationY, activeAnimName
L43–60   MASCOTS array — 18 blocky GLB characters (a–r)
```

### State Declarations
```
activeTab: "grid" | "characters" | "tiles"
gridPos, gridScale, gridOpacity, gridResolution, gridVisible
selectedMascot, placedCharacters, loadedMascotIds
selectedCharId, selectionRingRef, selectionGlowRef, hoverTileRef
prevCharBuildKeyRef  ← optimization: skip mesh rebuild on rotation-only changes
blockedTiles state + refs + overlay refs
isDraggingTilesRef, tilePaintModeRef, lastPaintedTileKeyRef  ← tile drag-paint
outlineMatsRef  ← selection outline pulse animation
rendererRef  ← holds WebGLRenderer for captureScene + perfMode toggle
forceRenderRef  ← boolean, set true to force one render when scene is idle (e.g. after perfMode change)
cameraOrbitDeg state + cameraOrbitDegRef (default 45°)
aiCaptureUrl, aiThemeText, aiPromptCopied, selectedAiStyle  ← AI BG gen
perfMode  ← bool state: false=quality (pixelRatio 1.5×), true=performance (pixelRatio 1×)
weatherEffect / weatherSpeed / weatherDensity / weatherOpacity — particle system state
weatherEffectRef / weatherSpeedRef / weatherDensityRef / weatherOpacityRef — render loop refs
```

### Ref Declarations
```
mountRef, activeTabRef, gridPosRef, gridScaleRef, gridOpacityRef,
gridResolutionRef, selectedMascotRef, isDraggingCharRef,
selectedCharIdRef, placedCharactersRef
cameraRef, gridGroupRef, gridVisibleRef, characterGroupRef,
gizmoGroupRef, tileMatA/B/Bottom/lineMatRef, tileGeo/edgeGeoRef
loadedModelsRef, loadedAnimsRef (GLB cache)
mixersRef, animActionsRef (all clips per char), activeAnimNameRef
wasdCooldownRef
```

### Sync Effects
Keeps React refs in sync with state. One effect per ref:
activeTab → activeTabRef, gridPos → gridPosRef, gridScale → gridScaleRef,
gridOpacity → material opacities, gridResolution, gridVisible, selectedMascot,
selectedCharId, placedCharacters, blockedTiles, cameraOrbitDeg → cameraOrbitDegRef,
weatherEffect/Speed/Density/Opacity → their Refs.

`perfMode` effect: calls `rendererRef.current.setPixelRatio(perfMode ? 1 : Math.min(dpr, 1.5))`
+ `setSize(displaySize, displaySize)` + sets `forceRenderRef.current = true`.

### Texture Helpers
```
createDirectionTexture(text)    — N/S/E/W compass label on canvas
createSelectionRingTexture()    — cyan glowing ring
createSelectionGlowTexture()    — yellow radial gradient (floor aura)
createParticleTexture()         — soft radial gradient for dust particles
createLeafTexture()             — white leaf shape with veins (tinted by PointsMaterial.color)
```

### Three.js Setup Effect ← LARGEST SECTION
Runs once on mount. Sets up entire 3D scene.
```
Scene
Orthographic camera — initial isometric at (12,12,12 → 0,0,0)
  NOTE: position recomputed in render loop only when cameraOrbitDeg changes (dirty check)
WebGLRenderer — antialias:true, alpha:true, preserveDrawingBuffer:true
  setPixelRatio(Math.min(dpr, 1.5))  ← cap at 1.5, not 2, for perf
  shadowMap.enabled = false           ← shadows disabled for performance
rendererRef.current = renderer        ← stored for captureScene + perfMode toggle
Lights — ambient + hemisphere + directional (castShadow: false) + rim
Shared geometries: tileGeo (BoxGeometry 1x0.02x1), edgeGeo
Tile materials: tileMatA (white), tileMatB (light gray), tileBottomMat, lineMat
  receiveShadow/castShadow = false on all tiles
gridGroup + characterGroup (separate groups — chars NOT child of grid)
blockedOverlayGroup + blockedOverlayGeo (PlaneGeometry 0.95x0.95)
selectionRing mesh + selectionGlow disc (yellow aura)
hoverTile (blue PlaneGeometry hover highlight)
Gizmo arrows (X/Y/Z translation handles) + buildGizmoArrow helper
8.5. weatherPoints (THREE.Points) — dust/snow/dreamy/storm particles
  PARTICLE_COUNT = 300, PointsMaterial: sizeAttenuation:false, AdditiveBlending
  size updated each frame: pSize * (displaySize / (2 * frustumSize)) * zoom * gridScale
8.6. leafPoints (THREE.Points) — leaf particles
  LEAF_COUNT = 100, PointsMaterial: sizeAttenuation:false, NormalBlending
  size updated each frame: leafSize * pxPerUnit * gridScale
applyTilePaint(gx, gz) — direct Three.js overlay add/remove during drag
handleMouseDown — grid drag | char select/place/move (collision check) | tile paint start
handleMouseMove — tile paint drag | char drag (collision check) | gizmo drag | grid pan | hover
handleMouseUp — sync React state after drag ends
handleContextMenu — prevent right-click menu
handleKeyDown (WASD) — A/D rotate ±90°, W/S move (collision check vs blocked tiles AND other chars)
```

### Render Loop (rAF)
```
Dirty check (skip renderer.render when scene is truly idle):
  needsRender = hasMixers || hasWeather || hasHop || hasBump || hasSquish || hasPulse || isDragging || forceOnce
  forceRenderRef is consumed (set false) once used.

Camera orbit dirty check — recompute cos/sin + lookAt ONLY when orbitRad changed
Lighting dirty check — update intensity/position ONLY when ref values changed
Grid position dirty check — update gridGroup.position ONLY when gridPos changed
Camera zoom — update only when zoom changed

Character position loop — smooth lerp (120ms convergence), hop/bump/squish animations
Selection ring/glow — updated each frame when character selected
Gizmo arrows — visibility/position updates

Weather & Leaf particle update:
  if curEffect === "none": hide both, skip loop
  else: update PointsMaterial.color/size/opacity per-effect, move 300+100 particles,
        respawn at boundary, set posAttr.needsUpdate = true
  pxPerUnit = displaySizeRef.current / (2 * frustumSizeRef.current) * zoomRef.current

renderer.render(scene, camera)  ← only called when needsRender = true
```

### Grid Mesh Rebuild Effect
Runs when `gridResolution` changes. Disposes old tiles, rebuilds NxN grid,
places N/S/E/W direction markers.
Direction marker groups have `userData.directionMarker = true` — used by `captureScene`
to hide them temporarily during screenshot.
Tile meshes: `receiveShadow = false`, `castShadow = false`.

### Character Mesh Rebuild Effect
Runs when `placedCharacters`, `loadedMascotIds`, or `gridResolution` changes.
```
BUILD KEY OPTIMIZATION — if only rotationY/activeAnimName changed,
  update wrapper.rotation.y + crossfade animation directly, skip full rebuild
Full rebuild: dispose all wrappers → clone GLTF → raycast helper cylinder →
  position/scale → bounding box auto-fit to 1 tile → pre-create ALL AnimationActions
  → play starting animation
  child.castShadow = true / receiveShadow = true  (but shadowMap is disabled globally)
```

### Selection Outline Effect
Runs when `selectedCharId`, `placedCharacters`, or `loadedMascotIds` changes.
Calls `clearOutlines()` then `addOutlines(charId)`.

### Blocked Tiles Overlay Effect
Runs when `blockedTiles` or `gridResolution` changes.
Disposes all overlay meshes, rebuilds from current `blockedTiles` Set.

### Helper Functions
```
activePanel state: "grid"|"characters"|"background"|"tiles"|"ai"
switchPanel(panel) — syncs activePanel + activeTab
AI_STYLES — array of 20 art style presets (key, label, bg CSS, prompt)
captureScene() — screenshots canvas + background composite:
  1. Hides direction markers (userData.directionMarker)
  2. Drops tile opacity to ~0.04 (invisible to eye, keeps structure for AI)
  3. Waits 2 rAF frames for render loop to paint
  4. Composites bg (gradient/image) + Three.js canvas on new <canvas>
  5. Sets aiCaptureUrl (data URL), then restores all opacity + visibility
buildAiPrompt() — assembles prompt: selectedAiStyle.prompt + isometric rules
  + Kenney-style props instruction + user's aiThemeText
copyAiPrompt() — copies buildAiPrompt() to clipboard, triggers copied feedback
switchCharAnim(charId, clipName) — immediate crossfade via refs + React state sync
clearOutlines() / addOutlines(charId) — BackSide inverted hull outlines
```

### JSX
```
Navbar/header
Left sidebar — vertical tab strip:
  Grid (Maximize2) | Chars (MousePointer) | Tiles (Grid3x3) |
  BG (Image) | AI (Wand2) | Reset (RefreshCw, bottom)
Panel title bar (switches label per activePanel)
GRID PANEL — Visible toggle, Scale/Opacity sliders,
  Orbit° slider (0–360) + NE/SE/SW/NW snap buttons, Size slider,
  X/Y/Z position display, Reset Canvas/Camera buttons,
  Performance Mode toggle (perfMode: pixelRatio 1× vs 1.5×)
CHARACTERS PANEL — Model picker grid, selected char (Scale/Rotate/Animation),
  Scene list
TILES PANEL — walkability legend, stats, clear button, blocked tile list
BACKGROUND PANEL — upload + preset swatches + Weather Effects section
  (5 weather presets: none/gentle/windy/dreamy/storm + Speed/Density/Opacity sliders)
AI BG GENERATOR PANEL — 4 steps:
  1. Capture Scene button → composited screenshot
  2. Art Style grid (2 columns × 10 rows = 20 styles, CSS gradient thumbnails)
  3. Theme/Detail textarea
  4. Prompt preview + Copy Prompt button
Playfield — canvas container (bg from currentBgStyle)
```

---

## Key Patterns

### Two-Group Architecture
Characters are in `characterGroup` (not child of `gridGroup`). Positions are
recalculated every frame in the render loop using `gridPosRef` + `gridScaleRef`.
This allows grid to move/scale without re-parenting characters.

### Camera Orbit
Camera orbits the scene center on the Y-axis. In the render loop, recomputed ONLY when
`cameraOrbitDegRef.current` changes (dirty check with `lastOrbitRad`):
`camera.position.set(12√2·cos(θ), 12, 12√2·sin(θ)); camera.lookAt(0,0,0)`
Default 45° = NE isometric. Snap presets: NE=45°, SE=135°, SW=225°, NW=315°.

### Ref-first Updates for Performance
Drag operations (character move, tile paint, gizmo) update refs + Three.js directly
for instant 60fps response. React state is synced only on `mouseup` to avoid
triggering effects on every frame.
**IMPORTANT**: All occupancy checks use `placedCharactersRef.current`, NOT React `prev`,
because the ref is updated immediately while `prev` may be stale across React batches.

### Build Key Optimization
Character rebuild effect computes a key from structural fields only
(not `rotationY`/`activeAnimName`). If key matches previous, skips full mesh rebuild
and only updates rotation + crossfades animation.

### Model Collision / Tile Occupancy
Models cannot share the same tile. Enforced in 4 places using `placedCharactersRef.current`:
1. **Placement** (mousedown): skip if target tile already occupied
2. **Click-to-move** (mousedown): skip move if target tile occupied by another char
3. **Drag move** (mousemove): block drag onto occupied tile (return early, no ref update)
4. **WASD move** (handleKeyDown): occupied tile counts as `blocked` same as blockedTiles

### Animation System
- `animActionsRef`: `{ [charId]: { [clipName]: AnimationAction } }` — all clips pre-created
- `activeAnimNameRef`: currently playing clip name per character
- `switchCharAnim()`: direct crossfade (0.25s) then React state sync
- All characters run their own `AnimationMixer` ticked in the render loop (only when hasMixers)

### Selection Feedback (3 Layers)
1. `selectionRing` — cyan ring on tile surface (renderOrder 11)
2. `selectionGlow` — yellow radial aura disc (renderOrder 8, depthTest: false)
3. Outline meshes — BackSide `__sel_outline__` children added per mesh (renderOrder 3),
   pulse animated in render loop via `outlineMatsRef`

### Tile Drag Paint
`applyTilePaint(gx, gz)` operates entirely on refs + Three.js during drag.
React `setBlockedTiles` is called once on `mouseup` to sync sidebar counts.

### AI Scene Capture
`captureScene()` temporarily modifies the scene (hide markers, near-zero tile opacity),
waits 2 rAF frames for render loop to repaint, composites background + Three.js canvas,
then immediately restores all state. Requires `preserveDrawingBuffer: true` on renderer.
**NOTE**: `captureScene` must set `forceRenderRef.current = true` BEFORE waiting for rAF
frames, otherwise dirty rendering will skip the render.

### Weather Particle System
Two `THREE.Points` objects in the scene: `weatherPoints` (dust) + `leafPoints` (leaves).
- **CRITICAL**: Must use `sizeAttenuation: false` with orthographic cameras. With `true`
  (default), particle size = ~0.6px (sub-pixel, invisible). With `false`, size is in
  screen pixels.
- Size formula: `pSize * (displaySize / (2 * frustumSize)) * zoom * gridScale`
  This converts world-unit sizes to pixels correctly for the current camera.
- Dust uses `AdditiveBlending`; leaves use `NormalBlending`.
- When `weatherEffectRef.current === "none"`, both Points are hidden and the particle
  update loop is skipped entirely.
- Particles at Y < 0 with `verticalSpeed < 0` are respawned at `boundaryY` each frame,
  so switching from "none" to any effect makes all particles appear immediately.

### Dirty Rendering
The render loop skips `renderer.render()` when the scene is fully idle:
```
needsRender = hasMixers || hasWeather || hasHop || hasBump || hasSquish || hasPulse
             || isDraggingCharRef.current || forceRenderRef.current
```
To force one render after an out-of-band change (e.g. perfMode toggle, resize):
set `forceRenderRef.current = true`.

### Performance Settings
- `shadowMap.enabled = false` — shadows disabled globally (biggest GPU saving)
- `pixelRatio = Math.min(dpr, 1.5)` default; `perfMode` toggle sets it to `1`
- `antialias: true` always (on retina, extra sharpness from 1.5× dpr offsets cost)
- Lighting, camera orbit, grid position all have dirty checks — no redundant per-frame math

### Asset Panel & Dynamic Model Registry
The bottom `AssetPanel` lets the user pick any of ~615 models. Blocky chars live in the
static `MASCOTS` array; the 6 Kenney kits do not. When a non-MASCOTS model is selected,
its `{ modelPath, name, previewPath? }` is written to `dynamicRegistryRef` (keyed by the
collection-prefixed AssetItem id, e.g. `graveyard:altar-stone`). `loadMascotModel` and
the scene-list lookups fall back to `dynamicRegistryRef` when an id isn't in `MASCOTS`.
Selecting a model sets `selectedMascot` (placement mode) → click a tile to place.
`switchPanel` clears `selectedMascot` whenever the user leaves the Characters tab so
placement mode doesn't linger silently.

### Lazy Thumbnail Rendering (shared WebGL context)
`ModelThumbnail` renders each GLB to a webp data URL once per session (cached in a
module-level `Map`). All thumbnails share ONE module-level `WebGLRenderer` — never one
per thumbnail — because browsers cap live WebGL contexts (~16). A bounded queue
(`MAX_CONCURRENT = 3`) limits in-flight GLB loads; `render()`/`toDataURL()` run
synchronously on the shared context. `IntersectionObserver` (rootMargin 120px) defers
work until a thumbnail scrolls near view. `previewPath` (blocky PNGs) skips rendering.

### Scene Persistence (JSON export/import)
`exportScene()` / `importScene(file)` save & restore the full scene as JSON via navbar
Save/Load buttons (hidden file input on `importInputRef`). Snapshot (`version: 1`):
grid pos/scale/opacity/resolution/visible, `cameraOrbitDeg`, `selectedBg`,
`placedCharacters`, `blockedTiles` (as array), and the slice of `dynamicRegistryRef`
referenced by placed characters. Import repopulates the registry first, restores state,
then replays `loadMascotModel` for each unique mascotId so dynamic GLBs reload.

---

## Common Edit Targets

| Task | Where to look |
|------|---------------|
| Add new sidebar panel | tab strip + panel content switch in JSX |
| Change WASD behavior | `handleKeyDown` |
| Change character scale/fit | bounding box auto-fit in character rebuild effect |
| Add new animation action | `switchCharAnim` |
| Change grid tile appearance | tileMatA/B setup + grid rebuild effect |
| Change selection glow color/size | `createSelectionGlowTexture` + render loop |
| Change outline color/scale | `addOutlines` |
| Add new blocked tile behavior | `applyTilePaint` + WASD blocker |
| Change camera orbit default angle | `cameraOrbitDeg` useState default |
| Add/edit AI art style preset | `AI_STYLES` array |
| Change capture behavior | `captureScene` — remember to set `forceRenderRef.current = true` |
| Change AI prompt template | `buildAiPrompt` |
| Add new background preset | `BG_OPTIONS` array |
| Add/edit weather effect | render loop weather section — `pSize`/`leafSize` in world units, multiplied by `pxPerUnit` |
| Change particle size/behavior | `pSize`/`leafSize` values in render loop weather section |
| Toggle performance mode | `perfMode` state + useEffect that calls `renderer.setPixelRatio` |
| Add/edit asset collection | `COLLECTIONS` + name arrays in `AssetPanel.tsx` |
| Tune thumbnail render queue/quality | `MAX_CONCURRENT` / `RENDER_SIZE` in `ModelThumbnail.tsx` |
| Change scene save/load format | `exportScene` / `importScene` + navbar Save/Load buttons |
| Edit dark mode init logic | `public/theme-init.js` (injected via `next/script beforeInteractive`) |
