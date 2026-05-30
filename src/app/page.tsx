"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Button3D from "@/components/game/Button3D";
import { Sparkles, LayoutGrid, Code, Sun, Moon } from "lucide-react";

export default function Home() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      setIsDark(true);
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
  };

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-gradient-to-b from-blue-50 via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 min-h-screen py-16 px-4 font-sans select-none relative transition-colors duration-200">
      
      {/* Floating 3D Theme Switcher Toggle */}
      <div className="absolute top-6 right-6">
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border-2 border-b-[4px] border-slate-200 dark:border-slate-950 flex items-center justify-center text-slate-500 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-700 active:border-b-[2px] active:translate-y-[2px] transition-all duration-100 cursor-pointer shadow-sm"
          title="สลับธีม (Light/Dark)"
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-game-warning animate-pulse" />
          ) : (
            <Moon className="w-5 h-5 text-brand-blue" />
          )}
        </button>
      </div>

      <main className="max-w-4xl w-full bg-white dark:bg-slate-900 border-2 border-b-[8px] border-slate-200 dark:border-slate-800 rounded-[32px] p-8 sm:p-12 text-center flex flex-col items-center shadow-xl transition-all duration-200">
        {/* Branding badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100/60 dark:bg-blue-900/30 border-2 border-brand-blue rounded-full text-brand-blue font-black text-xs uppercase tracking-widest mb-6">
          <Sparkles className="w-3.5 h-3.5 text-brand-blue animate-pulse" />
          <span>Welcome to Coder Studio</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-none mb-4">
          CODER <span className="text-brand-blue">STUDIO</span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-xl text-slate-500 dark:text-slate-400 font-medium text-base sm:text-lg leading-relaxed mb-10">
          เรียนรู้การเขียนโปรแกรมผ่านมินิเกมสุดสร้างสรรค์สไตล์{" "}
          <span className="text-game-success font-extrabold">Duolingo 3D</span> ขับเคลื่อนด้วยสีสันและเอกลักษณ์พรีเมียมจาก{" "}
          <span className="text-brand-blue font-extrabold">Atlassian Blue</span> และอักษรไทยที่เป็นมิตรอย่าง{" "}
          <span className="text-slate-800 dark:text-slate-200 font-extrabold">Sarabun</span>
        </p>

        {/* Mascot Grid Showcase */}
        <div className="w-full max-w-2xl bg-slate-50 dark:bg-slate-950 border-2 border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 mb-10">
          <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">
            สหายร่วมเรียนรู้มาสคอตทั้ง 3 รูปแบบ (Our Playful Mascot Squad)
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { id: 1, name: "น้องบลู", desc: "คอยดูแลและแนะนำ", color: "bg-[#0052CC]/10 border-[#0052CC]" },
              { id: 2, name: "พี่แชดี้", desc: "ให้คำใบ้โจทย์เขียนโค้ด", color: "bg-[#58CC02]/10 border-[#58CC02]" },
              { id: 3, name: "เจ้าคูโร่", desc: "ผู้ช่วยตรวจคำตอบ", color: "bg-[#FF9600]/10 border-[#FF9600]" },
            ].map((mascot) => (
              <div
                key={mascot.id}
                className="flex flex-col items-center p-3 sm:p-4 bg-white dark:bg-slate-900 border-2 border-b-[4px] border-slate-200 dark:border-slate-850 rounded-2xl hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 overflow-hidden flex items-center justify-center p-1.5 mb-3 ${mascot.color}`}>
                  <Image
                    src={`/mascots/mascot-${mascot.id}-cropped.png`}
                    alt={mascot.name}
                    width={80}
                    height={80}
                    className="object-contain animate-float hover:animate-wiggle transition-all duration-300 cursor-pointer"
                    style={{ animationDelay: `${mascot.id * 0.4}s` }}
                  />
                </div>
                <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm sm:text-base">{mascot.name}</h4>
                <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 font-bold">{mascot.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Actions with clean Lucide icons */}
        <div className="flex flex-col sm:flex-row gap-4 items-center w-full justify-center">
          <Link href="/player" className="w-full sm:w-auto">
            <Button3D variant="success" size="lg" className="w-full flex items-center justify-center gap-2">
              <span className="text-xl">🎮</span>
              <span>เข้าสู่ห้องแต่งตัว & แดชบอร์ดผู้เล่น (Player)</span>
            </Button3D>
          </Link>
          <Link href="/design-system" className="w-full sm:w-auto">
            <Button3D variant="primary" size="lg" className="w-full flex items-center justify-center gap-2">
              <LayoutGrid className="w-5 h-5 text-white" />
              <span>เปิดคลัง Component Catalog</span>
            </Button3D>
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto"
          >
            <Button3D variant="secondary" size="lg" className="w-full flex items-center justify-center gap-2">
              <Code className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              <span>ส่องซอร์สโค้ดระบบ</span>
            </Button3D>
          </a>
        </div>
      </main>

      {/* Footer footer info */}
      <footer className="mt-8 text-center text-xs font-bold text-slate-400 dark:text-slate-500 font-mono tracking-wider">
        CODER STUDIO DESIGN SYSTEM v1.0.0 • POWERED BY TAILWIND V4
      </footer>
    </div>
  );
}
