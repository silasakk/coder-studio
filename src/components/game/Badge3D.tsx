"use client";

import React from "react";
import { Crown, Flame, Star, Shield, Lock } from "lucide-react";

interface Badge3DProps {
  type: "crown" | "streak" | "star" | "shield";
  label?: string;
  size?: "sm" | "md" | "lg";
  active?: boolean;
}

export default function Badge3D({
  type,
  label,
  size = "md",
  active = true,
}: Badge3DProps) {
  // Size presets for icons inside badge
  const iconSizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  // Size presets for badge container
  const sizeStyles = {
    sm: "w-12 h-12 text-xs",
    md: "w-16 h-16 text-sm",
    lg: "w-24 h-24 text-base",
  };

  // Badge configs
  const badgeConfig = {
    crown: {
      color: "bg-[#FFFDF0] border-game-gold text-[#D08B00] hover:border-yellow-500",
      icon: (s: string) => <Crown className={`${s} text-game-gold fill-game-gold/30 drop-shadow-[0_2px_0_rgba(180,120,0,0.3)]`} />,
      shadow: "shadow-yellow-100",
    },
    streak: {
      color: "bg-orange-50 border-game-warning text-[#D05B00] hover:border-orange-500",
      icon: (s: string) => <Flame className={`${s} text-game-warning fill-game-warning/30 drop-shadow-[0_2px_0_rgba(200,80,0,0.3)]`} />,
      shadow: "shadow-orange-100",
    },
    star: {
      color: "bg-amber-50 border-amber-400 text-[#D88A00] hover:border-amber-500",
      icon: (s: string) => <Star className={`${s} text-amber-500 fill-amber-500/30 drop-shadow-[0_2px_0_rgba(220,160,0,0.3)]`} />,
      shadow: "shadow-amber-100",
    },
    shield: {
      color: "bg-blue-50 border-blue-400 text-blue-700 hover:border-blue-500",
      icon: (s: string) => <Shield className={`${s} text-blue-500 fill-blue-500/30 drop-shadow-[0_2px_0_rgba(0,80,200,0.3)]`} />,
      shadow: "shadow-blue-100",
    },
  };

  const currentBadge = badgeConfig[type];

  // Base styling for 3D rounded badges
  const activeStyle = `border-2 border-b-[5px] cursor-pointer hover:translate-y-[-2px] hover:border-b-[7px] ${currentBadge.color} ${currentBadge.shadow} shadow-md`;
  
  // Locked grayscale style
  const lockedStyle = "bg-slate-100 border-slate-300 border-2 border-b-[4px] text-slate-450 cursor-not-allowed filter grayscale opacity-60";

  return (
    <div className="inline-flex flex-col items-center gap-1.5 select-none">
      {/* 3D Badge Shape */}
      <div
        className={`rounded-2xl flex items-center justify-center transition-all duration-150 animate-float hover:animate-wiggle relative ${
          active ? activeStyle : lockedStyle
        } ${sizeStyles[size]}`}
      >
        {active ? (
          currentBadge.icon(iconSizes[size])
        ) : (
          <>
            {/* Lock indicator */}
            <Lock className={`${iconSizes[size]} text-slate-400`} />
            {/* Small lock emblem in corner */}
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-slate-500 text-white rounded-full flex items-center justify-center text-[8px] font-bold ring-2 ring-white">
              <Lock className="w-2.5 h-2.5" />
            </span>
          </>
        )}
      </div>

      {/* Optional Badge Label */}
      {label && (
        <span
          className={`font-black text-xs transition-colors duration-150 ${
            active ? "text-slate-700" : "text-slate-400"
          }`}
        >
          {label}
        </span>
      )}
    </div>
  );
}
