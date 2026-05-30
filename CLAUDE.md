# Coder Studio — AI Navigation Guide

## Project Overview
Next.js 16 + TypeScript + Tailwind v4 + Three.js isometric 3D editor.
Learning platform for coding ("Duolingo for coding") with a 3D character placement studio.

## Stack
- **Framework**: Next.js 16 App Router (`src/app/`)
- **Styling**: Tailwind CSS v4 (config in `postcss.config.mjs`)
- **3D Engine**: Three.js (orthographic isometric camera, locked angle)
- **UI Components**: Custom `Button3D` etc. in `src/components/game/`
- **Icons**: Lucide React

---

## File Map

### Pages
| File | Lines | Purpose |
|------|-------|---------|
| `src/app/page.tsx` | ~140 | Landing page — mascot showcase, nav links |
| `src/app/player/page.tsx` | **2,454** | Main 3D studio editor (see detailed map below) |
| `src/app/design-system/page.tsx` | — | Component catalog / storybook |

### Components
| File | Purpose |
|------|---------|
| `src/components/game/Button3D.tsx` | Primary CTA button with 3D border effect |
| `src/components/game/Sidebar3D.tsx` | Sidebar shell |
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

### State Declarations (L63–145)
```
L65      activeTab: "grid" | "characters" | "tiles"
L68–71   gridPos, gridScale, gridOpacity, gridResolution, gridVisible
L75–77   selectedMascot, placedCharacters, loadedMascotIds
L82–85   selectedCharId, selectionRingRef, selectionGlowRef, hoverTileRef
L87      prevCharBuildKeyRef  ← optimization: skip mesh rebuild on rotation-only changes
L90–97   blockedTiles state + refs + overlay refs
L98–105  isDraggingTilesRef, tilePaintModeRef, lastPaintedTileKeyRef  ← tile drag-paint
L107     outlineMatsRef  ← selection outline pulse animation
```

### Ref Declarations (L109–145)
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
selectedCharId, placedCharacters, blockedTiles.

### Texture Helpers (L301–442)
```
L301     createDirectionTexture(text)    — N/S/E/W compass label on canvas
L377     createSelectionRingTexture()    — cyan glowing ring (used for selection indicator)
L421     createSelectionGlowTexture()    — yellow radial gradient (floor aura under selected char)
```

### Three.js Setup Effect (L443–1455) ← LARGEST SECTION
Runs once on mount. Sets up entire 3D scene.
```
L449–451  Scene
L452–468  Orthographic camera — locked isometric (12,12,12 → 0,0,0)
L469–476  WebGLRenderer — alpha transparent, shadow maps
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
L1237–1455 render loop (rAF) — updates mixers, char positions/rotation, overlays,
            outline pulse, selection ring, glow disc, gizmo
```

### Grid Mesh Rebuild Effect (L1456–1567)
Runs when `gridResolution` changes. Disposes old tiles, rebuilds NxN grid,
places N/S/E/W direction markers.

### Character Mesh Rebuild Effect (L1568–1818)
Runs when `placedCharacters`, `loadedMascotIds`, or `gridResolution` changes.
```
L1584–1601 BUILD KEY OPTIMIZATION — if only rotationY/activeAnimName changed,
            update wrapper.rotation.y + crossfade animation directly, skip full rebuild
L1604–1630 Full rebuild: dispose all wrappers
L1639–1668 Clean up stale AnimationMixers
L1672–1818 For each character:
  L1672    Clone GLTF model (SkeletonUtils.clone or baseModel.clone)
  L1692    Create invisible raycast helper cylinder
  L1714    Position/scale wrapper
  L1733    Auto-fit model to exactly 1 grid tile (bounding box measurement)
  L1779    Pre-create ALL AnimationActions for every clip (enables instant crossfade)
  L1795    Play starting animation (saved activeAnimName → "idle" → first clip)
```

### Selection Outline Effect (L1819–1825)
Runs when `selectedCharId`, `placedCharacters`, or `loadedMascotIds` changes.
Calls `clearOutlines()` then `addOutlines(charId)`.

### Blocked Tiles Overlay Effect (L1826–1865)
Runs when `blockedTiles` or `gridResolution` changes.
Disposes all overlay meshes, rebuilds from current `blockedTiles` Set.

### Helper Functions (L1867–1960)
```
L1867    switchPanel(panel)      — syncs activePanel + activeTab
L1875    switchCharAnim(charId, clipName) — immediate crossfade via refs + React state sync
L1896    clearOutlines()         — remove all __sel_outline__ meshes, dispose materials
L1911    addOutlines(charId)     — add BackSide (inverted hull) outline to each mesh
                                   as CHILD of original mesh → follows animation transforms
```

### JSX (L1971–2454)
```
L1974–2001  Navbar/header
L2006–2041  Left sidebar — vertical tab strip (Grid | Chars | Tiles | BG | Reset)
L2044–2058  Panel title bar
L2058–2125  GRID PANEL — Visible toggle, Scale/Opacity/Size sliders, X/Y/Z position display
L2126–2303  CHARACTERS PANEL — Model picker grid, selected char (Scale/Rotate/Animation), Scene list
L2224–2303  Animation selector — chips per clip, calls switchCharAnim on click
L2304–2392  TILES PANEL — walkability legend, stats, clear button, blocked tile list
L2385–2432  BACKGROUND PANEL — upload + preset swatches
L2434–2453  3D canvas container (1024×1024 px)
```

---

## Key Patterns

### Two-Group Architecture
Characters are in `characterGroup` (not child of `gridGroup`). Positions are
recalculated every frame in the render loop using `gridPosRef` + `gridScaleRef`.
This allows grid to move/scale without re-parenting characters.

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

---

## Common Edit Targets

| Task | Where to look |
|------|---------------|
| Add new sidebar panel | L2006 tab strip + L2044 panel content switch |
| Change WASD behavior | L1176 `handleKeyDown` |
| Change character scale/fit | L1733–1778 bounding box auto-fit |
| Add new animation action | `switchCharAnim` L1875 |
| Change grid tile appearance | L502–540 materials, L1456 grid rebuild effect |
| Change selection glow color/size | L421 texture + L1289 render loop |
| Change outline color/scale | L1911 `addOutlines` |
| Add new blocked tile behavior | L728 `applyTilePaint` + L1176 WASD blocker |
| Change camera angle | L461–467 camera.position.set |
| Add new background preset | L1948 `BG_OPTIONS` array |
