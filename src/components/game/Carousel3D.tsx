"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Button3D from "./Button3D";

interface Carousel3DProps {
  slides: React.ReactNode[];
  autoPlay?: boolean;
  interval?: number;
}

export default function Carousel3D({
  slides,
  autoPlay = false,
  interval = 4000,
}: Carousel3DProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-play hook
  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, slides.length]);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  return (
    <div className="w-full relative bg-white border-2 border-b-[8px] border-slate-200 rounded-[32px] p-8 select-none shadow-sm flex flex-col items-center min-h-[300px]">
      
      {/* Slides Viewport Container */}
      <div className="w-full flex-grow flex items-center justify-center min-h-[160px] relative overflow-hidden">
        {slides.map((slide, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={index}
              className={`w-full transition-all duration-300 transform flex flex-col items-center justify-center ${
                isActive
                  ? "opacity-100 scale-100 relative z-10 translate-x-0"
                  : "opacity-0 scale-95 absolute -z-10 translate-x-12"
              }`}
            >
              {slide}
            </div>
          );
        })}
      </div>

      {/* Slide Navigator Arrow Controls */}
      <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none z-20">
        <Button3D
          variant="secondary"
          size="sm"
          onClick={handlePrev}
          className="pointer-events-auto w-10 h-10 rounded-full flex items-center justify-center p-0 text-slate-500 hover:text-slate-800"
        >
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </Button3D>
        <Button3D
          variant="secondary"
          size="sm"
          onClick={handleNext}
          className="pointer-events-auto w-10 h-10 rounded-full flex items-center justify-center p-0 text-slate-500 hover:text-slate-800"
        >
          <ChevronRight className="w-5 h-5 text-slate-600" />
        </Button3D>
      </div>

      {/* Pill-shaped stretchable bottom indicators */}
      <div className="flex gap-2.5 justify-center mt-6">
        {slides.map((_, index) => {
          const isActive = index === currentIndex;
          return (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 focus:outline-none ${
                isActive
                  ? "w-6 bg-brand-blue shadow-sm shadow-blue-200"
                  : "w-2.5 bg-slate-200 hover:bg-slate-300"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
