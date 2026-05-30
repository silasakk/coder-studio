"use client";

import React from "react";

interface ProgressBar3DProps {
  value: number;
  max?: number;
  color?: "brand" | "success" | "danger" | "warning" | "gold";
  size?: "sm" | "md" | "lg";
  showPercentage?: boolean;
  animate?: boolean;
}

export default function ProgressBar3D({
  value,
  max = 100,
  color = "brand",
  size = "md",
  showPercentage = false,
  animate = true,
}: ProgressBar3DProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  // Height configurations
  const heightStyles = {
    sm: "h-3",
    md: "h-5",
    lg: "h-7",
  };

  // Color variants with solid fills
  const colorStyles = {
    brand: "bg-brand-blue",
    success: "bg-game-success",
    danger: "bg-game-danger",
    warning: "bg-game-warning",
    gold: "bg-game-gold",
  };

  return (
    <div className="w-full flex flex-col gap-1.5 select-none text-left">
      {/* Dynamic percentage label if enabled */}
      {showPercentage && (
        <div className="flex justify-between items-center px-1 text-xs font-black text-slate-400">
          <span>ความคืบหน้า</span>
          <span className="font-mono">{Math.round(percentage)}%</span>
        </div>
      )}

      {/* 3D Progress Container */}
      <div
        className={`w-full ${heightStyles[size]} bg-slate-200 border-2 border-slate-300 border-b-[4px] rounded-full overflow-hidden relative shadow-inner`}
      >
        {/* The Animated Inner Progress Bar */}
        <div
          style={{ width: `${percentage}%` }}
          className={`absolute left-0 top-0 h-full rounded-full ${
            colorStyles[color]
          } ${
            animate ? "transition-all duration-500 ease-out" : ""
          }`}
        >
          {/* Shiny top highlight bar for 3D depth */}
          <div className="absolute top-0.5 left-1 right-1 h-1 bg-white/25 rounded-full" />
        </div>
      </div>
    </div>
  );
}
