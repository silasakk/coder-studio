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
| `src/app/player/page.tsx` | **~3000** | Main 3D studio editor (see detailed map below) |
| `src/app/design-system/page.tsx` | — | Component catalog / storybook |

### Components
| File | Purpose |
|------|---------|
| `src/components/game/Button3D.tsx` | Primary CTA button with 3D border effect |
| `src/components/game/Sidebar3D.tsx` | Sidebar shell |
| `src/components/game/AssetPanel.tsx` | Bottom asset browser — 7 collections (~615 models): blocky chars + 6 Kenney kits. Per-collection search, Brick Kit style sub-filter. |
| `src/components/game/ModelThumbnail.tsx` | Lazy GLB thumbnail renderer. Shared WebGL context + bounded queue (max 3). Caches to webp data URL per session. |
| `src/components/game/*.tsx` | Full DaisyUI-style component set in "game" theme |
| `src/components/ui/CodeHighlight.tsx` | Syntax highlighted code block |

---

## `src/app/player/page.tsx` — Detailed Map

This is the largest file. Grep by section name or line range before reading.

### Interface & Constants (L1–62)
```
L28–41   PlacedCharacter interface
           fields: id, mascotId, gridX, gridZ, offsetX/Y/Z, scaleX/Y/Z, rotationY, activeAnimName
L43–60   MASCOTS array — 18 blocky GLB characters (a–r)
```

### State Declarations (L63–168)
```
L65      activeTab: "grid" | "characters" | "tiles"
L68–71   gridPos, gridScale, gridOpacity, gridResolution, gridVisible
L75–77   selectedMascot, placedCharacters, loadedMascotIds
L82–85   selectedCharId, selectionRingRef, selectionGlowRef, hoverTileRef
L87      prevCharBuildKeyRef  ← optimization: skip mesh rebuild on rotation-only changes
L90–97   blockedTiles state + refs + overlay refs
L98–105  isDraggingTilesRef, tilePaintModeRef, lastPaintedTileKeyRef  ← tile drag-paint
L107     outlineMatsRef  ← selection outline pulse animation
L158     rendererRef  ← holds WebGLRenderer for captureScene
L161–162 cameraOrbitDeg state + cameraOrbitDegRef (default 45°)
L164–168 aiCaptureUrl, aiThemeText, aiPromptCopied, selectedAiStyle  ← AI BG gen
```

### Ref Declarations (L109–155)
```
L109–120 mountRef, activeTabRef, gridPosRef, gridScaleRef, gridOpacityRef,
          gridResolutionRef, selectedMascotRef, isDraggingCharRef,
          selectedCharIdRef, placedCharactersRef
L121–134 cameraRef, gridGroupRef, gridVisibleRef, characterGroupRef,
          gizmoGroupRef, tileMatA/B/Bottom/lineMatRef, tileGeo/edgeGeoRef
L135–138 loadedModelsRef, loadedAnimsRef (GLB cache)
L139–141 mixersRef, animActionsRef (all clips per char), activeAnimNameRef
L142     wasdCooldownRef
```

### Sync Effects (L149–214)
Keeps React refs in sync with state. One effect per ref:
activeTab → activeTabRef, gridPos → gridPosRef, gridScale → gridScaleRef,
gridOpacity → material opacities, gridResolution, gridVisible, selectedMascot,
selectedCharId, placedCharacters, blockedTiles, cameraOrbitDeg → cameraOrbitDegRef.

### Texture Helpers (L301–442)
```
L301     createDirectionTexture(text)    — N/S/E/W compass label on canvas
L377     createSelectionRingTexture()    — cyan glowing ring (used for selection indicator)
L421     createSelectionGlowTexture()    — yellow radial gradient (floor aura under selected char)
```

### Three.js Setup Effect (L443–1460) ← LARGEST SECTION
Runs once on mount. Sets up entire 3D scene.
```
L449–451  Scene
L452–468  Orthographic camera — initial isometric at (12,12,12 → 0,0,0)
           NOTE: position is overridden every frame by cameraOrbitDeg in render loop
L476      WebGLRenderer — alpha:true, preserveDrawingBuffer:true (required for captureScene)
L507      rendererRef.current = renderer  ← stored for captureScene
L477–495  Lights — ambient + hemisphere + directional + rim
L496–501  Shared geometries: tileGeo (BoxGeometry 1x0.02x1), edgeGeo
L502–540  Tile materials: tileMatA (white), tileMatB (light gray), tileBottomMat, lineMat
L541–553  gridGroup + characterGroup (separate groups — chars NOT child of grid)
L548–553  blockedOverlayGroup + blockedOverlayGeo (PlaneGeometry 0.95x0.95)
L555–593  selectionRing mesh + selectionGlow disc (yellow aura)
L595–609  hoverTile (blue PlaneGeometry hover highlight)
L611–768  Gizmo arrows (X/Y/Z translation handles) + buildGizmoArrow helper
L728–766  applyTilePaint(gx, gz) — direct Three.js overlay add/remove during drag
L770–893  handleMouseDown — grid drag | char select/place/move | tile paint start
L897–1145 handleMouseMove — tile paint drag | char drag | gizmo drag | grid pan | hover
L1146–1163 handleMouseUp — sync React state after drag ends
L1165–1168 handleContextMenu — prevent right-click menu
L1176–1235 handleKeyDown (WASD) — A/D rotate ±90°, W/S move in facing direction
L1268–1460 render loop (rAF):
  L1295   Camera orbit — sets camera position from cameraOrbitDegRef each frame
            formula: x = 12√2·cos(θ), y = 12, z = 12√2·sin(θ)
  updates mixers, char positions/rotation, overlays, outline pulse,
  selection ring, glow disc, gizmo
```

### Grid Mesh Rebuild Effect (L1461–1580)
Runs when `gridResolution` changes. Disposes old tiles, rebuilds NxN grid,
places N/S/E/W direction markers.
Direction marker groups have `userData.directionMarker = true` — used by `captureScene`
to hide them temporarily during screenshot.

### Character Mesh Rebuild Effect (~L1580–1830)
Runs when `placedCharacters`, `loadedMascotIds`, or `gridResolution` changes.
```
BUILD KEY OPTIMIZATION — if only rotationY/activeAnimName changed,
  update wrapper.rotation.y + crossfade animation directly, skip full rebuild
Full rebuild: dispose all wrappers → clone GLTF → raycast helper cylinder →
  position/scale → bounding box auto-fit to 1 tile → pre-create ALL AnimationActions
  → play starting animation
```

### Selection Outline Effect
Runs when `selectedCharId`, `placedCharacters`, or `loadedMascotIds` changes.
Calls `clearOutlines()` then `addOutlines(charId)`.

### Blocked Tiles Overlay Effect
Runs when `blockedTiles` or `gridResolution` changes.
Disposes all overlay meshes, rebuilds from current `blockedTiles` Set.

### Helper Functions (~L1947–2130)
```
L1947    activePanel state: "grid"|"characters"|"background"|"tiles"|"ai"
L1949    switchPanel(panel) — syncs activePanel + activeTab
L1956    AI_STYLES — array of 20 art style presets (key, label, bg CSS, prompt)
           No emoji anywhere. bg uses rich layered CSS gradients + repeating patterns.
           Styles: 3D Clay, Cartoon, Cyberpunk, Kawaii, Dark Fantasy, Pixel Art,
           Watercolor, Steampunk, Enchanted, Neon City, Ancient Egypt, Underwater,
           Space Station, Viking, Tropical, Desert Ruins, Winter, Volcanic,
           Fairy Tale, Mecha/Sci-Fi
L2020    captureScene() — screenshots canvas + background composite:
           1. Hides direction markers (userData.directionMarker)
           2. Drops tile opacity to ~0.04 (invisible to eye, keeps structure for AI)
           3. Waits 2 rAF frames for render loop to paint
           4. Composites bg (gradient/image) + Three.js canvas on new <canvas>
           5. Sets aiCaptureUrl (data URL), then restores all opacity + visibility
L2110    buildAiPrompt() — assembles prompt: selectedAiStyle.prompt + isometric rules
           + Kenney-style props instruction + user's aiThemeText
L2119    copyAiPrompt() — copies buildAiPrompt() to clipboard, triggers copied feedback
L~2130   switchCharAnim(charId, clipName) — immediate crossfade via refs + React state sync
         clearOutlines() / addOutlines(charId) — BackSide inverted hull outlines
```

### JSX (~L2238–2886)
```
L2238    Navbar/header
L2270    Left sidebar — vertical tab strip:
           Grid (Maximize2) | Chars (MousePointer) | Tiles (Grid3x3) |
           BG (Image) | AI (Wand2) | Reset (RefreshCw, bottom)
L2319    Panel title bar (switches label per activePanel)
L2326    GRID PANEL — Visible toggle, Scale/Opacity sliders,
           Orbit° slider (0–360) + NE/SE/SW/NW snap buttons, Size slider,
           X/Y/Z position display
L2421    CHARACTERS PANEL — Model picker grid, selected char (Scale/Rotate/Animation),
           Scene list
L2575    TILES PANEL — walkability legend, stats, clear button, blocked tile list
L2656    BACKGROUND PANEL — upload + preset swatches (8 gradients)
L2700    AI BG GENERATOR PANEL — 4 steps:
           1. Capture Scene button → composited screenshot
           2. Art Style grid (2 columns × 10 rows = 20 styles, CSS gradient thumbnails)
              + selected style description preview
           3. Theme/Detail textarea (optional, appended to prompt)
           4. Prompt preview + Copy Prompt button
L2849    Playfield — 1024×1024 canvas container (bg from currentBgStyle)
```

---

## Key Patterns

### Two-Group Architecture
Characters are in `characterGroup` (not child of `gridGroup`). Positions are
recalculated every frame in the render loop using `gridPosRef` + `gridScaleRef`.
This allows grid to move/scale without re-parenting characters.

### Camera Orbit
Camera orbits the scene center on the Y-axis. Every render frame:
`camera.position.set(12√2·cos(θ), 12, 12√2·sin(θ)); camera.lookAt(0,0,0)`
where θ = `cameraOrbitDegRef.current` in radians. Default 45° = NE isometric.
Snap presets: NE=45°, SE=135°, SW=225°, NW=315°.

### Ref-first Updates for Performance
Drag operations (character move, tile paint, gizmo) update refs + Three.js directly
for instant 60fps response. React state is synced only on `mouseup` to avoid
triggering effects on every frame.

### Build Key Optimization
Character rebuild effect computes a key from structural fields only
(not `rotationY`/`activeAnimName`). If key matches previous, skips full mesh rebuild
and only updates rotation + crossfades animation.

### Animation System
- `animActionsRef`: `{ [charId]: { [clipName]: AnimationAction } }` — all clips pre-created
- `activeAnimNameRef`: currently playing clip name per character
- `switchCharAnim()`: direct crossfade (0.25s) then React state sync
- All characters run their own `AnimationMixer` ticked in the render loop

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
| Add new sidebar panel | ~L2270 tab strip + ~L2319 panel content switch |
| Change WASD behavior | `handleKeyDown` ~L1176 |
| Change character scale/fit | bounding box auto-fit ~L1733 |
| Add new animation action | `switchCharAnim` ~L2130 |
| Change grid tile appearance | materials ~L502, grid rebuild ~L1461 |
| Change selection glow color/size | texture ~L421 + render loop ~L1380 |
| Change outline color/scale | `addOutlines` ~L2160 |
| Add new blocked tile behavior | `applyTilePaint` ~L728 + WASD blocker |
| Change camera orbit default angle | `cameraOrbitDeg` useState default (L161) |
| Add/edit AI art style preset | `AI_STYLES` array ~L1956 |
| Change capture behavior | `captureScene` ~L2020 |
| Change AI prompt template | `buildAiPrompt` ~L2110 |
| Add new background preset | `BG_OPTIONS` array ~L2120 |
| Add/edit asset collection | `COLLECTIONS` + name arrays in `AssetPanel.tsx` |
| Tune thumbnail render queue/quality | `MAX_CONCURRENT` / `RENDER_SIZE` in `ModelThumbnail.tsx` |
| Change scene save/load format | `exportScene` / `importScene` + navbar Save/Load buttons |
