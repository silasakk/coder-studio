"use client";
import React, { useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronUp,
  Search,
  Sparkles,
  X,
  User,
  Box,
  Skull,
  Gamepad2,
  Swords,
  ShoppingCart,
  Hexagon,
  type LucideIcon,
} from "lucide-react";
import ModelThumbnail from "./ModelThumbnail";

export interface AssetItem {
  id: string;
  name: string;
  modelPath: string;
  previewPath?: string;
}

interface Collection {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
  items: AssetItem[];
  subFilter?: boolean;
}

const fmt = (s: string) =>
  s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const blockyItems: AssetItem[] = [
  "a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r",
].map((ch) => ({
  id: `character-${ch}`,
  name: `Character ${ch.toUpperCase()}`,
  modelPath: `/blocky_characters/Models/GLB format/character-${ch}.glb`,
  previewPath: `/blocky_characters/Previews/character-${ch}.png`,
}));

const mkItems = (collId: string, base: string, names: string[]): AssetItem[] =>
  names.map((n) => ({ id: `${collId}:${n}`, name: fmt(n), modelPath: `/assets/${base}/${n}.glb` }));

const brickNames = [
  "bevel-hq-brick-1x1","bevel-hq-brick-1x1-round","bevel-hq-brick-1x2",
  "bevel-hq-brick-1x4","bevel-hq-brick-1x6","bevel-hq-brick-1x8",
  "bevel-hq-brick-2x2","bevel-hq-brick-2x4","bevel-hq-brick-2x6",
  "bevel-hq-brick-2x8","bevel-hq-brick-corner","bevel-hq-brick-slope-1x2",
  "bevel-hq-brick-slope-2x2","bevel-hq-brick-slope-2x3","bevel-hq-brick-slope-2x4",
  "bevel-hq-brick-slope-3x1","bevel-hq-brick-slope-3x2",
  "bevel-hq-brick-slope-corner-inside-2x2","bevel-hq-brick-slope-corner-inside-inverted-2x2",
  "bevel-hq-brick-slope-corner-outside-2x2","bevel-hq-brick-slope-corner-outside-inverted-2x2",
  "bevel-hq-brick-slope-inverted-1x2","bevel-hq-brick-slope-inverted-2x2",
  "bevel-hq-plate-1x1","bevel-hq-plate-1x1-round","bevel-hq-plate-1x2",
  "bevel-hq-plate-1x4","bevel-hq-plate-1x6","bevel-hq-plate-1x8",
  "bevel-hq-plate-2x2","bevel-hq-plate-2x4","bevel-hq-plate-2x6","bevel-hq-plate-2x8",
  "bevel-hq-plate-4x4","bevel-hq-plate-4x6","bevel-hq-plate-4x8","bevel-hq-plate-corner",
  "bevel-lq-brick-1x1","bevel-lq-brick-1x1-round","bevel-lq-brick-1x2",
  "bevel-lq-brick-1x4","bevel-lq-brick-1x6","bevel-lq-brick-1x8",
  "bevel-lq-brick-2x2","bevel-lq-brick-2x4","bevel-lq-brick-2x6",
  "bevel-lq-brick-2x8","bevel-lq-brick-corner","bevel-lq-brick-slope-1x2",
  "bevel-lq-brick-slope-2x2","bevel-lq-brick-slope-2x3","bevel-lq-brick-slope-2x4",
  "bevel-lq-brick-slope-3x1","bevel-lq-brick-slope-3x2",
  "bevel-lq-brick-slope-corner-inside-2x2","bevel-lq-brick-slope-corner-inside-inverted-2x2",
  "bevel-lq-brick-slope-corner-outside-2x2","bevel-lq-brick-slope-corner-outside-inverted-2x2",
  "bevel-lq-brick-slope-inverted-1x2","bevel-lq-brick-slope-inverted-2x2",
  "bevel-lq-plate-1x1","bevel-lq-plate-1x1-round","bevel-lq-plate-1x2",
  "bevel-lq-plate-1x4","bevel-lq-plate-1x6","bevel-lq-plate-1x8",
  "bevel-lq-plate-2x2","bevel-lq-plate-2x4","bevel-lq-plate-2x6","bevel-lq-plate-2x8",
  "bevel-lq-plate-4x4","bevel-lq-plate-4x6","bevel-lq-plate-4x8","bevel-lq-plate-corner",
  "none-hq-brick-1x1","none-hq-brick-1x1-round","none-hq-brick-1x2",
  "none-hq-brick-1x4","none-hq-brick-1x6","none-hq-brick-1x8",
  "none-hq-brick-2x2","none-hq-brick-2x4","none-hq-brick-2x6",
  "none-hq-brick-2x8","none-hq-brick-corner","none-hq-brick-slope-1x2",
  "none-hq-brick-slope-2x2","none-hq-brick-slope-2x3","none-hq-brick-slope-2x4",
  "none-hq-brick-slope-3x1","none-hq-brick-slope-3x2",
  "none-hq-brick-slope-corner-inside-2x2","none-hq-brick-slope-corner-inside-inverted-2x2",
  "none-hq-brick-slope-corner-outside-2x2","none-hq-brick-slope-corner-outside-inverted-2x2",
  "none-hq-brick-slope-inverted-1x2","none-hq-brick-slope-inverted-2x2",
  "none-hq-plate-1x1","none-hq-plate-1x1-round","none-hq-plate-1x2",
  "none-hq-plate-1x4","none-hq-plate-1x6","none-hq-plate-1x8",
  "none-hq-plate-2x2","none-hq-plate-2x4","none-hq-plate-2x6","none-hq-plate-2x8",
  "none-hq-plate-4x4","none-hq-plate-4x6","none-hq-plate-4x8","none-hq-plate-corner",
  "none-lq-brick-1x1","none-lq-brick-1x1-round","none-lq-brick-1x2",
  "none-lq-brick-1x4","none-lq-brick-1x6","none-lq-brick-1x8",
  "none-lq-brick-2x2","none-lq-brick-2x4","none-lq-brick-2x6",
  "none-lq-brick-2x8","none-lq-brick-corner","none-lq-brick-slope-1x2",
  "none-lq-brick-slope-2x2","none-lq-brick-slope-2x3","none-lq-brick-slope-2x4",
  "none-lq-brick-slope-3x1","none-lq-brick-slope-3x2",
  "none-lq-brick-slope-corner-inside-2x2","none-lq-brick-slope-corner-inside-inverted-2x2",
  "none-lq-brick-slope-corner-outside-2x2","none-lq-brick-slope-corner-outside-inverted-2x2",
  "none-lq-brick-slope-inverted-1x2","none-lq-brick-slope-inverted-2x2",
  "none-lq-plate-1x1","none-lq-plate-1x1-round","none-lq-plate-1x2",
  "none-lq-plate-1x4","none-lq-plate-1x6","none-lq-plate-1x8",
  "none-lq-plate-2x2","none-lq-plate-2x4","none-lq-plate-2x6","none-lq-plate-2x8",
  "none-lq-plate-4x4","none-lq-plate-4x6","none-lq-plate-4x8","none-lq-plate-corner",
  "round-hq-brick-1x1","round-hq-brick-1x1-round","round-hq-brick-1x2",
  "round-hq-brick-1x4","round-hq-brick-1x6","round-hq-brick-1x8",
  "round-hq-brick-2x2","round-hq-brick-2x4","round-hq-brick-2x6",
  "round-hq-brick-2x8","round-hq-brick-corner","round-hq-brick-slope-1x2",
  "round-hq-brick-slope-2x2","round-hq-brick-slope-2x3","round-hq-brick-slope-2x4",
  "round-hq-brick-slope-3x1","round-hq-brick-slope-3x2",
  "round-hq-brick-slope-corner-inside-2x2","round-hq-brick-slope-corner-inside-inverted-2x2",
  "round-hq-brick-slope-corner-outside-2x2","round-hq-brick-slope-corner-outside-inverted-2x2",
  "round-hq-brick-slope-inverted-1x2","round-hq-brick-slope-inverted-2x2",
  "round-hq-plate-1x1","round-hq-plate-1x1-round","round-hq-plate-1x2",
  "round-hq-plate-1x4","round-hq-plate-1x6","round-hq-plate-1x8",
  "round-hq-plate-2x2","round-hq-plate-2x4","round-hq-plate-2x6","round-hq-plate-2x8",
  "round-hq-plate-4x4","round-hq-plate-4x6","round-hq-plate-4x8","round-hq-plate-corner",
  "round-lq-brick-1x1","round-lq-brick-1x1-round","round-lq-brick-1x2",
  "round-lq-brick-1x4","round-lq-brick-1x6","round-lq-brick-1x8",
  "round-lq-brick-2x2","round-lq-brick-2x4","round-lq-brick-2x6",
  "round-lq-brick-2x8","round-lq-brick-corner","round-lq-brick-slope-1x2",
  "round-lq-brick-slope-2x2","round-lq-brick-slope-2x3","round-lq-brick-slope-2x4",
  "round-lq-brick-slope-3x1","round-lq-brick-slope-3x2",
  "round-lq-brick-slope-corner-inside-2x2","round-lq-brick-slope-corner-inside-inverted-2x2",
  "round-lq-brick-slope-corner-outside-2x2","round-lq-brick-slope-corner-outside-inverted-2x2",
  "round-lq-brick-slope-inverted-1x2","round-lq-brick-slope-inverted-2x2",
  "round-lq-plate-1x1","round-lq-plate-1x1-round","round-lq-plate-1x2",
  "round-lq-plate-1x4","round-lq-plate-1x6","round-lq-plate-1x8",
  "round-lq-plate-2x2","round-lq-plate-2x4","round-lq-plate-2x6","round-lq-plate-2x8",
  "round-lq-plate-4x4","round-lq-plate-4x6","round-lq-plate-4x8","round-lq-plate-corner",
  "square-hq-brick-1x1","square-hq-brick-1x1-round","square-hq-brick-1x2",
  "square-hq-brick-1x4","square-hq-brick-1x6","square-hq-brick-1x8",
  "square-hq-brick-2x2","square-hq-brick-2x4","square-hq-brick-2x6",
  "square-hq-brick-2x8","square-hq-brick-corner","square-hq-brick-slope-1x2",
  "square-hq-brick-slope-2x2","square-hq-brick-slope-2x3","square-hq-brick-slope-2x4",
  "square-hq-brick-slope-3x1","square-hq-brick-slope-3x2",
  "square-hq-brick-slope-corner-inside-2x2","square-hq-brick-slope-corner-inside-inverted-2x2",
  "square-hq-brick-slope-corner-outside-2x2","square-hq-brick-slope-corner-outside-inverted-2x2",
  "square-hq-brick-slope-inverted-1x2","square-hq-brick-slope-inverted-2x2",
  "square-hq-plate-1x1","square-hq-plate-1x1-round","square-hq-plate-1x2",
  "square-hq-plate-1x4","square-hq-plate-1x6","square-hq-plate-1x8",
  "square-hq-plate-2x2","square-hq-plate-2x4","square-hq-plate-2x6","square-hq-plate-2x8",
  "square-hq-plate-4x4","square-hq-plate-4x6","square-hq-plate-4x8","square-hq-plate-corner",
  "square-lq-brick-1x1","square-lq-brick-1x1-round","square-lq-brick-1x2",
  "square-lq-brick-1x4","square-lq-brick-1x6","square-lq-brick-1x8",
  "square-lq-brick-2x2","square-lq-brick-2x4","square-lq-brick-2x6",
  "square-lq-brick-2x8","square-lq-brick-corner","square-lq-brick-slope-1x2",
  "square-lq-brick-slope-2x2","square-lq-brick-slope-2x3","square-lq-brick-slope-2x4",
  "square-lq-brick-slope-3x1","square-lq-brick-slope-3x2",
  "square-lq-brick-slope-corner-inside-2x2","square-lq-brick-slope-corner-inside-inverted-2x2",
  "square-lq-brick-slope-corner-outside-2x2","square-lq-brick-slope-corner-outside-inverted-2x2",
  "square-lq-brick-slope-inverted-1x2","square-lq-brick-slope-inverted-2x2",
  "square-lq-plate-1x1","square-lq-plate-1x1-round","square-lq-plate-1x2",
  "square-lq-plate-1x4","square-lq-plate-1x6","square-lq-plate-1x8",
  "square-lq-plate-2x2","square-lq-plate-2x4","square-lq-plate-2x6","square-lq-plate-2x8",
  "square-lq-plate-4x4","square-lq-plate-4x6","square-lq-plate-4x8","square-lq-plate-corner",
];

const graveyardNames = [
  "altar-stone","altar-wood","bench","bench-damaged","border-pillar","brick-wall",
  "brick-wall-curve","brick-wall-curve-small","brick-wall-end","candle","candle-multiple",
  "character-ghost","character-keeper","character-skeleton","character-vampire","character-zombie",
  "coffin","coffin-old","column-large","cross","cross-column","cross-wood","crypt","crypt-a","crypt-b",
  "crypt-door","crypt-large","crypt-large-door","crypt-large-roof","crypt-small","crypt-small-roof",
  "debris","debris-wood","detail-bowl","detail-chalice","detail-plate","fence","fence-damaged",
  "fence-gate","fire-basket","grave","grave-border","gravestone-bevel","gravestone-broken",
  "gravestone-cross","gravestone-cross-large","gravestone-debris","gravestone-decorative",
  "gravestone-roof","gravestone-round","gravestone-wide","hay-bale","hay-bale-bundled","iron-fence",
  "iron-fence-bar","iron-fence-border","iron-fence-border-column","iron-fence-border-curve",
  "iron-fence-border-gate","iron-fence-curve","iron-fence-damaged","lantern-candle","lantern-glass",
  "lightpost-all","lightpost-double","lightpost-single","pillar-large","pillar-obelisk","pillar-small",
  "pillar-square","pine","pine-crooked","pine-fall","pine-fall-crooked","pumpkin","pumpkin-carved",
  "pumpkin-tall","pumpkin-tall-carved","road","rocks","rocks-tall","shovel","shovel-dirt",
  "stone-wall","stone-wall-column","stone-wall-curve","stone-wall-damaged","trunk","trunk-long",
  "urn-round","urn-square",
];

const arcadeNames = [
  "air-hockey","arcade-machine","basketball-game","cash-register","character-employee",
  "character-gamer","claw-machine","column","dance-machine","floor","gambling-machine",
  "pinball","prize-wheel","prizes","ticket-machine","vending-machine","wall","wall-corner",
  "wall-door-rotate","wall-window",
];

const dungeonNames = [
  "banner","barrel","character-human","character-orc","chest","coin","column","dirt",
  "floor","floor-detail","gate","rocks","shield-rectangle","shield-round","stairs","stones",
  "trap","wall","wall-half","wall-narrow","wall-opening","weapon-spear","weapon-sword",
  "wood-structure","wood-support",
];

const marketNames = [
  "bottle-return","cash-register","character-employee","column","display-bread","display-fruit",
  "fence","fence-door-rotate","floor","freezer","freezers-standing","shelf-bags","shelf-boxes",
  "shelf-end","shopping-basket","shopping-cart","wall","wall-corner","wall-door-rotate","wall-window",
];

const protoNames = [
  "animal-bison","animal-dog","animal-horse","button-floor-round","button-floor-round-small",
  "button-floor-square","button-floor-square-small","coin","column","column-low","column-rounded",
  "column-rounded-low","column-triangle","column-triangle-low","crate","crate-color","door-garage",
  "door-rotate","door-sliding","door-sliding-double","door-sliding-double-round",
  "door-sliding-double-wide","figurine","figurine-cube","figurine-cube-detailed","figurine-large",
  "flag","floor-diagonal","floor-small-diagonal","floor-small-square","floor-square","floor-thick",
  "floor-thick-corner-diagonal","floor-thick-corner-round","floor-thick-corner-rounded","hat-cap",
  "hat-hard","indicator-doorway","indicator-round-a","indicator-round-b","indicator-round-c",
  "indicator-round-d","indicator-round-e","indicator-round-f","indicator-special-area",
  "indicator-special-arrow","indicator-special-cross","indicator-special-lines","indicator-square-a",
  "indicator-square-b","indicator-square-c","indicator-square-d","indicator-square-e",
  "indicator-square-f","ladder","ladder-color","ladder-top","lever-double","lever-single",
  "number-0","number-1","number-2","number-3","number-4","number-5","number-6","number-7",
  "number-8","number-9","number-double-0","number-double-1","number-double-2","number-double-3",
  "number-double-4","number-double-5","number-double-6","number-double-7","number-double-8",
  "number-double-9","pipe","pipe-corner","pipe-half","pipe-half-section","pipe-section","pipe-split",
  "shape-cube","shape-cube-half","shape-cube-rounded","shape-cylinder","shape-cylinder-detailed",
  "shape-cylinder-half","shape-cylinder-half-detailed","shape-hexagon","shape-hexagon-half",
  "shape-hollow-cylinder","shape-hollow-cylinder-detailed","shape-hollow-cylinder-half",
  "shape-hollow-cylinder-half-detailed","shape-hollow-hexagon","shape-hollow-hexagon-half",
  "shape-slope","shape-triangular-prism","shape-triangular-prism-low","stairs","stairs-diagonal",
  "stairs-diagonal-narrow","stairs-diagonal-small","stairs-diagonal-small-narrow","stairs-narrow",
  "stairs-small","stairs-small-narrow","target-a-round","target-a-square","target-b-round",
  "target-b-square","vehicle","vehicle-convertible","wall","wall-corner","wall-corner-low",
  "wall-corner-rounded","wall-corner-rounded-low","wall-diagonal","wall-diagonal-low","wall-doorway",
  "wall-doorway-garage","wall-doorway-round","wall-doorway-sliding","wall-doorway-wide",
  "wall-doorway-wide-sliding","wall-low","wall-round","wall-round-low","wall-window-barred-large",
  "wall-window-barred-medium","wall-window-barred-small","wall-window-cutout-large",
  "wall-window-cutout-medium","wall-window-cutout-small","wall-window-large","wall-window-medium",
  "wall-window-small","weapon-shield","weapon-sword","wheelchair",
];

const COLLECTIONS: Collection[] = [
  {
    id: "blocky",
    label: "Blocky Chars",
    icon: User,
    color: "#3b82f6",
    items: blockyItems,
  },
  {
    id: "brick-kit",
    label: "Brick Kit",
    icon: Box,
    color: "#f97316",
    items: mkItems("brick-kit", "brick-kit", brickNames),
    subFilter: true,
  },
  {
    id: "graveyard",
    label: "Graveyard",
    icon: Skull,
    color: "#8b5cf6",
    items: mkItems("graveyard", "graveyard-kit", graveyardNames),
  },
  {
    id: "arcade",
    label: "Mini Arcade",
    icon: Gamepad2,
    color: "#ec4899",
    items: mkItems("arcade", "mini-arcade", arcadeNames),
  },
  {
    id: "dungeon",
    label: "Mini Dungeon",
    icon: Swords,
    color: "#78716c",
    items: mkItems("dungeon", "mini-dungeon", dungeonNames),
  },
  {
    id: "market",
    label: "Mini Market",
    icon: ShoppingCart,
    color: "#22c55e",
    items: mkItems("market", "mini-market", marketNames),
  },
  {
    id: "prototype",
    label: "Prototype Kit",
    icon: Hexagon,
    color: "#06b6d4",
    items: mkItems("prototype", "prototype-kit", protoNames),
  },
];

const BRICK_STYLES = ["All", "Bevel", "None", "Round", "Square"] as const;
type BrickStyle = (typeof BRICK_STYLES)[number];

interface AssetPanelProps {
  selectedMascot: string | null;
  onSelectModel: (item: AssetItem) => void;
  onCancelSelect: () => void;
}

export default function AssetPanel({
  selectedMascot,
  onSelectModel,
  onCancelSelect,
}: AssetPanelProps) {
  const [activeCollection, setActiveCollection] = useState("blocky");
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [brickStyle, setBrickStyle] = useState<BrickStyle>("Bevel");

  const collection = COLLECTIONS.find((c) => c.id === activeCollection)!;

  const filteredItems = useMemo(() => {
    let items = collection.items;

    if (activeCollection === "brick-kit" && brickStyle !== "All") {
      // ids are collection-prefixed ("brick-kit:bevel-…"), so match the
      // model name after the colon, which is what carries the style prefix.
      const prefix = brickStyle.toLowerCase();
      items = items.filter((item) => item.id.split(":")[1]?.startsWith(prefix));
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      items = items.filter(
        (item) => item.name.toLowerCase().includes(q) || item.id.includes(q)
      );
    }

    return items;
  }, [collection.items, activeCollection, brickStyle, search]);

  return (
    <div
      className={`w-full shrink-0 bg-white dark:bg-[#1a1a1a] border-t-2 border-slate-200 dark:border-[#2e2e2e] flex flex-col select-none transition-all duration-200 ${
        collapsed ? "h-10" : "h-56"
      }`}
    >
      {/* Top bar: collection tabs + collapse button */}
      <div className="h-10 shrink-0 flex items-stretch border-b border-slate-200 dark:border-[#2e2e2e] bg-slate-50 dark:bg-[#222] overflow-x-auto">
        <div className="flex items-stretch gap-0 flex-1 min-w-0">
          {COLLECTIONS.map((col) => {
            const active = activeCollection === col.id;
            return (
              <button
                key={col.id}
                onClick={() => {
                  setActiveCollection(col.id);
                  setSearch("");
                }}
                className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold whitespace-nowrap border-r border-slate-200 dark:border-[#2e2e2e] transition-colors cursor-pointer shrink-0 ${
                  active
                    ? "bg-white dark:bg-[#1a1a1a] text-slate-800 dark:text-slate-100 border-b-2 border-b-[var(--col-color)]"
                    : "text-slate-400 dark:text-[#666] hover:text-slate-600 dark:hover:text-[#aaa] hover:bg-white/60 dark:hover:bg-[#232323]"
                }`}
                style={active ? ({ "--col-color": col.color } as React.CSSProperties) : undefined}
              >
                <col.icon className="w-3 h-3" />
                <span>{col.label}</span>
                <span
                  className="text-[8px] px-1 rounded-full"
                  style={{
                    background: active ? col.color + "22" : undefined,
                    color: active ? col.color : undefined,
                  }}
                >
                  {col.items.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        {!collapsed && (
          <div className="flex items-center gap-1 px-2 border-l border-slate-200 dark:border-[#2e2e2e] shrink-0">
            <Search className="w-3 h-3 text-slate-400 dark:text-[#555]" />
            <input
              type="text"
              placeholder="ค้นหา..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-28 bg-transparent text-[10px] text-slate-700 dark:text-slate-300 outline-none placeholder-slate-400 dark:placeholder-[#555]"
            />
          </div>
        )}

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="px-3 border-l border-slate-200 dark:border-[#2e2e2e] text-slate-400 dark:text-[#555] hover:text-slate-600 dark:hover:text-[#aaa] transition-colors cursor-pointer shrink-0"
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Content */}
      {!collapsed && (
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {/* Brick-kit style sub-filter */}
          {activeCollection === "brick-kit" && (
            <div className="flex items-center gap-1 px-3 py-1.5 border-b border-slate-100 dark:border-[#2a2a2a] shrink-0">
              <span className="text-[9px] text-slate-400 dark:text-[#666] mr-1 font-bold uppercase tracking-widest">Style</span>
              {BRICK_STYLES.map((s) => (
                <button
                  key={s}
                  onClick={() => setBrickStyle(s)}
                  className={`px-2 py-0.5 rounded text-[9px] font-bold transition-colors cursor-pointer border ${
                    brickStyle === s
                      ? "bg-orange-500 border-orange-500 text-white"
                      : "border-slate-200 dark:border-[#333] text-slate-400 dark:text-[#666] hover:border-slate-300 dark:hover:border-[#555]"
                  }`}
                >
                  {s}
                </button>
              ))}
              <span className="ml-2 text-[9px] text-slate-400 dark:text-[#555]">
                {filteredItems.length} models
              </span>
            </div>
          )}

          {/* Selected model indicator */}
          {selectedMascot && (
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-[#1a3050] border-b border-blue-200 dark:border-[#2a4a7a] shrink-0">
              <span className="flex items-center gap-1 text-[9px] text-brand-blue dark:text-[#569cd6] font-bold animate-pulse">
                <Sparkles className="w-3 h-3" />
                เลือก {selectedMascot} — คลิก tile บน grid เพื่อวาง
              </span>
              <button
                onClick={onCancelSelect}
                className="ml-auto flex items-center gap-1 text-[9px] text-red-400 hover:text-red-500 cursor-pointer font-bold"
              >
                <X className="w-3 h-3" />
                ยกเลิก
              </button>
            </div>
          )}

          {/* Model grid */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="grid p-2 gap-1.5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))" }}>
              {filteredItems.map((item) => {
                const isSelected = selectedMascot === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (isSelected) {
                        onCancelSelect();
                      } else {
                        onSelectModel(item);
                      }
                    }}
                    title={item.name}
                    className={`flex flex-col items-center p-1 rounded-lg border transition-all cursor-pointer group ${
                      isSelected
                        ? "border-brand-blue dark:border-[#569cd6] bg-blue-50 dark:bg-[#1a3a5a] shadow-sm"
                        : "border-slate-200 dark:border-[#2e2e2e] hover:border-slate-300 dark:hover:border-[#444] bg-slate-50 dark:bg-[#222] hover:bg-slate-100 dark:hover:bg-[#2a2a2a]"
                    }`}
                  >
                    <div className="relative">
                      <ModelThumbnail
                        modelPath={item.modelPath}
                        previewPath={item.previewPath}
                        size={56}
                        className="rounded"
                      />
                      {isSelected && (
                        <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-brand-blue dark:bg-[#569cd6] border-2 border-white dark:border-[#1a1a1a]" />
                      )}
                    </div>
                    <span className="text-[7px] text-slate-500 dark:text-[#888] group-hover:text-slate-700 dark:group-hover:text-[#aaa] truncate w-full text-center mt-0.5 leading-tight">
                      {item.name.length > 14 ? item.name.slice(0, 13) + "…" : item.name}
                    </span>
                  </button>
                );
              })}

              {filteredItems.length === 0 && (
                <div className="col-span-full text-center py-6 text-slate-400 dark:text-[#555] text-[10px]">
                  ไม่พบ model
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
