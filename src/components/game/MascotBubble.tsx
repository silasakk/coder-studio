"use client";

import React from "react";
import Image from "next/image";

interface MascotBubbleProps {
  mascotIndex?: 1 | 2 | 3;
  text: string | React.ReactNode;
  title?: string;
  alignment?: "left" | "right";
}

export default function MascotBubble({
  mascotIndex = 1,
  text,
  title = "พี่โค้ดเดอร์ (Coder Guide)",
  alignment = "left",
}: MascotBubbleProps) {
  // Mascot image path matching copied files in public/mascots/
  const mascotSrc = `/mascots/mascot-1.png`; // Wait, actually let's map each index:
  const mascotMap = {
    1: "/mascots/mascot-1-cropped.png",
    2: "/mascots/mascot-2-cropped.png",
    3: "/mascots/mascot-3-cropped.png",
  };

  const imageSrc = mascotMap[mascotIndex] || mascotMap[1];

  return (
    <div
      className={`w-full flex flex-col sm:flex-row items-center gap-6 p-4 select-none ${
        alignment === "right" ? "sm:flex-row-reverse" : ""
      }`}
    >
      {/* Mascot Image Container with 3D Card Hover & Playful Animations */}
      <div className="flex-shrink-0 relative group animate-pop-in">
        <div className="absolute -inset-1 bg-gradient-to-r from-brand-blue to-cyan-400 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 bg-white rounded-full border-4 border-slate-200 shadow-md overflow-hidden flex items-center justify-center p-2">
          <Image
            src={imageSrc}
            alt={`Mascot ${mascotIndex}`}
            width={120}
            height={120}
            className="object-contain animate-float hover:animate-wiggle transition-all duration-300 cursor-pointer"
            priority
          />
        </div>
        {/* Active Status Badge */}
        <span className="absolute bottom-1 right-2 block h-4 w-4 rounded-full ring-2 ring-white bg-game-success animate-pulse" />
      </div>

      {/* Playful Speech Bubble */}
      <div className="relative flex-grow w-full">
        {/* Chat Bubble Card */}
        <div className="relative p-6 bg-white border-2 border-b-[6px] border-slate-200 rounded-3xl shadow-sm text-left animate-fade-in">
          {/* Speaking guide title */}
          {title && (
            <h4 className="text-sm font-black text-brand-blue uppercase tracking-wider mb-1">
              {title}
            </h4>
          )}
          {/* Main spoken text */}
          <div className="text-slate-700 text-base md:text-lg font-medium leading-relaxed">
            {text}
          </div>
        </div>

        {/* Speech Bubble Arrow - custom CSS indicator matching left/right layout */}
        {alignment === "left" ? (
          <div className="hidden sm:block absolute left-0 top-1/2 -translate-x-[9px] -translate-y-1/2 w-4 h-4 bg-white border-l-2 border-b-2 border-slate-200 rotate-45" />
        ) : (
          <div className="hidden sm:block absolute right-0 top-1/2 translate-x-[9px] -translate-y-1/2 w-4 h-4 bg-white border-r-2 border-t-2 border-slate-200 rotate-45" />
        )}
      </div>
    </div>
  );
}
