"use client";

import React from "react";
import { Star, Loader2 } from "lucide-react";

interface Loading3DProps {
  type?: "dots" | "spin-star" | "spinner";
  color?: "brand" | "success" | "danger" | "warning" | "gold";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function Loading3D({
  type = "dots",
  color = "brand",
  size = "md",
  className = "",
}: Loading3DProps) {
  const sizeStyles = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  };

  const textColors = {
    brand: "text-brand-blue",
    success: "text-game-success",
    danger: "text-game-danger",
    warning: "text-game-warning",
    gold: "text-game-gold",
  };

  const fillColors = {
    brand: "bg-brand-blue",
    success: "bg-game-success",
    danger: "bg-game-danger",
    warning: "bg-game-warning",
    gold: "bg-game-gold",
  };

  const strokeColors = {
    brand: "stroke-[#0043A4]",
    success: "stroke-[#3B8A01]",
    danger: "stroke-[#C93535]",
    warning: "stroke-[#C27200]",
    gold: "stroke-[#D4B200]",
  };

  if (type === "dots") {
    const dotSize = size === "sm" ? "w-2 h-2" : size === "lg" ? "w-4 h-4" : "w-3 h-3";

    return (
      <div className={`flex items-center gap-1.5 select-none justify-center ${className}`}>
        {[0, 1, 2].map((idx) => (
          <div
            key={idx}
            className={`rounded-full transition-all duration-300 border border-black/10
              ${fillColors[color]} ${dotSize}`}
            style={{
              animation: "float 1s ease-in-out infinite",
              animationDelay: `${idx * 0.15}s`,
            }}
          />
        ))}
      </div>
    );
  }

  if (type === "spin-star") {
    return (
      <div className={`flex items-center justify-center select-none ${className}`}>
        <Star
          className={`animate-wiggle stroke-[2.5px]
            ${sizeStyles[size]} ${textColors[color]} ${strokeColors[color]}`}
          style={{
            fill: "currentColor",
          }}
        />
      </div>
    );
  }

  // Classic tactile loader spinner spinner
  return (
    <div className={`flex items-center justify-center select-none ${className}`}>
      <Loader2
        className={`animate-spin stroke-[3px]
          ${sizeStyles[size]} ${textColors[color]}`}
      />
    </div>
  );
}
