"use client";

import React, { useState, useEffect, useContext } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { TestCase } from "./UserRepoList";
import {
  Play,
  CheckCircle2,
  XCircle,
  Loader2,
  Terminal,
  ExternalLink,
  Globe,
  Code,
  PlayCircle,
  ChevronRight,
  Sparkles,
  Database,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Square,
  X,
} from "lucide-react";
import axios from "axios";
import { UserContext } from "@/context/userContext";
import { C } from "@/app/lib/theme";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onRunComplete?: () => void;
  testCases: TestCase[];
  repository: any;
};

type RunResult = {
  testCaseId: number;
  status: "idle" | "generating" | "running" | "passed" | "failed";
  logs: string[];
  reason?: string;
  error?: string;
  sessionId?: string;
  sessionUrl?: string;
  playwrightScript?: string;
};

// ─── Status badge component ───────────────────────────────────────
function StatusBadge({ status, isRunning }: { status: RunResult["status"]; isRunning: boolean }) {
  if (isRunning) {
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        fontSize: 10, fontFamily: "'Geist Mono', monospace", fontWeight: 700,
        padding: "3px 9px", borderRadius: 999,
        background: "#1c1a08", color: "#fbbf24", border: "1px solid #92400e50",
        animation: "pulse 1.5s infinite",
      }}>
        <Loader2 style={{ width: 10, height: 10, animation: "spin 1s linear infinite" }} />
        Running
      </span>
    );
  }
  const map: Record<string, { bg: string; color: string; border: string; icon: React.ReactNode; label: string }> = {
    generating: { bg: C.primaryBg, color: C.primaryLight, border: C.primaryMid, icon: <Loader2 style={{ width: 10, height: 10, animation: "spin 1s linear infinite" }} />, label: "Generating" },
    passed:     { bg: "#022c22", color: "#34d399", border: "#10B98140", icon: <CheckCircle2 style={{ width: 10, height: 10 }} />, label: "Passed" },
    failed:     { bg: "#2d0a0a", color: "#f87171", border: "#EF444440", icon: <XCircle style={{ width: 10, height: 10 }} />, label: "Failed" },
    idle:       { bg: C.surfaceAlt, color: C.subtle, border: C.border, icon: null, label: "Queued" },
  };
  const s = map[status] ?? map.idle;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: 10, fontFamily: "'Geist Mono', monospace", fontWeight: 700,
      padding: "3px 9px", borderRadius: 999,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>
      {s.icon}
      {s.label}
    </span>
  );
}

export default function TestExecutionModal({ isOpen, onClose, testCases, repository }: Props) {
  const [baseUrl, setBaseUrl] = useState(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}`);
  const [backendUrl, setBackendUrl] = useState("");
  const [currentIdx, setCurrentIdx] = useState<number>(-1);
  const [isExecuting, setIsExecuting] = useState(false);
  const [results, setResults] = useState<Record<number, RunResult>>({});
  const [selectedDetailId, setSelectedDetailId] = useState<number | null>(null);
  const { userDetail, setUserDetail } = useContext(UserContext);
  const [executionMode, setExecutionMode] = useState<"cache" | "generate">("cache");
  const [customPrompt, setCustomPrompt] = useState("");
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    if (isOpen && testCases.length > 0) {
      const initial: Record<number, RunResult> = {};
      testCases.forEach((tc) => {
        const tcStatus = (tc as any).status;
        const tcLogs = (tc as any).logs;
        const hasPreviousLogs = Array.isArray(tcLogs) && tcLogs.length > 0;
        initial[tc.id] = {
          testCaseId: tc.id,
          status: tcStatus === "passed" || tcStatus === "failed" ? tcStatus : "idle",
          logs: hasPreviousLogs ? tcLogs : ["Waiting to run..."],
          playwrightScript: tc.playwrightScript || undefined,
          sessionId: (tc as any).sessionId || (tc as any).session_id || undefined,
          sessionUrl: (tc as any).sessionUrl || (tc as any).session_url || undefined,
        };
      });
      setResults(initial);
      setSelectedDetailId(testCases[0].id);
      setCurrentIdx(-1);
      setIsExecuting(false);
      setCustomPrompt("");
      setBaseUrl(repository?.targetDomain || repository?.websiteUrl || "http://localhost:3000");
      const hasMissingScript = testCases.some((tc) => !tc.playwrightScript);
      setExecutionMode(hasMissingScript ? "generate" : "cache");
    }
  }, [isOpen, testCases, repository]);

  useEffect(() => {
    if (!isExecuting || currentIdx < 0 || currentIdx >= testCases.length) {
      if (currentIdx >= testCases.length) setIsExecuting(false);
      return;
    }
    const runTest = async () => {
      const currentTestCase = testCases[currentIdx];
      const tcId = currentTestCase.id;
      setSelectedDetailId(tcId);
      const isRegenerating = executionMode === "generate" || !results[tcId]?.playwrightScript;
      setResults((prev) => ({
        ...prev,
        [tcId]: {
          ...prev[tcId],
          status: isRegenerating ? "generating" : "running",
          logs: [isRegenerating
            ? "[SYSTEM] Connecting to AI agent to analyze files and generate script..."
            : "[SYSTEM] Found pre-generated script cached in database, preparing execution..."],
        },
      }));
      try {
        const res = await axios.post("/api/test-cases/run", {
          testCaseId: tcId,
          baseUrl: baseUrl.trim(),
          backendUrl: backendUrl.trim(),
          mode: executionMode,
          customPrompt: customPrompt.trim(),
        });
        const data = res.data;
        if (data.credits !== undefined) setUserDetail((prev: any) => ({ ...prev, credits: data.credits }));
        setResults((prev) => ({
          ...prev,
          [tcId]: {
            testCaseId: tcId,
            status: data.status,
            reason: data.reason || (data.status === "passed" ? "The test completed without runtime errors." : "The test failed during execution. See logs for details."),
            logs: data.logs || [],
            playwrightScript: data.playwrightScript,
            sessionId: data.sessionId,
            sessionUrl: data.sessionUrl,
            error: data.error,
          },
        }));
      } catch (err: any) {
        const errMsg = err.response?.data?.error || err.message || "Execution failed";
        if (err.response?.data?.credits !== undefined) setUserDetail((prev: any) => ({ ...prev, credits: err.response.data.credits }));
        setResults((prev) => ({
          ...prev,
          [tcId]: {
            ...prev[tcId],
            status: "failed",
            error: errMsg,
            logs: [...(prev[tcId]?.logs || []), `[SYSTEM ERROR] ${errMsg}`],
          },
        }));
      }
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      if (nextIdx >= testCases.length) setIsExecuting(false);
    };
    runTest();
  }, [isExecuting, currentIdx, testCases, baseUrl, executionMode]);

  const startExecution = () => {
    const resetResults: Record<number, RunResult> = {};
    testCases.forEach((tc) => {
      resetResults[tc.id] = { testCaseId: tc.id, status: "idle", logs: ["Queued..."], playwrightScript: tc.playwrightScript || undefined };
    });
    setResults(resetResults);
    setIsExecuting(true);
    setCurrentIdx(0);
    setSelectedDetailId(testCases[0].id);
  };

  const stopExecution = () => { setIsExecuting(false); setCurrentIdx(-1); };

  const currentSelectedResult = selectedDetailId ? results[selectedDetailId] : null;
  const currentSelectedTestCase = testCases.find((tc) => tc.id === selectedDetailId);

  // ── Shared style helpers ──
  const monoLabel: React.CSSProperties = {
    fontFamily: "'Geist Mono', monospace", fontSize: 10,
    textTransform: "uppercase", letterSpacing: "0.1em",
    color: C.subtle, fontWeight: 600, display: "flex", alignItems: "center", gap: 5,
    marginBottom: 5,
  };
  const darkInput: React.CSSProperties = {
    background: C.surfaceAlt,
    border: `1px solid ${C.border}`,
    color: C.ink,
    fontFamily: "'Geist Mono', monospace",
    fontSize: 12.5,
    borderRadius: 8, height: 36,
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        style={{
          maxWidth: 1000,
          height: "90vh",
          display: "flex",
          flexDirection: "column",
          padding: "1.5rem",
          gap: 16,
          background: C.bg,
          border: `1px solid ${C.border}`,
          borderRadius: 20,
          overflow: "hidden",
          userSelect: "none",
          boxShadow: `0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px ${C.primaryMid}40`,
        }}
      >
        {/* ── Header ── */}
        <DialogHeader style={{ borderBottom: `1px solid ${C.border}`, paddingBottom: "1rem", flexShrink: 0 }}>
          <DialogTitle style={{
            fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18,
            color: C.ink, display: "flex", alignItems: "center", gap: 10,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: `linear-gradient(135deg, ${C.primaryDark}, ${C.primary})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 4px 12px ${C.primary}44`,
            }}>
              <PlayCircle style={{ width: 18, height: 18, color: "#fff" }} />
            </div>
            Playwright Test Runner
          </DialogTitle>
          <DialogDescription style={{ fontFamily: "'Geist', sans-serif", fontSize: 13, color: C.muted, marginTop: 2 }}>
            Execute Playwright automation scripts across Chromium, Firefox, and WebKit.
          </DialogDescription>
        </DialogHeader>

        {/* ── Config row ── */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 14, padding: "1rem 1.25rem",
          display: "flex", flexDirection: "column", gap: 12, flexShrink: 0,
        }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
            {/* Target URL */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <label style={monoLabel}><Globe style={{ width: 12, height: 12, color: C.primary }} />Target Website URL</label>
              <Input placeholder="http://localhost:3000" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} disabled={isExecuting} style={darkInput} />
            </div>
            {/* Backend URL */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <label style={monoLabel}><Database style={{ width: 12, height: 12, color: C.primary }} />Backend API URL <span style={{ color: C.subtle }}>(optional)</span></label>
              <Input placeholder="http://localhost:8000" value={backendUrl} onChange={(e) => setBackendUrl(e.target.value)} disabled={isExecuting} style={darkInput} />
            </div>
            {/* Buttons */}
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <button
                onClick={() => setShowOptions(!showOptions)}
                style={{
                  height: 36, padding: "0 14px", borderRadius: 8, cursor: "pointer",
                  border: `1px solid ${showOptions ? C.primaryMid : C.border}`,
                  background: showOptions ? C.primaryBg : C.surfaceAlt,
                  color: showOptions ? C.primary : C.inkMid,
                  display: "flex", alignItems: "center", gap: 6,
                  fontFamily: "'Geist', sans-serif", fontSize: 12.5, fontWeight: 500,
                  transition: "all 0.2s",
                }}
              >
                <SlidersHorizontal style={{ width: 13, height: 13 }} />
                Options
                {showOptions ? <ChevronUp style={{ width: 11, height: 11 }} /> : <ChevronDown style={{ width: 11, height: 11 }} />}
              </button>
              {!isExecuting ? (
                <button
                  onClick={startExecution}
                  style={{
                    height: 36, padding: "0 20px", borderRadius: 8, border: "none", cursor: "pointer",
                    background: `linear-gradient(135deg, ${C.primaryDark}, ${C.primary})`,
                    color: "#fff", display: "flex", alignItems: "center", gap: 7,
                    fontFamily: "'Geist', sans-serif", fontSize: 13, fontWeight: 600,
                    boxShadow: `0 4px 14px ${C.primary}38`, transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"
                    ;(e.currentTarget as HTMLButtonElement).style.boxShadow = `0 8px 24px ${C.primary}55`
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.transform = "none"
                    ;(e.currentTarget as HTMLButtonElement).style.boxShadow = `0 4px 14px ${C.primary}38`
                  }}
                >
                  <Play style={{ width: 13, height: 13 }} />
                  Start Execution
                </button>
              ) : (
                <button
                  onClick={stopExecution}
                  style={{
                    height: 36, padding: "0 20px", borderRadius: 8, cursor: "pointer",
                    background: "#2d0a0a", color: "#f87171", border: `1px solid #EF444440`,
                    display: "flex", alignItems: "center", gap: 7,
                    fontFamily: "'Geist', sans-serif", fontSize: 13, fontWeight: 600, transition: "all 0.2s",
                  } as React.CSSProperties}
                >
                  <Square style={{ width: 13, height: 13 }} />
                  Stop Runner
                </button>
              )}
            </div>
          </div>

          {/* Advanced options panel */}
          {showOptions && (
            <div style={{
              paddingTop: 12, borderTop: `1px solid ${C.border}`,
              display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16,
            }}>
              {/* Run mode toggle */}
              <div>
                <p style={{ ...monoLabel, marginBottom: 8 }}>Run Mode</p>
                <div style={{
                  display: "grid", gridTemplateColumns: "1fr 1fr",
                  background: C.surfaceAlt, border: `1px solid ${C.border}`,
                  borderRadius: 8, padding: 3, gap: 3,
                }}>
                  {(["cache", "generate"] as const).map((mode) => (
                    <button
                      key={mode}
                      disabled={isExecuting}
                      onClick={() => setExecutionMode(mode)}
                      style={{
                        padding: "6px 0", borderRadius: 6, border: "none", cursor: isExecuting ? "not-allowed" : "pointer",
                        background: executionMode === mode ? C.primaryBg : "transparent",
                        color: executionMode === mode ? C.primary : C.muted,
                        border: executionMode === mode ? `1px solid ${C.primaryMid}` : "1px solid transparent",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                        fontFamily: "'Geist', sans-serif", fontSize: 12, fontWeight: 600, transition: "all 0.2s",
                      } as React.CSSProperties}
                    >
                      {mode === "cache"
                        ? <><Database style={{ width: 12, height: 12 }} />Run Cached</>
                        : <><Sparkles style={{ width: 12, height: 12 }} />AI Regenerate</>}
                    </button>
                  ))}
                </div>
              </div>
              {/* Custom prompt */}
              <div>
                <p style={{ ...monoLabel, marginBottom: 8 }}>Custom Run Instructions</p>
                <textarea
                  placeholder="e.g. Wait 1s after each click, click the profile dropdown first..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  disabled={isExecuting || executionMode === "cache"}
                  rows={2}
                  style={{
                    width: "100%", borderRadius: 8,
                    border: `1px solid ${C.border}`,
                    background: C.surfaceAlt,
                    color: executionMode === "cache" ? C.subtle : C.ink,
                    fontFamily: "'Geist', sans-serif", fontSize: 12.5,
                    padding: "8px 12px", resize: "none", outline: "none",
                    opacity: executionMode === "cache" ? 0.5 : 1, transition: "opacity 0.2s",
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── Main panel ── */}
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "280px 1fr", gap: 12, overflow: "hidden", minHeight: 0 }}>

          {/* Left: Queue list */}
          <div style={{
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 12, overflowY: "auto", padding: "0.75rem",
            display: "flex", flexDirection: "column", gap: 6,
          }}>
            <p style={{ ...monoLabel, padding: "0 4px", marginBottom: 4 }}>Execution Queue</p>
            {testCases.map((tc, index) => {
              const res = results[tc.id];
              const isActive = selectedDetailId === tc.id;
              const isRunning = currentIdx === index && isExecuting;
              return (
                <div
                  key={tc.id}
                  onClick={() => setSelectedDetailId(tc.id)}
                  style={{
                    padding: "10px 12px", borderRadius: 10, cursor: "pointer",
                    background: isActive ? C.primaryBg : C.surfaceAlt,
                    border: `1px solid ${isActive ? C.primaryMid : C.border}`,
                    boxShadow: isActive ? `0 0 0 1px ${C.primary}20` : "none",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6, marginBottom: 4 }}>
                    <h4 style={{
                      fontFamily: "'Geist', sans-serif", fontWeight: 600, fontSize: 12.5,
                      color: isActive ? C.ink : C.inkMid,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1,
                    }}>
                      {tc.title}
                    </h4>
                    <ChevronRight style={{ width: 13, height: 13, color: isActive ? C.primary : C.subtle, flexShrink: 0 }} />
                  </div>
                  <p style={{
                    fontFamily: "'Geist', sans-serif", fontSize: 11, color: C.subtle,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 8,
                  }}>
                    {tc.description}
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{
                      fontSize: 10, fontFamily: "'Geist Mono', monospace", fontWeight: 600,
                      color: C.primary, background: C.primaryBg, border: `1px solid ${C.primaryMid}`,
                      padding: "1px 7px", borderRadius: 5, textTransform: "uppercase",
                    }}>
                      {tc.type}
                    </span>
                    <StatusBadge status={res?.status || "idle"} isRunning={isRunning} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Detail panel */}
          <div style={{
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 12, display: "flex", flexDirection: "column", overflow: "hidden",
          }}>
            {currentSelectedTestCase ? (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                {/* Case header */}
                <div style={{
                  padding: "0.875rem 1.125rem",
                  borderBottom: `1px solid ${C.border}`,
                  background: C.surfaceAlt,
                  display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12,
                  flexShrink: 0,
                }}>
                  <div>
                    <h3 style={{
                      fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14.5,
                      color: C.ink, marginBottom: 4,
                    }}>
                      {currentSelectedTestCase.title}
                    </h3>
                    <p style={{ fontFamily: "'Geist', sans-serif", fontSize: 12, color: C.muted, marginBottom: 3 }}>
                      Expected: {currentSelectedTestCase.expectedResult}
                    </p>
                    {currentSelectedResult?.reason && (
                      <p style={{
                        fontFamily: "'Geist', sans-serif", fontSize: 12,
                        color: currentSelectedResult.status === "passed" ? "#34d399" : C.muted,
                        fontWeight: 500,
                      }}>
                        {currentSelectedResult.reason}
                      </p>
                    )}
                  </div>
                  {currentSelectedResult?.sessionUrl && (
                    <button
                      onClick={() => window.open(currentSelectedResult.sessionUrl, "_blank")}
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        fontFamily: "'Geist', sans-serif", fontSize: 12, fontWeight: 600,
                        padding: "6px 14px", borderRadius: 8,
                        border: `1px solid ${C.primaryMid}`,
                        background: C.primaryBg, color: C.primary,
                        cursor: "pointer", flexShrink: 0, transition: "all 0.2s",
                      }}
                    >
                      <ExternalLink style={{ width: 13, height: 13 }} />
                      Watch Recording
                    </button>
                  )}
                </div>

                {/* Body */}
                <div style={{
                  flex: 1, display: "flex", flexDirection: "column",
                  padding: "1rem", gap: 12, overflowY: "auto",
                }}>
                  {/* Generated script block */}
                  {currentSelectedResult?.playwrightScript && (
                    <div style={{
                      borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden",
                    }}>
                      <div style={{
                        background: C.surfaceAlt, padding: "8px 12px",
                        borderBottom: `1px solid ${C.border}`,
                        display: "flex", alignItems: "center", gap: 7,
                      }}>
                        <Code style={{ width: 13, height: 13, color: C.primary }} />
                        <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                          Generated Playwright Script
                        </span>
                      </div>
                      <pre style={{
                        padding: "12px 14px",
                        background: "#080f1a",
                        color: "#a3e635",
                        fontFamily: "'Geist Mono', monospace",
                        fontSize: 11, lineHeight: 1.65,
                        overflowX: "auto", maxHeight: 140, margin: 0,
                      }}>
                        {currentSelectedResult.playwrightScript}
                      </pre>
                    </div>
                  )}

                  {/* Terminal logs */}
                  <div style={{
                    flex: 1, borderRadius: 10, border: `1px solid ${C.border}`,
                    overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 180,
                  }}>
                    <div style={{
                      background: "#080f1a",
                      padding: "8px 12px",
                      borderBottom: "1px solid #1a2540",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      flexShrink: 0,
                    }}>
                      <span style={{
                        display: "flex", alignItems: "center", gap: 6,
                        fontFamily: "'Geist Mono', monospace", fontSize: 11,
                        color: "#a3e635", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em",
                      }}>
                        <Terminal style={{ width: 12, height: 12 }} />
                        Console Output
                      </span>
                      <span style={{
                        fontFamily: "'Geist Mono', monospace", fontSize: 10,
                        color: C.subtle, textTransform: "uppercase", letterSpacing: "0.06em",
                        background: C.surfaceAlt, padding: "2px 8px", borderRadius: 4,
                        border: `1px solid ${C.border}`,
                      }}>
                        {currentSelectedResult?.status || "idle"}
                      </span>
                    </div>
                    <div style={{
                      flex: 1, padding: "10px 14px",
                      background: "#080f1a",
                      fontFamily: "'Geist Mono', monospace", fontSize: 11,
                      overflowY: "auto", display: "flex", flexDirection: "column", gap: 4,
                      userSelect: "text",
                    }}>
                      {currentSelectedResult?.logs
                        ?.filter((log) =>
                          log.startsWith("[SYSTEM]") ||
                          log.startsWith("[SYSTEM ERROR]") ||
                          log.startsWith("[BROWSER]") ||
                          log.startsWith("[ERROR]")
                        )
                        .map((log, lIdx) => (
                          <div key={lIdx} style={{ lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                            {log.startsWith("[SYSTEM]") ? (
                              <span style={{ color: "#60a5fa" }}>{log}</span>
                            ) : log.startsWith("[SYSTEM ERROR]") ? (
                              <span style={{ color: "#f87171", fontWeight: 700 }}>{log}</span>
                            ) : log.startsWith("[BROWSER]") ? (
                              <span style={{ color: "#c084fc" }}>{log}</span>
                            ) : log.startsWith("[ERROR]") ? (
                              <span style={{ color: "#f87171" }}>{log}</span>
                            ) : null}
                          </div>
                        ))}
                      {currentSelectedResult?.error && (
                        <div style={{
                          color: "#f87171", fontWeight: 700,
                          marginTop: 6, paddingTop: 6,
                          borderTop: "1px solid #1a2540",
                        }}>
                          Error: {currentSelectedResult.error}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{
                flex: 1, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                padding: "2rem", textAlign: "center",
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 14,
                  background: C.surfaceAlt, border: `1px solid ${C.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16,
                }}>
                  <Terminal style={{ width: 24, height: 24, color: C.subtle }} />
                </div>
                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 15, color: C.inkMid, marginBottom: 6 }}>
                  No Test Case Selected
                </h3>
                <p style={{ fontFamily: "'Geist', sans-serif", fontSize: 13, color: C.subtle, maxWidth: 280, lineHeight: 1.6 }}>
                  Select a test case from the queue to inspect its console logs and generated Playwright script.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{
          borderTop: `1px solid ${C.border}`, paddingTop: 12,
          display: "flex", justifyContent: "flex-end", flexShrink: 0,
        }}>
          <button
            onClick={onClose}
            disabled={isExecuting}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              fontFamily: "'Geist', sans-serif", fontSize: 13, fontWeight: 500,
              padding: "8px 20px", borderRadius: 8,
              border: `1px solid ${C.border}`, background: "transparent",
              color: isExecuting ? C.subtle : C.inkMid,
              cursor: isExecuting ? "not-allowed" : "pointer", transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              if (!isExecuting) {
                ;(e.currentTarget as HTMLButtonElement).style.borderColor = C.borderMid
                ;(e.currentTarget as HTMLButtonElement).style.color = C.ink
              }
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.borderColor = C.border
              ;(e.currentTarget as HTMLButtonElement).style.color = C.inkMid
            }}
          >
            <X style={{ width: 14, height: 14 }} />
            Close &amp; Refresh Status
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}