"use client";

import React from "react";
import { Lock, Check } from "lucide-react";

export interface TimelineItem {
  id: string;
  title: string;
  desc?: string;
  icon?: React.ReactNode;
  active?: boolean;
  completed?: boolean;
}

interface Timeline3DProps {
  items: TimelineItem[];
  className?: string;
}

export default function Timeline3D({ items, className = "" }: Timeline3DProps) {
  return (
    <div className={`relative flex flex-col items-center py-6 w-full font-sans select-none ${className}`}>
      {/* Central vertical thick spine */}
      <div className="absolute top-0 bottom-0 w-2.5 bg-slate-200 border border-slate-300 rounded-full shadow-inner" />

      <div className="relative flex flex-col gap-12 w-full max-w-md">
        {items.map((item, idx) => {
          const isUnlocked = item.active || item.completed;
          const isLeft = idx % 2 === 0;

          return (
            <div
              key={item.id}
              className={`flex items-center w-full transition-all duration-300
                ${isLeft ? "flex-row" : "flex-row-reverse"}`}
            >
              {/* Card content on one side */}
              <div className={`w-[42%] px-4 text-left ${isLeft ? "text-right" : "text-left"}`}>
                <h4
                  className={`text-xs font-black uppercase tracking-wider
                    ${item.active ? "text-brand-blue" : isUnlocked ? "text-slate-800" : "text-slate-400"}`}
                >
                  {item.title}
                </h4>
                {item.desc && <p className="text-[10px] font-bold text-slate-400 mt-1 leading-tight">{item.desc}</p>}
              </div>

              {/* Central 3D Node (sitting exactly over the vertical spine) */}
              <div className="w-[16%] flex justify-center z-10">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-200 hover:scale-105 cursor-pointer relative shadow-md
                    ${
                      item.completed
                        ? "bg-game-success border-[#3B8A01] text-white border-b-[6px] hover:border-b-[3px] hover:translate-y-[3px]"
                        : item.active
                        ? "bg-brand-blue border-[#0043A4] text-white border-b-[6px] hover:border-b-[3px] hover:translate-y-[3px] animate-float"
                        : "bg-slate-200 border-slate-300 text-slate-400 border-b-[4px]"
                    }`}
                >
                  {item.completed ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : !isUnlocked ? (
                    <Lock className="w-4 h-4 text-slate-400" />
                  ) : item.icon ? (
                    item.icon
                  ) : (
                    <span className="font-extrabold">{idx + 1}</span>
                  )}
                </div>
              </div>

              {/* Empty spacer block for alignment on the other side */}
              <div className="w-[42%]" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
