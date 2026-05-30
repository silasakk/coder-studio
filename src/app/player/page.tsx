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
  ChevronRight,
  Eye,
  EyeOff,
  ChevronDown,
  Image,
  Grid3x3,
  Wand2,
  Camera,
  Copy,
  Check,
  Download
} from "lucide-react";
import Button3D from "@/components/game/Button3D";
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

export default function PlayerPage() {
  const [isDark, setIsDark] = useState(false);

  // Active Editor Mode Tab: grid (ตาราง) vs characters (ตัวละคร) vs tiles (walkable)
  const [activeTab, setActiveTab] = useState<"grid" | "characters" | "tiles">("grid");

  // Grid transform states
  const [gridPos, setGridPos] = useState({ x: 0.0, y: 0.0, z: 0.0 });
  const [gridScale, setGridScale] = useState(1.0);
  const [gridOpacity, setGridOpacity] = useState(0.30); // Default grid opacity set to 30%
  const [gridResolution, setGridResolution] = useState(10); // Dynamic grid resolution slider
  const [gridVisible, setGridVisible] = useState(true); // Toggle grid visibility
  
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

  // Renderer ref for scene capture
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // AI BG Gen state
  const [aiCaptureUrl, setAiCaptureUrl] = useState<string | null>(null);
  const [aiThemeText, setAiThemeText] = useState("");
  const [aiPromptCopied, setAiPromptCopied] = useState(false);

  // Bump animation when character hits a blocked tile
  const bumpAnimRef = useRef<{ charId: string; startTime: number; dx: number; dz: number } | null>(null);

  // Per-character idle blend weight (how much the idle clip contributes vs. static pose)
  const idleBlendRef = useRef<{ [charId: string]: number }>({});

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
    if (lineMatRef.current) {
      lineMatRef.current.opacity = Math.min(1.0, gridOpacity * 2.2 + 0.15);
    }
  }, [gridOpacity]);

  useEffect(() => {
    gridResolutionRef.current = gridResolution;
  }, [gridResolution]);

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
    selectedCharIdRef.current = selectedCharId;
  }, [selectedCharId]);

  useEffect(() => {
    placedCharactersRef.current = placedCharacters;
  }, [placedCharacters]);

  useEffect(() => {
    blockedTilesRef.current = blockedTiles;
  }, [blockedTiles]);

  // Initializing theme
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
  }, []);

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
    setGridResolution(10);
    setGridVisible(true);
    setSelectedMascot(null);
    setPlacedCharacters([]);
    setSelectedCharId(null);
    setBlockedTiles(new Set());
    setActiveTab("grid");
  };

  // Dynamic GLTF Loader to load any Blocky Character model by mascotId
  const loadMascotModel = (mascotId: string, callback?: (model: THREE.Group) => void) => {
    if (loadedModelsRef.current[mascotId]) {
      if (callback) callback(loadedModelsRef.current[mascotId]);
      return;
    }

    const mascot = MASCOTS.find(m => m.id === mascotId);
    if (!mascot) return;

    const loader = new GLTFLoader();
    loader.load(
      mascot.modelPath,
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

  // Pre-load default blocky characters on mount to guarantee instant interaction
  useEffect(() => {
    loadMascotModel("character-a");
    loadMascotModel("character-b");
    loadMascotModel("character-c");
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

  // Three.js Setup - locked isometric view & direct drag editor
  useEffect(() => {
    if (!mountRef.current) return;

    const containerWidth = 1024;
    const containerHeight = 1024;

    // 1. Scene
    const scene = new THREE.Scene();

    // 2. Camera - STRICTLY LOCKED Orthographic Isometric Camera
    const aspect = containerWidth / containerHeight;
    const frustumSize = 7.0;
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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xffeedd, 0xbde5f8, 0.4);
    scene.add(hemiLight);

    const directionalLight = new THREE.DirectionalLight(0xffeedd, 1.3);
    directionalLight.position.set(8, 12, 6);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.bias = -0.0005;
    scene.add(directionalLight);

    const rimLight = new THREE.DirectionalLight(0xbde5f8, 0.45);
    rimLight.position.set(-6, 8, -6);
    scene.add(rimLight);

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
      opacity: Math.min(1.0, gridOpacityRef.current * 2.2 + 0.15),
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
              const filtered = prev.filter(c => !(c.gridX === gridX && c.gridZ === gridZ));
              return [...filtered, {
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
            setPlacedCharacters(prev => prev.map(c => {
              if (c.id === charId) {
                return {
                  ...c,
                  gridX,
                  gridZ,
                  offsetX: 0.0,
                  offsetY: 0.0,
                  offsetZ: 0.0
                };
              }
              return c;
            }));
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
          // Decide paint mode from the first tile: blocked→unblock, walkable→block
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
          placedCharactersRef.current = placedCharactersRef.current.map(c => {
            if (c.id === selectedCharIdRef.current) {
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
      if (activeTabRef.current !== "characters") return;
      if (!selectedCharIdRef.current) return;

      const key = e.key.toLowerCase();
      if (!["w", "a", "s", "d"].includes(key)) return;

      e.preventDefault();

      if (wasdCooldownRef.current) return;
      wasdCooldownRef.current = true;
      setTimeout(() => { wasdCooldownRef.current = false; }, 150);

      const charId = selectedCharIdRef.current;

      // A / D — rotate in place (no movement, instant visual via ref)
      if (key === "a" || key === "d") {
        const rotDelta = key === "a" ? Math.PI / 2 : -Math.PI / 2;
        setPlacedCharacters(prev => prev.map(c => {
          if (c.id !== charId) return c;
          const newRot = (c.rotationY ?? 0) + rotDelta;
          // Sync ref immediately so render loop shows new rotation before React re-render
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
      // Forward vector: (sin(rotY), 0, cos(rotY)) snapped to nearest integer for cardinal movement
      const fwdDx = Math.round(Math.sin(rotY));
      const fwdDz = Math.round(Math.cos(rotY));
      const moveDx = key === "w" ? fwdDx : -fwdDx;
      const moveDz = key === "w" ? fwdDz : -fwdDz;

      setPlacedCharacters(prev => prev.map(c => {
        if (c.id !== charId) return c;
        const newX = Math.max(0, Math.min(resolution - 1, c.gridX + moveDx));
        const newZ = Math.max(0, Math.min(resolution - 1, c.gridZ + moveDz));
        const wouldHitWall = newX === c.gridX && newZ === c.gridZ && (moveDx !== 0 || moveDz !== 0);
        const wouldHitBlocked = blockedTilesRef.current.has(`${newX}_${newZ}`);
        if (wouldHitBlocked || wouldHitWall) {
          bumpAnimRef.current = { charId, startTime: performance.now(), dx: moveDx, dz: moveDz };
          return c;
        }
        placedCharactersRef.current = placedCharactersRef.current.map(rc =>
          rc.id === charId ? { ...rc, gridX: newX, gridZ: newZ } : rc
        );
        return { ...c, gridX: newX, gridZ: newZ };
      }));

      // Resume current animation if it was somehow stopped
      const charActions = animActionsRef.current[charId];
      if (charActions) {
        const activeClip = activeAnimNameRef.current[charId];
        if (activeClip && charActions[activeClip] && !charActions[activeClip].isRunning()) {
          charActions[activeClip].reset().play();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    let lastTime = performance.now();
    let animFrameId: number;
    const render = () => {
      animFrameId = requestAnimationFrame(render);
      
      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      // Update all active animation mixers
      Object.values(mixersRef.current).forEach(mixer => mixer.update(delta));
      
      // Update Grid Board Position
      gridGroup.position.set(
        gridPosRef.current.x,
        gridPosRef.current.y,
        gridPosRef.current.z
      );

      // Update Character Positions dynamically in the render loop based on parent Grid's translated coordinates
      if (characterGroupRef.current) {
        characterGroupRef.current.children.forEach((wrapper) => {
          const charId = wrapper.userData.charId;
          const char = placedCharactersRef.current.find(c => c.id === charId);
          if (char) {
            const TILE_SPACING = 1.0;
            const tileWorldX = (char.gridX - (gridResolutionRef.current - 1) / 2) * TILE_SPACING;
            const tileWorldZ = (char.gridZ - (gridResolutionRef.current - 1) / 2) * TILE_SPACING;

            const s = gridScaleRef.current;
            // Snaps strictly to grid coordinates
            const posX = gridPosRef.current.x + tileWorldX * s;
            const posY = gridPosRef.current.y;
            const posZ = gridPosRef.current.z + tileWorldZ * s;

            // Apply bump offset if this char just hit a wall
            let bumpOffsetX = 0, bumpOffsetZ = 0;
            const bump = bumpAnimRef.current;
            if (bump && bump.charId === charId) {
              const elapsed = (now - bump.startTime) / 1000;
              const duration = 0.28;
              if (elapsed < duration) {
                const t = elapsed / duration;
                // Quick forward nudge then snap back — decaying half-sine
                const amount = 0.18 * s * Math.sin(t * Math.PI) * (1 - t * 0.5);
                bumpOffsetX = bump.dx * amount;
                bumpOffsetZ = bump.dz * amount;
              } else {
                bumpAnimRef.current = null;
              }
            }
            wrapper.position.set(posX + bumpOffsetX, posY, posZ + bumpOffsetZ);
            // Character scales proportionally with gridScale
            wrapper.scale.set(char.scaleX * s, char.scaleY * s, char.scaleZ * s);
            // Apply Y-axis rotation from character state
            wrapper.rotation.y = char.rotationY ?? 0;
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
        if (activeTabRef.current === "grid") {
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
        topMesh.receiveShadow = true;
        topMesh.castShadow = true;
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

  // Retrieve details of the currently selected placed character
  const selectedChar = placedCharacters.find(c => c.id === selectedCharId);

  // Vertical tab panel state
  const [activePanel, setActivePanel] = useState<"grid" | "characters" | "background" | "tiles" | "ai">("grid");

  const switchPanel = (panel: "grid" | "characters" | "background" | "tiles" | "ai") => {
    setActivePanel(panel);
    if (panel === "grid") setActiveTab("grid");
    if (panel === "characters") setActiveTab("characters");
    if (panel === "tiles") setActiveTab("tiles");
  };

  const captureScene = () => {
    const renderer = rendererRef.current;
    const mountEl = mountRef.current;
    if (!renderer || !mountEl) return;

    const threeCanvas = renderer.domElement;
    const w = threeCanvas.width;
    const h = threeCanvas.height;

    const compositeCanvas = document.createElement("canvas");
    compositeCanvas.width = w;
    compositeCanvas.height = h;
    const ctx = compositeCanvas.getContext("2d");
    if (!ctx) return;

    // Draw background
    if (selectedBg === "custom" && uploadedBgUrl) {
      const img = new window.Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, w, h);
        ctx.drawImage(threeCanvas, 0, 0);
        setAiCaptureUrl(compositeCanvas.toDataURL("image/png"));
      };
      img.src = uploadedBgUrl;
    } else {
      const bgOpt = BG_OPTIONS.find(b => b.key === selectedBg);
      const bgStyle = bgOpt?.style ?? BG_OPTIONS[0].style;
      if ("background" in bgStyle) {
        const bg = bgStyle.background as string;
        if (bg.startsWith("linear-gradient")) {
          // Parse gradient stops and approximate as top→bottom
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
      ctx.drawImage(threeCanvas, 0, 0);
      setAiCaptureUrl(compositeCanvas.toDataURL("image/png"));
    }
  };

  const buildAiPrompt = () => {
    const detail = aiThemeText.trim() || "(ใส่ theme ที่ต้องการ เช่น ninja village in Japan at night)";
    return `[RULES]
• Style: Isometric 2.5D game background, 45° orthographic perspective
• Output size: 2048 × 2048 pixels
• The reference image shows exact placement of characters, props, and walls — preserve ALL of them; do NOT remove, move, or replace any element
• Enhance ONLY the environment: textures, lighting, atmosphere, color grading, vegetation, and decorative details
• Add richness and depth to floors, walls, and surroundings while matching the isometric composition of the reference exactly
• Art style: stylized 3D game art (not pixel art, not photorealistic)
• Keep the same camera angle and perspective as the reference image

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
    const url = URL.createObjectURL(file);
    if (uploadedBgUrl) URL.revokeObjectURL(uploadedBgUrl);
    setUploadedBgUrl(url);
    setSelectedBg("custom");
    e.target.value = "";
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      {/* Navbar / Header */}
      <header className="w-full px-6 py-4 flex items-center justify-between border-b-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-50 shadow-sm select-none">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button3D variant="secondary" size="sm" className="flex items-center gap-1.5 py-1.5 px-3">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-xs">กลับหน้าหลัก</span>
            </Button3D>
          </Link>
          <div className="h-6 w-[2px] bg-slate-200 dark:bg-slate-800" />
          <h1 className="text-xl font-black text-brand-blue tracking-tight">
            Code Quest 3D Studio
          </h1>
        </div>

        {/* Theme Switcher Toggle */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border-2 border-b-[4px] border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 active:border-b-[2px] active:translate-y-[2px] transition-all duration-100 cursor-pointer shadow-sm"
          title="สลับธีม (Light/Dark)"
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-game-warning animate-pulse" />
          ) : (
            <Moon className="w-5 h-5 text-brand-blue" />
          )}
        </button>
      </header>

      {/* Main Container - Left Sidebar + Centered 1024x1024px Canvas */}
      <main className="flex-1 w-full flex flex-col lg:flex-row items-stretch select-none overflow-hidden">

        {/* ── Left Inspector Panel — Vertical Tabs ── */}
        <aside className="w-80 shrink-0 flex flex-row bg-white dark:bg-[#1e1e1e] border-r border-slate-200 dark:border-[#333] overflow-hidden text-[11px] font-mono select-none">

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
                onClick={() => switchPanel(tab.key)}
                title={tab.label}
                className={`w-9 flex flex-col items-center gap-0.5 py-2.5 rounded-lg transition-colors cursor-pointer ${
                  activePanel === tab.key
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
                    Transform
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
                    <span className="text-blue-500 dark:text-[#9cdcfe] w-20 shrink-0">Scale</span>
                    <input type="range" min="0.2" max="3.0" step="0.01" value={gridScale}
                      onChange={e => setGridScale(parseFloat(e.target.value))}
                      className="flex-1 accent-brand-blue dark:accent-[#569cd6] h-1 cursor-pointer" />
                    <input type="number" min="0.2" max="3.0" step="0.01" value={gridScale.toFixed(2)}
                      onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) setGridScale(Math.min(3, Math.max(0.2, v))); }}
                      className="w-10 bg-transparent border-b border-slate-200 dark:border-[#444] text-right text-slate-700 dark:text-[#d4d4d4] tabular-nums outline-none focus:border-brand-blue dark:focus:border-[#569cd6] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                  </div>

                  <div className="flex items-center gap-2 px-3 py-1.5 border-b border-slate-100 dark:border-[#2a2a2a]">
                    <span className="text-blue-500 dark:text-[#9cdcfe] w-20 shrink-0">Opacity</span>
                    <input type="range" min="0" max="80" step="0.5" value={(gridOpacity * 100).toFixed(0)}
                      onChange={e => setGridOpacity(parseFloat(e.target.value) / 100)}
                      className="flex-1 accent-brand-blue dark:accent-[#569cd6] h-1 cursor-pointer" />
                    <input type="number" min="0" max="80" step="1" value={(gridOpacity * 100).toFixed(0)}
                      onChange={e => { const v = parseFloat(e.target.value); if (!isNaN(v)) setGridOpacity(Math.min(80, Math.max(0, v)) / 100); }}
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
                    Position
                  </div>
                  {[
                    { label: "X", value: gridPos.x, color: "text-red-400 dark:text-[#f47067]" },
                    { label: "Y", value: gridPos.y, color: "text-green-500 dark:text-[#6dbe6d]" },
                    { label: "Z", value: gridPos.z, color: "text-brand-blue dark:text-[#569cd6]" },
                  ].map(axis => (
                    <div key={axis.label} className="flex items-center px-3 py-1 border-b border-slate-100 dark:border-[#2a2a2a]">
                      <span className={`w-3 font-black mr-2 ${axis.color}`}>{axis.label}</span>
                      <span className="flex-1 text-slate-700 dark:text-[#d4d4d4] tabular-nums">{axis.value.toFixed(3)}</span>
                    </div>
                  ))}
                </>
              )}

              {/* ── CHARACTERS PANEL ── */}
              {activePanel === "characters" && (
                <>
                  <div className="px-2 py-1 bg-slate-100 dark:bg-[#252525] border-b border-slate-200 dark:border-[#333] text-slate-400 dark:text-[#888] text-[9px] uppercase tracking-widest font-bold flex items-center justify-between">
                    <span>Models ({MASCOTS.length})</span>
                    {selectedMascot && (
                      <button onClick={() => setSelectedMascot(null)} className="text-red-400 hover:text-red-500 dark:text-[#f47067] dark:hover:text-red-400 text-[9px] cursor-pointer">✕ Cancel</button>
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-1 p-2 border-b border-slate-200 dark:border-[#333]">
                    {MASCOTS.map(mascot => {
                      const isLoaded = loadedMascotIds.includes(mascot.id);
                      const isSelected = selectedMascot === mascot.id;
                      return (
                        <button
                          key={mascot.id}
                          onClick={() => { setSelectedMascot(isSelected ? null : mascot.id); switchPanel("characters"); }}
                          title={mascot.name}
                          className={`relative flex flex-col items-center p-1 rounded-lg border transition-all cursor-pointer ${
                            isSelected
                              ? "border-brand-blue dark:border-[#569cd6] bg-blue-50 dark:bg-[#1a3a5a]"
                              : "border-slate-200 dark:border-[#333] hover:border-slate-300 dark:hover:border-[#555] bg-slate-50 dark:bg-[#252525] hover:bg-slate-100 dark:hover:bg-[#2e2e2e]"
                          }`}
                        >
                          <img src={mascot.previewPath} alt={mascot.name} className="w-8 h-8 object-contain" />
                          <span className="text-[7px] text-slate-400 dark:text-[#888] truncate w-full text-center mt-0.5">{mascot.name.replace("Blocky ", "")}</span>
                          {!isLoaded && (
                            <div className="absolute inset-0 bg-black/30 dark:bg-black/50 rounded-lg flex items-center justify-center">
                              <span className="text-[7px] text-slate-500 dark:text-[#888]">…</span>
                            </div>
                          )}
                          {isSelected && <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-brand-blue dark:bg-[#569cd6]" />}
                        </button>
                      );
                    })}
                  </div>

                  {selectedMascot && (
                    <div className="mx-2 my-1.5 px-2 py-1.5 rounded-lg bg-blue-50 dark:bg-[#1a3a5a] border border-blue-200 dark:border-[#2a5a8a] text-brand-blue dark:text-[#569cd6] text-[9px] font-bold text-center animate-pulse">
                      Click grid tile to place
                    </div>
                  )}

                  <div className="px-2 py-1 bg-slate-100 dark:bg-[#252525] border-b border-slate-200 dark:border-[#333] text-slate-400 dark:text-[#888] text-[9px] uppercase tracking-widest font-bold">
                    Selected
                  </div>

                  {selectedChar ? (() => {
                    const info = MASCOTS.find(m => m.id === selectedChar.mascotId);
                    return (
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 dark:border-[#2a2a2a]">
                          {info && <img src={info.previewPath} alt={info.name} className="w-5 h-5 object-contain" />}
                          <span className="text-slate-700 dark:text-[#d4d4d4] font-bold truncate">{info?.name || "Character"}</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 border-b border-slate-100 dark:border-[#2a2a2a]">
                          <span className="text-blue-500 dark:text-[#9cdcfe] w-14 shrink-0">Scale</span>
                          <input type="range" min="0.3" max="3.0" step="0.01" value={selectedChar.scaleX}
                            onChange={e => { const val = parseFloat(e.target.value); setPlacedCharacters(prev => prev.map(c => c.id === selectedCharId ? { ...c, scaleX: val, scaleY: val, scaleZ: val } : c)); }}
                            className="flex-1 accent-brand-blue dark:accent-[#569cd6] h-1 cursor-pointer" />
                          <input type="number" min="0.3" max="3.0" step="0.1" value={selectedChar.scaleX.toFixed(1)}
                            onChange={e => { const val = parseFloat(e.target.value); if (!isNaN(val)) setPlacedCharacters(prev => prev.map(c => c.id === selectedCharId ? { ...c, scaleX: Math.min(3, Math.max(0.3, val)), scaleY: Math.min(3, Math.max(0.3, val)), scaleZ: Math.min(3, Math.max(0.3, val)) } : c)); }}
                            className="w-9 bg-transparent border-b border-slate-200 dark:border-[#444] text-right text-slate-700 dark:text-[#d4d4d4] tabular-nums outline-none focus:border-brand-blue dark:focus:border-[#569cd6] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                        </div>

                        {/* Rotation row */}
                        <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-slate-100 dark:border-[#2a2a2a]">
                          <span className="text-blue-500 dark:text-[#9cdcfe] w-14 shrink-0 text-[9px]">Rotate</span>
                          <button
                            onClick={() => setPlacedCharacters(prev => prev.map(c => c.id === selectedCharId ? { ...c, rotationY: (c.rotationY ?? 0) + Math.PI / 2 } : c))}
                            title="หมุนซ้าย 90° (A)"
                            className="w-6 h-6 flex items-center justify-center rounded bg-slate-100 dark:bg-[#333] hover:bg-slate-200 dark:hover:bg-[#444] text-slate-600 dark:text-[#aaa] text-[10px] font-bold cursor-pointer transition-colors shrink-0"
                          >◀</button>
                          <input
                            type="range" min="0" max="360" step="1"
                            value={Math.round(((((selectedChar.rotationY ?? 0) * 180 / Math.PI) % 360) + 360) % 360)}
                            onChange={e => {
                              const deg = parseFloat(e.target.value);
                              setPlacedCharacters(prev => prev.map(c => c.id === selectedCharId ? { ...c, rotationY: deg * Math.PI / 180 } : c));
                            }}
                            className="flex-1 accent-brand-blue dark:accent-[#569cd6] h-1 cursor-pointer"
                          />
                          <span className="w-8 text-right tabular-nums text-slate-600 dark:text-[#d4d4d4] text-[9px] shrink-0">
                            {Math.round(((((selectedChar.rotationY ?? 0) * 180 / Math.PI) % 360) + 360) % 360)}°
                          </span>
                          <button
                            onClick={() => setPlacedCharacters(prev => prev.map(c => c.id === selectedCharId ? { ...c, rotationY: (c.rotationY ?? 0) - Math.PI / 2 } : c))}
                            title="หมุนขวา 90° (D)"
                            className="w-6 h-6 flex items-center justify-center rounded bg-slate-100 dark:bg-[#333] hover:bg-slate-200 dark:hover:bg-[#444] text-slate-600 dark:text-[#aaa] text-[10px] font-bold cursor-pointer transition-colors shrink-0"
                          >▶</button>
                        </div>

                        {/* Animation selector */}
                        {(() => {
                          const clips = loadedAnimsRef.current[selectedChar.mascotId];
                          if (!clips || clips.length === 0) return null;
                          const currentClip = selectedChar.activeAnimName || activeAnimNameRef.current[selectedChar.id] || "";
                          return (
                            <>
                              <div className="px-2 py-1 bg-slate-100 dark:bg-[#252525] border-b border-slate-200 dark:border-[#333] text-slate-400 dark:text-[#888] text-[9px] uppercase tracking-widest font-bold">
                                Animations ({clips.length})
                              </div>
                              <div className="flex flex-wrap gap-1 px-2 py-2 border-b border-slate-100 dark:border-[#2a2a2a]">
                                {clips.map(clip => {
                                  const isActive = currentClip === clip.name;
                                  const label = clip.name.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
                                  return (
                                    <button
                                      key={clip.name}
                                      onClick={() => switchCharAnim(selectedChar.id, clip.name)}
                                      title={clip.name}
                                      className={`px-2 py-1 rounded text-[8px] font-bold transition-all cursor-pointer border ${
                                        isActive
                                          ? "bg-brand-blue dark:bg-[#1a4a8a] border-brand-blue dark:border-[#569cd6] text-white dark:text-[#9cdcfe]"
                                          : "bg-slate-50 dark:bg-[#2a2a2a] border-slate-200 dark:border-[#3a3a3a] text-slate-500 dark:text-[#888] hover:border-slate-400 dark:hover:border-[#555] hover:text-slate-700 dark:hover:text-[#ccc]"
                                      }`}
                                    >
                                      {isActive && <span className="mr-1">▶</span>}
                                      {label}
                                    </button>
                                  );
                                })}
                              </div>
                            </>
                          );
                        })()}

                        {/* WASD hint row */}
                        <div className="px-3 py-1 border-b border-slate-100 dark:border-[#2a2a2a]">
                          <p className="text-[8px] text-slate-400 dark:text-[#666] leading-relaxed">
                            <span className="font-bold text-slate-500 dark:text-[#888]">A/D</span> หมุน ·{" "}
                            <span className="font-bold text-slate-500 dark:text-[#888]">W/S</span> เดินตามหน้าหัน
                          </p>
                        </div>

                        <button
                          onClick={() => { setPlacedCharacters(prev => prev.filter(c => c.id !== selectedCharId)); setSelectedCharId(null); }}
                          className="mx-3 my-2 py-1.5 rounded-lg bg-red-50 dark:bg-[#3a1a1a] hover:bg-red-100 dark:hover:bg-[#4a2020] border border-red-200 dark:border-[#5a2020] text-red-500 dark:text-[#f47067] text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                        >✕ Remove</button>
                      </div>
                    );
                  })() : (
                    <div className="px-3 py-4 text-slate-400 dark:text-[#555] text-[9px] text-center">No character selected</div>
                  )}

                  {placedCharacters.length > 0 && (
                    <>
                      <div className="px-2 py-1 bg-slate-100 dark:bg-[#252525] border-b border-slate-200 dark:border-[#333] text-slate-400 dark:text-[#888] text-[9px] uppercase tracking-widest font-bold">
                        Scene ({placedCharacters.length})
                      </div>
                      <div className="overflow-y-auto">
                        {placedCharacters.map((char, i) => {
                          const info = MASCOTS.find(m => m.id === char.mascotId);
                          return (
                            <div key={char.id} onClick={() => setSelectedCharId(char.id)}
                              className={`flex items-center gap-2 px-3 py-1.5 border-b border-slate-100 dark:border-[#2a2a2a] cursor-pointer transition-colors ${
                                selectedCharId === char.id
                                  ? "bg-blue-50 dark:bg-[#1a3a5a] text-brand-blue dark:text-[#569cd6]"
                                  : "hover:bg-slate-50 dark:hover:bg-[#252525] text-slate-400 dark:text-[#888]"
                              }`}
                            >
                              {info && <img src={info.previewPath} alt="" className="w-4 h-4 object-contain shrink-0" />}
                              <span className="flex-1 truncate text-[9px]">{info?.name.replace("Blocky ", "") || "?"} #{i + 1}</span>
                              <span className="text-[8px] tabular-nums opacity-60">{char.gridX},{char.gridZ}</span>
                              <button
                                onClick={e => { e.stopPropagation(); setPlacedCharacters(prev => prev.filter(c => c.id !== char.id)); if (selectedCharId === char.id) setSelectedCharId(null); }}
                                className="text-red-400 dark:text-[#f47067] hover:text-red-500 text-[8px] ml-1 cursor-pointer"
                              >✕</button>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </>
              )}

              {/* ── TILES PANEL ── */}
              {activePanel === "tiles" && (
                <>
                  <div className="px-2 py-1 bg-slate-100 dark:bg-[#252525] border-b border-slate-200 dark:border-[#333] text-slate-400 dark:text-[#888] text-[9px] uppercase tracking-widest font-bold">
                    วิธีใช้
                  </div>

                  <div className="px-3 py-2 border-b border-slate-100 dark:border-[#2a2a2a]">
                    <p className="text-[9px] text-slate-500 dark:text-[#888] leading-relaxed mb-2">
                      คลิกช่องกริดเพื่อสลับสถานะเดิน
                    </p>
                    <div className="flex gap-3 text-[9px] text-slate-500 dark:text-[#888]">
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-green-400/70 border border-green-500/50 inline-block shrink-0" />
                        เดินได้
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-red-500/70 border border-red-600/50 inline-block shrink-0" />
                        เดินไม่ได้
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

                  {blockedTiles.size > 0 && (
                    <>
                      <button
                        onClick={() => setBlockedTiles(new Set())}
                        className="mx-3 mt-2 py-1.5 rounded-lg bg-red-50 dark:bg-[#3a1a1a] hover:bg-red-100 dark:hover:bg-[#4a2020] border border-red-200 dark:border-[#5a2020] text-red-500 dark:text-[#f47067] text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        ✕ Clear ทั้งหมด
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
                              >✕</button>
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
                        >✕</button>
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
                        <span className="absolute top-1 left-1 bg-green-500 text-white text-[7px] font-bold px-1.5 py-0.5 rounded-full">✓ captured</span>
                      </div>
                    )}
                  </div>

                  {/* Step 2 — Theme */}
                  <div className="px-2 pt-1 pb-1 bg-slate-50 dark:bg-[#252525] border-y border-slate-200 dark:border-[#333]">
                    <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400 dark:text-[#666]">ขั้นตอนที่ 2 — ใส่ Theme / Detail</span>
                  </div>
                  <div className="px-2 py-2 flex flex-col gap-1.5">
                    <p className="text-[9px] text-slate-500 dark:text-[#888] leading-relaxed">
                      อธิบายบรรยากาศ / สถานที่ / สไตล์ที่ต้องการ
                    </p>
                    <textarea
                      value={aiThemeText}
                      onChange={e => setAiThemeText(e.target.value)}
                      placeholder="เช่น: ninja village in feudal Japan, cherry blossom trees, lanterns, night time, moonlight..."
                      rows={4}
                      className="w-full text-[9px] p-2 rounded-lg border border-slate-200 dark:border-[#444] bg-white dark:bg-[#1a1a1a] text-slate-700 dark:text-[#d4d4d4] placeholder-slate-300 dark:placeholder-[#555] resize-none focus:outline-none focus:ring-1 focus:ring-indigo-400 dark:focus:ring-[#6060cc] leading-relaxed"
                    />
                  </div>

                  {/* Step 3 — Prompt */}
                  <div className="px-2 pt-1 pb-1 bg-slate-50 dark:bg-[#252525] border-y border-slate-200 dark:border-[#333]">
                    <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400 dark:text-[#666]">ขั้นตอนที่ 3 — Copy Prompt</span>
                  </div>
                  <div className="px-2 py-2 flex flex-col gap-1.5">
                    <p className="text-[9px] text-slate-500 dark:text-[#888] leading-relaxed">
                      Copy prompt + แนบภาพ reference ไป AI เช่น Midjourney, DALL·E, Ideogram
                    </p>
                    <pre className="text-[8px] bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#333] rounded-lg p-2 text-slate-600 dark:text-[#aaa] whitespace-pre-wrap leading-relaxed font-mono max-h-48 overflow-y-auto">
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
                      {aiPromptCopied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy Prompt</>}
                    </button>
                    {!aiCaptureUrl && (
                      <p className="text-[8px] text-amber-500 dark:text-[#fbbf24] text-center">
                        อย่าลืม Capture ภาพก่อนส่งไป AI
                      </p>
                    )}
                  </div>

                </div>
              )}

            </div>
          </div>

        </aside>

        {/* Playfield Container - Centered exactly 1024x1024px Canvas */}
        <div className="flex-1 flex items-center justify-center p-6 overflow-auto bg-slate-100 dark:bg-slate-950">
          
          {/* Exact 1024x1024 Card Container */}
          <div className="w-[1024px] h-[1024px] border-4 border-slate-300 dark:border-slate-800/80 rounded-[40px] overflow-hidden bg-slate-200 dark:bg-slate-900 shadow-2xl relative shrink-0">
            
            {/* Three.js Canvas mount container */}
            <div
              ref={mountRef}
              className="w-full h-full"
              style={currentBgStyle}
            />

          </div>

        </div>
      </main>

    </div>
  );
}
