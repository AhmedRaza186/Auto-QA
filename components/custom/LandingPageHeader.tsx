"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { C } from "@/app/lib/theme";
import { Menu, X } from "lucide-react";

// Assuming these props or variables exist in your parent component context
interface HeaderProps {
  scrolled: boolean;
  userDetail: any; // Replace with your user type
  MagicButton: React.ComponentType<{ children: React.ReactNode }>;
  UserButton: React.ComponentType<{ appearance: any }>;
}

export default function Header({ scrolled, userDetail, MagicButton, UserButton }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = ["Features", "How it works", "Docs"];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-[100] transition-all duration-400 ease-in-out"
      style={{
        background: scrolled ? "rgba(0, 0, 0, 0.4)" : "transparent",
        backdropFilter: scrolled ? "blur(18px) saturate(180%)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(18px) saturate(180%)" : "none",
        borderBottom: scrolled ? `1px solid ${C.border}` : "none",
      }}
    >
      <div className="max-w-[1200px] mx-auto h-[66px] flex items-center justify-between px-6 md:px-8">
        
        {/* ── LOGO SECTION ── */}
        <div className="flex items-center gap-2.5">
          <Image src="/logo-white.svg" alt="logo" width={100} height={100}  />
          <span
            className="font-mono text-[10px] font-medium border rounded-md px-1.5 py-0.5 tracking-wider select-none"
            style={{
              color: C.primary,
              background: C.primaryBg,
              borderColor: C.primaryMid,
            }}
          >
            AI
          </span>
        </div>

        {/* ── DESKTOP NAVIGATION ── */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((l) => (
            <a
              key={l}
              href={l === "Docs" ? "/docs" : `#${l.toLowerCase().replace(/\s+/g, "-")}`}
              className="font-sans text-[13px] font-medium px-3.5 py-2 rounded-lg transition-all duration-200"
              style={{ color: C.muted }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = C.ink;
                e.currentTarget.style.background = C.primaryBg;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = C.muted;
                e.currentTarget.style.background = "transparent";
              }}
            >
              {l}
            </a>
          ))}
        </nav>

        {/* ── DESKTOP ACTION BUTTONS ── */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/workspace" className="flex items-center gap-3">
            {!userDetail && (
              <button 
                className="font-sans text-[13px] bg-transparent border-none cursor-pointer px-3 py-1.5 font-medium transition-colors hover:opacity-80"
                style={{ color: C.muted }}
              >
                Sign in
              </button>
            )}
            <MagicButton>
              {userDetail ? "Go to Workspace" : "Connect GitHub →"}
            </MagicButton>
          </Link>

          {userDetail && (
            <UserButton
              appearance={{
                elements: {
                  avatarBox: {
                    width: 34,
                    height: 34,
                    border: `2px solid ${C.primaryMid}`,
                    borderRadius: 999,
                  },
                },
              }}
            />
          )}
        </div>

        {/* ── MOBILE MENU TRIGGER ── */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex md:hidden p-1.5 rounded-lg border transition-colors cursor-pointer"
          style={{ borderColor: scrolled ? C.border : "transparent", color: C.ink }}
          aria-label="Toggle Menu"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ── MOBILE DROPDOWN DRAWER ── */}
      {isOpen && (
        <div 
          className="md:hidden absolute top-[66px] left-0 right-0 border-b flex flex-col p-6 gap-5 shadow-xl transition-all dynamic-fade-in"
          style={{ background: C.surface || "#000", borderColor: C.border }}
        >
          <nav className="flex flex-col gap-1.5">
            {navItems.map((l) => (
              <a
                key={l}
                href={l === "Docs" ? "/docs" : `#${l.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={() => setIsOpen(false)}
                className="font-sans text-[14px] font-medium py-2.5 px-3 rounded-lg transition-colors"
                style={{ color: C.muted }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = C.ink;
                  e.currentTarget.style.background = C.primaryBg;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = C.muted;
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {l}
              </a>
            ))}
          </nav>

          <div className="h-[1px] w-full" style={{ background: C.border }} />

          <div className="flex flex-col gap-4">
            <Link href="/workspace" onClick={() => setIsOpen(false)} className="w-full flex flex-col gap-3">
              {!userDetail && (
                <button 
                  className="font-sans text-[14px] w-full text-center bg-transparent border border-zinc-800 py-2.5 rounded-xl font-medium cursor-pointer"
                  style={{ color: C.ink }}
                >
                  Sign in
                </button>
              )}
              <div className="w-full text-center">
                <MagicButton>
                  {userDetail ? "Go to Workspace" : "Connect GitHub →"}
                </MagicButton>
              </div>
            </Link>

            {userDetail && (
              <div className="flex items-center justify-content-center gap-3 px-2">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: {
                        width: 36,
                        height: 36,
                        border: `2px solid ${C.primaryMid}`,
                        borderRadius: 999,
                      },
                    },
                  }}
                />
                <span className="font-sans text-xs" style={{ color: C.muted }}>Account Settings</span>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

