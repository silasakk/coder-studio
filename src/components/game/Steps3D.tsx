"use client";

import React from "react";
import { Check } from "lucide-react";

export interface StepItem {
  label: string;
  desc?: string;
  icon?: React.ReactNode;
}

interface Steps3DProps {
  steps: StepItem[];
  currentStep: number; // 0-indexed
  className?: string;
}

export default function Steps3D({ steps, currentStep, className = "" }: Steps3DProps) {
  return (
    <div className={`w-full font-sans select-none ${className}`}>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-4 relative w-full">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentStep;
          const isActive = idx === currentStep;
          const isUpcoming = idx > currentStep;

          // Compute step connector lines (for md size and larger horizontal view)
          const isLast = idx === steps.length - 1;

          return (
            <React.Fragment key={idx}>
              <div className="flex items-center gap-3.5 flex-1 relative z-10">
                {/* 3D Circle Node */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 transition-all duration-300 border-2
                    ${
                      isCompleted
                        ? "bg-game-success border-[#3B8A01] text-white border-b-[5px]"
                        : isActive
                        ? "bg-brand-blue border-[#0043A4] text-white border-b-[5px] scale-110 shadow-lg"
                        : "bg-white border-slate-300 text-slate-400 border-b-[5px]"
                    }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : step.icon ? (
                    step.icon
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>

                {/* Text labels */}
                <div className="text-left">
                  <h4
                    className={`text-xs font-black uppercase tracking-wider transition-colors
                      ${isActive ? "text-brand-blue" : isCompleted ? "text-slate-800" : "text-slate-400"}`}
                  >
                    {step.label}
                  </h4>
                  {step.desc && <p className="text-[10px] font-bold text-slate-400 mt-0.5 leading-tight">{step.desc}</p>}
                </div>
              </div>

              {/* Horizontal connecting bar between nodes on larger screens */}
              {!isLast && (
                <div className="hidden md:block flex-grow h-2.5 mx-2 bg-slate-200 rounded-full overflow-hidden border border-slate-300 shadow-inner relative">
                  <div
                    className={`h-full transition-all duration-500 rounded-full
                      ${isCompleted ? "w-full bg-game-success" : "w-0 bg-brand-blue"}`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
