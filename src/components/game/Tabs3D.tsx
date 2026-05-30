"use client";

import React from "react";

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface Tabs3DProps {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  orientation?: "horizontal" | "vertical";
  className?: string;
}

export default function Tabs3D({
  items,
  activeId,
  onChange,
  orientation = "horizontal",
  className = "",
}: Tabs3DProps) {
  const containerClasses =
    orientation === "horizontal"
      ? "flex flex-row gap-2 border-b border-slate-200 pb-2 w-full overflow-x-auto scrollbar-none"
      : "flex flex-col gap-2 border-r border-slate-200 pr-2 h-full justify-start";

  return (
    <div className={`flex ${containerClasses} font-sans select-none ${className}`}>
      {items.map((item) => {
        const isActive = item.id === activeId;
        const isDisabled = item.disabled;

        return (
          <button
            key={item.id}
            type="button"
            disabled={isDisabled}
            onClick={() => onChange(item.id)}
            className={`font-black text-xs rounded-xl px-4 py-2.5 transition-all duration-100 flex items-center gap-2 outline-none border-2
              ${
                isDisabled
                  ? "bg-slate-100 border-slate-200 border-b-[2px] text-slate-300 cursor-not-allowed translate-y-[2px]"
                  : isActive
                  ? "bg-blue-50 border-brand-blue border-b-[2px] text-brand-blue translate-y-[4px] shadow-inner"
                  : "bg-white border-slate-300 border-b-[6px] text-slate-500 hover:text-slate-800 hover:border-slate-400 active:border-b-[2px] active:translate-y-[4px]"
              }`}
          >
            {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
            <span className="truncate">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
