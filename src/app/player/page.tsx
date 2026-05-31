"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Sun,
  Moon,
  Sliders,
  RefreshCw,
  Move,
  Maximize2,
  MousePointer,
  Maximize,
  Minimize,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Image,
  Grid3x3,
  Wand2,
  Camera,
  Copy,
  Check,
  Download,
  Upload,
  Sparkles,
  X,
  Database,
  Smartphone,
  Tablet,
  Monitor,
  Play,
  Square,
  Trophy,
  Volume2,
  VolumeX,
  Zap,
  ZapOff,
  Cloud,
  CloudSun
} from "lucide-react";
import Button3D from "@/components/game/Button3D";
import AssetPanel, { AssetItem } from "@/components/game/AssetPanel";
import Toast3D from "@/components/game/Toast3D";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { AnimationMixer } from "three";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";

interface PlacedCharacter {
  id: string;
  mascotId: string;
  gridX: number;
  gridZ: number;
  offsetX: number;
  offsetY: number;
  offsetZ: number;
  scaleX: number;
  scaleY: number;
  scaleZ: number;
  rotationY: number;
  activeAnimName: string;
}

// Canvas sizing — responsive auto-fit + user zoom (square canvas, crisp re-render)
const MIN_SIZE = 320;
const MAX_SIZE = 3072;
const ZOOM_MIN = 0.25;
const ZOOM_MAX = 3;
const CAPTURE_SIZE = 1536; // fixed render size for AI reference capture
const clampNum = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

const VIEWPORT_PRESETS = {
  desktop: { label: "Desktop", ratioW: 1,  ratioH: 1  },
  tablet:  { label: "Tablet",  ratioW: 3,  ratioH: 4  },
  mobile:  { label: "Mobile",  ratioW: 9,  ratioH: 16 },
} as const;
type ViewportMode = keyof typeof VIEWPORT_PRESETS;

const MASCOTS = [
  { id: "character-a", name: "Blocky A", modelPath: "/blocky_characters/Models/GLB format/character-a.glb", previewPath: "/blocky_characters/Previews/character-a.png" },
  { id: "character-b", name: "Blocky B", modelPath: "/blocky_characters/Models/GLB format/character-b.glb", previewPath: "/blocky_characters/Previews/character-b.png" },
  { id: "character-c", name: "Blocky C", modelPath: "/blocky_characters/Models/GLB format/character-c.glb", previewPath: "/blocky_characters/Previews/character-c.png" },
  { id: "character-d", name: "Blocky D", modelPath: "/blocky_characters/Models/GLB format/character-d.glb", previewPath: "/blocky_characters/Previews/character-d.png" },
  { id: "character-e", name: "Blocky E", modelPath: "/blocky_characters/Models/GLB format/character-e.glb", previewPath: "/blocky_characters/Previews/character-e.png" },
  { id: "character-f", name: "Blocky F", modelPath: "/blocky_characters/Models/GLB format/character-f.glb", previewPath: "/blocky_characters/Previews/character-f.png" },
  { id: "character-g", name: "Blocky G", modelPath: "/blocky_characters/Models/GLB format/character-g.glb", previewPath: "/blocky_characters/Previews/character-g.png" },
  { id: "character-h", name: "Blocky H", modelPath: "/blocky_characters/Models/GLB format/character-h.glb", previewPath: "/blocky_characters/Previews/character-h.png" },
  { id: "character-i", name: "Blocky I", modelPath: "/blocky_characters/Models/GLB format/character-i.glb", previewPath: "/blocky_characters/Previews/character-i.png" },
  { id: "character-j", name: "Blocky J", modelPath: "/blocky_characters/Models/GLB format/character-j.glb", previewPath: "/blocky_characters/Previews/character-j.png" },
  { id: "character-k", name: "Blocky K", modelPath: "/blocky_characters/Models/GLB format/character-k.glb", previewPath: "/blocky_characters/Previews/character-k.png" },
  { id: "character-l", name: "Blocky L", modelPath: "/blocky_characters/Models/GLB format/character-l.glb", previewPath: "/blocky_characters/Previews/character-l.png" },
  { id: "character-m", name: "Blocky M", modelPath: "/blocky_characters/Models/GLB format/character-m.glb", previewPath: "/blocky_characters/Previews/character-m.png" },
  { id: "character-n", name: "Blocky N", modelPath: "/blocky_characters/Models/GLB format/character-n.glb", previewPath: "/blocky_characters/Previews/character-n.png" },
  { id: "character-o", name: "Blocky O", modelPath: "/blocky_characters/Models/GLB format/character-o.glb", previewPath: "/blocky_characters/Previews/character-o.png" },
  { id: "character-p", name: "Blocky P", modelPath: "/blocky_characters/Models/GLB format/character-p.glb", previewPath: "/blocky_characters/Previews/character-p.png" },
  { id: "character-q", name: "Blocky Q", modelPath: "/blocky_characters/Models/GLB format/character-q.glb", previewPath: "/blocky_characters/Previews/character-q.png" },
  { id: "character-r", name: "Blocky R", modelPath: "/blocky_characters/Models/GLB format/character-r.glb", previewPath: "/blocky_characters/Previews/character-r.png" },
];

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("IndexedDB is only available in the browser"));
      return;
    }
    const request = indexedDB.open("CoderStudioDB", 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("scenes")) {
        db.createObjectStore("scenes", { keyPath: "id" });
      }
    };
  });
};

let audioCtx: AudioContext | null = null;
const getAudioContext = () => {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
};

// Play blocky toy footstep procedurally (Sine thump + White noise scrape)
const playFootstepSound = (isMuted: boolean, scale: number = 1.0) => {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  
  // Frequency multiplier: larger characters = deeper steps, smaller = higher-pitched clicks
  const freqMult = scale > 1.0 ? 1 / (1 + (scale - 1) * 0.4) : 1 + (1 - scale) * 0.5;
  // Subtle pitch jitter of +/- 5% to make steps sound natural and unique
  const jitter = 0.95 + Math.random() * 0.1;
  const finalMult = freqMult * jitter;

  // 1. Low frequency thump
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = "sine";
  osc.frequency.setValueAtTime(120 * finalMult, now);
  osc.frequency.exponentialRampToValueAtTime(30 * finalMult, now + 0.08);

  gain.gain.setValueAtTime(0.18, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  osc.start(now);
  osc.stop(now + 0.08);

  // 2. Scrape/Rustle high-frequency component
  const bufferSize = ctx.sampleRate * 0.04;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1000 * finalMult;
  filter.Q.value = 3.0;

  const gainNoise = ctx.createGain();
  noiseSource.connect(filter);
  filter.connect(gainNoise);
  gainNoise.connect(ctx.destination);

  gainNoise.gain.setValueAtTime(0.05, now);
  gainNoise.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  noiseSource.start(now);
  noiseSource.stop(now + 0.04);
};

// Play swoosh sound for rotation (swept bandpass white noise)
const playRotateSound = (isMuted: boolean, scale: number = 1.0) => {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const duration = 0.18;
  const freqMult = scale > 1.0 ? 1 / (1 + (scale - 1) * 0.3) : 1 + (1 - scale) * 0.4;
  const jitter = 0.97 + Math.random() * 0.06;
  const finalMult = freqMult * jitter;

  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(260 * finalMult, now);
  filter.frequency.exponentialRampToValueAtTime(750 * finalMult, now + duration * 0.4);
  filter.frequency.exponentialRampToValueAtTime(320 * finalMult, now + duration);
  filter.Q.value = 2.5;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0, now);
  gain.gain.linearRampToValueAtTime(0.1, now + duration * 0.25);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start(now);
  noise.stop(now + duration);
};

// Play solid thud for collision (Low triangle sweep + high sine wood block tick)
const playCollideSound = (isMuted: boolean, scale: number = 1.0) => {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const duration = 0.16;
  const freqMult = scale > 1.0 ? 1 / (1 + (scale - 1) * 0.5) : 1 + (1 - scale) * 0.6;
  const jitter = 0.96 + Math.random() * 0.08;
  const finalMult = freqMult * jitter;

  // 1. Lower deep triangle thump
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = "triangle";
  osc.frequency.setValueAtTime(140 * finalMult, now);
  osc.frequency.exponentialRampToValueAtTime(50 * finalMult, now + duration);

  gain.gain.setValueAtTime(0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  osc.start(now);
  osc.stop(now + duration);

  // 2. High wood block tick/impact
  const oscTick = ctx.createOscillator();
  const gainTick = ctx.createGain();
  oscTick.connect(gainTick);
  gainTick.connect(ctx.destination);

  oscTick.type = "sine";
  oscTick.frequency.value = 900 * finalMult;

  gainTick.gain.setValueAtTime(0.07, now);
  gainTick.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

  oscTick.start(now);
  oscTick.stop(now + 0.03);
};

export default function PlayerPage() {
  const [isDark, setIsDark] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const isMutedRef = useRef(false);

  // Active Editor Mode Tab: grid (ตาราง) vs characters (ตัวละคร) vs tiles (walkable)
  const [activeTab, setActiveTab] = useState<"grid" | "characters" | "tiles">("grid");

  // Save/Load dropdown states
  const [saveMenuOpen, setSaveMenuOpen] = useState(false);
  const [loadMenuOpen, setLoadMenuOpen] = useState(false);
  const saveMenuRef = useRef<HTMLDivElement>(null);
  const loadMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (saveMenuRef.current && !saveMenuRef.current.contains(e.target as Node)) {
        setSaveMenuOpen(false);
      }
      if (loadMenuRef.current && !loadMenuRef.current.contains(e.target as Node)) {
        setLoadMenuOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Grid transform states
  const [gridPos, setGridPos] = useState({ x: 0.0, y: 0.0, z: 0.0 });
  const [gridScale, setGridScale] = useState(1.0);
  const [gridOpacity, setGridOpacity] = useState(0.30); // Default grid opacity set to 30%
  const [gridLineOpacity, setGridLineOpacity] = useState(0.80); // Default grid line opacity set to 80%
  const [gridResolution, setGridResolution] = useState(10); // Dynamic grid resolution slider
  const [gridVisible, setGridVisible] = useState(true); // Toggle grid visibility

  // Lighting states
  const [ambientIntensity, setAmbientIntensityState] = useState(0.7);
  const [sunIntensity, setSunIntensityState] = useState(1.3);
  const [sunAzimuth, setSunAzimuthState] = useState(53);
  const [sunElevation, setSunElevationState] = useState(56);
  const [rimIntensity, setRimIntensityState] = useState(0.45);
  const setAmbientIntensity = (v: number) => { ambientIntensityRef.current = v; setAmbientIntensityState(v); };
  const setSunIntensity = (v: number) => { sunIntensityRef.current = v; setSunIntensityState(v); };
  const setSunAzimuth = (v: number) => { sunAzimuthRef.current = v; setSunAzimuthState(v); };
  const setSunElevation = (v: number) => { sunElevationRef.current = v; setSunElevationState(v); };
  const setRimIntensity = (v: number) => { rimIntensityRef.current = v; setRimIntensityState(v); };
  
  // Mascot placement states
  const [selectedMascot, setSelectedMascot] = useState<string | null>(null);
  const [placedCharacters, setPlacedCharacters] = useState<PlacedCharacter[]>([]);
  const [loadedMascotIds, setLoadedMascotIds] = useState<string[]>([]);

  // Character selection state
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);
  const selectionRingRef = useRef<THREE.Mesh | null>(null);
  const selectionGlowRef = useRef<THREE.Mesh | null>(null);
  const hoverTileRef = useRef<THREE.Mesh | null>(null);

  // Optimization ref: tracks last character build key to avoid rebuilding meshes on rotation-only changes
  const prevCharBuildKeyRef = useRef<string>("");

  // Tile walkability state - tracks blocked tiles as "gridX_gridZ" keys
  const [blockedTiles, setBlockedTiles] = useState<Set<string>>(new Set());
  const blockedTilesRef = useRef<Set<string>>(new Set());
  const blockedOverlayGroupRef = useRef<THREE.Group | null>(null);
  const blockedOverlayGeoRef = useRef<THREE.PlaneGeometry | null>(null);

  // Live mode state
  const [playerCharId, setPlayerCharId] = useState<string | null>(null);
  const [finishTiles, setFinishTiles] = useState<Set<string>>(new Set());
  const [startTile, setStartTile] = useState<string | null>(null);
  const [tileEditMode, setTileEditMode] = useState<"paint" | "finish" | "start">("paint");
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  // Live display: "fit" = letterbox (reproduce editor frame, blurred margins),
  // "fill" = fullscreen (grid + BG scale up together to cover the window).
  const [liveDisplayMode, setLiveDisplayMode] = useState<"fit" | "fill">("fit");
  // Box dimensions of the centered scene in "fit" mode (drives the sharp BG box).
  const [liveBox, setLiveBox] = useState({ w: 0, h: 0 });

  // Selection outline materials ref (for pulsing animation in render loop)
  const outlineMatsRef = useRef<THREE.MeshBasicMaterial[]>([]);

  // Tile drag-paint state
  const isDraggingTilesRef = useRef(false);
  const tilePaintModeRef = useRef<"block" | "unblock">("block");
  const lastPaintedTileKeyRef = useRef<string>("");

  const mountRef = useRef<HTMLDivElement>(null);
  
  // Create references to pass React states to Three.js loop safely
  const activeTabRef = useRef<"grid" | "characters" | "tiles">("grid");
  const gridPosRef = useRef({ x: 0.0, y: 0.0, z: 0.0 });
  const gridScaleRef = useRef(1.0);
  const gridOpacityRef = useRef(0.30);
  const gridLineOpacityRef = useRef(0.80);
  const gridResolutionRef = useRef(10);
  const selectedMascotRef = useRef<string | null>(null);
  const isDraggingCharRef = useRef(false);
  const dragStartGridXRef = useRef(0);
  const dragStartGridZRef = useRef(0);
  const selectedCharIdRef = useRef<string | null>(null);
  const placedCharactersRef = useRef<PlacedCharacter[]>([]);

  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const gridGroupRef = useRef<THREE.Group | null>(null);
  const gridVisibleRef = useRef(true);
  const characterGroupRef = useRef<THREE.Group | null>(null);
  const gizmoGroupRef = useRef<THREE.Group | null>(null);
  const tileMatARef = useRef<THREE.MeshStandardMaterial | null>(null);
  const tileMatBRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const tileBottomMatRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const lineMatRef = useRef<THREE.LineBasicMaterial | null>(null);
  const tileGeoRef = useRef<THREE.BoxGeometry | null>(null);
  const edgeGeoRef = useRef<THREE.EdgesGeometry | null>(null);

  // Cache to store loaded GLB models dynamically to prevent network refetches
  const loadedModelsRef = useRef<{ [mascotId: string]: THREE.Group }>({});

  // Dynamic registry for models from non-MASCOTS collections (id → { modelPath, name, previewPath? })
  const dynamicRegistryRef = useRef<Record<string, { modelPath: string; name: string; previewPath?: string }>>({});

  // Hidden file input used by the scene import (Load) button.
  const importInputRef = useRef<HTMLInputElement>(null);

  // Cache to store loaded GLB animation clips per mascotId
  const loadedAnimsRef = useRef<{ [mascotId: string]: THREE.AnimationClip[] }>({});

  // Active AnimationMixers indexed by character id
  const mixersRef = useRef<{ [charId: string]: AnimationMixer }>({});
  // All pre-created AnimationActions per character: { charId: { clipName: action } }
  const animActionsRef = useRef<{ [charId: string]: { [clipName: string]: THREE.AnimationAction } }>({});
  // Currently playing clip name per character
  const activeAnimNameRef = useRef<{ [charId: string]: string }>({});

  // WASD movement cooldown to prevent too-fast movement
  const wasdCooldownRef = useRef(false);

  // Live mode refs
  const playerCharIdRef = useRef<string | null>(null);
  const finishTilesRef = useRef<Set<string>>(new Set());
  const startTileRef = useRef<string | null>(null);
  const tileEditModeRef = useRef<"paint" | "finish" | "start">("paint");
  const isLiveModeRef = useRef(false);
  const liveDisplayModeRef = useRef<"fit" | "fill">("fit");
  const hasWonRef = useRef(false);
  const finishOverlayGroupRef = useRef<THREE.Group | null>(null);
  const finishOverlayGeoRef = useRef<THREE.PlaneGeometry | null>(null);
  const startOverlayRef = useRef<THREE.Mesh | null>(null);
  const playerMarkerRef = useRef<THREE.Mesh | null>(null);

  // Renderer ref for scene capture
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const forceRenderRef = useRef(false);

  // Light refs for dynamic intensity/position updates
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const directionalLightRef = useRef<THREE.DirectionalLight | null>(null);
  const rimLightRef = useRef<THREE.DirectionalLight | null>(null);

  // Lighting value refs — read by render loop each frame (same pattern as cameraOrbitDegRef)
  const ambientIntensityRef = useRef(0.7);
  const sunIntensityRef = useRef(1.3);
  const sunAzimuthRef = useRef(53);
  const sunElevationRef = useRef(56);
  const rimIntensityRef = useRef(0.45);

  // Camera orbit angle in degrees (45 = default NE isometric view)
  const [cameraOrbitDeg, setCameraOrbitDeg] = useState(45);
  const cameraOrbitDegRef = useRef(45);

  // Canvas zoom (outer window size zoom)
  const [canvasZoom, setCanvasZoom] = useState(1);
  const canvasZoomRef = useRef(1);

  // Responsive viewport mode (device frame preview)
  const [viewportMode, setViewportMode] = useState<ViewportMode>("desktop");
  const viewportModeRef = useRef<ViewportMode>("desktop");

  // Scene camera zoom (inner 3D viewport zoom)
  const [zoom, setZoom] = useState(1.0);
  const zoomRef = useRef(1.0);
  const [fitSize, setFitSize] = useState(1024);
  const playfieldRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const frustumSizeRef = useRef(7.0);

  // Sidebar resize state
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);

  // Right Panel resize state
  const [rightPanelWidth, setRightPanelWidth] = useState(320);
  const [isResizingRightPanel, setIsResizingRightPanel] = useState(false);

  // Sidebar collapse states
  const [sceneCollapsed, setSceneCollapsed] = useState(false);
  const [assetCollapsed, setAssetCollapsed] = useState(false);
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);

  // Toast notifications state
  const [toast, setToast] = useState<{
    isVisible: boolean;
    message: string;
    type: "info" | "success" | "warning" | "error";
    title?: string;
  }>({
    isVisible: false,
    message: "",
    type: "info",
  });

  const showToast = (message: string, type: "info" | "success" | "warning" | "error" = "info", title?: string) => {
    setToast({ isVisible: true, message, type, title });
  };

  // Inspector sub-sections collapse states
  const [transformCollapsed, setTransformCollapsed] = useState(false);
  const [animationsCollapsed, setAnimationsCollapsed] = useState(false);
  const [actionsCollapsed, setActionsCollapsed] = useState(false);

  // Weather Effects States
  const [perfMode, setPerfMode] = useState(false);
  const [weatherEffect, setWeatherEffect] = useState<"none" | "gentle" | "windy" | "dreamy" | "storm">("none");
  const [weatherSpeed, setWeatherSpeed] = useState<number>(1.0);
  const [weatherDensity, setWeatherDensity] = useState<number>(150);
  const [weatherOpacity, setWeatherOpacity] = useState<number>(0.6);
  const [lastActiveWeatherEffect, setLastActiveWeatherEffect] = useState<"gentle" | "windy" | "dreamy" | "storm">("gentle");

  useEffect(() => {
    if (weatherEffect !== "none") {
      setLastActiveWeatherEffect(weatherEffect);
    }
  }, [weatherEffect]);

  const toggleWeather = () => {
    if (weatherEffect !== "none") {
      setWeatherEffect("none");
    } else {
      setWeatherEffect(lastActiveWeatherEffect);
    }
  };

  // Refs for rendering loop access
  const weatherEffectRef = useRef<"none" | "gentle" | "windy" | "dreamy" | "storm">("none");
  const weatherSpeedRef = useRef<number>(1.0);
  const weatherDensityRef = useRef<number>(150);
  const weatherOpacityRef = useRef<number>(0.6);

  useEffect(() => {
    weatherEffectRef.current = weatherEffect;
  }, [weatherEffect]);

  useEffect(() => {
    weatherSpeedRef.current = weatherSpeed;
  }, [weatherSpeed]);

  useEffect(() => {
    weatherDensityRef.current = weatherDensity;
  }, [weatherDensity]);

  useEffect(() => {
    weatherOpacityRef.current = weatherOpacity;
  }, [weatherOpacity]);

  useEffect(() => {
    const r = rendererRef.current;
    if (!r) return;
    const dpr = window.devicePixelRatio;
    r.setPixelRatio(perfMode ? 1 : Math.min(dpr, 1.5));
    r.setSize(displaySizeRef.current, displaySizeRef.current);
    forceRenderRef.current = true;
  }, [perfMode]);

  useEffect(() => {
    if (selectedCharId) {
      setSceneCollapsed(true);
      setAssetCollapsed(true);
    } else if (selectedMascot) {
      setSceneCollapsed(true);
    } else {
      setAssetCollapsed(false);
    }
  }, [selectedCharId, selectedMascot]);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingSidebar) return;
      const newWidth = Math.max(320, Math.min(e.clientX, 800));
      setSidebarWidth(newWidth);
    };
    const handleMouseUp = () => setIsResizingSidebar(false);
    if (isResizingSidebar) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    } else {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizingSidebar]);

  useEffect(() => {
    const handleMouseMoveRight = (e: MouseEvent) => {
      if (!isResizingRightPanel) return;
      const newWidth = Math.max(320, Math.min(window.innerWidth - e.clientX, 800));
      setRightPanelWidth(newWidth);
    };
    const handleMouseUpRight = () => setIsResizingRightPanel(false);
    if (isResizingRightPanel) {
      window.addEventListener("mousemove", handleMouseMoveRight);
      window.addEventListener("mouseup", handleMouseUpRight);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    } else {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMoveRight);
      window.removeEventListener("mouseup", handleMouseUpRight);
    };
  }, [isResizingRightPanel]);

  const displaySize = Math.round(clampNum(fitSize * canvasZoom, MIN_SIZE, MAX_SIZE));
  const { ratioW, ratioH } = VIEWPORT_PRESETS[viewportMode];
  const displayW = viewportMode === "desktop" ? displaySize : Math.round(displaySize * ratioW / ratioH);
  const displaySizeRef = useRef(displaySize);
  const displayWRef = useRef(displayW);

  // AI BG Gen state
  const [aiCaptureUrl, setAiCaptureUrl] = useState<string | null>(null);
  const [aiThemeText, setAiThemeText] = useState("");
  const [aiPromptCopied, setAiPromptCopied] = useState(false);
  const [selectedAiStyle, setSelectedAiStyle] = useState("clay");

  // Bump animation when character hits a blocked tile
  const bumpAnimRef = useRef<{ charId: string; startTime: number; dx: number; dz: number } | null>(null);

  // Per-character idle blend weight (how much the idle clip contributes vs. static pose)
  const idleBlendRef = useRef<{ [charId: string]: number }>({});

  // ── Motion effects ──
  // Lerped tile position and rotation for smooth glide + turn
  const smoothTransformRef = useRef<{ [id: string]: { tileX: number; tileZ: number; rotY: number } }>({});
  // Timestamp of the last step hop (Y-arc effect on walk)
  const hopAnimRef = useRef<{ [id: string]: number }>({});
  // Timestamp of the last turn squish (squash-and-stretch on A/D)
  const turnSquishRef = useRef<{ [id: string]: number }>({});
  // Pending setTimeout IDs that auto-return character to idle after walking
  const walkTimerRef = useRef<{ [id: string]: ReturnType<typeof setTimeout> }>({});
  // Step counter per character — odd = left foot, even = right foot
  const stepCountRef = useRef<{ [id: string]: number }>({});

  // Keep references synced
  useEffect(() => {
    activeTabRef.current = activeTab;
    if (activeTab === "grid") {
      setSelectedCharId(null);
    }
  }, [activeTab]);

  useEffect(() => {
    gridPosRef.current = gridPos;
    if (gridGroupRef.current) {
      gridGroupRef.current.position.set(gridPos.x, gridPos.y, gridPos.z);
    }
  }, [gridPos]);

  useEffect(() => {
    gridScaleRef.current = gridScale;
    if (gridGroupRef.current) {
      gridGroupRef.current.scale.set(gridScale, gridScale, gridScale);
    }
  }, [gridScale]);

  useEffect(() => {
    gridOpacityRef.current = gridOpacity;
    if (tileMatARef.current) tileMatARef.current.opacity = gridOpacity;
    if (tileMatBRef.current) tileMatBRef.current.opacity = gridOpacity;
    if (tileBottomMatRef.current) tileBottomMatRef.current.opacity = gridOpacity * 0.8;
  }, [gridOpacity]);

  useEffect(() => {
    gridLineOpacityRef.current = gridLineOpacity;
    if (lineMatRef.current) {
      lineMatRef.current.opacity = gridLineOpacity;
    }
  }, [gridLineOpacity]);

  useEffect(() => {
    gridResolutionRef.current = gridResolution;
  }, [gridResolution]);

  useEffect(() => {
    cameraOrbitDegRef.current = cameraOrbitDeg;
  }, [cameraOrbitDeg]);

  useEffect(() => {
    canvasZoomRef.current = canvasZoom;
  }, [canvasZoom]);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  // Resize the renderer and update camera frustum when canvas dimensions change.
  useEffect(() => {
    displaySizeRef.current = displaySize;
    displayWRef.current = displayW;
    viewportModeRef.current = viewportMode;
    const r = rendererRef.current;
    const cam = cameraRef.current;
    if (!r) return;
    if (isLiveModeRef.current) return; // live mode manages its own size
    r.setSize(displayW, displaySize);
    if (cam) {
      const aspect = displayW / displaySize;
      const fs = frustumSizeRef.current;
      cam.left   = -fs * aspect;
      cam.right  =  fs * aspect;
      cam.top    =  fs;
      cam.bottom = -fs;
      cam.updateProjectionMatrix();
    }
  }, [displaySize, displayW, viewportMode]);

  // Responsive auto-fit: track available playfield area and keep canvas square-fit.
  useEffect(() => {
    const el = playfieldRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const PAD = 48; // matches container p-6 padding (24px each side)
    // ResizeObserver fires an initial callback on observe(), so no synchronous measure needed.
    const observer = new ResizeObserver(() => {
      const avail = Math.min(el.clientWidth, el.clientHeight) - PAD;
      const next = Math.round(clampNum(avail, MIN_SIZE, MAX_SIZE));
      setFitSize(prev => (prev === next ? prev : next));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Clean up pending walk-return timers on unmount.
  useEffect(() => () => { Object.values(walkTimerRef.current).forEach(clearTimeout); }, []);

  // Option + wheel (and trackpad pinch, which arrives as wheel+ctrlKey) over the
  // canvas → zoom. Native non-passive listener so preventDefault works.
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!(e.altKey || e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      const factor = Math.exp(-e.deltaY * 0.0015);
      setZoom(z => clampNum(z * factor, 0.3, 4.0));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  useEffect(() => {
    gridVisibleRef.current = gridVisible;
    if (gridGroupRef.current) {
      gridGroupRef.current.visible = gridVisible;
    }
  }, [gridVisible]);

  useEffect(() => {
    selectedMascotRef.current = selectedMascot;
  }, [selectedMascot]);

  useEffect(() => {
    liveDisplayModeRef.current = liveDisplayMode;
  }, [liveDisplayMode]);

  useEffect(() => {
    selectedCharIdRef.current = selectedCharId;
  }, [selectedCharId]);

  useEffect(() => {
    placedCharactersRef.current = placedCharacters;
  }, [placedCharacters]);

  useEffect(() => {
    blockedTilesRef.current = blockedTiles;
  }, [blockedTiles]);

  useEffect(() => { playerCharIdRef.current = playerCharId; }, [playerCharId]);
  useEffect(() => { finishTilesRef.current = finishTiles; }, [finishTiles]);
  useEffect(() => { startTileRef.current = startTile; }, [startTile]);
  useEffect(() => { tileEditModeRef.current = tileEditMode; }, [tileEditMode]);
  useEffect(() => { isLiveModeRef.current = isLiveMode; }, [isLiveMode]);


  useEffect(() => { hasWonRef.current = hasWon; }, [hasWon]);

  // Initializing theme and audio settings
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    }

    const savedMute = localStorage.getItem("mute_sounds");
    if (savedMute === "true") {
      setIsMuted(true);
      isMutedRef.current = true;
    }
  }, []);

  // Sync isMuted state with ref and localStorage
  useEffect(() => {
    isMutedRef.current = isMuted;
    localStorage.setItem("mute_sounds", isMuted ? "true" : "false");
  }, [isMuted]);

  const toggleTheme = () => {
    if (isDark) {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      setIsDark(true);
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
  };

  // Reset grid alignment and clear mascots
  const handleResetAlignment = () => {
    setGridPos({ x: 0.0, y: 0.0, z: 0.0 });
    setGridScale(1.0);
    setGridOpacity(0.30);
    setGridLineOpacity(0.80);
    setGridResolution(10);
    setGridVisible(true);
    setSelectedMascot(null);
    setPlacedCharacters([]);
    setSelectedCharId(null);
    setBlockedTiles(new Set());
    setPlayerCharId(null);
    setFinishTiles(new Set());
    setStartTile(null);
    setIsLiveMode(false);
    setHasWon(false);
    setTileEditMode("paint");
    setActiveTab("grid");
    setCanvasZoom(1.0);
    setZoom(1.0);
    setAmbientIntensity(0.7);
    setSunIntensity(1.3);
    setSunAzimuth(53);
    setSunElevation(56);
    setRimIntensity(0.45);
  };


  // Resize the renderer + camera for the current live display mode. Called on
  // entering live mode, on window resize, and when toggling fit/fill.
  const applyLiveLayout = () => {
    const r = rendererRef.current;
    const cam = cameraRef.current;
    if (!r || !cam) return;
    // Measure the real editor card (its true on-screen size) rather than
    // displaySizeRef, which can be stale/clamped and throws off the scale.
    const rect = cardRef.current?.getBoundingClientRect();
    const cardW = rect?.width || displayWRef.current;
    const cardH = rect?.height || displaySizeRef.current;
    const winW = window.innerWidth;
    const winH = window.innerHeight;
    const fs = frustumSizeRef.current;
    const editorAspect = cardW / cardH;
    r.setClearAlpha(0);

    if (liveDisplayModeRef.current === "fill") {
      // Fullscreen: render at the full window, then scale the grid up by the
      // cover factor S so grid + BG grow together (px-per-unit = S × editor).
      const S = Math.max(winW / cardW, winH / cardH);
      r.setSize(winW, winH);
      const fsFill = (fs * winH) / (S * cardH);
      const aspect = winW / winH;
      cam.left = -fsFill * aspect; cam.right = fsFill * aspect;
      cam.top = fsFill; cam.bottom = -fsFill;
    } else {
      // Fit (letterbox): reproduce the editor frame larger, keeping the editor
      // aspect + frustum so BG and grid stay locked exactly as in the editor.
      const boxScale = Math.min(winW / cardW, winH / cardH);
      const boxW = Math.round(cardW * boxScale);
      const boxH = Math.round(cardH * boxScale);
      r.setSize(boxW, boxH);
      cam.left = -fs * editorAspect; cam.right = fs * editorAspect;
      cam.top = fs; cam.bottom = -fs;
      setLiveBox({ w: boxW, h: boxH });
    }
    cam.updateProjectionMatrix();
    forceRenderRef.current = true;
  };

  const toggleLiveDisplayMode = () => {
    const next = liveDisplayModeRef.current === "fit" ? "fill" : "fit";
    liveDisplayModeRef.current = next;
    setLiveDisplayMode(next);
    applyLiveLayout();
  };

  // While live, keep the renderer/camera in sync with the window size.
  useEffect(() => {
    if (!isLiveMode) return;
    const onResize = () => applyLiveLayout();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLiveMode]);

  // Hide/show editor-only chrome (grid floor, direction arrows, gizmo, blocked
  // overlay, selection helpers) so player mode shows only the BG + models.
  const setLiveHelpersHidden = (hidden: boolean) => {
    if (gridGroupRef.current) gridGroupRef.current.visible = hidden ? false : gridVisibleRef.current;
    if (blockedOverlayGroupRef.current) blockedOverlayGroupRef.current.visible = !hidden;
    if (finishOverlayGroupRef.current) finishOverlayGroupRef.current.visible = !hidden;
    if (hidden) {
      if (gizmoGroupRef.current) gizmoGroupRef.current.visible = false;
      if (hoverTileRef.current) hoverTileRef.current.visible = false;
      if (selectionRingRef.current) selectionRingRef.current.visible = false;
      if (selectionGlowRef.current) selectionGlowRef.current.visible = false;
      if (startOverlayRef.current) startOverlayRef.current.visible = false;
      if (playerMarkerRef.current) playerMarkerRef.current.visible = false;
    }
  };

  const startLiveMode = () => {
    if (!playerCharId || finishTiles.size === 0) return;
    setHasWon(false);
    setSelectedMascot(null);
    setSelectedCharId(null);
    // Update the ref synchronously so the render loop's live-mode guards apply
    // on the very next frame (the effect-based sync lags by a render).
    isLiveModeRef.current = true;
    setLiveHelpersHidden(true);
    if (startTileRef.current) {
      const [sx, sz] = startTileRef.current.split("_").map(Number);
      setPlacedCharacters(prev => prev.map(c =>
        c.id === playerCharId ? { ...c, gridX: sx, gridZ: sz } : c
      ));
      delete smoothTransformRef.current[playerCharId];
    }
    // Resize renderer immediately — before React re-render
    applyLiveLayout();
    setIsLiveMode(true);
  };

  const stopLiveMode = () => {
    // Restore renderer size before React re-render
    {
      const r = rendererRef.current;
      const cam = cameraRef.current;
      if (r && cam) {
        const w = displayWRef.current;
        const h = displaySizeRef.current;
        r.setSize(w, h);
        r.setClearAlpha(0);
        const fs = frustumSizeRef.current;
        const aspect = w / h;
        cam.left = -fs * aspect; cam.right = fs * aspect;
        cam.top = fs; cam.bottom = -fs;
        cam.updateProjectionMatrix();
        forceRenderRef.current = true;
      }
    }
    isLiveModeRef.current = false;
    setLiveHelpersHidden(false);
    setIsLiveMode(false);
    setHasWon(false);
    setTileEditMode("paint");
  };

  // Dynamic GLTF Loader - works with both MASCOTS and dynamic registry
  const loadMascotModel = (mascotId: string, callback?: (model: THREE.Group) => void) => {
    if (loadedModelsRef.current[mascotId]) {
      if (callback) callback(loadedModelsRef.current[mascotId]);
      return;
    }

    const mascot = MASCOTS.find(m => m.id === mascotId);
    const dynEntry = dynamicRegistryRef.current[mascotId];
    const modelPath = mascot?.modelPath ?? dynEntry?.modelPath;
    if (!modelPath) return;

    const loader = new GLTFLoader();
    loader.load(
      modelPath,
      (gltf) => {
        const model = gltf.scene;
        // Enable shadows recursively on all meshes
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        loadedModelsRef.current[mascotId] = model;
        // Cache animation clips from this GLB
        if (gltf.animations && gltf.animations.length > 0) {
          loadedAnimsRef.current[mascotId] = gltf.animations;
        }
        setLoadedMascotIds(prev => {
          if (prev.includes(mascotId)) return prev;
          return [...prev, mascotId];
        });
        if (callback) callback(model);
      },
      undefined,
      (err) => {
        console.error(`Error loading GLB blocky character model ${mascotId}:`, err);
      }
    );
  };

  // ── Scene persistence (JSON export/import & IndexedDB) ────────────────
  const SCENE_VERSION = 1;

  const getSceneSnapshot = () => {
    // Only persist registry entries actually referenced by placed characters.
    const usedRegistry: Record<string, { modelPath: string; name: string; previewPath?: string }> = {};
    placedCharacters.forEach((c) => {
      const entry = dynamicRegistryRef.current[c.mascotId];
      if (entry) usedRegistry[c.mascotId] = entry;
    });

    return {
      version: SCENE_VERSION,
      grid: {
        pos: gridPos,
        scale: gridScale,
        opacity: gridOpacity,
        lineOpacity: gridLineOpacity,
        resolution: gridResolution,
        visible: gridVisible,
      },
      cameraOrbitDeg,
      lighting: { ambientIntensity, sunIntensity, sunAzimuth, sunElevation, rimIntensity },
      weather: {
        effect: weatherEffect,
        speed: weatherSpeed,
        density: weatherDensity,
        opacity: weatherOpacity
      },
      selectedBg,
      uploadedBgUrl,
      canvasZoom,
      zoom,
      placedCharacters,
      blockedTiles: Array.from(blockedTiles),
      playerCharId,
      finishTiles: Array.from(finishTiles),
      startTile,
      registry: usedRegistry,
    };
  };

  const applySceneSnapshot = (snap: any) => {
    if (snap.version !== SCENE_VERSION) {
      console.error(`Unsupported scene version: ${snap.version}`);
      showToast("ไฟล์ scene ไม่รองรับเวอร์ชันนี้", "error", "ไม่สามารถโหลดได้");
      return;
    }

    // Repopulate dynamic registry first so model paths resolve on load.
    if (snap.registry) Object.assign(dynamicRegistryRef.current, snap.registry);

    if (snap.grid) {
      setGridPos(snap.grid.pos);
      setGridScale(snap.grid.scale);
      setGridOpacity(snap.grid.opacity);
      setGridLineOpacity(snap.grid.lineOpacity ?? Math.min(1.0, snap.grid.opacity * 2.2 + 0.15));
      setGridResolution(snap.grid.resolution);
      setGridVisible(snap.grid.visible);
    }
    if (typeof snap.cameraOrbitDeg === "number") setCameraOrbitDeg(snap.cameraOrbitDeg);
    if (snap.lighting) {
      setAmbientIntensity(snap.lighting.ambientIntensity ?? 0.7);
      setSunIntensity(snap.lighting.sunIntensity ?? 1.3);
      setSunAzimuth(snap.lighting.sunAzimuth ?? 53);
      setSunElevation(snap.lighting.sunElevation ?? 56);
      setRimIntensity(snap.lighting.rimIntensity ?? 0.45);
    }
    if (snap.weather) {
      setWeatherEffect(snap.weather.effect ?? "none");
      setWeatherSpeed(snap.weather.speed ?? 1.0);
      setWeatherDensity(snap.weather.density ?? 150);
      setWeatherOpacity(snap.weather.opacity ?? 0.6);
      if (snap.weather.effect && snap.weather.effect !== "none") {
        setLastActiveWeatherEffect(snap.weather.effect);
      }
    } else {
      setWeatherEffect("none");
      setWeatherSpeed(1.0);
      setWeatherDensity(150);
      setWeatherOpacity(0.6);
    }
    if (snap.selectedBg) setSelectedBg(snap.selectedBg);
    if (snap.uploadedBgUrl) setUploadedBgUrl(snap.uploadedBgUrl);
    if (typeof snap.canvasZoom === "number") setCanvasZoom(snap.canvasZoom);
    if (typeof snap.zoom === "number") setZoom(snap.zoom);
    setBlockedTiles(new Set<string>(snap.blockedTiles ?? []));
    setPlayerCharId(snap.playerCharId ?? null);
    setFinishTiles(new Set<string>(snap.finishTiles ?? []));
    setStartTile(snap.startTile ?? null);
    setIsLiveMode(false);
    setHasWon(false);
    setTileEditMode("paint");
    setSelectedCharId(null);
    setPlacedCharacters(snap.placedCharacters ?? []);

    // Trigger GLB loading for every unique model referenced.
    const ids = new Set<string>((snap.placedCharacters ?? []).map((c: PlacedCharacter) => c.mascotId));
    ids.forEach((id) => loadMascotModel(id));
  };

  const exportScene = () => {
    const snapshot = getSceneSnapshot();
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "coder-studio-scene.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importScene = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const snap = JSON.parse(String(reader.result));
        applySceneSnapshot(snap);
      } catch (err) {
        console.error("Failed to import scene:", err);
        showToast("ไม่สามารถอ่านไฟล์ scene ได้", "error", "ข้อผิดพลาด");
      }
    };
    reader.readAsText(file);
  };

  const saveToIndexedDB = async (slotId: string = "default") => {
    try {
      const snapshot = getSceneSnapshot();
      const db = await openDB();
      const transaction = db.transaction("scenes", "readwrite");
      const store = transaction.objectStore("scenes");
      
      await new Promise<void>((resolve, reject) => {
        const request = store.put({ id: slotId, snapshot, updatedAt: new Date().toISOString() });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      showToast("บันทึกฉากลง Browser Storage สำเร็จ!", "success", "บันทึกสำเร็จ");
    } catch (err) {
      console.error("Failed to save to IndexedDB:", err);
      showToast("ไม่สามารถบันทึกฉากลง Browser Storage ได้", "error", "บันทึกไม่สำเร็จ");
    }
  };

  const loadFromIndexedDB = async (slotId: string = "default", silent: boolean = false): Promise<boolean> => {
    try {
      const db = await openDB();
      const transaction = db.transaction("scenes", "readonly");
      const store = transaction.objectStore("scenes");
      
      const record = await new Promise<any>((resolve, reject) => {
        const request = store.get(slotId);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      if (!record || !record.snapshot) {
        if (!silent) {
          showToast("ไม่พบข้อมูลฉากที่เคยบันทึกไว้ในเบราว์เซอร์", "warning", "ไม่พบข้อมูล");
        }
        return false;
      }

      applySceneSnapshot(record.snapshot);
      if (!silent) {
        showToast("โหลดฉากจาก Browser Storage สำเร็จ!", "success", "โหลดสำเร็จ");
      } else {
        showToast("โหลดฉากที่บันทึกไว้ล่าสุดสำเร็จ", "success", "โหลดอัตโนมัติ");
      }
      return true;
    } catch (err) {
      console.error("Failed to load from IndexedDB:", err);
      if (!silent) {
        showToast("ไม่สามารถโหลดฉากจาก Browser Storage ได้", "error", "โหลดไม่สำเร็จ");
      }
      return false;
    }
  };

  const loadMascotModelPromise = (mascotId: string) => {
    return new Promise<void>((resolve) => {
      const timeout = setTimeout(() => resolve(), 3000);
      loadMascotModel(mascotId, () => {
        clearTimeout(timeout);
        resolve();
      });
    });
  };

  // Try to load saved scene from browser storage first on mount. Fall back to default characters if none exists.
  useEffect(() => {
    const initAndLoad = async () => {
      try {
        const loaded = await loadFromIndexedDB("default", true);
        if (!loaded) {
          await Promise.all([
            loadMascotModelPromise("character-a"),
            loadMascotModelPromise("character-b"),
            loadMascotModelPromise("character-c")
          ]);
        } else {
          const uniqueMascots = Array.from(new Set(placedCharactersRef.current.map(c => c.mascotId)));
          if (uniqueMascots.length > 0) {
            await Promise.all(uniqueMascots.map(id => loadMascotModelPromise(id)));
          }
        }
      } catch (e) {
        console.error("Error during initial mount load:", e);
      } finally {
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      }
    };
    initAndLoad();
  }, []);

  // Auto load selected mascot model if not already cached
  useEffect(() => {
    if (selectedMascot) {
      loadMascotModel(selectedMascot);
    }
  }, [selectedMascot]);

  // Helper inside client environment to draw glowing direction texture (N, S, E, W)
  const createDirectionTexture = (text: string) => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Clear canvas - transparent background
    ctx.clearRect(0, 0, 256, 256);

    // Faint semi-transparent radial gradient background
    const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 100);
    grad.addColorStop(0, "rgba(30, 41, 59, 0.35)");
    grad.addColorStop(1, "rgba(15, 23, 42, 0.15)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(128, 128, 100, 0, Math.PI * 2);
    ctx.fill();

    // Glowing futuristic outer ring
    ctx.shadowColor = "#3b82f6";
    ctx.shadowBlur = 10;
    ctx.strokeStyle = "rgba(59, 130, 246, 0.85)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(128, 128, 100, 0, Math.PI * 2);
    ctx.stroke();

    // Inner dashed ring
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(96, 165, 250, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 8]);
    ctx.beginPath();
    ctx.arc(128, 128, 85, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]); 

    // Cardinal tick marks
    ctx.strokeStyle = "rgba(59, 130, 246, 0.7)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const startX = 128 + Math.cos(angle) * 100;
      const startY = 128 + Math.sin(angle) * 100;
      const endX = 128 + Math.cos(angle) * 90;
      const endY = 128 + Math.sin(angle) * 90;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }

    // Modern clean typography
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 90px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 128, 128);

    // Dynamic pointer arrow
    ctx.shadowColor = "#60a5fa";
    ctx.shadowBlur = 8;
    ctx.fillStyle = "#60a5fa";
    ctx.beginPath();
    ctx.moveTo(128, 12);
    ctx.lineTo(116, 26);
    ctx.lineTo(140, 26);
    ctx.closePath();
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  };

  // Helper to draw a beautiful, futuristic cyan glowing selection ring (for active character select)
  const createSelectionRingTexture = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.clearRect(0, 0, 256, 256);

    // Glowing futuristic selection ring
    ctx.shadowColor = "#00f0ff";
    ctx.shadowBlur = 12;
    ctx.strokeStyle = "rgba(0, 240, 255, 0.9)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(128, 128, 110, 0, Math.PI * 2);
    ctx.stroke();

    // Subtle inner dashed ring
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(0, 240, 255, 0.35)";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.arc(128, 128, 95, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Ticks at 4 corners
    ctx.strokeStyle = "rgba(0, 240, 255, 0.85)";
    ctx.lineWidth = 3;
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const rOuter = 115;
      ctx.beginPath();
      ctx.arc(128, 128, rOuter, angle - 0.2, angle + 0.2);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  };

  // Soft radial glow disc for character selection aura
  const createSelectionGlowTexture = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.clearRect(0, 0, 512, 512);

    // Multi-stop radial gradient: bright cyan core → deep blue mid → transparent edge
    const grad = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
    grad.addColorStop(0,   "rgba(255, 220, 0, 1.00)");
    grad.addColorStop(0.20,"rgba(255, 200, 0, 0.40)");
    grad.addColorStop(0.50,"rgba(255, 170, 0, 0.23)");
    grad.addColorStop(0.80,"rgba(220, 130, 0, 0.08)");
    grad.addColorStop(1,   "rgba(180,  90, 0, 0.00)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    return new THREE.CanvasTexture(canvas);
  };

  // Soft glowing particle for weather effects
  const createParticleTexture = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.clearRect(0, 0, 64, 64);

    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0,   "rgba(255, 255, 255, 1.0)");
    grad.addColorStop(0.25,"rgba(255, 255, 255, 0.8)");
    grad.addColorStop(0.55,"rgba(255, 255, 255, 0.35)");
    grad.addColorStop(1.0, "rgba(255, 255, 255, 0.0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);

    return new THREE.CanvasTexture(canvas);
  };

  // Beautiful leaf shape particle texture for wind/leaf effects
  const createLeafTexture = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.clearRect(0, 0, 64, 64);

    // Draw beautiful leaf shape
    ctx.fillStyle = "#ffffff"; // White base so Three.js can tint it dynamically
    ctx.beginPath();
    ctx.moveTo(32, 8);
    // Left curve
    ctx.quadraticCurveTo(8, 32, 32, 56);
    // Right curve
    ctx.quadraticCurveTo(56, 32, 32, 8);
    ctx.closePath();
    ctx.fill();

    // Draw leaf stem/vein
    ctx.strokeStyle = "rgba(0, 0, 0, 0.22)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(32, 12);
    ctx.lineTo(32, 52);
    ctx.stroke();

    // Draw secondary veins
    ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(32, 24); ctx.lineTo(20, 18);
    ctx.moveTo(32, 24); ctx.lineTo(44, 18);
    ctx.moveTo(32, 34); ctx.lineTo(18, 28);
    ctx.moveTo(32, 34); ctx.lineTo(46, 28);
    ctx.stroke();

    return new THREE.CanvasTexture(canvas);
  };

  // Three.js Setup - locked isometric view & direct drag editor
  useEffect(() => {
    if (!mountRef.current) return;

    // Initial size; the displaySize resize effect overrides this immediately after mount.
    const containerWidth = displaySizeRef.current;
    const containerHeight = displaySizeRef.current;

    // 1. Scene
    const scene = new THREE.Scene();

    // 2. Camera - STRICTLY LOCKED Orthographic Isometric Camera
    const aspect = containerWidth / containerHeight;
    const frustumSize = 7.0;
    frustumSizeRef.current = frustumSize;
    const camera = new THREE.OrthographicCamera(
      -frustumSize * aspect,
      frustumSize * aspect,
      frustumSize,
      -frustumSize,
      0.1,
      1000
    );
    
    // Perfect Mathematical isometric locked angle
    camera.position.set(12, 12, 12);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer with transparency
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setSize(containerWidth, containerHeight);
    rendererRef.current = renderer;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = false;
    mountRef.current.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const hemiLight = new THREE.HemisphereLight(0xffeedd, 0xbde5f8, 0.4);
    scene.add(hemiLight);

    const directionalLight = new THREE.DirectionalLight(0xffeedd, 1.3);
    directionalLight.position.set(8, 12, 6);
    directionalLight.castShadow = false;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.bias = -0.0005;
    scene.add(directionalLight);
    directionalLightRef.current = directionalLight;

    const rimLight = new THREE.DirectionalLight(0xbde5f8, 0.45);
    rimLight.position.set(-6, 8, -6);
    scene.add(rimLight);
    rimLightRef.current = rimLight;

    // 5. Allocate shared reusable geometries to prevent memory leaks during reconstruction
    const tileGeo = new THREE.BoxGeometry(1.0, 0.02, 1.0);
    const edgeGeo = new THREE.EdgesGeometry(tileGeo);
    tileGeoRef.current = tileGeo;
    edgeGeoRef.current = edgeGeo;

    // 6. Draw alternating grid materials
    const tileMatA = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.25,
      metalness: 0.1,
      transparent: true,
      opacity: gridOpacityRef.current,
    });
    tileMatARef.current = tileMatA;

    const tileMatB = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.25,
      metalness: 0.1,
      transparent: true,
      opacity: gridOpacityRef.current,
    });
    tileMatBRef.current = tileMatB;

    const tileBottomMat = new THREE.MeshStandardMaterial({
      color: 0xc4cbd4,
      roughness: 0.5,
      transparent: true,
      opacity: gridOpacityRef.current * 0.8,
    });
    tileBottomMatRef.current = tileBottomMat;

    const lineMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: gridLineOpacityRef.current,
      depthTest: true,
    });
    lineMatRef.current = lineMat;

    const gridGroup = new THREE.Group();
    gridGroup.scale.set(gridScaleRef.current, gridScaleRef.current, gridScaleRef.current);
    gridGroup.position.set(gridPosRef.current.x, gridPosRef.current.y, gridPosRef.current.z);
    scene.add(gridGroup);
    gridGroupRef.current = gridGroup;

    // 6.5. Independent Character Group directly in scene (separated from Grid Group scale/translation)
    const characterGroup = new THREE.Group();
    scene.add(characterGroup);
    characterGroupRef.current = characterGroup;

    // 6.6. Blocked tile overlay group and shared geometry
    const blockedOverlayGroup = new THREE.Group();
    scene.add(blockedOverlayGroup);
    blockedOverlayGroupRef.current = blockedOverlayGroup;
    const blockedOverlayGeo = new THREE.PlaneGeometry(0.95, 0.95);
    blockedOverlayGeoRef.current = blockedOverlayGeo;

    // Start tile overlay (blue)
    const startOverlayGeo = new THREE.PlaneGeometry(0.95, 0.95);
    const startOverlayMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.6, side: THREE.DoubleSide, depthWrite: false });
    const startOverlayMesh = new THREE.Mesh(startOverlayGeo, startOverlayMat);
    startOverlayMesh.rotation.x = -Math.PI / 2;
    startOverlayMesh.renderOrder = 10;
    startOverlayMesh.visible = false;
    scene.add(startOverlayMesh);
    startOverlayRef.current = startOverlayMesh;

    // Finish tile overlay group (gold) — one mesh per tile, rebuilt via useEffect
    const finishOverlayGroup = new THREE.Group();
    scene.add(finishOverlayGroup);
    finishOverlayGroupRef.current = finishOverlayGroup;
    const finishOverlayGeo = new THREE.PlaneGeometry(0.95, 0.95);
    finishOverlayGeoRef.current = finishOverlayGeo;

    // Player marker — green downward-pointing cone floating above player
    const playerMarkerGeo = new THREE.ConeGeometry(0.18, 0.32, 4);
    const playerMarkerMat = new THREE.MeshBasicMaterial({ color: 0x4ade80, transparent: true, depthTest: false });
    const playerMarkerMesh = new THREE.Mesh(playerMarkerGeo, playerMarkerMat);
    playerMarkerMesh.rotation.x = Math.PI;
    playerMarkerMesh.renderOrder = 12;
    playerMarkerMesh.visible = false;
    scene.add(playerMarkerMesh);
    playerMarkerRef.current = playerMarkerMesh;

    // 7. Dynamic glowing selection ring
    const selectionRingTex = createSelectionRingTexture();
    let selectionRingMat: THREE.MeshBasicMaterial | null = null;
    let selectionRing: THREE.Mesh | null = null;
    
    if (selectionRingTex) {
      selectionRingMat = new THREE.MeshBasicMaterial({
        map: selectionRingTex,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      selectionRing = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.0), selectionRingMat);
      selectionRing.rotation.x = -Math.PI / 2; // Lie flat on XZ plane
      selectionRing.position.y = 0.03; // Float slightly above tiles
      selectionRing.visible = false;
      selectionRing.renderOrder = 11; // Ensure it renders on top of hover tile
      scene.add(selectionRing);
      selectionRingRef.current = selectionRing;
    }

    // 7.5. Character selection glow disc (soft radial aura under selected character)
    const selectionGlowTex = createSelectionGlowTexture();
    let selectionGlow: THREE.Mesh | null = null;
    if (selectionGlowTex) {
      const glowMat = new THREE.MeshBasicMaterial({
        map: selectionGlowTex,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        depthTest: false,   // Always render regardless of depth — disc sits under character
      });
      selectionGlow = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.0), glowMat);
      selectionGlow.rotation.x = -Math.PI / 2;
      selectionGlow.visible = false;
      selectionGlow.renderOrder = 8; // Render before hover/ring but always shows
      scene.add(selectionGlow);
      selectionGlowRef.current = selectionGlow;
    }

    // 8. Hover Highlight Tile
    const hoverMat = new THREE.MeshBasicMaterial({
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.30, // 30% low opacity as requested (opacity จางๆ)
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const hoverTile = new THREE.Mesh(new THREE.PlaneGeometry(0.98, 0.98), hoverMat); // 0.98 for beautiful tile borders
    hoverTile.rotation.x = -Math.PI / 2;
    hoverTile.position.y = 0.015; // Float slightly above tiles
    hoverTile.visible = false;
    hoverTile.renderOrder = 10; // Ensure it renders on top of grid tiles
    scene.add(hoverTile);
    hoverTileRef.current = hoverTile;

    // 8.5. Weather Particle System (ฝุ่นลอยลมพัด)
    const PARTICLE_COUNT = 300;
    const weatherParticlesGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(PARTICLE_COUNT * 3);
    const particleVelocities = new Float32Array(PARTICLE_COUNT * 3);

    // Initial position generation function
    const spawnParticle = (i: number, isInitial: boolean = false) => {
      const gridS = gridScaleRef.current;
      const bX = 12 * gridS;
      const bZ = 12 * gridS;
      const bY = 9 * gridS;

      const x = (Math.random() - 0.5) * bX * 2;
      const y = isInitial ? Math.random() * bY : bY; // vertical spread initially, else spawn at top
      const z = (Math.random() - 0.5) * bZ * 2;

      particlePositions[i * 3] = x;
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = z;

      // Base directions (speeds will be dynamic)
      particleVelocities[i * 3] = (Math.random() - 0.5) * 0.3; // vx
      particleVelocities[i * 3 + 1] = -0.15 - Math.random() * 0.25; // vy
      particleVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.3; // vz
    };

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      spawnParticle(i, true);
    }

    weatherParticlesGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));

    const weatherParticleTex = createParticleTexture();
    const weatherParticleMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 8,
      sizeAttenuation: false,
      map: weatherParticleTex || undefined,
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const weatherPoints = new THREE.Points(weatherParticlesGeo, weatherParticleMat);
    scene.add(weatherPoints);

    // 8.6. Leaf Particle System (ใบไม้ปลิว)
    const LEAF_COUNT = 100;
    const leafParticlesGeo = new THREE.BufferGeometry();
    const leafPositions = new Float32Array(LEAF_COUNT * 3);
    const leafVelocities = new Float32Array(LEAF_COUNT * 3);
    const leafRotations = new Float32Array(LEAF_COUNT); // Spin cycle

    const spawnLeaf = (i: number, isInitial: boolean = false) => {
      const gridS = gridScaleRef.current;
      const bX = 12 * gridS;
      const bZ = 12 * gridS;
      const bY = 9 * gridS;

      const x = (Math.random() - 0.5) * bX * 2;
      const y = isInitial ? Math.random() * bY : bY;
      const z = (Math.random() - 0.5) * bZ * 2;

      leafPositions[i * 3] = x;
      leafPositions[i * 3 + 1] = y;
      leafPositions[i * 3 + 2] = z;

      // Base directions (blowing wind)
      leafVelocities[i * 3] = 0.2 + Math.random() * 0.4; // vx
      leafVelocities[i * 3 + 1] = -0.1 - Math.random() * 0.2; // vy (leaves fall slower than heavy dust)
      leafVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.4; // vz
      leafRotations[i] = Math.random() * Math.PI * 2;
    };

    for (let i = 0; i < LEAF_COUNT; i++) {
      spawnLeaf(i, true);
    }

    leafParticlesGeo.setAttribute("position", new THREE.BufferAttribute(leafPositions, 3));

    const leafParticleTex = createLeafTexture();
    const leafParticleMat = new THREE.PointsMaterial({
      color: 0x22c55e,
      size: 16,
      sizeAttenuation: false,
      map: leafParticleTex || undefined,
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
      blending: THREE.NormalBlending
    });

    const leafPoints = new THREE.Points(leafParticlesGeo, leafParticleMat);
    scene.add(leafPoints);

    // 9. Grid translation arrows (Red for X, Green for Y, Blue for Z)
    const gizmoGroup = new THREE.Group();
    scene.add(gizmoGroup);
    gizmoGroupRef.current = gizmoGroup;

    const xColor = 0xff3b30; // Red
    const yColor = 0x34c759; // Green
    const zColor = 0x007aff; // Blue
    const arrowLength = 1.4;
    const coneHeight = 0.38;
    const coneRadius = 0.12;

    const buildGizmoArrow = (direction: THREE.Vector3, color: number, name: string) => {
      const arrowGroup = new THREE.Group();
      arrowGroup.name = name;

      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, arrowLength - coneHeight, 8),
        new THREE.MeshBasicMaterial({ color, depthTest: false, transparent: true, opacity: 0.85 })
      );
      shaft.name = name;
      shaft.renderOrder = 999;
      
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(coneRadius, coneHeight, 16),
        new THREE.MeshBasicMaterial({ color, depthTest: false, transparent: true, opacity: 0.85 })
      );
      cone.name = name;
      cone.renderOrder = 999;

      if (direction.x !== 0) {
        arrowGroup.rotation.z = -Math.PI / 2;
        shaft.position.y = (arrowLength - coneHeight) / 2;
        cone.position.y = arrowLength - coneHeight / 2;
      } else if (direction.z !== 0) {
        arrowGroup.rotation.x = Math.PI / 2;
        shaft.position.y = (arrowLength - coneHeight) / 2;
        cone.position.y = arrowLength - coneHeight / 2;
      } else if (direction.y !== 0) {
        // Points vertically straight up by default
        shaft.position.y = (arrowLength - coneHeight) / 2;
        cone.position.y = arrowLength - coneHeight / 2;
      }

      arrowGroup.add(shaft);
      arrowGroup.add(cone);
      return arrowGroup;
    };

    const arrowX = buildGizmoArrow(new THREE.Vector3(1, 0, 0), xColor, "x");
    const arrowY = buildGizmoArrow(new THREE.Vector3(0, 1, 0), yColor, "y");
    const arrowZ = buildGizmoArrow(new THREE.Vector3(0, 0, 1), zColor, "z");
    gizmoGroup.add(arrowX, arrowY, arrowZ);

    let isDraggingGrid = false;
    let isDraggingGizmo = false;
    let activeGizmoAxis: "x" | "y" | "z" | null = null;
    let dragStartT = 0;

    const dragStartMouseGroundPos = new THREE.Vector3();
    const dragStartGridPos = new THREE.Vector3();

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Skew-line closest parameter helper to get beautiful, zero-jitter translation along arbitrary 3D axes
    const getAxisIntersectionParameter = (ray: THREE.Ray, axisOrigin: THREE.Vector3, axisDir: THREE.Vector3) => {
      const u = axisDir.clone().normalize();
      const d = ray.direction.clone().normalize();
      const o = ray.origin;
      const v = new THREE.Vector3().subVectors(o, axisOrigin);
      
      const b = u.dot(d);
      const denom = 1.0 - b * b;
      if (Math.abs(denom) < 1e-5) return 0;
      
      const d_val = u.dot(v);
      const e = d.dot(v);
      const t = (d_val - b * e) / denom;
      return t;
    };

    const getGroundIntersection = (mousePos: THREE.Vector2) => {
      raycaster.setFromCamera(mousePos, camera);
      const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const intersectionPoint = new THREE.Vector3();
      raycaster.ray.intersectPlane(groundPlane, intersectionPoint);
      return intersectionPoint;
    };

    // Project mouse coordinates to get snapped grid coordinates (using mathematically perfect flat plane intersection for pixel-perfect cursor alignment)
    const getGridTileIntersection = (mousePos: THREE.Vector2) => {
      raycaster.setFromCamera(mousePos, camera);
      
      const s = gridScaleRef.current;
      const posY = gridPosRef.current.y;
      const gridTopY = posY + 0.02 * s;
      
      const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -gridTopY);
      const intersectionPoint = new THREE.Vector3();
      const intersectsGround = raycaster.ray.intersectPlane(groundPlane, intersectionPoint);
      
      if (intersectsGround) {
        // Convert world intersection point to local grid coordinates
        const localX = (intersectionPoint.x - gridPosRef.current.x) / s;
        const localZ = (intersectionPoint.z - gridPosRef.current.z) / s;
        
        // Snapped grid cell indices
        const gridX = Math.round(localX + (gridResolutionRef.current - 1) / 2);
        const gridZ = Math.round(localZ + (gridResolutionRef.current - 1) / 2);
        
        // Check boundary safety
        if (gridX >= 0 && gridX < gridResolutionRef.current && gridZ >= 0 && gridZ < gridResolutionRef.current) {
          return { gridX, gridZ };
        }
      }
      return null;
    };

    // Apply a single tile paint/erase directly to Three.js overlays + ref (no React state during drag)
    const applyTilePaint = (gx: number, gz: number) => {
      const key = `${gx}_${gz}`;
      const mode = tilePaintModeRef.current;
      const isBlocked = blockedTilesRef.current.has(key);

      if (mode === "block" && !isBlocked) {
        const next = new Set(blockedTilesRef.current);
        next.add(key);
        blockedTilesRef.current = next;
        // Keep finish/start tiles walkable
        if (finishTilesRef.current.has(key)) setFinishTiles(prev => { const n = new Set(prev); n.delete(key); return n; });
        if (startTileRef.current === key) setStartTile(null);

        if (blockedOverlayGroupRef.current && blockedOverlayGeoRef.current) {
          const mat = new THREE.MeshBasicMaterial({
            color: 0xff3b30, transparent: true, opacity: 0.52,
            side: THREE.DoubleSide, depthWrite: false,
          });
          const mesh = new THREE.Mesh(blockedOverlayGeoRef.current, mat);
          mesh.rotation.x = -Math.PI / 2;
          mesh.renderOrder = 9;
          mesh.userData = { gridX: gx, gridZ: gz };
          blockedOverlayGroupRef.current.add(mesh);
        }
      } else if (mode === "unblock" && isBlocked) {
        const next = new Set(blockedTilesRef.current);
        next.delete(key);
        blockedTilesRef.current = next;

        if (blockedOverlayGroupRef.current) {
          const child = blockedOverlayGroupRef.current.children.find(
            m => m.userData.gridX === gx && m.userData.gridZ === gz
          );
          if (child) {
            const mat = (child as THREE.Mesh).material as THREE.Material;
            blockedOverlayGroupRef.current.remove(child);
            mat.dispose();
          }
        }
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return; // Left click only

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      if (activeTabRef.current === "grid") {
        // 1. Raycast check against 3D grid translation arrows first!
        if (gizmoGroupRef.current && gizmoGroupRef.current.visible && gridGroupRef.current) {
          const gizmoIntersects = raycaster.intersectObjects(gizmoGroupRef.current.children, true);
          if (gizmoIntersects.length > 0) {
            let rootObj = gizmoIntersects[0].object;
            while (rootObj.parent && rootObj.parent !== gizmoGroupRef.current) {
              rootObj = rootObj.parent;
            }
            const axis = rootObj.name as "x" | "y" | "z";
            if (axis === "x" || axis === "y" || axis === "z") {
              isDraggingGizmo = true;
              activeGizmoAxis = axis;
              dragStartMouseGroundPos.copy(getGroundIntersection(mouse));
              dragStartGridPos.copy(gridGroupRef.current.position);
              
              const axisDir = new THREE.Vector3(
                axis === "x" ? 1 : 0,
                axis === "y" ? 1 : 0,
                axis === "z" ? 1 : 0
              );
              dragStartT = getAxisIntersectionParameter(raycaster.ray, dragStartGridPos, axisDir);
              
              e.preventDefault();
              return;
            }
          }
        }

        // 2. Otherwise, direct grid panning dragging
        if (gridGroupRef.current) {
          isDraggingGrid = true;
          dragStartMouseGroundPos.copy(getGroundIntersection(mouse));
          dragStartGridPos.copy(gridGroupRef.current.position);
          e.preventDefault();
        }
      } else if (activeTabRef.current === "characters") {
        // Raycast check to SELECT a placed 3D character model inside independent characterGroup
        const charIntersects = raycaster.intersectObjects(characterGroup.children, true);

        if (charIntersects.length > 0) {
          let hitObj: THREE.Object3D | null = charIntersects[0].object;
          while (hitObj && !hitObj.userData.charId) {
            hitObj = hitObj.parent;
          }
          if (hitObj) {
            const charId = hitObj.userData.charId;
            setSelectedCharId(charId);
            setSelectedMascot(null); // Clear placement mode
            
            // Enable drag-moving the character directly snapped to grid!
            isDraggingCharRef.current = true;
            return;
          }
        }

        // Raycast check against grid tiles to place mascot or select/move a tile (using flat plane intersection for perfect alignment)
        const tile = getGridTileIntersection(mouse);
        if (tile) {
          const { gridX, gridZ } = tile;
          if (selectedMascotRef.current) {
            const mascotId = selectedMascotRef.current;
            setPlacedCharacters(prev => {
              if (placedCharactersRef.current.some(c => c.gridX === gridX && c.gridZ === gridZ)) return prev;
              return [...prev, {
                id: `${Date.now()}_${Math.random()}`,
                mascotId,
                gridX,
                gridZ,
                offsetX: 0.0,
                offsetY: 0.0,
                offsetZ: 0.0,
                scaleX: 1.0,
                scaleY: 1.0,
                scaleZ: 1.0,
                rotationY: 0.0,
                activeAnimName: "",
              }];
            });
            setSelectedMascot(null);
          } else if (selectedCharIdRef.current) {
            // Clicked empty tile while character is selected: move character directly to this tile!
            const charId = selectedCharIdRef.current;
            setPlacedCharacters(prev => {
              if (placedCharactersRef.current.some(c => c.id !== charId && c.gridX === gridX && c.gridZ === gridZ)) return prev;
              return prev.map(c => {
                if (c.id === charId) {
                  return { ...c, gridX, gridZ, offsetX: 0.0, offsetY: 0.0, offsetZ: 0.0 };
                }
                return c;
              });
            });
          } else {
            // Clicked empty grid tile in character mode with no selection: deselect character
            setSelectedCharId(null);
          }
        } else {
          // Clicked background in character mode: deselect character
          setSelectedCharId(null);
        }
      } else if (activeTabRef.current === "tiles") {
        const tile = getGridTileIntersection(mouse);
        if (tile) {
          const key = `${tile.gridX}_${tile.gridZ}`;
          if (tileEditModeRef.current === "finish") {
            if (!blockedTilesRef.current.has(key)) {
              setFinishTiles(prev => {
                const n = new Set(prev);
                if (n.has(key)) n.delete(key); else n.add(key);
                return n;
              });
            }
            e.preventDefault();
            return;
          }
          if (tileEditModeRef.current === "start") {
            if (!blockedTilesRef.current.has(key)) {
              setStartTile(prev => prev === key ? null : key);
            }
            e.preventDefault();
            return;
          }
          // paint mode
          tilePaintModeRef.current = blockedTilesRef.current.has(key) ? "unblock" : "block";
          isDraggingTilesRef.current = true;
          lastPaintedTileKeyRef.current = key;
          applyTilePaint(tile.gridX, tile.gridZ);
          e.preventDefault();
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // 0. Tile drag-paint (runs on every move while LMB held in tiles mode)
      if (isDraggingTilesRef.current && activeTabRef.current === "tiles") {
        const tile = getGridTileIntersection(mouse);
        if (tile) {
          const key = `${tile.gridX}_${tile.gridZ}`;
          if (key !== lastPaintedTileKeyRef.current) {
            lastPaintedTileKeyRef.current = key;
            applyTilePaint(tile.gridX, tile.gridZ);
          }
        }
        // Update cursor while painting
        renderer.domElement.style.cursor = tilePaintModeRef.current === "block" ? "cell" : "crosshair";
        return;
      }

      // 1. Direct snapped character drag movement (using fast direct-mesh updates for lag-free fluid dragging)
      if (isDraggingCharRef.current && selectedCharIdRef.current) {
        const tile = getGridTileIntersection(mouse);
        if (tile) {
          // Update the Ref instantly to ensure the render loop coordinates are correct
          const dragId = selectedCharIdRef.current;
          const tileOccupied = placedCharactersRef.current.some(
            c => c.id !== dragId && c.gridX === tile.gridX && c.gridZ === tile.gridZ
          );
          if (tileOccupied) return;
          placedCharactersRef.current = placedCharactersRef.current.map(c => {
            if (c.id === dragId) {
              return {
                ...c,
                gridX: tile.gridX,
                gridZ: tile.gridZ,
                offsetX: 0.0,
                offsetY: 0.0,
                offsetZ: 0.0
              };
            }
            return c;
          });

          // Move the 3D wrapper directly in the viewport for instant fluid feedback
          if (characterGroupRef.current) {
            const wrapper = characterGroupRef.current.getObjectByName(`char_${selectedCharIdRef.current}`);
            if (wrapper) {
              const TILE_SPACING = 1.0;
              const tileWorldX = (tile.gridX - (gridResolutionRef.current - 1) / 2) * TILE_SPACING;
              const tileWorldZ = (tile.gridZ - (gridResolutionRef.current - 1) / 2) * TILE_SPACING;

              const s = gridScaleRef.current;
              const posX = gridPosRef.current.x + tileWorldX * s;
              const posY = gridPosRef.current.y;
              const posZ = gridPosRef.current.z + tileWorldZ * s;

              wrapper.position.set(posX, posY, posZ);
            }
          }

          // Move the glowing selection ring directly in the viewport to match the dragging character in real-time
          if (selectionRingRef.current) {
            const TILE_SPACING = 1.0;
            const worldX = (tile.gridX - (gridResolutionRef.current - 1) / 2) * TILE_SPACING;
            const worldZ = (tile.gridZ - (gridResolutionRef.current - 1) / 2) * TILE_SPACING;
            
            const s = gridScaleRef.current;
            const posX = gridPosRef.current.x + worldX * s;
            const posY = gridPosRef.current.y;
            const posZ = gridPosRef.current.z + worldZ * s;
            
            selectionRingRef.current.position.set(posX, posY + 0.02 * s + 0.008, posZ);
            selectionRingRef.current.visible = true;
          }
        }
        return;
      }

      // 2. Grid translation gizmo axis drag movement
      if (isDraggingGizmo && activeGizmoAxis) {
        const axisDir = new THREE.Vector3(
          activeGizmoAxis === "x" ? 1 : 0,
          activeGizmoAxis === "y" ? 1 : 0,
          activeGizmoAxis === "z" ? 1 : 0
        );
        raycaster.setFromCamera(mouse, camera);
        const currentT = getAxisIntersectionParameter(raycaster.ray, dragStartGridPos, axisDir);
        const deltaT = currentT - dragStartT;
        
        const nextPos = {
          x: parseFloat((dragStartGridPos.x + (activeGizmoAxis === "x" ? deltaT : 0)).toFixed(2)),
          y: parseFloat((dragStartGridPos.y + (activeGizmoAxis === "y" ? deltaT : 0)).toFixed(2)),
          z: parseFloat((dragStartGridPos.z + (activeGizmoAxis === "z" ? deltaT : 0)).toFixed(2))
        };
        gridPosRef.current = nextPos;
        if (gridGroupRef.current) {
          gridGroupRef.current.position.set(nextPos.x, nextPos.y, nextPos.z);
        }
        if (gizmoGroupRef.current) {
          const s = gridScaleRef.current;
          gizmoGroupRef.current.position.set(nextPos.x, nextPos.y + 0.02 * s + 0.01, nextPos.z);
        }
        
        // Sync character wrapper positions in viewport instantly to stay snapped
        if (characterGroupRef.current) {
          characterGroupRef.current.children.forEach(wrapper => {
            const charId = wrapper.userData.charId;
            const gridX = wrapper.userData.gridX;
            const gridZ = wrapper.userData.gridZ;
            if (charId !== undefined && gridX !== undefined && gridZ !== undefined) {
              const TILE_SPACING = 1.0;
              const tileWorldX = (gridX - (gridResolutionRef.current - 1) / 2) * TILE_SPACING;
              const tileWorldZ = (gridZ - (gridResolutionRef.current - 1) / 2) * TILE_SPACING;

              const s = gridScaleRef.current;
              const posX = nextPos.x + tileWorldX * s;
              const posY = nextPos.y;
              const posZ = nextPos.z + tileWorldZ * s;
              wrapper.position.set(posX, posY, posZ);
            }
          });
        }
        if (selectionRingRef.current && selectedCharIdRef.current) {
          const selectedWrapper = characterGroupRef.current?.getObjectByName(`char_${selectedCharIdRef.current}`);
          if (selectedWrapper) {
            const s = gridScaleRef.current;
            selectionRingRef.current.position.set(
              selectedWrapper.position.x,
              selectedWrapper.position.y + 0.02 * s + 0.008,
              selectedWrapper.position.z
            );
          }
        }
        return;
      }

      // 3. Direct grid panning dragging
      if (isDraggingGrid && activeTabRef.current === "grid") {
        const currentMouseGroundPos = getGroundIntersection(mouse);
        const delta = new THREE.Vector3().subVectors(currentMouseGroundPos, dragStartMouseGroundPos);
        
        const nextPos = {
          x: parseFloat((dragStartGridPos.x + delta.x).toFixed(2)),
          y: dragStartGridPos.y,
          z: parseFloat((dragStartGridPos.z + delta.z).toFixed(2))
        };
        gridPosRef.current = nextPos;
        if (gridGroupRef.current) {
          gridGroupRef.current.position.set(nextPos.x, nextPos.y, nextPos.z);
        }
        if (gizmoGroupRef.current) {
          const s = gridScaleRef.current;
          gizmoGroupRef.current.position.set(nextPos.x, nextPos.y + 0.02 * s + 0.01, nextPos.z);
        }

        // Sync character wrapper positions in viewport instantly to stay snapped
        if (characterGroupRef.current) {
          characterGroupRef.current.children.forEach(wrapper => {
            const charId = wrapper.userData.charId;
            const gridX = wrapper.userData.gridX;
            const gridZ = wrapper.userData.gridZ;
            if (charId !== undefined && gridX !== undefined && gridZ !== undefined) {
              const TILE_SPACING = 1.0;
              const tileWorldX = (gridX - (gridResolutionRef.current - 1) / 2) * TILE_SPACING;
              const tileWorldZ = (gridZ - (gridResolutionRef.current - 1) / 2) * TILE_SPACING;

              const s = gridScaleRef.current;
              const posX = nextPos.x + tileWorldX * s;
              const posY = nextPos.y;
              const posZ = nextPos.z + tileWorldZ * s;
              wrapper.position.set(posX, posY, posZ);
            }
          });
        }
        if (selectionRingRef.current && selectedCharIdRef.current) {
          const selectedWrapper = characterGroupRef.current?.getObjectByName(`char_${selectedCharIdRef.current}`);
          if (selectedWrapper) {
            const s = gridScaleRef.current;
            selectionRingRef.current.position.set(
              selectedWrapper.position.x,
              selectedWrapper.position.y + 0.02 * s + 0.008,
              selectedWrapper.position.z
            );
          }
        }
        return;
      }

      // 4. Hover detection for pointer cursor and grid tile/gizmo highlighting
      let hoveredGizmoAxis: "x" | "y" | "z" | null = null;
      if (activeTabRef.current === "grid" && gizmoGroupRef.current && gizmoGroupRef.current.visible) {
        raycaster.setFromCamera(mouse, camera);
        const gizmoIntersects = raycaster.intersectObjects(gizmoGroupRef.current.children, true);
        if (gizmoIntersects.length > 0) {
          let rootObj = gizmoIntersects[0].object;
          while (rootObj.parent && rootObj.parent !== gizmoGroupRef.current) {
            rootObj = rootObj.parent;
          }
          hoveredGizmoAxis = rootObj.name as "x" | "y" | "z";
        }
      }

      // Update gizmo hover colors
      if (gizmoGroupRef.current) {
        ["x", "y", "z"].forEach(axis => {
          const arrow = gizmoGroupRef.current!.getObjectByName(axis) as THREE.Group;
          if (arrow) {
            const isHovered = hoveredGizmoAxis === axis;
            const origColor = axis === "x" ? xColor : axis === "y" ? yColor : zColor;
            const hoverColor = axis === "x" ? 0xff7b72 : axis === "y" ? 0x7ef09a : 0x60a5fa;
            arrow.children.forEach(c => {
              const mat = (c as THREE.Mesh).material as THREE.MeshBasicMaterial;
              mat.opacity = isHovered ? 1.0 : 0.85;
              mat.color.setHex(isHovered ? hoverColor : origColor);
            });
          }
        });
      }

      if (hoveredGizmoAxis) {
        renderer.domElement.style.cursor = "pointer";
        if (hoverTileRef.current) {
          hoverTileRef.current.visible = false;
        }
        return;
      }

      const hoverTile = getGridTileIntersection(mouse);
      if (hoverTile) {
        renderer.domElement.style.cursor = "pointer";
        if (hoverTileRef.current) {
          const TILE_SPACING = 1.0;
          const worldX = (hoverTile.gridX - (gridResolutionRef.current - 1) / 2) * TILE_SPACING;
          const worldZ = (hoverTile.gridZ - (gridResolutionRef.current - 1) / 2) * TILE_SPACING;
          
          const s = gridScaleRef.current;
          const posX = gridPosRef.current.x + worldX * s;
          const posY = gridPosRef.current.y;
          const posZ = gridPosRef.current.z + worldZ * s;
          
          // Position hover highlight precisely floating 0.005 units above the scaled tile top surface
          hoverTileRef.current.position.set(posX, posY + 0.02 * s + 0.005, posZ);
          hoverTileRef.current.scale.set(s, s, 1.0);
          hoverTileRef.current.visible = true;
        }
      } else {
        renderer.domElement.style.cursor = "default";
        if (hoverTileRef.current) {
          hoverTileRef.current.visible = false;
        }
      }
    };

    const handleMouseUp = () => {
      if ((isDraggingGrid || isDraggingGizmo) && activeTabRef.current === "grid") {
        setGridPos({ ...gridPosRef.current });
      }
      if (isDraggingCharRef.current && selectedCharIdRef.current) {
        setPlacedCharacters([...placedCharactersRef.current]);
      }
      if (isDraggingTilesRef.current) {
        // Sync final painted set to React state (triggers sidebar count update, etc.)
        setBlockedTiles(new Set(blockedTilesRef.current));
        isDraggingTilesRef.current = false;
        lastPaintedTileKeyRef.current = "";
      }
      isDraggingGrid = false;
      isDraggingGizmo = false;
      isDraggingCharRef.current = false;
      activeGizmoAxis = null;
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const domElement = renderer.domElement;
    domElement.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    domElement.addEventListener("contextmenu", handleContextMenu);

    // WASD keyboard movement handler
    const handleKeyDown = (e: KeyboardEvent) => {
      const liveActive = isLiveModeRef.current;
      if (liveActive) {
        if (hasWonRef.current) return;
      } else {
        if (activeTabRef.current !== "characters") return;
      }

      const key = e.key.toLowerCase();
      if (!["w", "a", "s", "d"].includes(key)) return;

      e.preventDefault();

      if (wasdCooldownRef.current) return;
      wasdCooldownRef.current = true;
      setTimeout(() => { wasdCooldownRef.current = false; }, 150);

      const charId = liveActive ? playerCharIdRef.current : selectedCharIdRef.current;
      if (!charId) return;

      // A / D — rotate in place + trigger squash-and-stretch
      if (key === "a" || key === "d") {
        const rotDelta = key === "a" ? Math.PI / 2 : -Math.PI / 2;
        turnSquishRef.current[charId] = performance.now();

        const currentChar = placedCharactersRef.current.find(c => c.id === charId);
        playRotateSound(isMutedRef.current, currentChar?.scaleX ?? 1.0);

        setPlacedCharacters(prev => prev.map(c => {
          if (c.id !== charId) return c;
          const newRot = (c.rotationY ?? 0) + rotDelta;
          placedCharactersRef.current = placedCharactersRef.current.map(rc =>
            rc.id === charId ? { ...rc, rotationY: newRot } : rc
          );
          return { ...c, rotationY: newRot };
        }));
        return;
      }

      // W / S — move forward / backward based on current facing direction
      const resolution = gridResolutionRef.current;
      const currentChar = placedCharactersRef.current.find(c => c.id === charId);
      if (!currentChar) return;

      const rotY = currentChar.rotationY ?? 0;
      const fwdDx = Math.round(Math.sin(rotY));
      const fwdDz = Math.round(Math.cos(rotY));
      const moveDx = key === "w" ? fwdDx : -fwdDx;
      const moveDz = key === "w" ? fwdDz : -fwdDz;

      // Pre-check success so we can trigger effects outside the setter callback.
      const targetX = Math.max(0, Math.min(resolution - 1, currentChar.gridX + moveDx));
      const targetZ = Math.max(0, Math.min(resolution - 1, currentChar.gridZ + moveDz));
      const blocked = (targetX === currentChar.gridX && targetZ === currentChar.gridZ && (moveDx !== 0 || moveDz !== 0))
                    || blockedTilesRef.current.has(`${targetX}_${targetZ}`)
                    || placedCharactersRef.current.some(c => c.id !== charId && c.gridX === targetX && c.gridZ === targetZ);

      setPlacedCharacters(prev => prev.map(c => {
        if (c.id !== charId) return c;
        const nX = Math.max(0, Math.min(resolution - 1, c.gridX + moveDx));
        const nZ = Math.max(0, Math.min(resolution - 1, c.gridZ + moveDz));
        const hitWall    = nX === c.gridX && nZ === c.gridZ && (moveDx !== 0 || moveDz !== 0);
        const hitBlocked = blockedTilesRef.current.has(`${nX}_${nZ}`)
                        || placedCharactersRef.current.some(other => other.id !== charId && other.gridX === nX && other.gridZ === nZ);
        if (hitBlocked || hitWall) {
          bumpAnimRef.current = { charId, startTime: performance.now(), dx: moveDx, dz: moveDz };
          playCollideSound(isMutedRef.current, c.scaleX ?? 1.0);
          return c;
        }
        placedCharactersRef.current = placedCharactersRef.current.map(rc =>
          rc.id === charId ? { ...rc, gridX: nX, gridZ: nZ } : rc
        );
        return { ...c, gridX: nX, gridZ: nZ };
      }));

      if (!blocked) {
        // Win condition check in live mode
        if (liveActive && finishTilesRef.current.has(`${targetX}_${targetZ}`)) {
          setHasWon(true);
        }

        // Step hop effect
        hopAnimRef.current[charId] = performance.now();
        playFootstepSound(isMutedRef.current, currentChar?.scaleX ?? 1.0);

        // Auto-play walk anim while moving; return to saved clip after 400 ms of inactivity.
        const charActions = animActionsRef.current[charId];
        if (charActions) {
          const WALK_CLIPS = ["walk", "run"];
          const walkClip = WALK_CLIPS.find(n => charActions[n]);
          if (walkClip) {
            // Increment step counter and pick foot
            stepCountRef.current[charId] = (stepCountRef.current[charId] ?? 0) + 1;
            const isRightFoot = stepCountRef.current[charId] % 2 === 0;

            // Prefer directional step clips if available, then fall back to walk/run
            const rightClip = ["kick-right", "step-right"].find(n => charActions[n]);
            const leftClip  = ["kick-left",  "step-left" ].find(n => charActions[n]);
            let targetClip = walkClip;
            if (rightClip && leftClip) {
              targetClip = isRightFoot ? rightClip : leftClip;
            } else if (rightClip) {
              targetClip = rightClip;
            }

            // Fade out previous clip
            const cur = activeAnimNameRef.current[charId];
            if (cur === "idle" && charActions["static"]) charActions["static"].fadeOut(0.12);
            if (cur && charActions[cur] && cur !== targetClip) charActions[cur].fadeOut(0.08);

            // Reset from frame 0 each step so animation syncs with tile movement
            charActions[targetClip].setEffectiveWeight(1).reset().fadeIn(0.05).play();
            activeAnimNameRef.current[charId] = targetClip;
          }
          clearTimeout(walkTimerRef.current[charId]);
          walkTimerRef.current[charId] = setTimeout(() => {
            // Fade back to the character's saved clip (or idle).
            const returnClip = placedCharactersRef.current.find(c => c.id === charId)?.activeAnimName || "idle";
            const cur2 = activeAnimNameRef.current[charId];
            if (!charActions || cur2 === returnClip) return;
            if (cur2 && charActions[cur2]) charActions[cur2].fadeOut(0.25);
            if (returnClip === "idle" && charActions["static"]) {
              const blend = idleBlendRef.current[charId] ?? 0.15;
              charActions["static"].setEffectiveWeight(1 - blend).reset().fadeIn(0.25).play();
              if (charActions["idle"]) charActions["idle"].setEffectiveWeight(blend).reset().fadeIn(0.25).play();
              activeAnimNameRef.current[charId] = "idle";
            } else if (charActions[returnClip]) {
              charActions[returnClip].setEffectiveWeight(1).reset().fadeIn(0.25).play();
              activeAnimNameRef.current[charId] = returnClip;
            }
          }, 400);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    let lastTime = performance.now();
    let animFrameId: number;
    let lastOrbitRad = -999;
    let lastGridX = -999, lastGridY = -999, lastGridZ = -999;
    let lastAmbient = -1, lastRim = -1, lastSun = -1, lastSunAz = -1, lastSunEl = -1;
    const render = () => {
      animFrameId = requestAnimationFrame(render);

      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      // ── Dirty check: skip renderer.render() when scene is truly idle ──
      const hasMixers = Object.keys(mixersRef.current).length > 0;
      const hasWeather = weatherEffectRef.current !== "none";
      const hasHop = Object.values(hopAnimRef.current).some(t => now - t < 350);
      const hasBump = bumpAnimRef.current !== null;
      const hasSquish = Object.values(turnSquishRef.current).some(t => now - t < 400);
      const hasPulse = outlineMatsRef.current.length > 0;
      const forceOnce = forceRenderRef.current;
      if (forceOnce) forceRenderRef.current = false;
      const needsRender = hasMixers || hasWeather || hasHop || hasBump || hasSquish || hasPulse || isDraggingCharRef.current || forceOnce || isLiveModeRef.current;

      // Update mixers only when active
      if (hasMixers) Object.values(mixersRef.current).forEach(mixer => mixer.update(delta));

      // Camera orbit — recompute only when angle changes
      const orbitRad = (cameraOrbitDegRef.current * Math.PI) / 180;
      if (orbitRad !== lastOrbitRad) {
        const XZ_RADIUS = 12 * Math.SQRT2;
        cameraRef.current!.position.set(XZ_RADIUS * Math.cos(orbitRad), 12, XZ_RADIUS * Math.sin(orbitRad));
        cameraRef.current!.lookAt(0, 0, 0);
        lastOrbitRad = orbitRad;
      }

      // Lighting — update only when values change
      const ai = ambientIntensityRef.current, ri = rimIntensityRef.current;
      const si = sunIntensityRef.current, saz = sunAzimuthRef.current, sel = sunElevationRef.current;
      if (ambientLightRef.current && ai !== lastAmbient) { ambientLightRef.current.intensity = ai; lastAmbient = ai; }
      if (rimLightRef.current && ri !== lastRim) { rimLightRef.current.intensity = ri; lastRim = ri; }
      if (directionalLightRef.current && (si !== lastSun || saz !== lastSunAz || sel !== lastSunEl)) {
        directionalLightRef.current.intensity = si;
        const az = (saz * Math.PI) / 180, el = (sel * Math.PI) / 180, r = 20;
        directionalLightRef.current.position.set(r * Math.cos(el) * Math.cos(az), r * Math.sin(el), r * Math.cos(el) * Math.sin(az));
        lastSun = si; lastSunAz = saz; lastSunEl = sel;
      }

      // Camera zoom
      if (cameraRef.current && cameraRef.current.zoom !== zoomRef.current) {
        cameraRef.current.zoom = zoomRef.current;
        cameraRef.current.updateProjectionMatrix();
      }

      // Grid position — update only when changed
      const gx = gridPosRef.current.x, gy = gridPosRef.current.y, gz = gridPosRef.current.z;
      if (gx !== lastGridX || gy !== lastGridY || gz !== lastGridZ) {
        gridGroup.position.set(gx, gy, gz);
        lastGridX = gx; lastGridY = gy; lastGridZ = gz;
      }

      // Update Character Positions dynamically in the render loop based on parent Grid's translated coordinates
      if (characterGroupRef.current) {
        characterGroupRef.current.children.forEach((wrapper) => {
          const charId = wrapper.userData.charId;
          const char = placedCharactersRef.current.find(c => c.id === charId);
          if (char) {
            const TILE_SPACING = 1.0;
            const s = gridScaleRef.current;
            const posY = gridPosRef.current.y;
            const targetTileX = char.gridX;
            const targetTileZ = char.gridZ;
            const targetRotY  = char.rotationY ?? 0;

            // ── Smooth glide: lerp fractional tile position + rotation each frame ──
            let sm = smoothTransformRef.current[charId];
            if (!sm) {
              sm = { tileX: targetTileX, tileZ: targetTileZ, rotY: targetRotY };
              smoothTransformRef.current[charId] = sm;
            }
            const tPos = Math.min(1, delta / 0.12); // ~120 ms convergence
            const tRot = Math.min(1, delta / 0.09); // ~90 ms convergence
            sm.tileX += (targetTileX - sm.tileX) * tPos;
            sm.tileZ += (targetTileZ - sm.tileZ) * tPos;
            // Shortest-path angle interpolation
            let da = ((targetRotY - sm.rotY) % (Math.PI * 2));
            if (da >  Math.PI) da -= Math.PI * 2;
            if (da < -Math.PI) da += Math.PI * 2;
            sm.rotY += da * tRot;

            const smWorldX = (sm.tileX - (gridResolutionRef.current - 1) / 2) * TILE_SPACING;
            const smWorldZ = (sm.tileZ - (gridResolutionRef.current - 1) / 2) * TILE_SPACING;
            const posX = gridPosRef.current.x + smWorldX * s;
            const posZ = gridPosRef.current.z + smWorldZ * s;

            // ── Step hop: brief Y arc on each successful move ──
            const hopStart = hopAnimRef.current[charId] ?? 0;
            const HOP_DUR  = 0.18;
            const hopElapsed = hopStart > 0 ? (now - hopStart) / 1000 : 1;
            const hopY = hopElapsed < HOP_DUR ? Math.sin((hopElapsed / HOP_DUR) * Math.PI) * 0.13 * s : 0;

            // ── Bump (wall-collision nudge) ──
            let bumpOffsetX = 0, bumpOffsetZ = 0;
            const bump = bumpAnimRef.current;
            if (bump && bump.charId === charId) {
              const elapsed = (now - bump.startTime) / 1000;
              const duration = 0.28;
              if (elapsed < duration) {
                const t = elapsed / duration;
                const amount = 0.18 * s * Math.sin(t * Math.PI) * (1 - t * 0.5);
                bumpOffsetX = bump.dx * amount;
                bumpOffsetZ = bump.dz * amount;
              } else {
                bumpAnimRef.current = null;
              }
            }

            wrapper.position.set(posX + bumpOffsetX, posY + hopY, posZ + bumpOffsetZ);

            // ── Turn squish: squash-and-stretch on A / D ──
            const squishStart = turnSquishRef.current[charId] ?? 0;
            const SQUISH_DUR  = 0.22;
            const squishElapsed = squishStart > 0 ? (now - squishStart) / 1000 : 1;
            let sX = 1, sY = 1;
            if (squishElapsed < SQUISH_DUR) {
              const amount = Math.sin(squishElapsed / SQUISH_DUR * Math.PI) * 0.14;
              sX = 1 + amount * 0.7; // widen slightly
              sY = 1 - amount;       // squash height
            }
            wrapper.scale.set(char.scaleX * s * sX, char.scaleY * s * sY, char.scaleZ * s * sX);

            // ── Forward lean while gliding between tiles ──
            const isGliding = Math.abs(sm.tileX - targetTileX) > 0.02 || Math.abs(sm.tileZ - targetTileZ) > 0.02;
            wrapper.rotation.y = sm.rotY;
            wrapper.rotation.x = isGliding ? -0.07 : 0;
            wrapper.rotation.z = 0;
          }
        });
      }

      // Update blocked tile overlay positions to follow grid drag/scale
      if (blockedOverlayGroupRef.current) {
        blockedOverlayGroupRef.current.children.forEach(obj => {
          const mesh = obj as THREE.Mesh;
          const { gridX, gridZ } = mesh.userData;
          const TILE_SPACING = 1.0;
          const worldX = (gridX - (gridResolutionRef.current - 1) / 2) * TILE_SPACING;
          const worldZ = (gridZ - (gridResolutionRef.current - 1) / 2) * TILE_SPACING;
          const s = gridScaleRef.current;
          mesh.position.set(
            gridPosRef.current.x + worldX * s,
            gridPosRef.current.y + 0.02 * s + 0.006,
            gridPosRef.current.z + worldZ * s
          );
          mesh.scale.set(s, s, 1);
        });
      }

      // Update start tile overlay position and pulse
      if (startOverlayRef.current) {
        const startKey = startTileRef.current;
        if (startKey) {
          const [sgx, sgz] = startKey.split("_").map(Number);
          const TILE_SPACING = 1.0;
          const s = gridScaleRef.current;
          const swX = (sgx - (gridResolutionRef.current - 1) / 2) * TILE_SPACING;
          const swZ = (sgz - (gridResolutionRef.current - 1) / 2) * TILE_SPACING;
          startOverlayRef.current.position.set(
            gridPosRef.current.x + swX * s,
            gridPosRef.current.y + 0.02 * s + 0.007,
            gridPosRef.current.z + swZ * s
          );
          startOverlayRef.current.scale.set(s, s, 1);
          (startOverlayRef.current.material as THREE.MeshBasicMaterial).opacity = 0.45 + 0.2 * Math.sin(now * 0.003);
          startOverlayRef.current.visible = !isLiveModeRef.current;
        } else {
          startOverlayRef.current.visible = false;
        }
      }

      // Update finish tile overlays position and pulse
      if (finishOverlayGroupRef.current) {
        const TILE_SPACING = 1.0;
        const s = gridScaleRef.current;
        const fPulse = 0.5 + 0.2 * Math.sin(now * 0.004);
        finishOverlayGroupRef.current.children.forEach(obj => {
          const mesh = obj as THREE.Mesh;
          const { gridX: fgx, gridZ: fgz } = mesh.userData;
          const fwX = (fgx - (gridResolutionRef.current - 1) / 2) * TILE_SPACING;
          const fwZ = (fgz - (gridResolutionRef.current - 1) / 2) * TILE_SPACING;
          mesh.position.set(
            gridPosRef.current.x + fwX * s,
            gridPosRef.current.y + 0.02 * s + 0.008,
            gridPosRef.current.z + fwZ * s
          );
          mesh.scale.set(s, s, 1);
          (mesh.material as THREE.MeshBasicMaterial).opacity = fPulse;
        });
      }

      // Update player marker — floating cone above player character
      if (playerMarkerRef.current) {
        const pid = playerCharIdRef.current;
        const pChar = pid ? placedCharactersRef.current.find(c => c.id === pid) : null;
        if (pChar) {
          const TILE_SPACING = 1.0;
          const s = gridScaleRef.current;
          const sm = smoothTransformRef.current[pChar.id];
          const ptileX = sm ? sm.tileX : pChar.gridX;
          const ptileZ = sm ? sm.tileZ : pChar.gridZ;
          const pmwX = (ptileX - (gridResolutionRef.current - 1) / 2) * TILE_SPACING;
          const pmwZ = (ptileZ - (gridResolutionRef.current - 1) / 2) * TILE_SPACING;
          const bob = Math.sin(now * 0.004) * 0.06 * s;
          playerMarkerRef.current.position.set(
            gridPosRef.current.x + pmwX * s,
            gridPosRef.current.y + 0.9 * s + bob,
            gridPosRef.current.z + pmwZ * s
          );
          playerMarkerRef.current.rotation.y = now * 0.0015;
          playerMarkerRef.current.scale.setScalar(s);
          playerMarkerRef.current.visible = !isLiveModeRef.current;
        } else {
          playerMarkerRef.current.visible = false;
        }
      }

      // Update glowing selection ring position and scale dynamically
      if (selectionRingRef.current) {
        if (activeTabRef.current === "characters" && selectedCharIdRef.current) {
          const char = placedCharactersRef.current.find(c => c.id === selectedCharIdRef.current);
          if (char) {
            const TILE_SPACING = 1.0;
            const worldX = (char.gridX - (gridResolutionRef.current - 1) / 2) * TILE_SPACING;
            const worldZ = (char.gridZ - (gridResolutionRef.current - 1) / 2) * TILE_SPACING;
            
            const s = gridScaleRef.current;
            const posX = gridPosRef.current.x + worldX * s;
            const posY = gridPosRef.current.y;
            const posZ = gridPosRef.current.z + worldZ * s;
            
            // Position selection ring precisely floating 0.008 units above the scaled tile top surface (above hoverTile)
            selectionRingRef.current.position.set(posX, posY + 0.02 * s + 0.008, posZ);
            selectionRingRef.current.scale.set(char.scaleX * s * 1.3, char.scaleZ * s * 1.3, 1.0);
            selectionRingRef.current.visible = true;
          } else {
            selectionRingRef.current.visible = false;
          }
        } else {
          selectionRingRef.current.visible = false;
        }
      }

      // Animate selection outline pulse (opacity + color brightness)
      if (outlineMatsRef.current.length > 0) {
        const glowPulse = 0.75 + 0.25 * Math.sin(now * 0.004);
        outlineMatsRef.current.forEach(m => { m.opacity = glowPulse; });
      }

      // Update selection glow disc — pulsing aura under the selected character
      if (selectionGlowRef.current) {
        if (activeTabRef.current === "characters" && selectedCharIdRef.current) {
          const char = placedCharactersRef.current.find(c => c.id === selectedCharIdRef.current);
          if (char) {
            const TILE_SPACING = 1.0;
            const worldX = (char.gridX - (gridResolutionRef.current - 1) / 2) * TILE_SPACING;
            const worldZ = (char.gridZ - (gridResolutionRef.current - 1) / 2) * TILE_SPACING;
            const s = gridScaleRef.current;
            const posX = gridPosRef.current.x + worldX * s;
            const posY = gridPosRef.current.y;
            const posZ = gridPosRef.current.z + worldZ * s;
            // Float just above tile surface (tile top = posY + 0.02*s)
            selectionGlowRef.current.position.set(posX, posY + 0.02 * s + 0.003, posZ);
            // Breathing pulse — scale and opacity oscillate together
            const pulse = 1.0 + 0.10 * Math.sin(now * 0.003);
            selectionGlowRef.current.scale.set(char.scaleX * s * 1.3 * pulse, char.scaleZ * s * 1.3 * pulse, 1.0);
            const mat = selectionGlowRef.current.material as THREE.MeshBasicMaterial;
            mat.opacity = 0.35 + 0.10 * Math.sin(now * 0.003);
            selectionGlowRef.current.visible = true;
          } else {
            selectionGlowRef.current.visible = false;
          }
        } else {
          selectionGlowRef.current.visible = false;
        }
      }

      // Update Grid translation gizmo position, scale, and visibility dynamically
      if (gizmoGroupRef.current) {
        if (activeTabRef.current === "grid" && !isLiveModeRef.current) {
          const s = gridScaleRef.current;
          gizmoGroupRef.current.position.set(
            gridPosRef.current.x,
            gridPosRef.current.y + 0.02 * s + 0.01,
            gridPosRef.current.z
          );
          const gizmoScale = Math.max(0.6, Math.min(1.5, s));
          gizmoGroupRef.current.scale.set(gizmoScale, gizmoScale, gizmoScale);
          gizmoGroupRef.current.visible = gridVisibleRef.current;
        } else {
          gizmoGroupRef.current.visible = false;
        }
      }

      // ── Weather & Leaf Particle Systems Animation ──
      const curEffect = weatherEffectRef.current;
      const curSpeed = weatherSpeedRef.current;
      const curDensity = weatherDensityRef.current;
      const curOpacity = weatherOpacityRef.current;

      if (curEffect === "none") {
        weatherPoints.visible = false;
        leafPoints.visible = false;
      } else {
        weatherPoints.visible = true;
        leafPoints.visible = true;

        // ── 1. Update Dust Particles ──
        let baseColor = 0xffffff;
        let pSize = 0.06;
        let horizontalWind = 0;
        let verticalSpeed = -1.0;
        let swayAmount = 0.15;

        if (curEffect === "gentle") {
          baseColor = 0xffffff;
          pSize = 0.05;
          horizontalWind = 0.8;
          verticalSpeed = -0.5;
          swayAmount = 0.1;
        } else if (curEffect === "windy") {
          baseColor = 0xebd3a0;
          pSize = 0.07;
          horizontalWind = 2.5;
          verticalSpeed = -0.8;
          swayAmount = 0.25;
        } else if (curEffect === "dreamy") {
          const hue = (now * 0.01) % 360;
          weatherParticleMat.color.setHSL(hue / 360, 0.8, 0.8);
          pSize = 0.08;
          horizontalWind = 0.2;
          verticalSpeed = 0.7;
          swayAmount = 0.4;
        } else if (curEffect === "storm") {
          baseColor = 0x8fa4b3;
          pSize = 0.09;
          horizontalWind = 5.0;
          verticalSpeed = -1.8;
          swayAmount = 0.5;
        }

        if (curEffect !== "dreamy") {
          weatherParticleMat.color.setHex(baseColor);
        }

        const pxPerUnit = displaySizeRef.current / (2 * frustumSizeRef.current) * zoomRef.current;
        weatherParticleMat.size = Math.max(1, pSize * pxPerUnit * gridScaleRef.current);
        weatherParticleMat.opacity = curOpacity;

        // Update positions buffer for weather points
        const posAttr = weatherParticlesGeo.getAttribute("position") as THREE.BufferAttribute;
        const positions = posAttr.array as Float32Array;

        for (let i = 0; i < PARTICLE_COUNT; i++) {
          if (i > (curDensity / 300) * PARTICLE_COUNT) {
            positions[i * 3 + 1] = -999;
            continue;
          }

          let vx = particleVelocities[i * 3];
          let vy = particleVelocities[i * 3 + 1];
          let vz = particleVelocities[i * 3 + 2];

          const finalVx = (vx + horizontalWind) * curSpeed * delta;
          const finalVy = (vy + verticalSpeed) * curSpeed * delta;
          const finalVz = (vz + Math.sin(now * 0.002 + i) * swayAmount) * curSpeed * delta;

          positions[i * 3] += finalVx;
          positions[i * 3 + 1] += finalVy;
          positions[i * 3 + 2] += finalVz;

          const gridS = gridScaleRef.current;
          const boundaryX = 12 * gridS;
          const boundaryZ = 12 * gridS;
          const boundaryY = 9 * gridS;

          if (verticalSpeed < 0 && positions[i * 3 + 1] < 0) {
            positions[i * 3 + 1] = boundaryY;
            positions[i * 3] = (Math.random() - 0.5) * boundaryX * 2;
            positions[i * 3 + 2] = (Math.random() - 0.5) * boundaryZ * 2;
          } else if (verticalSpeed > 0 && positions[i * 3 + 1] > boundaryY) {
            positions[i * 3 + 1] = 0;
            positions[i * 3] = (Math.random() - 0.5) * boundaryX * 2;
            positions[i * 3 + 2] = (Math.random() - 0.5) * boundaryZ * 2;
          }

          if (positions[i * 3] > boundaryX) {
            positions[i * 3] = -boundaryX;
            positions[i * 3 + 1] = Math.random() * boundaryY;
          } else if (positions[i * 3] < -boundaryX) {
            positions[i * 3] = boundaryX;
            positions[i * 3 + 1] = Math.random() * boundaryY;
          }

          if (positions[i * 3 + 2] > boundaryZ) {
            positions[i * 3 + 2] = -boundaryZ;
          } else if (positions[i * 3 + 2] < -boundaryZ) {
            positions[i * 3 + 2] = boundaryZ;
          }
        }
        posAttr.needsUpdate = true;


        // ── 2. Update Leaf Particles (สร้างใบไม้ปลิวประกอบฉาก) ──
        let leafColor = 0x22c55e;
        let leafSize = 0.12;
        let leafHorizontalWind = 0.8;
        let leafVerticalSpeed = -0.3;
        let leafSway = 0.3;

        if (curEffect === "gentle") {
          leafColor = 0x22c55e;
          leafSize = 0.11;
          leafHorizontalWind = 1.0;
          leafVerticalSpeed = -0.4;
          leafSway = 0.25;
        } else if (curEffect === "windy") {
          leafColor = 0xf97316;
          leafSize = 0.13;
          leafHorizontalWind = 2.8;
          leafVerticalSpeed = -0.6;
          leafSway = 0.4;
        } else if (curEffect === "dreamy") {
          leafColor = 0xd946ef;
          leafSize = 0.12;
          leafHorizontalWind = 0.3;
          leafVerticalSpeed = 0.5;
          leafSway = 0.5;
        } else if (curEffect === "storm") {
          leafColor = 0x854d0e;
          leafSize = 0.12;
          leafHorizontalWind = 5.2;
          leafVerticalSpeed = -1.2;
          leafSway = 0.6;
        }

        leafParticleMat.color.setHex(leafColor);
        leafParticleMat.size = Math.max(2, leafSize * pxPerUnit * gridScaleRef.current);
        leafParticleMat.opacity = curOpacity * 0.9;

        const leafPosAttr = leafParticlesGeo.getAttribute("position") as THREE.BufferAttribute;
        const leafPos = leafPosAttr.array as Float32Array;

        for (let i = 0; i < LEAF_COUNT; i++) {
          if (i > (curDensity / 300) * LEAF_COUNT) {
            leafPos[i * 3 + 1] = -999;
            continue;
          }

          let vx = leafVelocities[i * 3];
          let vy = leafVelocities[i * 3 + 1];
          let vz = leafVelocities[i * 3 + 2];

          // Fluttering math: simulating tumbling leaves naturally using pre-allocated rotations
          const flutterTime = now * 0.003 * curSpeed + leafRotations[i];
          const swayX = Math.sin(flutterTime) * leafSway;
          const swayZ = Math.cos(flutterTime * 1.5) * leafSway;

          const finalVx = (vx + leafHorizontalWind + swayX) * curSpeed * delta;
          const finalVy = (vy + leafVerticalSpeed) * curSpeed * delta;
          const finalVz = (vz + swayZ) * curSpeed * delta;

          leafPos[i * 3] += finalVx;
          leafPos[i * 3 + 1] += finalVy;
          leafPos[i * 3 + 2] += finalVz;

          const gridS = gridScaleRef.current;
          const boundaryX = 12 * gridS;
          const boundaryZ = 12 * gridS;
          const boundaryY = 9 * gridS;

          if (leafVerticalSpeed < 0 && leafPos[i * 3 + 1] < 0) {
            leafPos[i * 3 + 1] = boundaryY;
            leafPos[i * 3] = (Math.random() - 0.5) * boundaryX * 2;
            leafPos[i * 3 + 2] = (Math.random() - 0.5) * boundaryZ * 2;
          } else if (leafVerticalSpeed > 0 && leafPos[i * 3 + 1] > boundaryY) {
            leafPos[i * 3 + 1] = 0;
            leafPos[i * 3] = (Math.random() - 0.5) * boundaryX * 2;
            leafPos[i * 3 + 2] = (Math.random() - 0.5) * boundaryZ * 2;
          }

          if (leafPos[i * 3] > boundaryX) {
            leafPos[i * 3] = -boundaryX;
            leafPos[i * 3 + 1] = Math.random() * boundaryY;
          } else if (leafPos[i * 3] < -boundaryX) {
            leafPos[i * 3] = boundaryX;
            leafPos[i * 3 + 1] = Math.random() * boundaryY;
          }

          if (leafPos[i * 3 + 2] > boundaryZ) {
            leafPos[i * 3 + 2] = -boundaryZ;
          } else if (leafPos[i * 3 + 2] < -boundaryZ) {
            leafPos[i * 3 + 2] = boundaryZ;
          }
        }
        leafPosAttr.needsUpdate = true;
      }

      if (!needsRender) return;
      renderer.render(scene, camera);
    };
    render();

    return () => {
      cancelAnimationFrame(animFrameId);
      
      domElement.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      domElement.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleKeyDown);
      // Stop all mixers
      Object.values(mixersRef.current).forEach(m => m.stopAllAction());
      mixersRef.current = {};
      animActionsRef.current = {};
      activeAnimNameRef.current = {};

      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      tileGeo.dispose();
      edgeGeo.dispose();
      tileMatA.dispose();
      tileMatB.dispose();
      tileBottomMat.dispose();
      lineMat.dispose();
      
      if (selectionRing) {
        selectionRing.geometry.dispose();
        if (selectionRingMat) {
          if (selectionRingMat.map) selectionRingMat.map.dispose();
          selectionRingMat.dispose();
        }
      }

      if (selectionGlow) {
        selectionGlow.geometry.dispose();
        const glowMat = selectionGlow.material as THREE.MeshBasicMaterial;
        if (glowMat.map) glowMat.map.dispose();
        glowMat.dispose();
      }

      if (hoverTile) {
        hoverTile.geometry.dispose();
        hoverMat.dispose();
      }

      if (weatherPoints) {
        weatherPoints.geometry.dispose();
        const mat = weatherPoints.material as THREE.PointsMaterial;
        if (mat.map) mat.map.dispose();
        mat.dispose();
      }

      if (leafPoints) {
        leafPoints.geometry.dispose();
        const mat = leafPoints.material as THREE.PointsMaterial;
        if (mat.map) mat.map.dispose();
        mat.dispose();
      }

      if (gizmoGroup) {
        gizmoGroup.traverse((obj) => {
          if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose();
          if ((obj as THREE.Mesh).material) {
            const mats = Array.isArray((obj as THREE.Mesh).material)
              ? ((obj as THREE.Mesh).material as THREE.Material[])
              : [(obj as THREE.Mesh).material as THREE.Material];
            mats.forEach(m => m.dispose());
          }
        });
      }

      if (blockedOverlayGeoRef.current) {
        blockedOverlayGeoRef.current.dispose();
        blockedOverlayGeoRef.current = null;
      }
      if (blockedOverlayGroupRef.current) {
        blockedOverlayGroupRef.current.traverse((obj) => {
          if ((obj as THREE.Mesh).material) {
            const m = (obj as THREE.Mesh).material as THREE.Material;
            if (m) m.dispose();
          }
        });
      }
      if (startOverlayRef.current) {
        startOverlayRef.current.geometry.dispose();
        (startOverlayRef.current.material as THREE.Material).dispose();
        startOverlayRef.current = null;
      }
      if (finishOverlayGeoRef.current) {
        finishOverlayGeoRef.current.dispose();
        finishOverlayGeoRef.current = null;
      }
      if (finishOverlayGroupRef.current) {
        finishOverlayGroupRef.current.traverse((obj) => {
          if ((obj as THREE.Mesh).material) {
            ((obj as THREE.Mesh).material as THREE.Material).dispose();
          }
        });
      }
      if (playerMarkerRef.current) {
        playerMarkerRef.current.geometry.dispose();
        (playerMarkerRef.current.material as THREE.Material).dispose();
        playerMarkerRef.current = null;
      }
    };
  }, []);

  // Effect to construct or reconstruct Grid meshes dynamically when gridResolution changes
  useEffect(() => {
    if (!gridGroupRef.current || !tileGeoRef.current || !edgeGeoRef.current) return;

    const gridGroup = gridGroupRef.current;
    
    // Clear all existing children inside gridGroup and dispose resources properly to prevent WebGL memory leaks
    while (gridGroup.children.length > 0) {
      const child = gridGroup.children[0];
      gridGroup.remove(child);
      child.traverse((obj) => {
        if ((obj as THREE.Mesh).geometry) {
          (obj as THREE.Mesh).geometry.dispose();
        }
        if ((obj as THREE.Mesh).material) {
          const materials = Array.isArray((obj as THREE.Mesh).material)
            ? ((obj as THREE.Mesh).material as THREE.Material[])
            : [(obj as THREE.Mesh).material as THREE.Material];
          materials.forEach((m) => {
            if ((m as any).map) (m as any).map.dispose();
            m.dispose();
          });
        }
      });
    }

    const GRID_SIZE = gridResolution;
    const TILE_SPACING = 1.0;
    const tileGeo = tileGeoRef.current;
    const edgeGeo = edgeGeoRef.current;

    // Build the grid meshes using shared reusable geometries
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let z = 0; z < GRID_SIZE; z++) {
        const tileContainer = new THREE.Group();
        tileContainer.name = `tile_${x}_${z}`;
        tileContainer.userData = { gridX: x, gridZ: z };
        gridGroup.add(tileContainer);

        // alternating pattern
        const mat = (x + z) % 2 === 0 ? tileMatARef.current! : tileMatBRef.current!;
        const topMesh = new THREE.Mesh(tileGeo, mat);
        topMesh.position.y = 0.01;
        topMesh.receiveShadow = false;
        topMesh.castShadow = false;
        tileContainer.add(topMesh);

        // wireframe edges
        const edges = new THREE.LineSegments(edgeGeo, lineMatRef.current!);
        edges.position.y = 0.01;
        tileContainer.add(edges);

        // bottom base block
        const bottomMesh = new THREE.Mesh(
          new THREE.BoxGeometry(1.0, 0.02, 1.0),
          tileBottomMatRef.current!
        );
        bottomMesh.position.y = -0.01;
        tileContainer.add(bottomMesh);
      }
    }

    // Set static positions for tiles
    let idx = 0;
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let z = 0; z < GRID_SIZE; z++) {
        const tileContainer = gridGroup.children[idx] as THREE.Group;
        if (tileContainer) {
          const worldX = (x - (GRID_SIZE - 1) / 2) * TILE_SPACING;
          const worldZ = (z - (GRID_SIZE - 1) / 2) * TILE_SPACING;
          tileContainer.position.set(worldX, 0, worldZ);
        }
        idx++;
      }
    }

    // Dynamic high-fidelity 3D direction cards placed neatly flat on the ground aligned with grid perspective
    const dirs = [
      { text: "N", x: 0, z: -GRID_SIZE / 2 - 0.9, rotY: 0 },
      { text: "S", x: 0, z: GRID_SIZE / 2 + 0.9, rotY: Math.PI },
      { text: "E", x: GRID_SIZE / 2 + 0.9, z: 0, rotY: -Math.PI / 2 },
      { text: "W", x: -GRID_SIZE / 2 - 0.9, z: 0, rotY: Math.PI / 2 }
    ];

    dirs.forEach(d => {
      const texture = createDirectionTexture(d.text);
      if (texture) {
        const mat = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          opacity: Math.min(1.0, gridOpacityRef.current * 2.5 + 0.25),
          side: THREE.DoubleSide,
          depthWrite: false
        });
        
        const markerGroup = new THREE.Group();
        markerGroup.userData.directionMarker = true;
        markerGroup.position.set(d.x, 0.02, d.z); // Float slightly above tiles to prevent Z-fighting
        
        const plane = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.2), mat);
        plane.rotation.x = -Math.PI / 2; // Lie flat on the ground plane (XZ-plane)
        
        markerGroup.add(plane);
        
        // Rotate the marker group to align the texture's directional pointer outward
        markerGroup.rotation.y = d.rotY;
        
        gridGroup.add(markerGroup);
      }
    });

  }, [gridResolution]);

  // Effect to sync placed GLTF model characters inside the separate characterGroup dynamically
  useEffect(() => {
    if (!characterGroupRef.current) return;

    const charGroup = characterGroupRef.current;

    // Build key encodes structural properties (not rotationY). Skip full mesh rebuild when only rotations changed.
    const buildKey = `${gridResolution}_${loadedMascotIds.join(",")}__${
      placedCharacters.map(c => `${c.id}:${c.mascotId}:${c.gridX}:${c.gridZ}:${c.scaleX}:${c.scaleZ}`).join("|")
    }`;

    if (buildKey === prevCharBuildKeyRef.current) {
      // Only rotation / animation changed — no mesh rebuild needed
      placedCharacters.forEach(char => {
        const wrapper = charGroup.getObjectByName(`char_${char.id}`);
        if (wrapper) wrapper.rotation.y = char.rotationY ?? 0;

        // Crossfade to newly selected animation if changed
        const charActions = animActionsRef.current[char.id];
        if (charActions && char.activeAnimName) {
          const currentClip = activeAnimNameRef.current[char.id];
          if (currentClip !== char.activeAnimName) {
            const currentAction = currentClip ? charActions[currentClip] : null;
            const nextAction = charActions[char.activeAnimName];
            if (nextAction) {
              if (currentAction) currentAction.fadeOut(0.25);
              nextAction.reset().setEffectiveWeight(1).fadeIn(0.25).play();
              activeAnimNameRef.current[char.id] = char.activeAnimName;
            }
          }
        }
      });
      return;
    }
    prevCharBuildKeyRef.current = buildKey;

    // 1. Remove all old character models from characterGroup
    while (charGroup.children.length > 0) {
      const existingChar = charGroup.children[0];
      charGroup.remove(existingChar);
      
      // Recursively dispose GLTF meshes to prevent WebGL memory leak
      existingChar.traverse((child) => {
        if ((child as THREE.Mesh).geometry) (child as THREE.Mesh).geometry.dispose();
        if ((child as THREE.Mesh).material) {
          const mats = Array.isArray((child as THREE.Mesh).material) 
            ? ((child as THREE.Mesh).material as THREE.Material[]) 
            : [(child as THREE.Mesh).material as THREE.Material];
          mats.forEach(m => m.dispose());
        }
      });
    }

    // Helper to calculate robust bounding box even if setFromObject fails on un-added skinned meshes
    const computeModelBounds = (model: THREE.Group) => {
      let minX = Infinity, minY = Infinity, minZ = Infinity;
      let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
      
      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const geom = (child as THREE.Mesh).geometry;
          if (geom) {
            if (!geom.boundingBox) geom.computeBoundingBox();
            const b = geom.boundingBox;
            if (b && isFinite(b.min.x) && isFinite(b.max.x)) {
              minX = Math.min(minX, b.min.x);
              minY = Math.min(minY, b.min.y);
              minZ = Math.min(minZ, b.min.z);
              maxX = Math.max(maxX, b.max.x);
              maxY = Math.max(maxY, b.max.y);
              maxZ = Math.max(maxZ, b.max.z);
            }
          }
        }
      });

      // Fallback to approximate dimensions if bounding box calculation failed
      if (minX === Infinity || maxX === -Infinity || Math.abs(maxX - minX) < 1e-4) {
        return {
          box: new THREE.Box3(new THREE.Vector3(-0.3, 0.0, -0.3), new THREE.Vector3(0.3, 1.5, 0.3)),
          size: new THREE.Vector3(0.6, 1.5, 0.6),
          center: new THREE.Vector3(0, 0.75, 0)
        };
      }

      const box = new THREE.Box3(new THREE.Vector3(minX, minY, minZ), new THREE.Vector3(maxX, maxY, maxZ));
      return {
        box,
        size: box.getSize(new THREE.Vector3()),
        center: box.getCenter(new THREE.Vector3())
      };
    };

    // Clean up old mixers for characters no longer in scene
    const currentCharIds = new Set(placedCharacters.map(c => c.id));
    Object.keys(mixersRef.current).forEach(charId => {
      if (!currentCharIds.has(charId)) {
        mixersRef.current[charId].stopAllAction();
        delete mixersRef.current[charId];
        delete animActionsRef.current[charId];
        delete activeAnimNameRef.current[charId];
      }
    });

    // 2. Add 3D cloned GLTF models inside dedicated wrapper groups
    placedCharacters.forEach((char) => {
      const baseModel = loadedModelsRef.current[char.mascotId];
      if (baseModel) {
        // Stop & clear any stale mixer for this charId before rebuilding
        // (prevents double-update if useEffect runs again while character still exists)
        if (mixersRef.current[char.id]) {
          mixersRef.current[char.id].stopAllAction();
          delete mixersRef.current[char.id];
          delete animActionsRef.current[char.id];
        }

        // Wrapper Group acts as the pivot center at (0, 0, 0)
        const wrapper = new THREE.Group();
        wrapper.name = `char_${char.id}`;
        wrapper.userData = { charId: char.id, gridX: char.gridX, gridZ: char.gridZ };
        wrapper.rotation.y = char.rotationY ?? 0;

        // Use .clone(true) for rigid-body (non-skinned) GLTF models.
        // Animation tracks resolve by node name, so we must pass modelClone as root
        // to clipAction() — this forces Three.js to search the cloned hierarchy by name.
        const modelClone = baseModel.clone(true) as THREE.Group;
        modelClone.name = "gltf_model";
        
        // 1. Initially set modelClone scale to 1.0 (no scaling) and add it to wrapper
        modelClone.scale.set(1.0, 1.0, 1.0);
        modelClone.position.set(0, 0, 0); // Reset position offsets
        wrapper.add(modelClone);

        // Create an invisible raycast helper cylinder for 100% reliable click selection
        const helperGeo = new THREE.CylinderGeometry(0.4, 0.4, 1.5, 8);
        const helperMat = new THREE.MeshBasicMaterial({
          color: 0x00ffff,
          transparent: true,
          opacity: 0,
          depthWrite: false
        });
        const raycastHelper = new THREE.Mesh(helperGeo, helperMat);
        raycastHelper.name = "raycast_helper";
        raycastHelper.position.y = 0.75; // Align center vertically
        wrapper.add(raycastHelper);

        // 2. Position and scale the wrapper dynamically
        const TILE_SPACING = 1.0;
        const tileWorldX = (char.gridX - (gridResolution - 1) / 2) * TILE_SPACING;
        const tileWorldZ = (char.gridZ - (gridResolution - 1) / 2) * TILE_SPACING;

        const s = gridScale;
        const posX = gridPos.x + tileWorldX * s;
        const posY = gridPos.y;
        const posZ = gridPos.z + tileWorldZ * s;

        wrapper.position.set(posX, posY, posZ);
        // Scale proportionally with gridScale (s) so character footprint matches grid tile exactly
        wrapper.scale.set(char.scaleX * s, char.scaleY * s, char.scaleZ * s);

        charGroup.add(wrapper);

        // 3. Force world matrix update so Three.js computes final world coordinates
        wrapper.updateMatrixWorld(true);

        // 4. Measure correct world visual bounds using setFromObject (which handles all child meshes and scales perfectly!)
        const visualBox = new THREE.Box3().setFromObject(wrapper);
        if (isFinite(visualBox.min.x) && isFinite(visualBox.max.x)) {
          const visualSize = visualBox.getSize(new THREE.Vector3());
          const visualCenter = visualBox.getCenter(new THREE.Vector3());

          // Calculate visual size in the unscaled local wrapper coordinates
          const localSizeX = visualSize.x / (char.scaleX * s);
          const localSizeZ = visualSize.z / (char.scaleZ * s);
          const localSizeY = visualSize.y / (char.scaleY * s);
          
          const baseSize = Math.max(localSizeX, localSizeZ);
          
          // Compute correct scale factor to make the base footprint exactly 1.0 local Grid unit
          const scaleFactor = 1.0 / (baseSize || 1.0);
          
          // Apply scale to modelClone
          modelClone.scale.set(scaleFactor, scaleFactor, scaleFactor);

          // Update matrix again to apply the new local scale
          wrapper.updateMatrixWorld(true);
          
          // Measure the new bounding box after scaling
          const finalBox = new THREE.Box3().setFromObject(wrapper);
          const finalCenter = finalBox.getCenter(new THREE.Vector3());
          const finalSize = finalBox.getSize(new THREE.Vector3());
          
          // Center the visual model precisely on the grid tile and rest flat on the ground Y surface level
          const diffX = finalCenter.x - posX;
          const diffZ = finalCenter.z - posZ;
          modelClone.position.x -= diffX / (char.scaleX * s);
          modelClone.position.z -= diffZ / (char.scaleZ * s);

          const diffY = finalBox.min.y - posY;
          modelClone.position.y -= diffY / (char.scaleY * s);

          // Update helper cylinder to match the final calculated visual height!
          const visualHeight = finalSize.y / (char.scaleY * s);
          raycastHelper.scale.set(1.0, visualHeight / 1.5, 1.0);
          raycastHelper.position.y = visualHeight / 2;
        } else {
          // Fallback if visual bounding box is empty/invalid
          modelClone.scale.set(1.0, 1.0, 1.0);
          modelClone.position.set(0, 0, 0);
        }

        // 5. Setup AnimationMixer and pre-create all actions for every clip
        const clips = loadedAnimsRef.current[char.mascotId];
        if (clips && clips.length > 0) {
          const mixer = new AnimationMixer(modelClone);
          mixersRef.current[char.id] = mixer;

          // Pre-create one action per clip so crossfading is instant (no re-alloc on switch)
          const actions: { [clipName: string]: THREE.AnimationAction } = {};
          clips.forEach(clip => {
            const action = mixer.clipAction(clip, modelClone);
            action.setLoop(THREE.LoopRepeat, Infinity);
            action.clampWhenFinished = false;
            actions[clip.name] = action;
          });
          animActionsRef.current[char.id] = actions;

          // Pick starting clip: honour saved activeAnimName → "idle" → first
          const startClipName =
            (char.activeAnimName && actions[char.activeAnimName])
              ? char.activeAnimName
              : (actions["idle"] ? "idle" : clips[0].name);

          // Assign a unique idle blend weight once per character (persists across rebuilds)
          if (!idleBlendRef.current[char.id]) {
            idleBlendRef.current[char.id] = 0.10 + Math.random() * 0.15; // 0.10–0.25
          }

          // Idle state = static (base pose) blended with a small amount of the idle clip
          if (startClipName === "idle" && actions["static"]) {
            const blend = idleBlendRef.current[char.id];
            actions["static"].setEffectiveWeight(1 - blend).play();
            actions["idle"].timeScale = 1;
            actions["idle"].setEffectiveWeight(blend).play();
          } else {
            actions[startClipName].timeScale = 1;
            actions[startClipName].setEffectiveWeight(1).play();
          }
          activeAnimNameRef.current[char.id] = startClipName;
        } else {
          // No animations available; clear any stale mixer
          delete mixersRef.current[char.id];
          delete animActionsRef.current[char.id];
          delete activeAnimNameRef.current[char.id];
        }

      } else {
        // Load on demand if not yet cached
        loadMascotModel(char.mascotId);
      }
    });
  // Only re-run when characters are added/removed or models finish loading or grid resolution changes.
  // gridPos and gridScale are NOT deps because the render loop repositions characters every frame.
  }, [placedCharacters, loadedMascotIds, gridResolution]);

  // Effect to maintain selection outline — re-runs whenever selection or characters rebuild
  useEffect(() => {
    clearOutlines();
    if (selectedCharId) addOutlines(selectedCharId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCharId, placedCharacters, loadedMascotIds]);

  // Effect to rebuild blocked tile overlay meshes when blockedTiles or gridResolution changes
  useEffect(() => {
    if (!blockedOverlayGroupRef.current || !blockedOverlayGeoRef.current) return;
    const group = blockedOverlayGroupRef.current;
    const geo = blockedOverlayGeoRef.current;

    // Dispose all existing overlay materials and clear group
    while (group.children.length > 0) {
      const child = group.children[0] as THREE.Mesh;
      group.remove(child);
      (child.material as THREE.Material).dispose();
    }

    // Rebuild one flat red plane per blocked tile
    blockedTiles.forEach(key => {
      const parts = key.split("_");
      const gx = parseInt(parts[0]);
      const gz = parseInt(parts[1]);
      if (gx < 0 || gx >= gridResolution || gz < 0 || gz >= gridResolution) return;

      const mat = new THREE.MeshBasicMaterial({
        color: 0xff3b30,
        transparent: true,
        opacity: 0.52,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.renderOrder = 9;
      mesh.userData = { gridX: gx, gridZ: gz };
      group.add(mesh);
    });
  }, [blockedTiles, gridResolution]);

  // Effect to rebuild finish tile overlay meshes when finishTiles or gridResolution changes
  useEffect(() => {
    if (!finishOverlayGroupRef.current || !finishOverlayGeoRef.current) return;
    const group = finishOverlayGroupRef.current;
    const geo = finishOverlayGeoRef.current;

    while (group.children.length > 0) {
      const child = group.children[0] as THREE.Mesh;
      group.remove(child);
      (child.material as THREE.Material).dispose();
    }

    finishTiles.forEach(key => {
      const parts = key.split("_");
      const gx = parseInt(parts[0]);
      const gz = parseInt(parts[1]);
      if (gx < 0 || gx >= gridResolution || gz < 0 || gz >= gridResolution) return;
      const mat = new THREE.MeshBasicMaterial({ color: 0xffd54a, transparent: true, opacity: 0.6, side: THREE.DoubleSide, depthWrite: false });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.renderOrder = 10;
      mesh.userData = { gridX: gx, gridZ: gz };
      group.add(mesh);
    });
  }, [finishTiles, gridResolution]);

  // Retrieve details of the currently selected placed character
  const selectedChar = placedCharacters.find(c => c.id === selectedCharId);

  // Vertical tab panel state
  const [activePanel, setActivePanel] = useState<"grid" | "characters" | "background" | "tiles" | "ai">("grid");

  const switchPanel = (panel: "grid" | "characters" | "background" | "tiles" | "ai") => {
    setActivePanel(panel);
    if (panel === "grid") setActiveTab("grid");
    if (panel === "characters") setActiveTab("characters");
    if (panel === "tiles") setActiveTab("tiles");
    // Leaving the Characters tab cancels any pending placement so the
    // selection banner doesn't linger silently on other panels.
    if (panel !== "characters") setSelectedMascot(null);
  };

  const AI_STYLES = [
    { key: "clay",       label: "3D Clay",
      bg: "radial-gradient(ellipse at 35% 30%, #fff0e8, #ffd0b8 40%, #f0a888 70%, #e07860 100%)",
      prompt: "An ultra-premium minimalist 3D clay render, smooth matte pastel finish, soft rounded shapes, warm studio lighting, clean elegant clay art style" },
    { key: "cartoon",    label: "Cartoon",
      bg: "linear-gradient(135deg, #ffe03d 0% 25%, #ff6eb4 25% 50%, #4fc3f7 50% 75%, #69f0ae 75% 100%)",
      prompt: "Vibrant cartoon cel-shaded art style, bold outlines, bright saturated colors, playful toon shading, animated movie quality" },
    { key: "cyberpunk",  label: "Cyberpunk",
      bg: "repeating-linear-gradient(90deg, transparent 0px, transparent 19px, rgba(0,255,255,.18) 19px, rgba(0,255,255,.18) 20px), repeating-linear-gradient(180deg, transparent 0px, transparent 19px, rgba(180,0,255,.12) 19px, rgba(180,0,255,.12) 20px), linear-gradient(135deg, #040416, #0d0d2e)",
      prompt: "Cyberpunk neon-lit cityscape, glowing neon signs, holographic elements, dark rainy atmosphere, purple and cyan neon glow, blade runner aesthetic" },
    { key: "kawaii",     label: "Kawaii",
      bg: "radial-gradient(circle at 15% 25%, #ff9ec4 0px, #ff9ec4 4px, transparent 4px) 0 0 / 20px 20px, radial-gradient(circle at 65% 75%, #cc88ee 0px, #cc88ee 3px, transparent 3px) 0 0 / 20px 20px, linear-gradient(135deg, #ffd6e8, #e8c8ff)",
      prompt: "Ultra-cute kawaii Japanese style, pastel pink and lavender palette, soft chibi proportions, sparkles and flowers, adorable round shapes" },
    { key: "darkfantasy",label: "Dark Fantasy",
      bg: "radial-gradient(ellipse at 25% 40%, rgba(139,92,246,.55), transparent 50%), radial-gradient(ellipse at 75% 65%, rgba(76,29,149,.6), transparent 50%), linear-gradient(135deg, #0d0020, #1e0440)",
      prompt: "Epic dark fantasy atmosphere, dramatic torchlight, ancient stone textures, mystical purple fog, gothic architectural details, moody shadows" },
    { key: "pixel",      label: "Pixel Art",
      bg: "repeating-linear-gradient(90deg, rgba(255,255,255,.07) 0px, rgba(255,255,255,.07) 1px, transparent 1px, transparent 10px), repeating-linear-gradient(180deg, rgba(255,255,255,.07) 0px, rgba(255,255,255,.07) 1px, transparent 1px, transparent 10px), linear-gradient(135deg, #0f0f23, #1a2a50)",
      prompt: "Retro pixel art style, crisp 32-bit game aesthetic, limited color palette, clean pixel details, classic RPG game art" },
    { key: "watercolor", label: "Watercolor",
      bg: "radial-gradient(ellipse at 20% 30%, rgba(168,237,234,.7), transparent 45%), radial-gradient(ellipse at 80% 70%, rgba(254,214,227,.8), transparent 45%), radial-gradient(ellipse at 55% 55%, rgba(212,252,121,.45), transparent 50%), #d8eff5",
      prompt: "Soft watercolor painting style, flowing ink washes, gentle color bleeds, artistic painted texture, impressionistic loose brushwork" },
    { key: "steampunk",  label: "Steampunk",
      bg: "radial-gradient(circle at 50% 50%, transparent 28px, rgba(200,136,42,.3) 28px, rgba(200,136,42,.3) 30px, transparent 30px) 0 0 / 60px 60px, radial-gradient(circle at 50% 50%, transparent 13px, rgba(200,136,42,.2) 13px, rgba(200,136,42,.2) 15px, transparent 15px) 0 0 / 60px 60px, linear-gradient(135deg, #2a1c10, #6b4010)",
      prompt: "Victorian steampunk aesthetic, brass and copper machinery, steam pipes, cog gears, sepia warm tones, industrial elegance" },
    { key: "enchanted",  label: "Enchanted",
      bg: "radial-gradient(ellipse at 50% 40%, rgba(144,255,100,.35), transparent 55%), radial-gradient(ellipse at 20% 85%, rgba(80,220,60,.22), transparent 38%), linear-gradient(180deg, #021208, #063018, #0d4820)",
      prompt: "Enchanted magical forest, bioluminescent glowing plants, fairy lights, mystical green glow, ancient mossy ruins, ethereal light shafts" },
    { key: "neoncity",   label: "Neon City",
      bg: "linear-gradient(180deg, rgba(255,80,200,.15) 0%, transparent 40%), linear-gradient(180deg, transparent 60%, rgba(0,229,255,.18) 100%), repeating-linear-gradient(90deg, transparent 0px, transparent 39px, rgba(255,80,200,.1) 39px, rgba(255,80,200,.1) 40px), linear-gradient(180deg, #06040e, #100820)",
      prompt: "Vibrant neon city night scene, glowing neon signs in multiple colors, wet reflective streets, urban cyberpunk environment, electric atmosphere" },
    { key: "egypt",      label: "Ancient Egypt",
      bg: "repeating-linear-gradient(180deg, transparent 0px, transparent 9px, rgba(200,169,81,.18) 9px, rgba(200,169,81,.18) 10px), linear-gradient(135deg, #5c3d00, #c8951a, #f5d060, #c8951a, #5c3d00)",
      prompt: "Ancient Egyptian setting, golden sandstone textures, hieroglyphic carvings, warm desert sunlight, palm trees, lapis lazuli accents" },
    { key: "underwater", label: "Underwater",
      bg: "repeating-linear-gradient(180deg, transparent 0px, transparent 14px, rgba(144,224,239,.18) 14px, rgba(144,224,239,.18) 16px), radial-gradient(ellipse at 50% 0%, rgba(224,242,255,.4), transparent 60%), linear-gradient(180deg, #0050a0, #0077c8, #00a8e0)",
      prompt: "Magical underwater ocean environment, caustic light patterns, coral reefs, floating kelp, soft aqua blue atmosphere, bioluminescent details" },
    { key: "space",      label: "Space Station",
      bg: "radial-gradient(circle at 15% 25%, white 0px, white 1.5px, transparent 1.5px) 0 0 / 30px 30px, radial-gradient(circle at 70% 60%, white 0px, white 1px, transparent 1px) 0 0 / 50px 50px, radial-gradient(circle at 45% 80%, white 0px, white 1px, transparent 1px) 0 0 / 20px 20px, linear-gradient(135deg, #030308, #0a0a20)",
      prompt: "Futuristic space station interior, metallic hull panels, zero-gravity sci-fi environment, deep space backdrop with stars, blue sci-fi lighting" },
    { key: "viking",     label: "Viking",
      bg: "repeating-linear-gradient(135deg, transparent 0px, transparent 14px, rgba(160,196,200,.14) 14px, rgba(160,196,200,.14) 15px), linear-gradient(180deg, #0c2030, #1e4060, #2a5570, #608898)",
      prompt: "Norse Viking era setting, rough-hewn timber halls, rune carvings, cold misty fjord atmosphere, firelight warmth against icy blues" },
    { key: "tropical",   label: "Tropical",
      bg: "radial-gradient(ellipse at 50% 100%, rgba(255,234,0,.55), transparent 50%), radial-gradient(ellipse at 50% 10%, rgba(0,200,81,.5), transparent 50%), linear-gradient(180deg, #00a040, #50c830, #ffd000)",
      prompt: "Lush tropical paradise, vibrant jungle foliage, exotic flowers, bright golden sunlight, thatched huts, turquoise water in the distance" },
    { key: "desert",     label: "Desert Ruins",
      bg: "repeating-linear-gradient(160deg, transparent 0px, transparent 24px, rgba(180,130,40,.12) 24px, rgba(180,130,40,.12) 25px), linear-gradient(180deg, #c8956a, #e8bf80, #d4a060, #8b5020)",
      prompt: "Ancient desert ruins, sun-bleached sandstone, crumbling columns, heat shimmer, wind-worn textures, warm amber and ochre tones, sand dunes" },
    { key: "winter",     label: "Winter",
      bg: "radial-gradient(circle at 20% 30%, white 0px, white 2px, transparent 2px) 0 0 / 22px 22px, radial-gradient(circle at 70% 70%, rgba(255,255,255,.7) 0px, rgba(255,255,255,.7) 1.5px, transparent 1.5px) 0 0 / 18px 18px, linear-gradient(180deg, #c8e8ff, #e8f4ff, #d8eeff)",
      prompt: "Magical winter wonderland, pristine snow covering every surface, icicles, soft blue-white light, frosted trees, cozy glowing warm windows" },
    { key: "volcanic",   label: "Volcanic",
      bg: "radial-gradient(ellipse at 50% 85%, rgba(255,100,0,.65), transparent 50%), radial-gradient(ellipse at 25% 90%, rgba(255,50,0,.4), transparent 38%), linear-gradient(180deg, #080000, #220006, #500010)",
      prompt: "Dramatic volcanic environment, glowing lava rivers, ash-covered ground, dramatic orange and red lighting, ember particles, intense heat haze" },
    { key: "fairytale",  label: "Fairy Tale",
      bg: "radial-gradient(circle at 20% 30%, rgba(255,180,230,.7) 0px, rgba(255,180,230,.7) 3px, transparent 3px) 0 0 / 22px 22px, radial-gradient(circle at 70% 70%, rgba(190,160,255,.55) 0px, rgba(190,160,255,.55) 2px, transparent 2px) 0 0 / 16px 16px, linear-gradient(135deg, #ffd6f0, #e8c8ff, #ffeef8)",
      prompt: "Whimsical fairy tale kingdom, pastel candy-colored architecture, sparkle magic effects, fluffy clouds, rainbow reflections, storybook illustration style" },
    { key: "mecha",      label: "Mecha / Sci-Fi",
      bg: "repeating-linear-gradient(90deg, transparent 0px, transparent 19px, rgba(0,212,255,.13) 19px, rgba(0,212,255,.13) 20px), repeating-linear-gradient(180deg, transparent 0px, transparent 19px, rgba(0,212,255,.08) 19px, rgba(0,212,255,.08) 20px), linear-gradient(135deg, #060c14, #0a1828)",
      prompt: "Futuristic mecha sci-fi environment, chrome and titanium surfaces, glowing energy conduits, holographic HUD elements, clean high-tech industrial design" },
  ] as const;
  type AiStyleKey = typeof AI_STYLES[number]["key"];

  const captureScene = () => {
    const renderer = rendererRef.current;
    const gridGroup = gridGroupRef.current;
    const matA = tileMatARef.current;
    const matB = tileMatBRef.current;
    const matBottom = tileBottomMatRef.current;
    const lineMat = lineMatRef.current;
    if (!renderer || !gridGroup) return;

    // --- 1. Save state ---
    const savedOpacityA = matA?.opacity ?? 0;
    const savedOpacityB = matB?.opacity ?? 0;
    const savedOpacityBottom = matBottom?.opacity ?? 0;
    const savedOpacityLine = lineMat?.opacity ?? 0;

    const dirMarkers: THREE.Object3D[] = [];
    gridGroup.traverse(obj => {
      if (obj.userData.directionMarker) dirMarkers.push(obj);
    });

    // --- 2. Apply capture overrides ---
    // Hide direction arrows
    dirMarkers.forEach(m => { m.visible = false; });
    // Drop grid to barely-visible opacity (enough for AI to see structure, invisible to human eye)
    const CAPTURE_OPACITY = 0.04;
    if (matA) { matA.opacity = CAPTURE_OPACITY; matA.needsUpdate = true; }
    if (matB) { matB.opacity = CAPTURE_OPACITY * 0.8; matB.needsUpdate = true; }
    if (matBottom) { matBottom.opacity = CAPTURE_OPACITY * 0.5; matBottom.needsUpdate = true; }
    if (lineMat) { lineMat.opacity = CAPTURE_OPACITY * 0.5; lineMat.needsUpdate = true; }
    // Render at a fixed high resolution so the AI reference is consistent regardless of zoom.
    renderer.setSize(CAPTURE_SIZE, CAPTURE_SIZE);

    // --- 3. Wait 2 frames so render loop paints the change ---
    const doCapture = () => {
      const threeCanvas = renderer.domElement;
      const w = threeCanvas.width;
      const h = threeCanvas.height;

      const compositeCanvas = document.createElement("canvas");
      compositeCanvas.width = w;
      compositeCanvas.height = h;
      const ctx = compositeCanvas.getContext("2d");

      const finalize = () => {
        // --- 4. Restore state ---
        dirMarkers.forEach(m => { m.visible = true; });
        if (matA) { matA.opacity = savedOpacityA; matA.needsUpdate = true; }
        if (matB) { matB.opacity = savedOpacityB; matB.needsUpdate = true; }
        if (matBottom) { matBottom.opacity = savedOpacityBottom; matBottom.needsUpdate = true; }
        if (lineMat) { lineMat.opacity = savedOpacityLine; lineMat.needsUpdate = true; }
        // Restore the on-screen display size.
        renderer.setSize(displaySizeRef.current, displaySizeRef.current);
      };

      if (!ctx) { finalize(); return; }

      const drawAndSave = () => {
        ctx.drawImage(threeCanvas, 0, 0);
        setAiCaptureUrl(compositeCanvas.toDataURL("image/png"));
        finalize();
      };

      const bgOpt = BG_OPTIONS.find(b => b.key === selectedBg) ?? BG_OPTIONS[0];
      const bgStyle = bgOpt.style;

      const isImageBg = (selectedBg === "custom" && uploadedBgUrl) || ("backgroundImage" in bgStyle);
      const imageUrl = selectedBg === "custom" && uploadedBgUrl 
        ? uploadedBgUrl 
        : ("backgroundImage" in bgStyle ? (bgStyle.backgroundImage as string).replace(/^url\(['"]?|['"]?\)$/g, "") : null);

      if (isImageBg && imageUrl) {
        const img = new window.Image();
        img.onload = () => {
          ctx.save();
          ctx.translate(w / 2, h / 2);
          ctx.scale(zoomRef.current, zoomRef.current);
          ctx.translate(-w / 2, -h / 2);
          ctx.drawImage(img, 0, 0, w, h);
          ctx.restore();
          drawAndSave();
        };
        img.onerror = drawAndSave;
        img.src = imageUrl;
      } else {
        if ("background" in bgStyle) {
          const bg = bgStyle.background as string;
          if (bg.startsWith("linear-gradient")) {
            const stops = [...bg.matchAll(/#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)/g)].map(m => m[0]);
            if (stops.length >= 2) {
              const grad = ctx.createLinearGradient(0, 0, 0, h);
              stops.forEach((c, i) => grad.addColorStop(i / (stops.length - 1), c));
              ctx.fillStyle = grad;
            } else {
              ctx.fillStyle = stops[0] ?? "#1e1e2e";
            }
          } else {
            ctx.fillStyle = bg;
          }
          ctx.fillRect(0, 0, w, h);
        }
        drawAndSave();
      }
    };

    // Skip 2 animation frames so the rAF render loop has a chance to paint
    requestAnimationFrame(() => requestAnimationFrame(doCapture));
  };

  const buildAiPrompt = () => {
    const styleObj = AI_STYLES.find(s => s.key === selectedAiStyle) ?? AI_STYLES[0];
    const detail = aiThemeText.trim() || "(ใส่ theme / สถานที่ที่ต้องการ)";
    return `${styleObj.prompt}, isometric 2.5D game background, 45° orthographic top-down perspective, extremely high resolution, ultra-detailed textures, 8k resolution, crisp sharp details, hyper-realistic depth, crystal clear, output size 4096 × 4096 pixels, perfect 1:1 square aspect ratio. All props characters and objects in the scene must use a Kenney-style design: clean simple low-poly 3D models with flat colors minimal detail rounded friendly shapes similar to Kenney game assets. The reference image shows the exact placement of characters props and walls — preserve ALL of them, do NOT remove, move or replace any element. Enhance ONLY the environment textures, lighting, atmosphere, color grading, vegetation and decorative details while keeping all props in Kenney-style. Add richness and depth to floors, walls, and surroundings while matching the isometric composition of the reference exactly. Keep the same camera angle and perspective as the reference image. Leave ample empty space and clean margins around the borders of the image to ensure the entire scene is fully visible and not cut off at the edges. Do not include any text, letters, watermarks, UI elements, or labels in the image.

[THEME / DETAIL]
${detail}`;
  };

  const copyAiPrompt = async () => {
    await navigator.clipboard.writeText(buildAiPrompt());
    setAiPromptCopied(true);
    setTimeout(() => setAiPromptCopied(false), 2000);
  };

  // Immediately crossfade to a new animation clip, then sync React state for UI highlight
  const switchCharAnim = (charId: string, clipName: string) => {
    const charActions = animActionsRef.current[charId];
    if (!charActions || !charActions[clipName]) return;

    const currentClip = activeAnimNameRef.current[charId];
    if (currentClip !== clipName) {
      // Leaving idle-blend: fade out both the static base and idle layer
      if (currentClip === "idle" && charActions["static"]) {
        charActions["static"].fadeOut(0.25);
      }
      if (currentClip && charActions[currentClip]) charActions[currentClip].fadeOut(0.25);

      if (clipName === "idle" && charActions["static"]) {
        // Entering idle-blend: static base + low-weight idle
        const blend = idleBlendRef.current[charId] ?? 0.15;
        charActions["static"].setEffectiveWeight(1 - blend).reset().fadeIn(0.25).play();
        charActions["idle"].timeScale = 1;
        charActions["idle"].setEffectiveWeight(blend).reset().fadeIn(0.25).play();
      } else {
        charActions[clipName].timeScale = 1;
        charActions[clipName].setEffectiveWeight(1).reset().fadeIn(0.25).play();
      }
      activeAnimNameRef.current[charId] = clipName;
    }

    setPlacedCharacters(prev => prev.map(c =>
      c.id === charId ? { ...c, activeAnimName: clipName } : c
    ));
    placedCharactersRef.current = placedCharactersRef.current.map(c =>
      c.id === charId ? { ...c, activeAnimName: clipName } : c
    );
  };

  // Remove all "__sel_outline__" meshes from every character wrapper
  const clearOutlines = () => {
    outlineMatsRef.current = [];
    if (!characterGroupRef.current) return;
    const toRemove: THREE.Object3D[] = [];
    characterGroupRef.current.traverse(obj => {
      if (obj.name === "__sel_outline__") toRemove.push(obj);
    });
    toRemove.forEach(obj => {
      obj.parent?.remove(obj);
      const mat = (obj as THREE.Mesh).material as THREE.MeshBasicMaterial;
      if (mat) mat.dispose();
    });
  };

  // Add BackSide inverted-hull outline to every mesh inside the selected character
  const addOutlines = (charId: string) => {
    if (!characterGroupRef.current) return;
    const wrapper = characterGroupRef.current.getObjectByName(`char_${charId}`);
    if (!wrapper) return;
    const model = wrapper.getObjectByName("gltf_model");
    if (!model) return;

    const mats: THREE.MeshBasicMaterial[] = [];
    model.traverse(child => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      if ((mesh as any).isSkinnedMesh) return; // skip deformation-based skinned mesh
      if (child.name === "raycast_helper" || child.name === "__sel_outline__") return;

      const mat = new THREE.MeshBasicMaterial({
        color: 0xffdd00,
        side: THREE.BackSide,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
      });
      const outline = new THREE.Mesh(mesh.geometry, mat);
      outline.name = "__sel_outline__";
      outline.scale.setScalar(1.06); // 6% larger → outline peeks out from behind original
      outline.renderOrder = 3;
      mesh.add(outline); // Child of original mesh → inherits all animation transforms
      mats.push(mat);
    });
    outlineMatsRef.current = mats;
  };

  // Background presets for the 3D canvas
  const BG_OPTIONS = [
    { key: "playground", label: "Playground", style: { backgroundImage: "url('/playground-bg.png')", backgroundSize: "cover", backgroundPosition: "center" } },
    { key: "sky",        label: "Sky Blue",   style: { background: "linear-gradient(180deg, #bfdbfe 0%, #e0f2fe 100%)" } },
    { key: "sunset",     label: "Sunset",     style: { background: "linear-gradient(180deg, #fbbf24 0%, #f87171 50%, #7c3aed 100%)" } },
    { key: "night",      label: "Night",      style: { background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)" } },
    { key: "forest",     label: "Forest",     style: { background: "linear-gradient(180deg, #86efac 0%, #166534 100%)" } },
    { key: "white",      label: "White",      style: { background: "#ffffff" } },
    { key: "black",      label: "Black",      style: { background: "#000000" } },
    { key: "grid-dark",  label: "Dark Grid",  style: { background: "#1e1e2e" } },
  ];
  const [selectedBg, setSelectedBg] = useState("playground");
  const [uploadedBgUrl, setUploadedBgUrl] = useState<string | null>(null);
  const bgUploadRef = useRef<HTMLInputElement>(null);

  const currentBgStyle = selectedBg === "custom" && uploadedBgUrl
    ? { backgroundImage: `url('${uploadedBgUrl}')`, backgroundSize: "cover", backgroundPosition: "center" }
    : BG_OPTIONS.find(b => b.key === selectedBg)?.style ?? BG_OPTIONS[0].style;

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = String(reader.result);
      setUploadedBgUrl(base64);
      setSelectedBg("custom");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-[#0b0f19] text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      {/* Premium Loader Overlay */}
      <div
        className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-900 text-white transition-all duration-700 ease-in-out ${
          isLoading ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Animated Cyber Grid/Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-[#0f172a] to-slate-900 opacity-95 pointer-events-none" />
        <div 
          className="absolute inset-0 opacity-5 pointer-events-none" 
          style={{
            backgroundImage: `radial-gradient(rgba(255,255,255,0.15) 1px, transparent 0), radial-gradient(rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: '24px 24px',
            backgroundPosition: '0 0, 12px 12px'
          }}
        />

        <div className="relative z-10 flex flex-col items-center gap-6 max-w-sm px-6 text-center">
          {/* Glowing Logo Section */}
          <div className="relative flex items-center justify-center w-20 h-20 bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-2xl animate-float">
            <div className="absolute inset-0 bg-brand-blue/20 dark:bg-[#569cd6]/20 rounded-2xl blur-xl animate-pulse" />
            <Sparkles className="w-10 h-10 text-brand-blue dark:text-[#60a5fa] animate-pulse" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
              Code Quest <span className="text-brand-blue dark:text-[#60a5fa]">3D Studio</span>
            </h2>
            <p className="text-[11px] font-mono tracking-widest text-slate-400 uppercase">
              Initializing Engine
            </p>
          </div>

          {/* Premium Segmented CSS Spinner */}
          <div className="relative w-12 h-12 mt-2">
            <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
            <div className="absolute inset-0 rounded-full border-4 border-t-brand-blue dark:border-t-[#60a5fa] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
            <div className="absolute inset-1 rounded-full border-2 border-slate-800" />
            <div className="absolute inset-1 rounded-full border-2 border-b-green-500 border-t-transparent border-r-transparent border-l-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          </div>

          <div className="space-y-1 mt-2">
            <p className="text-xs font-semibold text-slate-200">
              กำลังโหลดข้อมูลและโมเดล 3D...
            </p>
            <p className="text-[10px] text-slate-500 font-mono">
              Please wait while we render the playfield
            </p>
          </div>
        </div>
      </div>

      {/* Navbar / Header */}
      {!isLiveMode && (
      <header className="w-full px-6 py-4 flex items-center justify-between border-b-2 border-slate-200 dark:border-[#2d2d2d] bg-white dark:bg-[#1e1e1e] text-slate-800 dark:text-slate-100 sticky top-0 z-50 shadow-sm select-none">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button3D variant="secondary" size="sm" className="flex items-center gap-1.5 py-1.5 px-3">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-xs">กลับหน้าหลัก</span>
            </Button3D>
          </Link>
          <div className="h-6 w-[2px] bg-slate-200 dark:bg-slate-800" />
          <h1 className="text-xl font-black text-brand-blue dark:text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-blue dark:text-[#569cd6] animate-pulse" />
            Code Quest <span className="text-brand-blue dark:text-[#569cd6]">3D Studio</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
        {/* Live Mode Play/Stop button */}
        {(() => {
          const canPlay = !!playerCharId && finishTiles.size > 0;
          return (
            <button
              disabled={!isLiveMode && !canPlay}
              onClick={() => isLiveMode ? stopLiveMode() : startLiveMode()}
              title={canPlay || isLiveMode ? (isLiveMode ? "หยุดโหมดเล่น" : "เริ่มโหมดเล่น") : "ต้องตั้งผู้เล่น (★) และเส้นชัย (เส้นชัย) ก่อน"}
              className={`h-10 px-4 rounded-xl border-2 border-b-[4px] flex items-center gap-1.5 text-xs font-bold transition-all duration-100 cursor-pointer shadow-sm ${
                isLiveMode
                  ? "bg-red-500 border-red-600 border-b-red-700 text-white hover:bg-red-400 active:border-b-[2px] active:translate-y-[2px]"
                  : canPlay
                  ? "bg-green-500 border-green-600 border-b-green-700 text-white hover:bg-green-400 active:border-b-[2px] active:translate-y-[2px]"
                  : "opacity-40 cursor-not-allowed bg-slate-100 dark:bg-[#252525] border-slate-200 dark:border-[#333] text-slate-400"
              }`}
            >
              {isLiveMode ? <><Square className="w-4 h-4" /> Stop</> : <><Play className="w-4 h-4" /> Play</>}
            </button>
          );
        })()}

        {/* Scene persistence: Save dropdown */}
        <div className="relative" ref={saveMenuRef}>
          <button
            onClick={() => setSaveMenuOpen(prev => !prev)}
            className="h-10 px-3 rounded-xl bg-white dark:bg-[#252525] border-2 border-b-[4px] border-slate-200 dark:border-[#141414] flex items-center gap-1.5 text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#2a2a2a] active:border-b-[2px] active:translate-y-[2px] transition-all duration-100 cursor-pointer shadow-sm text-xs font-bold"
            title="บันทึกฉาก"
          >
            <Download className="w-4 h-4" />
            <span>Save</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>
          {saveMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-[#1e1e1e] border-2 border-slate-200 dark:border-[#2d2d2d] shadow-xl z-[100] overflow-hidden font-sans border-b-[6px] border-b-slate-350 dark:border-b-[#141414] text-slate-650 dark:text-slate-200">
              <button
                onClick={() => { exportScene(); setSaveMenuOpen(false); }}
                className="w-full px-4 py-2.5 flex items-center gap-2.5 text-left text-xs font-medium text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#2a2a2a] transition-colors cursor-pointer border-b border-slate-100 dark:border-[#2d2d2d]/50"
              >
                <Download className="w-4 h-4 text-brand-blue" />
                <div className="flex flex-col">
                  <span>Export as JSON File</span>
                  <span className="text-[9px] text-slate-400 dark:text-[#888]">บันทึกเป็นไฟล์ลงคอมพิวเตอร์</span>
                </div>
              </button>
              <button
                onClick={() => { saveToIndexedDB(); setSaveMenuOpen(false); }}
                className="w-full px-4 py-2.5 flex items-center gap-2.5 text-left text-xs font-medium text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#2a2a2a] transition-colors cursor-pointer"
              >
                <Database className="w-4 h-4 text-green-500" />
                <div className="flex flex-col">
                  <span>Save to Browser Storage</span>
                  <span className="text-[9px] text-slate-400 dark:text-[#888]">บันทึกเก็บไว้ในประวัติเบราว์เซอร์ (IndexedDB)</span>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Scene persistence: Load dropdown */}
        <div className="relative" ref={loadMenuRef}>
          <button
            onClick={() => setLoadMenuOpen(prev => !prev)}
            className="h-10 px-3 rounded-xl bg-white dark:bg-[#252525] border-2 border-b-[4px] border-slate-200 dark:border-[#141414] flex items-center gap-1.5 text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#2a2a2a] active:border-b-[2px] active:translate-y-[2px] transition-all duration-100 cursor-pointer shadow-sm text-xs font-bold"
            title="โหลดฉาก"
          >
            <Upload className="w-4 h-4" />
            <span>Load</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>
          {loadMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-[#1e1e1e] border-2 border-slate-200 dark:border-[#2d2d2d] shadow-xl z-[100] overflow-hidden font-sans border-b-[6px] border-b-slate-350 dark:border-b-[#141414] text-slate-650 dark:text-slate-200">
              <button
                onClick={() => { importInputRef.current?.click(); setLoadMenuOpen(false); }}
                className="w-full px-4 py-2.5 flex items-center gap-2.5 text-left text-xs font-medium text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#2a2a2a] transition-colors cursor-pointer border-b border-slate-100 dark:border-[#2d2d2d]/50"
              >
                <Upload className="w-4 h-4 text-brand-blue" />
                <div className="flex flex-col">
                  <span>Import JSON File</span>
                  <span className="text-[9px] text-slate-400 dark:text-[#888]">โหลดไฟล์ฉากจากเครื่องคอมฯ</span>
                </div>
              </button>
              <button
                onClick={() => { loadFromIndexedDB(); setLoadMenuOpen(false); }}
                className="w-full px-4 py-2.5 flex items-center gap-2.5 text-left text-xs font-medium text-slate-650 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#2a2a2a] transition-colors cursor-pointer"
              >
                <Database className="w-4 h-4 text-green-500" />
                <div className="flex flex-col">
                  <span>Load from Browser Storage</span>
                  <span className="text-[9px] text-slate-400 dark:text-[#888]">โหลดฉากที่เซฟล่าสุดจาก IndexedDB</span>
                </div>
              </button>
            </div>
          )}
        </div>
        <input
          ref={importInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) importScene(file);
            e.target.value = "";
          }}
        />

        {/* Sound Toggle (Mute/Unmute) */}
        <button
          onClick={() => setIsMuted(prev => !prev)}
          className="w-10 h-10 rounded-xl bg-white dark:bg-[#252525] border-2 border-b-[4px] border-slate-200 dark:border-[#141414] flex items-center justify-center text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#2a2a2a] active:border-b-[2px] active:translate-y-[2px] transition-all duration-100 cursor-pointer shadow-sm"
          title={isMuted ? "เปิดเสียง (Unmute)" : "ปิดเสียง (Mute)"}
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-game-danger" />
          ) : (
            <Volume2 className="w-5 h-5 text-green-500" />
          )}
        </button>

        {/* Weather Toggle (On/Off) */}
        <button
          onClick={toggleWeather}
          className="w-10 h-10 rounded-xl bg-white dark:bg-[#252525] border-2 border-b-[4px] border-slate-200 dark:border-[#141414] flex items-center justify-center text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#2a2a2a] active:border-b-[2px] active:translate-y-[2px] transition-all duration-100 cursor-pointer shadow-sm"
          title={weatherEffect !== "none" ? "ปิดสภาพอากาศ (Disable Weather)" : "เปิดสภาพอากาศ (Enable Weather)"}
        >
          {weatherEffect !== "none" ? (
            <CloudSun className="w-5 h-5 text-brand-blue dark:text-[#569cd6] animate-pulse" />
          ) : (
            <Cloud className="w-5 h-5 text-slate-400 dark:text-[#666]" />
          )}
        </button>

        {/* Theme Switcher Toggle */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-xl bg-white dark:bg-[#252525] border-2 border-b-[4px] border-slate-200 dark:border-[#141414] flex items-center justify-center text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#2a2a2a] active:border-b-[2px] active:translate-y-[2px] transition-all duration-100 cursor-pointer shadow-sm"
          title="สลับธีม (Light/Dark)"
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-game-warning animate-pulse" />
          ) : (
            <Moon className="w-5 h-5 text-brand-blue dark:text-[#569cd6]" />
          )}
        </button>
        </div>
      </header>
      )}

      {/* Wrapper: middle row + bottom AssetPanel */}
      <div className="flex-1 flex flex-col overflow-hidden select-none">

      {/* Main Container - Left Sidebar + Centered 1024x1024px Canvas */}
      <main className="flex-1 w-full flex flex-col lg:flex-row items-stretch overflow-hidden">

        {/* ── Left Inspector Panel — Vertical Tabs ── */}
        {!isLiveMode && (
        <aside 
          style={{ width: leftSidebarCollapsed ? 44 : sidebarWidth }}
          className="shrink-0 flex flex-row bg-white dark:bg-[#1e1e1e] border-r border-slate-200 dark:border-[#333] overflow-hidden text-[11px] font-mono select-none relative transition-all duration-200"
        >
          {/* Resize handle */}
          {!leftSidebarCollapsed && (
            <div
              className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize z-50 hover:bg-brand-blue/30 dark:hover:bg-[#569cd6]/30 transition-colors"
              onMouseDown={() => setIsResizingSidebar(true)}
            />
          )}

          {/* Vertical Tab Strip */}
          <div className="w-11 shrink-0 flex flex-col items-center bg-slate-100 dark:bg-[#252525] border-r border-slate-200 dark:border-[#333] py-1 gap-0.5">
            {([
              { key: "grid",       icon: <Maximize2 className="w-4 h-4" />,    label: "Grid" },
              { key: "characters", icon: <MousePointer className="w-4 h-4" />, label: "Chars" },
              { key: "tiles",      icon: <Grid3x3 className="w-4 h-4" />,      label: "Tiles" },
              { key: "background", icon: <Image className="w-4 h-4" />,        label: "BG" },
              { key: "ai",         icon: <Wand2 className="w-4 h-4" />,        label: "AI" },
            ] as const).map(tab => (
              <button
                key={tab.key}
                onClick={() => {
                  switchPanel(tab.key);
                  if (leftSidebarCollapsed) setLeftSidebarCollapsed(false);
                }}
                title={tab.label}
                className={`w-9 flex flex-col items-center gap-0.5 py-2.5 rounded-lg transition-colors cursor-pointer ${
                  activePanel === tab.key && !leftSidebarCollapsed
                    ? "bg-white dark:bg-[#1e1e1e] text-brand-blue dark:text-[#569cd6] shadow-sm"
                    : "text-slate-400 dark:text-[#666] hover:text-slate-600 dark:hover:text-[#aaa] hover:bg-white/60 dark:hover:bg-[#2a2a2a]"
                }`}
              >
                {tab.icon}
                <span className="text-[7px] font-bold leading-none">{tab.label}</span>
              </button>
            ))}

            {/* Spacer + Reset at bottom */}
            <div className="flex-1" />
            
            {/* Collapse toggle button for left sidebar */}
            <button
              onClick={() => setLeftSidebarCollapsed(prev => !prev)}
              title={leftSidebarCollapsed ? "ขยายเมนูด้านซ้าย (Expand)" : "ยุบเมนูด้านซ้าย (Collapse)"}
              className="w-9 flex flex-col items-center gap-0.5 py-2 rounded-lg text-slate-400 hover:text-brand-blue dark:hover:text-[#569cd6] hover:bg-white/60 dark:hover:bg-[#2a2a2a] transition-colors cursor-pointer mb-0.5"
            >
              {leftSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              <span className="text-[7px] font-bold leading-none">{leftSidebarCollapsed ? "Expand" : "Collapse"}</span>
            </button>

            <button
              onClick={handleResetAlignment}
              title="Reset Scene"
              className="w-9 flex flex-col items-center gap-0.5 py-2.5 rounded-lg text-slate-300 dark:text-[#555] hover:text-red-400 dark:hover:text-[#f47067] hover:bg-white/60 dark:hover:bg-[#2a2a2a] transition-colors cursor-pointer mb-1"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="text-[7px] font-bold leading-none">Reset</span>
            </button>
          </div>

          {/* Panel Content */}
          {!leftSidebarCollapsed && (
            <div className="flex-1 flex flex-col overflow-hidden">

            {/* Panel title */}
            <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 dark:bg-[#2d2d2d] border-b border-slate-200 dark:border-[#3a3a3a] shrink-0">
              <Sliders className="w-3 h-3 text-brand-blue dark:text-[#569cd6]" />
              <span className="text-slate-600 dark:text-[#c8c8c8] font-bold tracking-wide text-[10px] uppercase">
                {activePanel === "grid" ? "Grid Inspector" : activePanel === "characters" ? "Characters" : activePanel === "tiles" ? "Tile Walkability" : activePanel === "ai" ? "AI BG Generator" : "Background"}
              </span>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto flex flex-col">

              {/* ── GRID PANEL ── */}
              {activePanel === "grid" && (
                <>
                  <div className="px-2 py-1 bg-slate-100 dark:bg-[#252525] border-b border-slate-200 dark:border-[#333] text-slate-400 dark:text-[#888] text-[9px] uppercase tracking-widest font-bold">
                    Grid
                  </div>

                  <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100 dark:border-[#2a2a2a] hover:bg-slate-50 dark:hover:bg-[#252525] transition-colors">
                    <span className="text-blue-500 dark:text-[#9cdcfe] w-20 shrink-0">Visible</span>
                    <button
                      onClick={() => setGridVisible(v => !v)}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold cursor-pointer transition-colors ${
                        gridVisible
                          ? "bg-green-100 dark:bg-[#3a5a3a] text-green-700 dark:text-[#6dbe6d] hover:bg-green-200 dark:hover:bg-[#2f4d2f]"
                          : "bg-slate-100 dark:bg-[#3a3a3a] text-slate-400 dark:text-[#888] hover:bg-slate-200 dark:hover:bg-[#444]"
                      }`}
                    >
                      {gridVisible ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
                      {gridVisible ? "ON" : "OFF"}
                    </button>
                  </div>

                  <div className="flex items-center gap-2 px-3 py-1.5 border-b border-slate-100 dark:border-[#2a2a2a]">
                    <span className="text-blue-500 dark:text-[#9cdcfe] w-20 shrink-0">Tile Opac.</span>
                    <input type="range" min="0" max="80" step="0.5" value={(gridOpacity * 100).toFixed(0)}
                      onChange={e => setGridOpacity(parseFloat(e.target.value) / 100)}
                      className="flex-1 accent-brand-blue dark:accent-[#569cd6] h-1 cursor-pointer" />
                    <input type="number" min="0" max="80" step="1" value={(gridOpacity * 100).toFixed(0)}
                      onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) setGridOpacity(Math.min(80, Math.max(0, v)) / 100); }}
                      className="w-10 bg-transparent border-b border-slate-200 dark:border-[#444] text-right text-slate-700 dark:text-[#d4d4d4] tabular-nums outline-none focus:border-brand-blue dark:focus:border-[#569cd6] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                  </div>

                  <div className="flex items-center gap-2 px-3 py-1.5 border-b border-slate-100 dark:border-[#2a2a2a]">
                    <span className="text-blue-500 dark:text-[#9cdcfe] w-20 shrink-0">Line Opac.</span>
                    <input type="range" min="0" max="100" step="1" value={(gridLineOpacity * 100).toFixed(0)}
                      onChange={e => setGridLineOpacity(parseFloat(e.target.value) / 100)}
                      className="flex-1 accent-brand-blue dark:accent-[#569cd6] h-1 cursor-pointer" />
                    <input type="number" min="0" max="100" step="1" value={(gridLineOpacity * 100).toFixed(0)}
                      onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) setGridLineOpacity(Math.min(100, Math.max(0, v)) / 100); }}
                      className="w-10 bg-transparent border-b border-slate-200 dark:border-[#444] text-right text-slate-700 dark:text-[#d4d4d4] tabular-nums outline-none focus:border-brand-blue dark:focus:border-[#569cd6] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                  </div>

                  <div className="flex items-center gap-2 px-3 py-1.5 border-b border-slate-100 dark:border-[#2a2a2a]">
                    <span className="text-blue-500 dark:text-[#9cdcfe] w-20 shrink-0">Scale</span>
                    <input type="range" min="0.2" max="3.0" step="0.01" value={gridScale}
                      onChange={e => setGridScale(parseFloat(e.target.value))}
                      className="flex-1 accent-brand-blue dark:accent-[#569cd6] h-1 cursor-pointer" />
                    <input type="number" min="0.2" max="3.0" step="0.01" value={gridScale.toFixed(2)}
                      onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) setGridScale(Math.min(3, Math.max(0.2, v))); }}
                      className="w-10 bg-transparent border-b border-slate-200 dark:border-[#444] text-right text-slate-700 dark:text-[#d4d4d4] tabular-nums outline-none focus:border-brand-blue dark:focus:border-[#569cd6] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                  </div>

                  <div className="flex items-center gap-2 px-3 py-1.5 border-b border-slate-100 dark:border-[#2a2a2a]">
                    <span className="text-blue-500 dark:text-[#9cdcfe] w-20 shrink-0">Size</span>
                    <input type="range" min="3" max="50" step="1" value={gridResolution}
                      onChange={e => setGridResolution(parseInt(e.target.value))}
                      className="flex-1 accent-brand-blue dark:accent-[#569cd6] h-1 cursor-pointer" />
                    <input type="number" min="3" max="50" step="1" value={gridResolution}
                      onChange={e => { const v = parseInt(e.target.value); if (!isNaN(v)) setGridResolution(Math.min(50, Math.max(3, v))); }}
                      className="w-10 bg-transparent border-b border-slate-200 dark:border-[#444] text-right text-slate-700 dark:text-[#d4d4d4] tabular-nums outline-none focus:border-brand-blue dark:focus:border-[#569cd6] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                  </div>

                  <div className="px-2 py-1 bg-slate-100 dark:bg-[#252525] border-b border-slate-200 dark:border-[#333] text-slate-400 dark:text-[#888] text-[9px] uppercase tracking-widest font-bold mt-1">
                    Camera
                  </div>

                  <div className="flex items-center gap-2 px-3 py-1.5 border-b border-slate-100 dark:border-[#2a2a2a]">
                    <span className="text-blue-500 dark:text-[#9cdcfe] w-20 shrink-0">Orbit °</span>
                    <input type="range" min="0" max="360" step="1" value={cameraOrbitDeg}
                      onChange={e => setCameraOrbitDeg(parseInt(e.target.value))}
                      className="flex-1 accent-brand-blue dark:accent-[#569cd6] h-1 cursor-pointer" />
                    <input type="number" min="0" max="360" step="1" value={cameraOrbitDeg}
                      onChange={e => { const v = parseInt(e.target.value); if (!isNaN(v)) setCameraOrbitDeg(((v % 360) + 360) % 360); }}
                      className="w-10 bg-transparent border-b border-slate-200 dark:border-[#444] text-right text-slate-700 dark:text-[#d4d4d4] tabular-nums outline-none focus:border-brand-blue dark:focus:border-[#569cd6] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                  </div>

                  {/* Canvas Zoom row */}
                  <div className="flex items-center gap-2 px-3 py-1.5 border-b border-slate-100 dark:border-[#2a2a2a]">
                    <span className="text-blue-500 dark:text-[#9cdcfe] w-20 shrink-0">Canvas Zoom</span>
                    <input type="range" min={ZOOM_MIN} max={ZOOM_MAX} step="0.05" value={canvasZoom}
                      onChange={e => setCanvasZoom(clampNum(parseFloat(e.target.value), ZOOM_MIN, ZOOM_MAX))}
                      className="flex-1 accent-brand-blue dark:accent-[#569cd6] h-1 cursor-pointer" />
                    <span className="w-10 text-right text-slate-700 dark:text-[#d4d4d4] tabular-nums">{Math.round(canvasZoom * 100)}%</span>
                  </div>

                  {/* Camera Zoom row */}
                  <div className="flex items-center gap-2 px-3 py-1.5 border-b border-slate-100 dark:border-[#2a2a2a]">
                    <span className="text-blue-500 dark:text-[#9cdcfe] w-20 shrink-0">Camera Zoom</span>
                    <input type="range" min="0.3" max="4.0" step="0.05" value={zoom}
                      onChange={e => setZoom(clampNum(parseFloat(e.target.value), 0.3, 4.0))}
                      className="flex-1 accent-brand-blue dark:accent-[#569cd6] h-1 cursor-pointer" />
                    <span className="w-10 text-right text-slate-700 dark:text-[#d4d4d4] tabular-nums">{Math.round(zoom * 100)}%</span>
                  </div>

                  {/* Reset buttons */}
                  <div className="flex gap-1 px-3 pb-1.5 border-b border-slate-100 dark:border-[#2a2a2a]">
                    <button onClick={() => setCanvasZoom(1)}
                      className="flex-1 py-1 rounded text-[8px] font-bold transition-colors cursor-pointer bg-slate-100 dark:bg-[#2a2a2a] text-slate-500 dark:text-[#888] hover:bg-slate-200 dark:hover:bg-[#333]"
                    >Reset Canvas</button>
                    <button onClick={() => setZoom(1)}
                      className="flex-1 py-1 rounded text-[8px] font-bold transition-colors cursor-pointer bg-slate-100 dark:bg-[#2a2a2a] text-slate-500 dark:text-[#888] hover:bg-slate-200 dark:hover:bg-[#333]"
                    >Reset Camera</button>
                  </div>

                  {/* Performance Mode toggle */}
                  <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100 dark:border-[#2a2a2a] hover:bg-slate-50 dark:hover:bg-[#252525] transition-colors">
                    <div className="flex flex-col">
                      <span className="text-blue-500 dark:text-[#9cdcfe] text-[9px]">Performance Mode</span>
                       <span className="text-slate-400 dark:text-[#666] text-[7.5px]" suppressHydrationWarning>{perfMode ? "PixelRatio 1× (เร็วกว่า)" : `PixelRatio ${Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 1.5, 1.5).toFixed(1)}× (คมชัดกว่า)`}</span>
                    </div>
                    <button
                      onClick={() => setPerfMode(p => !p)}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold cursor-pointer transition-colors ${
                        perfMode
                          ? "bg-green-100 dark:bg-[#3a5a3a] text-green-700 dark:text-[#6dbe6d] hover:bg-green-200 dark:hover:bg-[#2f4d2f]"
                          : "bg-slate-100 dark:bg-[#3a3a3a] text-slate-400 dark:text-[#888] hover:bg-slate-200 dark:hover:bg-[#444]"
                      }`}
                    >
                      {perfMode ? <Zap className="w-2.5 h-2.5" /> : <ZapOff className="w-2.5 h-2.5" />}
                      {perfMode ? "ON" : "OFF"}
                    </button>
                  </div>

                  <div className="px-2 py-1 bg-slate-100 dark:bg-[#252525] border-b border-slate-200 dark:border-[#333] text-slate-400 dark:text-[#888] text-[9px] uppercase tracking-widest font-bold mt-1">
                    Lighting
                  </div>

                  <div className="flex items-center gap-2 px-3 py-1.5 border-b border-slate-100 dark:border-[#2a2a2a]">
                    <span className="text-blue-500 dark:text-[#9cdcfe] w-20 shrink-0">Ambient</span>
                    <input type="range" min="0" max="2" step="0.01" value={ambientIntensity}
                      onChange={e => setAmbientIntensity(parseFloat(e.target.value))}
                      className="flex-1 accent-brand-blue dark:accent-[#569cd6] h-1 cursor-pointer" />
                    <input type="number" min="0" max="2" step="0.01" value={ambientIntensity.toFixed(2)}
                      onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) setAmbientIntensity(Math.min(2, Math.max(0, v))); }}
                      className="w-10 bg-transparent border-b border-slate-200 dark:border-[#444] text-right text-slate-700 dark:text-[#d4d4d4] tabular-nums outline-none focus:border-brand-blue dark:focus:border-[#569cd6] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                  </div>

                  <div className="flex items-center gap-2 px-3 py-1.5 border-b border-slate-100 dark:border-[#2a2a2a]">
                    <span className="text-blue-500 dark:text-[#9cdcfe] w-20 shrink-0">Sun</span>
                    <input type="range" min="0" max="3" step="0.01" value={sunIntensity}
                      onChange={e => setSunIntensity(parseFloat(e.target.value))}
                      className="flex-1 accent-brand-blue dark:accent-[#569cd6] h-1 cursor-pointer" />
                    <input type="number" min="0" max="3" step="0.01" value={sunIntensity.toFixed(2)}
                      onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) setSunIntensity(Math.min(3, Math.max(0, v))); }}
                      className="w-10 bg-transparent border-b border-slate-200 dark:border-[#444] text-right text-slate-700 dark:text-[#d4d4d4] tabular-nums outline-none focus:border-brand-blue dark:focus:border-[#569cd6] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                  </div>

                  <div className="flex items-center gap-2 px-3 py-1.5 border-b border-slate-100 dark:border-[#2a2a2a]">
                    <span className="text-blue-500 dark:text-[#9cdcfe] w-20 shrink-0">Sun Az °</span>
                    <input type="range" min="0" max="360" step="1" value={sunAzimuth}
                      onChange={e => setSunAzimuth(parseInt(e.target.value))}
                      className="flex-1 accent-brand-blue dark:accent-[#569cd6] h-1 cursor-pointer" />
                    <input type="number" min="0" max="360" step="1" value={sunAzimuth}
                      onChange={e => { const v = parseInt(e.target.value); if (!isNaN(v)) setSunAzimuth(((v % 360) + 360) % 360); }}
                      className="w-10 bg-transparent border-b border-slate-200 dark:border-[#444] text-right text-slate-700 dark:text-[#d4d4d4] tabular-nums outline-none focus:border-brand-blue dark:focus:border-[#569cd6] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                  </div>

                  <div className="flex items-center gap-2 px-3 py-1.5 border-b border-slate-100 dark:border-[#2a2a2a]">
                    <span className="text-blue-500 dark:text-[#9cdcfe] w-20 shrink-0">Sun El °</span>
                    <input type="range" min="10" max="80" step="1" value={sunElevation}
                      onChange={e => setSunElevation(parseInt(e.target.value))}
                      className="flex-1 accent-brand-blue dark:accent-[#569cd6] h-1 cursor-pointer" />
                    <input type="number" min="10" max="80" step="1" value={sunElevation}
                      onChange={e => { const v = parseInt(e.target.value); if (!isNaN(v)) setSunElevation(Math.min(80, Math.max(10, v))); }}
                      className="w-10 bg-transparent border-b border-slate-200 dark:border-[#444] text-right text-slate-700 dark:text-[#d4d4d4] tabular-nums outline-none focus:border-brand-blue dark:focus:border-[#569cd6] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                  </div>

                  <div className="flex items-center gap-2 px-3 py-1.5 border-b border-slate-100 dark:border-[#2a2a2a]">
                    <span className="text-blue-500 dark:text-[#9cdcfe] w-20 shrink-0">Rim</span>
                    <input type="range" min="0" max="2" step="0.01" value={rimIntensity}
                      onChange={e => setRimIntensity(parseFloat(e.target.value))}
                      className="flex-1 accent-brand-blue dark:accent-[#569cd6] h-1 cursor-pointer" />
                    <input type="number" min="0" max="2" step="0.01" value={rimIntensity.toFixed(2)}
                      onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) setRimIntensity(Math.min(2, Math.max(0, v))); }}
                      className="w-10 bg-transparent border-b border-slate-200 dark:border-[#444] text-right text-slate-700 dark:text-[#d4d4d4] tabular-nums outline-none focus:border-brand-blue dark:focus:border-[#569cd6] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                  </div>

                </>
              )}

              {/* ── CHARACTERS PANEL ── */}
              {activePanel === "characters" && (
                <div className="flex flex-col h-full overflow-y-auto overflow-x-hidden relative">
                  {/* Floating hint for placement */}
                  {selectedMascot && (
                    <div className="sticky top-2 left-1/2 -translate-x-1/2 w-max px-3 py-1.5 rounded-full bg-blue-500 text-white shadow-lg text-[10px] font-bold flex items-center gap-2 animate-bounce z-50">
                      <Sparkles className="w-3 h-3" />
                      คลิกบน Grid เพื่อวาง
                      <button onClick={() => setSelectedMascot(null)} className="ml-1 text-blue-200 hover:text-white shrink-0 bg-transparent border-none cursor-pointer">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* 1. SCENE HIERARCHY */}
                  {placedCharacters.length > 0 && (
                    <div className="shrink-0 flex flex-col border-b border-slate-200 dark:border-[#333]">
                      <div 
                        className="flex items-center justify-between px-2 py-1 bg-slate-100 dark:bg-[#252525] text-slate-400 dark:text-[#888] text-[9px] uppercase tracking-widest font-bold cursor-pointer hover:bg-slate-200 dark:hover:bg-[#2a2a2a] transition-colors select-none"
                        onClick={() => setSceneCollapsed(prev => !prev)}
                      >
                        <span>Scene ({placedCharacters.length})</span>
                        {sceneCollapsed ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </div>
                      {!sceneCollapsed && (
                        <div className="flex flex-col">
                          {placedCharacters.map((char, i) => {
                          const sInfo = MASCOTS.find(m => m.id === char.mascotId);
                          const dInfo = dynamicRegistryRef.current[char.mascotId];
                          const previewPath = sInfo?.previewPath ?? dInfo?.previewPath;
                          const modelName = sInfo?.name ?? dInfo?.name ?? char.mascotId.split(":").pop() ?? "Model";
                          return (
                            <div key={char.id} onClick={() => setSelectedCharId(char.id)}
                              className={`flex items-center gap-2 px-3 py-1.5 border-b border-slate-100 dark:border-[#2a2a2a] cursor-pointer transition-colors ${
                                selectedCharId === char.id
                                  ? "bg-blue-50 dark:bg-[#1a3a5a] text-brand-blue dark:text-[#569cd6]"
                                  : "hover:bg-slate-50 dark:hover:bg-[#252525] text-slate-400 dark:text-[#888]"
                              }`}
                            >
                              {previewPath && <img src={previewPath} alt="" className="w-4 h-4 object-contain shrink-0" />}
                              {playerCharId === char.id && (
                                <span className="text-[7px] px-1 rounded bg-green-500 text-white font-black shrink-0 leading-4">P1</span>
                              )}
                              <span className="flex-1 truncate text-[9px]">{modelName.replace("Blocky ", "")} #{i + 1}</span>
                              <span className="text-[8px] tabular-nums opacity-60">{char.gridX},{char.gridZ}</span>
                              <button
                                onClick={e => { e.stopPropagation(); setPlayerCharId(prev => prev === char.id ? null : char.id); }}
                                title="ตั้งเป็นผู้เล่น"
                                className={`text-[11px] ml-1 cursor-pointer leading-none ${playerCharId === char.id ? "text-green-500" : "text-slate-300 dark:text-[#555] hover:text-green-500"}`}
                              >★</button>
                              <button
                                onClick={e => { e.stopPropagation(); setPlacedCharacters(prev => prev.filter(c => c.id !== char.id)); if (selectedCharId === char.id) setSelectedCharId(null); if (playerCharId === char.id) setPlayerCharId(null); }}
                                className="text-red-400 dark:text-[#f47067] hover:text-red-500 text-[8px] ml-1 cursor-pointer"
                              >x</button>
                            </div>
                          );
                        })}
                        </div>
                      )}
                    </div>
                  )}

{/* 3. ASSET BROWSER */}
                  <div className="shrink-0 flex flex-col">
                    <AssetPanel
                      collapsed={assetCollapsed}
                      onToggleCollapse={setAssetCollapsed}
                      selectedMascot={selectedMascot}
                      onSelectModel={(item) => {
                        dynamicRegistryRef.current[item.id] = {
                          modelPath: item.modelPath,
                          name: item.name,
                          previewPath: item.previewPath,
                        };
                        setSelectedMascot(item.id);
                        setSelectedCharId(null); // Deselect object so inspector disappears
                      }}
                      onCancelSelect={() => setSelectedMascot(null)}
                    />
                  </div>
                </div>
              )}

              {/* ── TILES PANEL ── */}
              {activePanel === "tiles" && (
                <>
                  <div className="px-2 py-1 bg-slate-100 dark:bg-[#252525] border-b border-slate-200 dark:border-[#333] text-slate-400 dark:text-[#888] text-[9px] uppercase tracking-widest font-bold">
                    วิธีใช้
                  </div>

                  {/* Mode toggle */}
                  <div className="px-3 py-2 flex gap-1.5 border-b border-slate-100 dark:border-[#2a2a2a]">
                    {([
                      { key: "paint" as const,  label: "กำแพง" },
                      { key: "start" as const,  label: "จุดเริ่มต้น" },
                      { key: "finish" as const, label: "เส้นชัย" },
                    ]).map(mode => (
                      <button
                        key={mode.key}
                        onClick={() => setTileEditMode(mode.key)}
                        className={`flex-1 py-1 rounded text-[8px] font-bold transition-colors cursor-pointer ${
                          tileEditMode === mode.key
                            ? mode.key === "paint" ? "bg-red-500 text-white" : mode.key === "start" ? "bg-blue-500 text-white" : "bg-amber-400 text-white"
                            : "bg-slate-100 dark:bg-[#252525] text-slate-400 dark:text-[#666] hover:bg-slate-200 dark:hover:bg-[#2a2a2a]"
                        }`}
                      >{mode.label}</button>
                    ))}
                  </div>

                  <div className="px-3 py-2 border-b border-slate-100 dark:border-[#2a2a2a]">
                    <p className="text-[9px] text-slate-500 dark:text-[#888] leading-relaxed mb-2">
                      {tileEditMode === "paint" ? "คลิกช่องกริดเพื่อสลับสถานะเดิน" : tileEditMode === "start" ? "คลิกช่องกริดเพื่อตั้งจุดเริ่มต้น" : "คลิกช่องกริดเพื่อตั้งเส้นชัย"}
                    </p>
                    <div className="flex flex-wrap gap-2 text-[9px] text-slate-500 dark:text-[#888]">
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-green-400/70 border border-green-500/50 inline-block shrink-0" />
                        เดินได้
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-red-500/70 border border-red-600/50 inline-block shrink-0" />
                        เดินไม่ได้
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-blue-500/70 border border-blue-600/50 inline-block shrink-0" />
                        จุดเริ่มต้น
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-amber-400/70 border border-amber-500/50 inline-block shrink-0" />
                        เส้นชัย
                      </span>
                    </div>
                  </div>

                  <div className="px-2 py-1 bg-slate-100 dark:bg-[#252525] border-b border-slate-200 dark:border-[#333] text-slate-400 dark:text-[#888] text-[9px] uppercase tracking-widest font-bold">
                    สถิติ
                  </div>

                  <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100 dark:border-[#2a2a2a]">
                    <span className="text-slate-500 dark:text-[#888] text-[9px]">ช่องทั้งหมด</span>
                    <span className="text-slate-600 dark:text-[#d4d4d4] font-bold text-[9px] tabular-nums">
                      {gridResolution * gridResolution}
                    </span>
                  </div>

                  <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100 dark:border-[#2a2a2a]">
                    <span className="text-slate-500 dark:text-[#888] text-[9px]">เดินได้</span>
                    <span className="text-green-500 dark:text-[#6dbe6d] font-bold text-[9px] tabular-nums">
                      {gridResolution * gridResolution - blockedTiles.size}
                    </span>
                  </div>

                  <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100 dark:border-[#2a2a2a]">
                    <span className="text-slate-500 dark:text-[#888] text-[9px]">เดินไม่ได้</span>
                    <span className="text-red-400 dark:text-[#f47067] font-bold text-[9px] tabular-nums">
                      {blockedTiles.size}
                    </span>
                  </div>

                  <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100 dark:border-[#2a2a2a]">
                    <span className="text-slate-500 dark:text-[#888] text-[9px]">จุดเริ่มต้น</span>
                    {startTile ? (
                      <span className="flex items-center gap-1 text-blue-500 font-bold text-[9px] tabular-nums">
                        ({startTile.replace("_", ", ")})
                        <button onClick={() => setStartTile(null)} className="text-red-400 hover:text-red-500 cursor-pointer leading-none">x</button>
                      </span>
                    ) : (
                      <span className="text-slate-400 dark:text-[#555] text-[9px]">ยังไม่ตั้ง</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100 dark:border-[#2a2a2a]">
                    <span className="text-slate-500 dark:text-[#888] text-[9px]">เส้นชัย ({finishTiles.size})</span>
                    {finishTiles.size > 0 ? (
                      <button onClick={() => setFinishTiles(new Set())} className="text-red-400 hover:text-red-500 text-[8px] cursor-pointer">Clear</button>
                    ) : (
                      <span className="text-slate-400 dark:text-[#555] text-[9px]">ยังไม่ตั้ง</span>
                    )}
                  </div>
                  {finishTiles.size > 0 && (
                    <div className="overflow-y-auto max-h-24 border-b border-slate-100 dark:border-[#2a2a2a]">
                      {Array.from(finishTiles).map(key => {
                        const [fgx, fgz] = key.split("_");
                        return (
                          <div key={key} className="flex items-center justify-between px-3 py-0.5 hover:bg-slate-50 dark:hover:bg-[#252525] group">
                            <span className="text-[8px] text-amber-500 tabular-nums">({fgx}, {fgz})</span>
                            <button
                              onClick={() => setFinishTiles(prev => { const n = new Set(prev); n.delete(key); return n; })}
                              className="text-red-400 hover:text-red-500 text-[8px] opacity-0 group-hover:opacity-100 cursor-pointer"
                            >x</button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {blockedTiles.size > 0 && (
                    <>
                      <button
                        onClick={() => setBlockedTiles(new Set())}
                        className="mx-3 mt-2 py-1.5 rounded-lg bg-red-50 dark:bg-[#3a1a1a] hover:bg-red-100 dark:hover:bg-[#4a2020] border border-red-200 dark:border-[#5a2020] text-red-500 dark:text-[#f47067] text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Clear ทั้งหมด
                      </button>

                      <div className="px-2 py-1 bg-slate-100 dark:bg-[#252525] border-y border-slate-200 dark:border-[#333] text-slate-400 dark:text-[#888] text-[9px] uppercase tracking-widest font-bold mt-2">
                        ช่องที่ปิดกั้น
                      </div>
                      <div className="overflow-y-auto max-h-48">
                        {Array.from(blockedTiles).map(key => {
                          const [gx, gz] = key.split("_");
                          return (
                            <div key={key} className="flex items-center justify-between px-3 py-1 border-b border-slate-100 dark:border-[#2a2a2a] hover:bg-slate-50 dark:hover:bg-[#252525] group">
                              <span className="text-[9px] text-slate-500 dark:text-[#888] tabular-nums">
                                ({gx}, {gz})
                              </span>
                              <button
                                onClick={() => setBlockedTiles(prev => { const n = new Set(prev); n.delete(key); return n; })}
                                className="text-red-400 dark:text-[#f47067] hover:text-red-500 text-[8px] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                              >x</button>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </>
              )}

              {/* ── BACKGROUND PANEL ── */}
              {activePanel === "background" && (
                <div className="flex flex-col gap-0">
                  <div className="px-2 pt-2 pb-1">
                    <input ref={bgUploadRef} type="file" accept="image/*" className="hidden" onChange={handleBgUpload} />
                    <button
                      onClick={() => bgUploadRef.current?.click()}
                      className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border text-[9px] font-bold transition-all cursor-pointer ${
                        selectedBg === "custom"
                          ? "border-brand-blue dark:border-[#569cd6] bg-blue-50 dark:bg-[#1a3a5a] text-brand-blue dark:text-[#569cd6]"
                          : "border-dashed border-slate-300 dark:border-[#444] text-slate-400 dark:text-[#888] hover:border-slate-400 dark:hover:border-[#666] hover:text-slate-600 dark:hover:text-[#aaa]"
                      }`}
                    >
                      <Image className="w-3 h-3" />
                      {selectedBg === "custom" && uploadedBgUrl ? "เปลี่ยนรูป..." : "Upload Image..."}
                    </button>
                    {selectedBg === "custom" && uploadedBgUrl && (
                      <div className="mt-1 rounded-lg overflow-hidden border border-slate-200 dark:border-[#333] relative">
                        <img src={uploadedBgUrl} alt="custom bg" className="w-full h-12 object-cover" />
                        <button
                          onClick={() => { setSelectedBg("playground"); setUploadedBgUrl(null); }}
                          className="absolute top-0.5 right-0.5 w-4 h-4 rounded bg-black/50 text-white text-[8px] flex items-center justify-center hover:bg-black/70 cursor-pointer"
                        >x</button>
                      </div>
                    )}
                  </div>
                  <div className="p-2 grid grid-cols-2 gap-1.5">
                    {BG_OPTIONS.map(bg => (
                      <button key={bg.key} onClick={() => setSelectedBg(bg.key)}
                        className={`relative flex items-center gap-2 px-2 py-1.5 rounded-lg border text-[9px] font-bold transition-all cursor-pointer overflow-hidden ${
                          selectedBg === bg.key
                            ? "border-brand-blue dark:border-[#569cd6] text-brand-blue dark:text-[#569cd6] bg-blue-50 dark:bg-[#1a3a5a]"
                            : "border-slate-200 dark:border-[#333] text-slate-500 dark:text-[#888] hover:border-slate-300 dark:hover:border-[#555]"
                        }`}
                      >
                        <span className="w-5 h-5 rounded flex-shrink-0 border border-black/10" style={bg.style} />
                        <span className="truncate">{bg.label}</span>
                        {selectedBg === bg.key && <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-brand-blue dark:bg-[#569cd6]" />}
                      </button>
                    ))}
                  </div>

                  {/* ── WEATHER EFFECTS SECTION ── */}
                  <div className="px-2 py-1 bg-slate-100 dark:bg-[#252525] border-t border-b border-slate-200 dark:border-[#333] text-slate-400 dark:text-[#888] text-[9px] uppercase tracking-widest font-bold mt-2">
                    สภาพอากาศ (Weather Effects)
                  </div>

                  {/* Weather Toggle Switch */}
                  <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 dark:border-[#2a2a2a] hover:bg-slate-50 dark:hover:bg-[#252525] transition-colors">
                    <div className="flex flex-col">
                      <span className="text-blue-500 dark:text-[#9cdcfe] text-[9px] font-bold">เปิดใช้งานสภาพอากาศ</span>
                      <span className="text-slate-400 dark:text-[#666] text-[7.5px]">
                        {weatherEffect !== "none" ? "กำลังแสดงเอฟเฟกต์สภาพอากาศ" : "ปิดการแสดงผลสภาพอากาศ"}
                      </span>
                    </div>
                    <button
                      onClick={toggleWeather}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-bold cursor-pointer transition-all ${
                        weatherEffect !== "none"
                          ? "bg-green-100 dark:bg-[#3a5a3a] text-green-700 dark:text-[#6dbe6d] hover:bg-green-200 dark:hover:bg-[#2f4d2f]"
                          : "bg-slate-100 dark:bg-[#3a3a3a] text-slate-400 dark:text-[#888] hover:bg-slate-200 dark:hover:bg-[#444]"
                      }`}
                    >
                      {weatherEffect !== "none" ? <CloudSun className="w-3.5 h-3.5 animate-pulse" /> : <Cloud className="w-3.5 h-3.5" />}
                      {weatherEffect !== "none" ? "ON" : "OFF"}
                    </button>
                  </div>

                  {/* Preset Selector */}
                  <div className="p-2 grid grid-cols-2 gap-1.5 border-b border-slate-100 dark:border-[#2a2a2a]">
                    {[
                      { key: "none", label: "☀️ ปลอดโปร่ง", desc: "Clear sky" },
                      { key: "gentle", label: "🍃 ลมพัดเอื่อย", desc: "Gentle breeze" },
                      { key: "windy", label: "🌾 ลมฝุ่นปลิว", desc: "Windy dust" },
                      { key: "dreamy", label: "✨ ละอองเวทย์", desc: "Magical glows" },
                      { key: "storm", label: "⛈️ พายุฝุ่น", desc: "Heavy storm" }
                    ].map(preset => (
                      <button key={preset.key} onClick={() => setWeatherEffect(preset.key as any)}
                        className={`relative flex flex-col items-start p-2 rounded-lg border text-[9px] font-bold transition-all cursor-pointer overflow-hidden ${
                          weatherEffect === preset.key
                            ? "border-brand-blue dark:border-[#569cd6] text-brand-blue dark:text-[#569cd6] bg-blue-50 dark:bg-[#1a3a5a]"
                            : "border-slate-200 dark:border-[#333] text-slate-500 dark:text-[#888] hover:border-slate-300 dark:hover:border-[#555]"
                        }`}
                      >
                        <span>{preset.label}</span>
                        <span className="text-[7px] font-normal text-slate-400 dark:text-[#666] mt-0.5">{preset.desc}</span>
                        {weatherEffect === preset.key && <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-brand-blue dark:bg-[#569cd6]" />}
                      </button>
                    ))}
                  </div>

                  {weatherEffect !== "none" && (
                    <div className="flex flex-col gap-0">
                      {/* Wind Speed Slider */}
                      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-slate-100 dark:border-[#2a2a2a]">
                        <span className="text-blue-500 dark:text-[#9cdcfe] w-20 shrink-0">Wind Speed</span>
                        <input type="range" min="0.1" max="3.0" step="0.1" value={weatherSpeed}
                          onChange={e => setWeatherSpeed(parseFloat(e.target.value))}
                          className="flex-1 accent-brand-blue dark:accent-[#569cd6] h-1 cursor-pointer" />
                        <span className="w-10 text-right text-slate-700 dark:text-[#d4d4d4] text-[9px] tabular-nums">{weatherSpeed.toFixed(1)}x</span>
                      </div>

                      {/* Particle Density Slider */}
                      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-slate-100 dark:border-[#2a2a2a]">
                        <span className="text-blue-500 dark:text-[#9cdcfe] w-20 shrink-0">Density</span>
                        <input type="range" min="10" max="300" step="10" value={weatherDensity}
                          onChange={e => setWeatherDensity(parseInt(e.target.value))}
                          className="flex-1 accent-brand-blue dark:accent-[#569cd6] h-1 cursor-pointer" />
                        <span className="w-10 text-right text-slate-700 dark:text-[#d4d4d4] text-[9px] tabular-nums">{weatherDensity} pts</span>
                      </div>

                      {/* Opacity Slider */}
                      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-slate-100 dark:border-[#2a2a2a]">
                        <span className="text-blue-500 dark:text-[#9cdcfe] w-20 shrink-0">Opacity</span>
                        <input type="range" min="0.1" max="1.0" step="0.05" value={weatherOpacity}
                          onChange={e => setWeatherOpacity(parseFloat(e.target.value))}
                          className="flex-1 accent-brand-blue dark:accent-[#569cd6] h-1 cursor-pointer" />
                        <span className="w-10 text-right text-slate-700 dark:text-[#d4d4d4] text-[9px] tabular-nums">{Math.round(weatherOpacity * 100)}%</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── AI BG GENERATOR PANEL ── */}
              {activePanel === "ai" && (
                <div className="flex flex-col gap-0 overflow-y-auto">

                  {/* Step 1 — Capture */}
                  <div className="px-2 pt-2 pb-1 bg-slate-50 dark:bg-[#252525] border-b border-slate-200 dark:border-[#333]">
                    <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400 dark:text-[#666]">ขั้นตอนที่ 1 — Capture ฉาก</span>
                  </div>
                  <div className="px-2 py-2 flex flex-col gap-1.5">
                    <p className="text-[9px] text-slate-500 dark:text-[#888] leading-relaxed">
                      จัดตัวละคร / กำแพง / ฉากให้เรียบร้อย แล้วกด Capture เพื่อบันทึกภาพอ้างอิง
                    </p>
                    <button
                      onClick={captureScene}
                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-indigo-50 dark:bg-[#1a1a3a] border border-indigo-200 dark:border-[#3a3a6a] text-indigo-600 dark:text-[#8080ff] text-[9px] font-bold hover:bg-indigo-100 dark:hover:bg-[#22224a] transition-colors cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      Capture Scene
                    </button>
                    {aiCaptureUrl && (
                      <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-[#333]">
                        <img src={aiCaptureUrl} alt="scene capture" className="w-full h-24 object-cover" />
                        <a
                          href={aiCaptureUrl}
                          download="scene-reference.png"
                          className="absolute bottom-1 right-1 w-5 h-5 rounded bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                          title="ดาวน์โหลดภาพ"
                        >
                          <Download className="w-3 h-3" />
                        </a>
                        <span className="absolute top-1 left-1 bg-green-500 text-white text-[7px] font-bold px-1.5 py-0.5 rounded-full">captured</span>
                      </div>
                    )}
                  </div>

                  {/* Step 2 — Art Style */}
                  <div className="px-2 pt-1 pb-1 bg-slate-50 dark:bg-[#252525] border-y border-slate-200 dark:border-[#333]">
                    <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400 dark:text-[#666]">
                      2 — Art Style (20 แบบ)
                    </span>
                  </div>
                  <div className="p-2 grid grid-cols-2 gap-2">
                    {AI_STYLES.map((style) => {
                      const isSelected = selectedAiStyle === style.key;
                      return (
                        <button
                          key={style.key}
                          onClick={() => setSelectedAiStyle(style.key)}
                          title={style.label}
                          className={`relative flex flex-col items-center rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                            isSelected
                              ? "border-brand-blue dark:border-[#569cd6] shadow-md scale-[1.05]"
                              : "border-transparent hover:border-slate-300 dark:hover:border-[#555]"
                          }`}
                        >
                          <div
                            className="w-full h-16 rounded-t"
                            style={{ background: style.bg }}
                          />
                          <div
                            className={`w-full text-center py-0.5 text-[7px] font-bold leading-tight truncate px-0.5 ${
                              isSelected
                                ? "bg-brand-blue dark:bg-[#569cd6] text-white"
                                : "bg-slate-100 dark:bg-[#2a2a2a] text-slate-500 dark:text-[#888]"
                            }`}
                          >
                            {style.label}
                          </div>
                          {isSelected && (
                            <span className="absolute top-0.5 right-0.5 w-3 h-3 bg-brand-blue dark:bg-[#569cd6] rounded-full flex items-center justify-center">
                              <Check className="w-2 h-2 text-white" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Selected style description */}
                  {(() => {
                    const s = AI_STYLES.find((s) => s.key === selectedAiStyle);
                    return s ? (
                      <div className="mx-2 mb-1.5 p-2 rounded-lg border border-slate-200 dark:border-[#333] bg-slate-50 dark:bg-[#1e1e1e]">
                        <p className="text-[8px] font-bold text-slate-600 dark:text-[#c8c8c8] mb-0.5">{s.label}</p>
                        <p className="text-[8px] text-slate-500 dark:text-[#888] leading-relaxed">
                          {s.prompt.split(",").slice(0, 3).join(", ")}…
                        </p>
                      </div>
                    ) : null;
                  })()}

                  {/* Step 3 — Theme Detail */}
                  <div className="px-2 pt-1 pb-1 bg-slate-50 dark:bg-[#252525] border-y border-slate-200 dark:border-[#333]">
                    <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400 dark:text-[#666]">
                      3 — Theme / Detail (optional)
                    </span>
                  </div>
                  <div className="px-2 py-2 flex flex-col gap-1.5">
                    <textarea
                      value={aiThemeText}
                      onChange={(e) => setAiThemeText(e.target.value)}
                      placeholder="เช่น: ninja village in feudal Japan, cherry blossom, lanterns, night..."
                      rows={3}
                      className="w-full text-[9px] p-2 rounded-lg border border-slate-200 dark:border-[#444] bg-white dark:bg-[#1a1a1a] text-slate-700 dark:text-[#d4d4d4] placeholder-slate-300 dark:placeholder-[#555] resize-none focus:outline-none focus:ring-1 focus:ring-indigo-400 dark:focus:ring-[#6060cc] leading-relaxed"
                    />
                  </div>

                  {/* Step 4 — Copy Prompt */}
                  <div className="px-2 pt-1 pb-1 bg-slate-50 dark:bg-[#252525] border-y border-slate-200 dark:border-[#333]">
                    <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400 dark:text-[#666]">
                      4 — Copy Prompt → AI
                    </span>
                  </div>
                  <div className="px-2 py-2 flex flex-col gap-1.5">
                    <pre className="text-[8px] bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#333] rounded-lg p-2 text-slate-600 dark:text-[#aaa] whitespace-pre-wrap leading-relaxed font-mono max-h-32 overflow-y-auto">
                      {buildAiPrompt()}
                    </pre>
                    <button
                      onClick={copyAiPrompt}
                      className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border text-[9px] font-bold transition-all cursor-pointer ${
                        aiPromptCopied
                          ? "bg-green-50 dark:bg-[#1a3a1a] border-green-300 dark:border-[#3a6a3a] text-green-600 dark:text-[#6dbe6d]"
                          : "bg-violet-50 dark:bg-[#1e1a3a] border-violet-200 dark:border-[#4a3a6a] text-violet-600 dark:text-[#b080ff] hover:bg-violet-100 dark:hover:bg-[#28224a]"
                      }`}
                    >
                      {aiPromptCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy Prompt
                        </>
                      )}
                    </button>
                    {!aiCaptureUrl && (
                      <p className="text-[8px] text-amber-500 dark:text-[#fbbf24] text-center">
                        อย่าลืม Capture ภาพก่อนส่งไป AI
                      </p>
                    )}

                    {/* High-res / Zoom Tips */}
                    <div className="mt-2.5 p-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg text-[8px] leading-relaxed text-slate-500 dark:text-[#888]">
                      <div className="flex items-center gap-1 font-bold text-slate-700 dark:text-[#c8c8c8] mb-1">
                        <Wand2 className="w-3 h-3 text-brand-blue" />
                        <span>💡 เคล็ดลับสร้างภาพด้วย ChatGPT (DALL-E 3) / Image 2.0:</span>
                      </div>
                      <ul className="list-disc list-inside space-y-0.5 ml-1">
                        <li><strong>พร้อมใช้งานเต็มรูปแบบ</strong> ระบบถอดคำสั่งพิเศษ (เช่น --ar, --q) ที่มักสร้างปัญหาตัวอักษรส่วนเกินบน ChatGPT ออกทั้งหมดแล้ว</li>
                        <li><strong>ได้ภาพขนาดใหญ่โดยตรง</strong> ChatGPT / Image 2.0 จะสร้างภาพที่มีคุณภาพความละเอียดสูงและมีอัตราส่วน 1:1 แบบเต็มสัดส่วน</li>
                        <li>แนะนำให้นำภาพที่ได้ไปขยายขนาดภาพผ่านเว็บ AI Upscaler ฟรี (เช่น <a href="https://www.upscale.media" target="_blank" rel="noopener noreferrer" className="text-brand-blue dark:text-[#569cd6] hover:underline font-bold">upscale.media</a>) ก่อนนำมาอัปโหลด เพื่อความคมชัดสูงสุดเวลาซูมในฉาก 3D</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
          )}

        </aside>
        )}

        {/* Playfield Container - responsive canvas (auto-fit + zoom) */}
        <div
          ref={playfieldRef}
          className="flex-1 flex items-center justify-center p-6 overflow-auto bg-slate-100 dark:bg-slate-950 relative"
        >

          {/* Floating Expand Button for Collapsed Right Sidebar */}
          {!isLiveMode && rightSidebarCollapsed && (
            <button
              onClick={() => setRightSidebarCollapsed(false)}
              className="absolute right-6 top-6 w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border-2 border-b-[4px] border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 active:border-b-[2px] active:translate-y-[2px] transition-all duration-100 cursor-pointer shadow-md z-45 animate-pop-in hover:scale-105"
              title="ขยายหน้าต่างข้อมูลขวา (Expand Inspector)"
            >
              <Sliders className="w-5 h-5 text-brand-blue dark:text-[#569cd6]" />
            </button>
          )}

          {/* Floating viewport mode switcher — bottom-right of playfield */}
          {!isLiveMode && <div className="absolute bottom-4 right-4 flex flex-col gap-1 bg-white/80 dark:bg-[#1e1e1e]/80 backdrop-blur-sm border border-slate-200 dark:border-[#333] rounded-lg p-1 shadow-lg z-50">
            {(Object.entries(VIEWPORT_PRESETS) as [ViewportMode, typeof VIEWPORT_PRESETS[ViewportMode]][]).map(([key, preset]) => {
              const Icon = key === "mobile" ? Smartphone : key === "tablet" ? Tablet : Monitor;
              return (
                <button
                  key={key}
                  onClick={() => setViewportMode(key)}
                  title={`${preset.label} (${preset.ratioW}:${preset.ratioH})`}
                  className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors cursor-pointer ${
                    viewportMode === key
                      ? "bg-brand-blue dark:bg-[#569cd6] text-white shadow-sm"
                      : "text-slate-400 dark:text-[#555] hover:text-slate-600 dark:hover:text-[#aaa] hover:bg-slate-100 dark:hover:bg-[#2a2a2a]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              );
            })}
          </div>}

          {/* Card Container — size driven by displayW × displaySize (fit × zoom × aspect) */}
          <div
            ref={cardRef}
            style={{ width: displayW, height: displaySize }}
            className={`border-4 border-slate-300 dark:border-slate-800/80 rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-900 shadow-2xl relative shrink-0${isLiveMode ? " invisible" : ""}`}
          >
            {/* Background Layer (Zoomable via CSS scale matching camera zoom) */}
            <div
              style={{
                ...currentBgStyle,
                transform: `scale(${zoom})`,
                transformOrigin: "center center",
                transition: "transform 0.05s ease-out"
              }}
              className="absolute inset-0 w-full h-full pointer-events-none"
            />

            {/* Three.js Canvas mount container */}
            <div
              ref={mountRef}
              className={isLiveMode
                ? "fixed inset-0 z-[100] visible flex items-center justify-center"
                : "w-full h-full relative z-10 bg-transparent"}
            />

          </div>

          {/* Live Mode background — Fill: single cover layer scaling with the grid */}
          {isLiveMode && liveDisplayMode === "fill" && (
            <div
              style={{ ...currentBgStyle, transform: `scale(${zoom})`, transformOrigin: "center center" }}
              className="fixed inset-0 z-[99] pointer-events-none"
            />
          )}

          {/* Live Mode background — Fit: blurred full-screen backdrop + sharp centered box */}
          {isLiveMode && liveDisplayMode === "fit" && (
            <>
              <div
                style={{ ...currentBgStyle, transform: "scale(1.1)", filter: "blur(32px) brightness(0.55)" }}
                className="fixed inset-0 z-[98] pointer-events-none"
              />
              <div className="fixed inset-0 z-[99] flex items-center justify-center pointer-events-none">
                <div
                  style={{
                    width: liveBox.w,
                    height: liveBox.h,
                    ...currentBgStyle,
                    transform: `scale(${zoom})`,
                    transformOrigin: "center center",
                  }}
                  className="overflow-hidden"
                />
              </div>
            </>
          )}

          {/* Live Mode HUD overlay */}
          {isLiveMode && (
            <div className="fixed inset-0 z-[101] pointer-events-none">
              {/* Fit / Fill toggle */}
              <button
                onClick={toggleLiveDisplayMode}
                title={liveDisplayMode === "fit" ? "เต็มจอ (Fill screen)" : "พอดีเฟรม (Fit / letterbox)"}
                className="absolute top-4 right-28 pointer-events-auto h-10 px-4 rounded-xl border-2 border-b-[4px] border-slate-600 border-b-slate-800 flex items-center gap-1.5 text-xs font-bold bg-slate-700 text-white hover:bg-slate-600 active:border-b-[2px] active:translate-y-[2px] transition-all duration-100 cursor-pointer shadow-lg"
              >
                {liveDisplayMode === "fit"
                  ? <><Maximize className="w-4 h-4" /> Fill</>
                  : <><Minimize className="w-4 h-4" /> Fit</>}
              </button>
              {/* Stop button */}
              <button
                onClick={stopLiveMode}
                className="absolute top-4 right-4 pointer-events-auto h-10 px-4 rounded-xl border-2 border-b-[4px] border-red-600 border-b-red-800 flex items-center gap-1.5 text-xs font-bold bg-red-500 text-white hover:bg-red-400 active:border-b-[2px] active:translate-y-[2px] transition-all duration-100 cursor-pointer shadow-lg"
              >
                <Square className="w-4 h-4" /> Stop
              </button>
              {/* WASD hint */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 text-white/60 text-[10px] font-mono select-none">
                <span className="px-2 py-1 rounded bg-white/10 backdrop-blur-sm">W</span>
                <span className="px-2 py-1 rounded bg-white/10 backdrop-blur-sm">A</span>
                <span className="px-2 py-1 rounded bg-white/10 backdrop-blur-sm">S</span>
                <span className="px-2 py-1 rounded bg-white/10 backdrop-blur-sm">D</span>
              </div>
            </div>
          )}

        </div>

        {/* ── Right Inspector Panel ── */}
        {!isLiveMode && (
        <aside
          style={{ width: rightSidebarCollapsed ? 0 : rightPanelWidth }}
          className={`shrink-0 flex flex-col bg-white dark:bg-[#1e1e1e] border-slate-200 dark:border-[#333] overflow-hidden text-[11px] font-mono select-none relative transition-all duration-200 ${
            rightSidebarCollapsed ? "border-l-0" : "border-l"
          }`}
        >
          {/* Resize handle */}
          {!rightSidebarCollapsed && (
            <div
              className="absolute top-0 left-0 w-1.5 h-full cursor-col-resize z-50 hover:bg-brand-blue/30 dark:hover:bg-[#569cd6]/30 transition-colors"
              onMouseDown={() => setIsResizingRightPanel(true)}
            />
          )}

          {/* Panel Header */}
          {!rightSidebarCollapsed && (
            <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-[#2d2d2d] border-b border-slate-200 dark:border-[#3a3a3a] shrink-0">
              <div className="flex items-center gap-1.5">
                <Sliders className="w-3 h-3 text-brand-blue dark:text-[#569cd6]" />
                <span className="text-slate-600 dark:text-[#c8c8c8] font-bold tracking-wide text-[10px] uppercase">
                  Inspector
                </span>
              </div>
              <button
                onClick={() => setRightSidebarCollapsed(true)}
                className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-[#aaa] hover:bg-slate-100 dark:hover:bg-[#2a2a2a] transition-colors cursor-pointer"
                title="ยุบ Inspector"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Panel Content */}
          {!rightSidebarCollapsed && (
            <div className="flex-1 overflow-y-auto flex flex-col">
              {!selectedChar ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400 dark:text-[#666]">
                  <MousePointer className="w-8 h-8 mb-3 opacity-30" />
                  <p className="text-[9px] leading-relaxed">เลือก Character บน Grid เพื่อดูรายละเอียด</p>
                </div>
              ) : (
                <div className="flex flex-col">

                  {/* Transform Section */}
                  <div className="border-b border-slate-200 dark:border-[#2a2a2a]">
                    <div
                      className="flex items-center justify-between px-3 py-1.5 bg-slate-50 dark:bg-[#252525] cursor-pointer select-none"
                      onClick={() => setTransformCollapsed(p => !p)}
                    >
                      <span className="text-[9px] font-bold text-slate-500 dark:text-[#888] uppercase tracking-widest">Transform</span>
                      {transformCollapsed ? <ChevronDown className="w-3 h-3 text-slate-400" /> : <ChevronUp className="w-3 h-3 text-slate-400" />}
                    </div>
                    {!transformCollapsed && (
                      <div className="px-3 py-2 flex flex-col gap-2">
                        {(["scaleX", "scaleY", "scaleZ"] as const).map(axis => (
                          <div key={axis} className="flex items-center gap-2">
                            <span className="text-[8px] text-slate-400 dark:text-[#666] w-10 shrink-0">{axis === "scaleX" ? "Scale X" : axis === "scaleY" ? "Scale Y" : "Scale Z"}</span>
                            <input
                              type="range" min="0.1" max="3" step="0.05"
                              value={selectedChar[axis]}
                              onChange={e => setPlacedCharacters(prev => prev.map(c => c.id === selectedChar.id ? { ...c, [axis]: parseFloat(e.target.value) } : c))}
                              className="flex-1 h-1 accent-brand-blue cursor-pointer"
                            />
                            <span className="text-[8px] tabular-nums w-8 text-right text-slate-500 dark:text-[#888]">{selectedChar[axis].toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="flex items-center gap-2">
                          <span className="text-[8px] text-slate-400 dark:text-[#666] w-10 shrink-0">Rot Y</span>
                          <input
                            type="range" min={-Math.PI} max={Math.PI} step={0.1}
                            value={selectedChar.rotationY}
                            onChange={e => setPlacedCharacters(prev => prev.map(c => c.id === selectedChar.id ? { ...c, rotationY: parseFloat(e.target.value) } : c))}
                            className="flex-1 h-1 accent-brand-blue cursor-pointer"
                          />
                          <span className="text-[8px] tabular-nums w-8 text-right text-slate-500 dark:text-[#888]">{(selectedChar.rotationY * 180 / Math.PI).toFixed(0)}°</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Animations Section */}
                  <div className="border-b border-slate-200 dark:border-[#2a2a2a]">
                    <div
                      className="flex items-center justify-between px-3 py-1.5 bg-slate-50 dark:bg-[#252525] cursor-pointer select-none"
                      onClick={() => setAnimationsCollapsed(p => !p)}
                    >
                      <span className="text-[9px] font-bold text-slate-500 dark:text-[#888] uppercase tracking-widest">Animations</span>
                      {animationsCollapsed ? <ChevronDown className="w-3 h-3 text-slate-400" /> : <ChevronUp className="w-3 h-3 text-slate-400" />}
                    </div>
                    {!animationsCollapsed && (
                      <div className="px-3 py-2 flex flex-col gap-1">
                        {(loadedAnimsRef.current[selectedChar.mascotId] ?? []).map(clip => (
                          <button
                            key={clip.name}
                            onClick={() => switchCharAnim(selectedChar.id, clip.name)}
                            className={`text-left px-2 py-1 rounded text-[8px] font-medium transition-colors cursor-pointer ${
                              selectedChar.activeAnimName === clip.name
                                ? "bg-brand-blue dark:bg-[#1a3a5a] text-white dark:text-[#569cd6]"
                                : "text-slate-500 dark:text-[#888] hover:bg-slate-100 dark:hover:bg-[#252525]"
                            }`}
                          >
                            {clip.name}
                          </button>
                        ))}
                        {(loadedAnimsRef.current[selectedChar.mascotId] ?? []).length === 0 && (
                          <p className="text-[8px] text-slate-400 dark:text-[#555]">ไม่มี animation</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions Section */}
                  <div className="border-b border-slate-200 dark:border-[#2a2a2a]">
                    <div
                      className="flex items-center justify-between px-3 py-1.5 bg-slate-50 dark:bg-[#252525] cursor-pointer select-none"
                      onClick={() => setActionsCollapsed(p => !p)}
                    >
                      <span className="text-[9px] font-bold text-slate-500 dark:text-[#888] uppercase tracking-widest">Actions</span>
                      {actionsCollapsed ? <ChevronDown className="w-3 h-3 text-slate-400" /> : <ChevronUp className="w-3 h-3 text-slate-400" />}
                    </div>
                    {!actionsCollapsed && (
                      <div className="px-3 py-2 flex flex-col gap-1.5">
                        <button
                          onClick={() => { setPlacedCharacters(prev => prev.filter(c => c.id !== selectedChar.id)); setSelectedCharId(null); if (playerCharId === selectedChar.id) setPlayerCharId(null); }}
                          className="w-full py-1.5 rounded-lg text-[8px] font-bold text-red-500 dark:text-[#f47067] border border-red-200 dark:border-[#5a2020] hover:bg-red-50 dark:hover:bg-[#3a1a1a] transition-colors cursor-pointer"
                        >
                          ลบ Character นี้
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>
          )}
        </aside>
        )}

      </main>

      </div>

      {/* Win overlay — shown when player reaches finish tile in live mode */}
      {hasWon && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1e1e1e] rounded-3xl px-10 py-8 shadow-2xl border-4 border-amber-400 text-center">
            <Trophy className="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <h2 className="text-4xl font-black text-amber-500 mb-2">ชนะแล้ว!</h2>
            <p className="text-sm text-slate-500 dark:text-[#888] mb-5">ผู้เล่นถึงเส้นชัยแล้ว</p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setHasWon(false)}
                className="px-4 py-2 rounded-xl border-2 border-b-[4px] border-slate-200 dark:border-[#333] text-xs font-bold bg-white dark:bg-[#252525] text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#2a2a2a] cursor-pointer transition-all"
              >เล่นต่อ</button>
              <button
                onClick={stopLiveMode}
                className="px-4 py-2 rounded-xl border-2 border-b-[4px] border-amber-400 border-b-amber-600 text-xs font-bold bg-amber-400 text-white hover:bg-amber-300 cursor-pointer transition-all"
              >ออกจากโหมดเล่น</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast component replacing native alert */}
      <Toast3D
        isVisible={toast.isVisible}
        message={toast.message}
        title={toast.title}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
}