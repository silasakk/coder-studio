"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { X } from "lucide-react";

// Rendered thumbnails, keyed by modelPath. Renders once per session per model.
const thumbnailCache = new Map<string, string>();

// ── Shared WebGL context ──────────────────────────────────────────────
// All thumbnails share ONE WebGLRenderer. Browsers cap live WebGL contexts
// (~16), so creating one renderer per thumbnail caused "Too many active
// WebGL contexts" + context loss when many models scrolled into view at
// once. render()/toDataURL() are synchronous, so a single context serves
// every thumbnail safely.
const RENDER_SIZE = 128; // offscreen pixel size (size * 2 in old code)
let sharedRenderer: THREE.WebGLRenderer | null = null;
let sharedCamera: THREE.PerspectiveCamera | null = null;
let sharedScene: THREE.Scene | null = null;

function ensureShared() {
  if (sharedRenderer) return;
  const canvas = document.createElement("canvas");
  canvas.width = RENDER_SIZE;
  canvas.height = RENDER_SIZE;
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setSize(RENDER_SIZE, RENDER_SIZE);
  renderer.setPixelRatio(1);
  renderer.shadowMap.enabled = false;

  const camera = new THREE.PerspectiveCamera(40, 1, 0.001, 10000);

  const scene = new THREE.Scene();
  scene.add(new THREE.AmbientLight(0xffffff, 0.85));
  const d = new THREE.DirectionalLight(0xfff5e0, 1.3);
  d.position.set(2, 3, 2);
  scene.add(d);
  const r = new THREE.DirectionalLight(0xbde5f8, 0.45);
  r.position.set(-2, 1, -2);
  scene.add(r);

  sharedRenderer = renderer;
  sharedCamera = camera;
  sharedScene = scene;
}

// ── Bounded render queue ──────────────────────────────────────────────
// GLB network loads are the only async work; allow up to MAX in flight.
// When a load resolves we render synchronously on the shared renderer.
const MAX_CONCURRENT = 3;
interface Task {
  modelPath: string;
  cancelled: boolean;
  resolve: (url: string | null) => void;
}
const pending: Task[] = [];
let active = 0;

function pump() {
  while (active < MAX_CONCURRENT && pending.length > 0) {
    const task = pending.shift()!;
    if (task.cancelled) continue;

    const cached = thumbnailCache.get(task.modelPath);
    if (cached) {
      task.resolve(cached);
      continue;
    }

    active++;
    const loader = new GLTFLoader();
    loader.load(
      task.modelPath,
      (gltf) => {
        active--;
        try {
          if (!task.cancelled) {
            const url = renderModel(gltf.scene);
            thumbnailCache.set(task.modelPath, url);
            task.resolve(url);
          }
        } finally {
          disposeModel(gltf.scene);
          pump();
        }
      },
      undefined,
      () => {
        active--;
        if (!task.cancelled) task.resolve(null);
        pump();
      }
    );
  }
}

function renderModel(model: THREE.Object3D): string {
  ensureShared();
  const renderer = sharedRenderer!;
  const camera = sharedCamera!;
  const scene = sharedScene!;

  scene.add(model);

  const box = new THREE.Box3().setFromObject(model);
  const sz = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxDim = Math.max(sz.x, sz.y, sz.z) || 1;

  const dist = maxDim * 1.8;
  camera.position.set(
    center.x + dist * 0.6,
    center.y + dist * 0.55,
    center.z + dist * 0.6
  );
  camera.lookAt(center);
  camera.near = dist * 0.001;
  camera.far = dist * 100;
  camera.updateProjectionMatrix();

  renderer.render(scene, camera);
  const url = renderer.domElement.toDataURL("image/webp", 0.88);

  scene.remove(model);
  return url;
}

function disposeModel(model: THREE.Object3D) {
  model.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    if (mesh.material) {
      const mats = Array.isArray(mesh.material)
        ? (mesh.material as THREE.Material[])
        : [mesh.material as THREE.Material];
      mats.forEach((m) => {
        if ((m as THREE.MeshStandardMaterial).map)
          (m as THREE.MeshStandardMaterial).map?.dispose();
        m.dispose();
      });
    }
  });
}

function enqueue(modelPath: string): Task {
  const task: Task = { modelPath, cancelled: false, resolve: () => {} };
  const promise = new Promise<string | null>((res) => {
    task.resolve = res;
  });
  pending.push(task);
  pump();
  // Stash the promise on the task for the caller.
  (task as Task & { promise: Promise<string | null> }).promise = promise;
  return task;
}

interface ModelThumbnailProps {
  modelPath: string;
  previewPath?: string;
  size?: number;
  className?: string;
}

export default function ModelThumbnail({
  modelPath,
  previewPath,
  size = 64,
  className = "",
}: ModelThumbnailProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(
    thumbnailCache.get(modelPath) ?? null
  );
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (previewPath) return;
    if (thumbnailCache.has(modelPath)) {
      setDataUrl(thumbnailCache.get(modelPath)!);
      return;
    }

    const el = containerRef.current;
    if (!el) return;

    let task: Task | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          observer.disconnect();
          task = enqueue(modelPath);
          (task as Task & { promise: Promise<string | null> }).promise.then(
            (url) => {
              if (url) setDataUrl(url);
              else setFailed(true);
            }
          );
        }
      },
      { rootMargin: "120px" }
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      if (task) task.cancelled = true;
    };
  }, [modelPath, previewPath]);

  if (previewPath) {
    return (
      <img
        src={previewPath}
        alt=""
        className={className}
        style={{ width: size, height: size, objectFit: "contain" }}
        draggable={false}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      style={{ width: size, height: size, flexShrink: 0 }}
      className={className}
    >
      {dataUrl ? (
        <img
          src={dataUrl}
          alt=""
          style={{ width: size, height: size, objectFit: "contain" }}
          draggable={false}
        />
      ) : failed ? (
        <div
          style={{ width: size, height: size }}
          className="flex items-center justify-center bg-slate-800/40 rounded"
        >
          <X className="w-3 h-3 text-slate-500" />
        </div>
      ) : (
        <div
          style={{ width: size, height: size }}
          className="rounded bg-slate-700/30 animate-pulse"
        />
      )}
    </div>
  );
}
