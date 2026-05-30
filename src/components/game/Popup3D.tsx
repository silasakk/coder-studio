"use client";

import React, { useState, useRef, useEffect } from "react";

interface Popup3DProps {
  trigger: React.ReactNode;
  content: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  event?: "hover" | "click";
}

export default function Popup3D({
  trigger,
  content,
  position = "top",
  event = "hover",
}: Popup3DProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle click-away listeners to close popup
  useEffect(() => {
    if (event !== "click") return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [event]);

  const handleMouseEnter = () => {
    if (event === "hover") setIsVisible(true);
  };

  const handleMouseLeave = () => {
    if (event === "hover") setIsVisible(false);
  };

  const handleTriggerClick = () => {
    if (event === "click") setIsVisible(!isVisible);
  };

  // Positional placement styles for floating bubble
  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-3.5",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-3.5",
    left: "right-full top-1/2 -translate-y-1/2 mr-3.5",
    right: "left-full top-1/2 -translate-y-1/2 ml-3.5",
  };

  // Custom visual arrow tails pointing directly to trigger element
  const arrowClasses = {
    top: "absolute bottom-[-9px] left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white border-r-2 border-b-2 border-slate-200 rotate-45",
    bottom: "absolute top-[-9px] left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white border-l-2 border-t-2 border-slate-200 rotate-45",
    left: "absolute right-[-9px] top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white border-r-2 border-t-2 border-slate-200 rotate-45",
    right: "absolute left-[-9px] top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white border-l-2 border-b-2 border-slate-200 rotate-45",
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="inline-block relative select-none"
    >
      {/* Trigger Area */}
      <div onClick={handleTriggerClick} className="inline-block cursor-pointer">
        {trigger}
      </div>

      {/* Floating 3D Bubble */}
      {isVisible && (
        <div
          className={`absolute ${positionClasses[position]} bg-white border-2 border-b-[5px] border-slate-200 p-4 rounded-2xl shadow-lg z-50 text-slate-600 font-black text-xs sm:text-sm text-center min-w-40 animate-pop-in animate-float hover:animate-wiggle`}
        >
          {/* Main spoken text */}
          <div className="relative z-10 leading-relaxed font-sans">{content}</div>
          
          {/* Arrow Pointer */}
          <div className={arrowClasses[position]} />
        </div>
      )}
    </div>
  );
}
