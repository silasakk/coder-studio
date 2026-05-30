"use client";

import React, { useEffect } from "react";
import { Check, X } from "lucide-react";

interface OptionCard3DProps {
  numberLabel?: string | number;
  selected?: boolean;
  state?: "neutral" | "correct" | "wrong";
  onClick?: () => void;
  children: React.ReactNode;
  shortcutKey?: string; // e.g. "1", "2", "3" to trigger keyboard event
}

export default function OptionCard3D({
  numberLabel,
  selected = false,
  state = "neutral",
  onClick,
  children,
  shortcutKey,
}: OptionCard3DProps) {
  // Handle keyboard shortcut listeners for active selections
  useEffect(() => {
    if (!shortcutKey || !onClick) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === shortcutKey) {
        // Prevent default behavior if typing in text inputs
        const target = e.target as HTMLElement;
        if (
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable
        ) {
          return;
        }
        e.preventDefault();
        onClick();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcutKey, onClick]);

  // Base styles
  const baseCardStyle =
    "w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-b-[6px] transition-all duration-100 select-none text-left cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand-blue";

  // Active / state configurations
  const stateStyles = {
    neutral: selected
      ? "bg-blue-50/50 border-brand-blue border-b-[6px] text-brand-blue"
      : "bg-white border-slate-200 border-b-[6px] text-slate-700 hover:bg-slate-50/80 hover:border-slate-300",
    correct:
      "bg-emerald-50/50 border-game-success border-b-[6px] text-game-success-hover font-semibold",
    wrong:
      "bg-red-50/50 border-game-danger border-b-[6px] text-game-danger-hover font-semibold",
  };

  // 3D Press Down Effect (reduce border depth on active or selected/correct/wrong static press down state)
  const clickAnimation =
    "active:border-b-2 active:translate-y-[4px]";

  // Style of number badge on the left side of the card
  const getBadgeClass = () => {
    if (state === "correct") {
      return "bg-game-success border-game-success text-white";
    }
    if (state === "wrong") {
      return "bg-game-danger border-game-danger text-white";
    }
    if (selected) {
      return "bg-brand-blue border-brand-blue text-white";
    }
    return "bg-white border-slate-200 text-slate-400 group-hover:border-slate-300";
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
      className={`${baseCardStyle} ${stateStyles[state]} ${clickAnimation} group`}
    >
      {/* Shortcut/Index Badge */}
      {numberLabel && (
        <span
          className={`flex-shrink-0 w-8 h-8 flex items-center justify-center font-bold text-sm border-2 rounded-lg transition-colors duration-150 ${getBadgeClass()}`}
        >
          {numberLabel}
        </span>
      )}

      {/* Card Content */}
      <div className="flex-grow text-base md:text-lg">{children}</div>

      {/* Visual icon indicators for Correct/Wrong states using Lucide Icons */}
      {state === "correct" && (
        <Check className="w-6 h-6 text-game-success stroke-[3.5] flex-shrink-0 animate-bounce" />
      )}

      {state === "wrong" && (
        <X className="w-6 h-6 text-game-danger stroke-[3.5] flex-shrink-0 animate-pulse" />
      )}
    </div>
  );
}
