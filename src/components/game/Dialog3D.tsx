"use client";

import React, { useEffect } from "react";
import { CheckCircle2, XCircle, Sparkles } from "lucide-react";
import Button3D from "./Button3D";

interface Dialog3DProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  type?: "success" | "failure" | "levelUp";
  children: React.ReactNode;
}

export default function Dialog3D({
  isOpen,
  onClose,
  title = "สำเร็จแล้ว!",
  type = "success",
  children,
}: Dialog3DProps) {
  // Lock body scroll when dialog is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Thematic colors and decorative headers
  const typeConfigs = {
    success: {
      borderColor: "border-slate-200 border-b-[8px]",
      headerBg: "bg-emerald-50 text-game-success border-game-success",
      icon: <CheckCircle2 className="w-12 h-12 text-game-success" />,
      buttonVariant: "success" as const,
    },
    failure: {
      borderColor: "border-slate-200 border-b-[8px]",
      headerBg: "bg-red-50 text-game-danger border-game-danger",
      icon: <XCircle className="w-12 h-12 text-game-danger" />,
      buttonVariant: "danger" as const,
    },
    levelUp: {
      borderColor: "border-slate-200 border-b-[8px]",
      headerBg: "bg-amber-50 text-game-gold border-game-gold",
      icon: <Sparkles className="w-12 h-12 text-game-gold drop-shadow-md animate-bounce" />,
      buttonVariant: "warning" as const,
    },
  };

  const config = typeConfigs[type] || typeConfigs.success;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300">
      {/* Background click handler */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Bouncy Container */}
      <div
        className={`bg-white rounded-[32px] p-8 max-w-md w-full relative z-10 text-center shadow-2xl animate-pop-in flex flex-col items-center select-none border-2 ${config.borderColor}`}
      >
        {/* Large Decorative Top Icon */}
        <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center p-4 mb-5 shadow-inner ${config.headerBg}`}>
          {config.icon}
        </div>

        {/* Modal Title */}
        <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight mb-3">
          {title}
        </h2>

        {/* Modal Content */}
        <div className="text-slate-500 font-medium text-sm sm:text-base leading-relaxed mb-6 w-full">
          {children}
        </div>

        {/* Close Button / Bottom Controls */}
        <div className="w-full flex gap-3">
          <Button3D
            variant={config.buttonVariant}
            size="md"
            className="w-full"
            onClick={onClose}
          >
            ตกลง เรียนรู้ต่อ!
          </Button3D>
        </div>
      </div>
    </div>
  );
}
