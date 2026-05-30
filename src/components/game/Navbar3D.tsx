"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import Button3D from "./Button3D";

interface NavbarLink {
  label: string;
  href: string;
}

interface Navbar3DProps {
  brandName?: string;
  links: NavbarLink[];
}

export default function Navbar3D({
  brandName = "Coder Studio",
  links = [],
}: Navbar3DProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="w-full bg-white border-2 border-b-[6px] border-slate-200 rounded-[24px] px-6 py-4 select-none shadow-sm text-left relative z-40">
      <div className="flex items-center justify-between">
        {/* Brand Logo and Title */}
        <Link href="/" className="flex items-center gap-2 outline-none">
          <span className="w-8 h-8 rounded-lg bg-brand-blue flex items-center justify-center text-white text-sm font-black shadow-md">
            C
          </span>
          <span className="font-black text-slate-800 text-base sm:text-lg tracking-tight uppercase">
            {brandName}
          </span>
        </Link>

        {/* Desktop Menu Links */}
        <div className="hidden md:flex items-center gap-3">
          {links.map((link, idx) => (
            <Link key={idx} href={link.href}>
              <Button3D variant="secondary" size="sm" className="py-1.5 px-4 text-xs font-black">
                {link.label}
              </Button3D>
            </Link>
          ))}
          <Button3D variant="primary" size="sm" className="py-1.5 px-4 text-xs font-black">
            เริ่มเรียนรู้
          </Button3D>
        </div>

        {/* Mobile Hamburger toggle with Lucide React Menu and X icons */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-500 hover:text-slate-800 focus:outline-none flex items-center"
        >
          {mobileMenuOpen ? <X className="w-5 h-5 animate-pop-in" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 border-t border-slate-100 pt-4 flex flex-col gap-3 animate-pop-in">
          {links.map((link, idx) => (
            <Link key={idx} href={link.href} onClick={() => setMobileMenuOpen(false)}>
              <div className="px-4 py-2.5 rounded-xl border-2 border-b-[4px] border-slate-100 hover:border-slate-200 font-black text-sm text-slate-600 hover:text-slate-800 hover:translate-y-[-2px] transition-all bg-white shadow-sm">
                {link.label}
              </div>
            </Link>
          ))}
          <Button3D variant="primary" size="sm" className="w-full text-center mt-1">
            เริ่มเรียนรู้
          </Button3D>
        </div>
      )}
    </nav>
  );
}
