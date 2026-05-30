"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";

interface Rating3DProps {
  value: number;
  onChange?: (value: number) => void;
  max?: number;
  disabled?: boolean;
  className?: string;
}

export default function Rating3D({
  value,
  onChange,
  max = 5,
  disabled = false,
  className = "",
}: Rating3DProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const handleStarClick = (rating: number) => {
    if (disabled || !onChange) return;
    onChange(rating);
  };

  const handleMouseEnter = (rating: number) => {
    if (disabled) return;
    setHoverValue(rating);
  };

  const handleMouseLeave = () => {
    if (disabled) return;
    setHoverValue(null);
  };

  const stars = [];
  for (let i = 1; i <= max; i++) {
    stars.push(i);
  }

  return (
    <div className={`flex items-center gap-1.5 font-sans select-none justify-center ${className}`}>
      {stars.map((star) => {
        const isFilled = hoverValue !== null ? star <= hoverValue : star <= value;
        const isHovered = hoverValue !== null && star === hoverValue;

        return (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
            className={`transition-all duration-150 outline-none p-1 rounded-lg focus-visible:ring-2 focus-visible:ring-brand-blue/50
              ${disabled ? "cursor-not-allowed opacity-75" : "cursor-pointer"}
              ${isHovered ? "scale-125 animate-wiggle" : "hover:scale-115 active:scale-95"}`}
          >
            <Star
              className={`w-8 h-8 stroke-[2.5px] transition-all duration-150
                ${
                  isFilled
                    ? "fill-game-gold stroke-[#D4B200] filter drop-shadow-[0_2px_0_rgba(180,140,0,0.4)]"
                    : "fill-slate-100 stroke-slate-300 filter drop-shadow-[0_2px_0_rgba(0,0,0,0.05)]"
                }`}
            />
          </button>
        );
      })}
    </div>
  );
}
