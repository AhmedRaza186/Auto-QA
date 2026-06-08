"use client";

import { useState } from "react";
import { C } from "../../app/lib/theme";
import Link from "next/link";
import { useRouter } from "next/navigation";


// ─── Expanded Rich Documentation Data ─────────────────────────────
const SECTIONS = [
    {
        title: "Introduction",
        items: [
            {
                name: "What is the platform",
                badge: "Core",
                desc: "AutoQA is an autonomous test generation pipeline that analyzes your codebase, creates realistic end-to-end browser workflows, and executes them instantly.",
                details: "By mapping application routes and state transitions using AST (Abstract Syntax Tree) parsing, our system completely replaces brittle manual QA scripting with adaptive, resilient testing."
            },
            {
                name: "Core features",
                badge: "AI Powered",
                desc: "Zero-config regression testing, automatic selector healing, natural language assertion writing, and distributed cloud scaling.",
                details: "When your UI updates, our model heals selectors dynamically on runtime based on context, keeping your test builds from throwing unneeded false-positive breaks."
            },
            {
                name: "Supported frameworks",
                badge: "v2.0",
                desc: "Deep integration across modern ecosystems including React, Next.js, Vue, Svelte, and native REST APIs.",
                details: "We support Playwright, Cypress, and Puppeteer engine targets. Your generated workflows export directly into standard vanilla TypeScript code whenever you need to migrate."
            }
        ]
    },
    {
        title: "Getting Started",
        items: [
            {
                name: "Create account",
                badge: "Quick",
                desc: "Authenticate instantly with secure single sign-on using your primary GitHub credentials.",
                details: "Navigate to auth portal, select 'Sign in with GitHub', and authorize the read-level organization parameters to spin up your cloud workspace sandbox profile."
            },
            {
                name: "Connect GitHub",
                badge: "Webhook",
                desc: "Grant access to target individual public or private repositories via fine-grained GitHub Apps.",
                details: "We enforce absolute isolation protocols. Only requested metadata parameters and testable structure points are monitored—your intellectual raw source property remains completely safe."
            },
            {
                name: "Add credits",
                badge: "Billing",
                desc: "Manage token usage and test runtime minutes through automated, multi-tiered subscription balances.",
                details: "Every developer account launches with 10000 free credits monthly. Run custom heavy pipelines or upgrade directly via secure Stripe ledger points."
            },
            {
                name: "Generate first test case",
                badge: "Automated",
                desc: "Point our agent at any deployment URL or specific repository branch to trigger a comprehensive generation cycle.",
                details: "The system logs headless browser workflows against your app targets, mapping layouts instantly, and commits complete `.spec.ts` test files straight to your UI panel inside minutes."
            }
        ]
    },
    {
        title: "Repository Integration",
        items: [
            {
                name: "GitHub OAuth setup",
                badge: "Security",
                desc: "Enterprise-grade credential handling protocols securing access tokens via hardware-level encryption layers.",
                details: "All communication keys utilize asymmetric encryption frameworks. Tokens undergo cycling automatically every 48 hours to secure absolute data protection layout perimeters."
            },
            {
                name: "Selecting repositories",
                badge: "Filters",
                desc: "Isolate precise microservices or frontend monolithic branches that require monitoring.",
                details: "Utilize dynamic search expressions in the control center to scope repositories, preventing extraneous testing operations over basic static or legacy systems."
            },
            {
                name: "Branch selection",
                badge: "Git Flow",
                desc: "Target distinct testing configurations for production environments, development tracks, or feature pull requests.",
                details: "Configure system webhooks to watch `main` for release stability checks, or trigger micro-smoke tests on incoming PR branches to prevent breaking deployments early."
            },
            {
                name: "Source code analysis",
                badge: "AST Parsing",
                desc: "How our model parses code structural markers to map exact DOM selectors and critical transactional paths.",
                details: "The backend processes structure changes without reading actual runtime data layers, constructing mock data instances to evaluate your forms safely."
            }
        ]
    }
];

export default function DocsClient() {
    const router = useRouter();

    const [activeSection, setActiveSection] = useState("Introduction");
    // Default selection points to the first item of the starting section
    const [activeItemName, setActiveItemName] = useState(SECTIONS[0].items[0].name);

    const currentSection = SECTIONS.find((s) => s.title === activeSection);
    const currentItem = currentSection?.items.find((i) => i.name === activeItemName) || currentSection?.items[0];

    const handleSectionChange = (sectionTitle: string) => {
        setActiveSection(sectionTitle);
        const firstItemOfNewSection = SECTIONS.find((s) => s.title === sectionTitle)?.items[0];
        if (firstItemOfNewSection) {
            setActiveItemName(firstItemOfNewSection.name);
        }
    };

    return (
        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", minHeight: "100vh", background: C.bg, color: C.ink, fontFamily: "'Geist', sans-serif" }}>



            {/* ── SIDEBAR ── */}
            <aside style={{ borderRight: `1px solid ${C.border}`, padding: "2.5rem 1.5rem", background: C.surface, display: "flex", flexDirection: "column", gap: "2rem" }}>


                {/* Brand Header */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${C.primaryDark}, ${C.primary})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#fff", fontWeight: "bold" }}>
                        ⚡
                    </div>
                    <div>
                        <Link href={'/'}>
                            <h2 style={{ fontSize: 16, fontWeight: 700, color: C.ink, margin: 0, letterSpacing: "-0.02em" }}>
                                Auto-QA AI</h2>
                        </Link>
                        <span style={{ fontSize: 11, color: C.subtle, fontWeight: 500 }}>Developer Platform</span>
                    </div>
                </div>

                {/* Navigation Categories */}
                <nav style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: C.subtle, letterSpacing: "0.05em", paddingLeft: 12, marginBottom: 6 }}>
                        Documentation
                    </span>
                    {SECTIONS.map((s) => {
                        const isCategoryActive = activeSection === s.title;
                        return (
                            <button
                                key={s.title}
                                onClick={() => handleSectionChange(s.title)}
                                style={{
                                    position: "relative",
                                    display: "block",
                                    width: "100%",
                                    textAlign: "left",
                                    padding: "12px 14px",
                                    borderRadius: 10,
                                    border: "none",
                                    cursor: "pointer",
                                    fontSize: 14,
                                    fontWeight: isCategoryActive ? 600 : 500,
                                    background: isCategoryActive ? C.surfaceAlt : "transparent",
                                    color: isCategoryActive ? C.ink : C.muted,
                                    transition: "all 0.2s ease",
                                }}
                            >
                                {isCategoryActive && (
                                    <div style={{ position: "absolute", left: 0, top: "25%", height: "50%", width: 3, background: C.primary, borderRadius: 99 }} />
                                )}
                                {s.title}
                            </button>
                        );
                    })}
                </nav>
                <button
                    onClick={() => router.back()}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        width: '30%',
                        padding: "10px 10px",
                        borderRadius: 10,
                        border: `1px solid ${C.border}`,
                        background: C.surfaceAlt,
                        color: C.ink,
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: 600,
                        transition: "all .2s ease",
                        
                    }}
                >
                    ← Back
                </button>
            </aside>

            {/* ── MAIN CONTENT WORKSPACE ── */}
            <main style={{ padding: "3.5rem 4rem", maxWidth: 1100, width: "100%", boxSizing: "border-box" }}>

                {/* Section Heading Header */}
                <header style={{ marginBottom: "3rem", borderBottom: `1px solid ${C.border}`, paddingBottom: "1.5rem" }}>
                    <span style={{ fontSize: 13, color: C.primaryLight, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        Category Scope
                    </span>
                    <h1 style={{ fontSize: "3rem", fontFamily: "'Instrument Serif', serif", color: C.ink, marginTop: 4, marginBottom: 0, fontWeight: 400 }}>
                        {activeSection}
                    </h1>
                </header>

                {/* Dynamic Inner Layout Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2.5rem", alignItems: "start" }}>

                    {/* Left Column: Interactive Topic Cards */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        {currentSection?.items.map((item) => {
                            const isSelected = activeItemName === item.name;
                            return (
                                <div
                                    key={item.name}
                                    onClick={() => setActiveItemName(item.name)}
                                    style={{
                                        padding: "1.4rem",
                                        borderRadius: 14,
                                        border: `1px solid ${isSelected ? C.primary : C.border}`,
                                        background: isSelected ? C.primaryBg : C.surface,
                                        cursor: "pointer",
                                        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                                        boxShadow: isSelected ? `0 4px 20px ${C.primary}15` : "none",
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isSelected) e.currentTarget.style.borderColor = C.borderMid;
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isSelected) e.currentTarget.style.borderColor = C.border;
                                    }}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                                        <h3 style={{ fontSize: 15, fontWeight: 600, color: isSelected ? C.primaryLight : C.ink, margin: 0 }}>
                                            {item.name}
                                        </h3>
                                        <span style={{ fontSize: 10, fontWeight: 600, background: isSelected ? C.primaryMid : C.surfaceAlt, color: isSelected ? C.accentLight : C.muted, padding: "3px 8px", borderRadius: 99, border: `1px solid ${isSelected ? C.primaryDark : C.border}` }}>
                                            {item.badge}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: 13.5, color: C.inkMid, margin: 0, lineHeight: 1.5 }}>
                                        {item.desc}
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Right Column: Deep-Dive Technical Context View */}
                    {currentItem && (
                        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "2rem", position: "sticky", top: "3.5rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                                <span style={{ fontSize: 11, background: `${C.success}15`, color: C.success, padding: "2px 8px", borderRadius: 6, fontWeight: 600, border: `1px solid ${C.success}30` }}>
                                    Live Spec
                                </span>
                                <span style={{ fontSize: 12, color: C.subtle, fontFamily: "'Geist Mono', monospace" }}>
                                    config://{activeSection.toLowerCase().replace(/\s+/g, '-')}/{currentItem.name.toLowerCase().replace(/\s+/g, '-')}
                                </span>
                            </div>

                            <h2 style={{ fontSize: 20, fontWeight: 600, color: C.ink, marginTop: 0, marginBottom: 14 }}>
                                {currentItem.name}
                            </h2>

                            <p style={{ fontSize: 14.5, color: C.inkMid, lineHeight: 1.6, marginBottom: "1.5rem", marginTop: 0 }}>
                                {currentItem.details}
                            </p>

                            {/* Code Snippet Blueprint Window */}
                            <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: "1rem", fontFamily: "'Geist Mono', monospace", fontSize: 12 }}>
                                <div style={{ color: C.subtle, marginBottom: 6 }}>// Operational verification code blueprint</div>
                                <div>
                                    <span style={{ color: C.primaryLight }}>const</span> pipeline = <span style={{ color: C.accent }}>await</span> AutoQA.<span style={{ color: C.success }}>initialize</span>({'{'}
                                </div>
                                <div style={{ paddingLeft: 16 }}>
                                    scope: <span style={{ color: C.warning }}>"{currentItem.name.toLowerCase()}"</span>,
                                </div>
                                <div style={{ paddingLeft: 16 }}>
                                    traceSelectors: <span style={{ color: C.accentLight }}>true</span>,
                                </div>
                                <div style={{ paddingLeft: 16 }}>
                                    environment: <span style={{ color: C.warning }}>"sandbox-v2"</span>
                                </div>
                                <div>{'}'});</div>
                            </div>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
}