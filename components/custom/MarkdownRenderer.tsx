"use client";

import React, { useState } from "react";
import { C } from "@/app/lib/theme";
import { Copy, Check, Terminal, Sparkles, AlertTriangle, Lightbulb, PlayCircle, ShieldCheck } from "lucide-react";

interface Block {
  type: "heading" | "list" | "code" | "paragraph";
  level?: number;
  content: string | string[];
  lang?: string;
}

function parseInlineStyles(text: string): React.ReactNode[] {
  // Matches bold (**text**) and inline code (`code`)
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} style={{ color: C.ink, fontWeight: 700 }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={index}
          style={{
            fontFamily: "'Geist Mono', monospace",
            fontSize: "12px",
            background: C.surfaceAlt,
            border: `1px solid ${C.border}`,
            padding: "2px 6px",
            borderRadius: "6px",
            color: C.accentLight,
          }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code: ", err);
    }
  };

  return (
    <div
      style={{
        borderRadius: 10,
        border: `1px solid ${C.border}`,
        background: "#080f1a",
        overflow: "hidden",
        margin: "14px 0",
        boxShadow: "0 8px 20px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(99, 102, 241, 0.15)",
      }}
    >
      {/* Code Header */}
      <div
        style={{
          background: C.surfaceAlt,
          padding: "8px 14px",
          borderBottom: `1px solid ${C.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Terminal style={{ width: 13, height: 13, color: C.accentLight }} />
          <span
            style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: 10,
              color: C.muted,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {lang || "Code Block"}
          </span>
        </div>
        <button
          onClick={handleCopy}
          style={{
            background: copied ? `${C.success}15` : "transparent",
            border: `1px solid ${copied ? C.success : C.border}`,
            borderRadius: 6,
            color: copied ? C.success : C.muted,
            fontSize: 11,
            fontFamily: "'Geist', sans-serif",
            fontWeight: 500,
            padding: "4px 10px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 5,
            transition: "all 0.2s ease",
          }}
        >
          {copied ? (
            <>
              <Check style={{ width: 12, height: 12 }} />
              Copied!
            </>
          ) : (
            <>
              <Copy style={{ width: 12, height: 12 }} />
              Copy Code
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <pre
        style={{
          padding: "14px",
          color: "#e2e8f0",
          fontFamily: "'Geist Mono', monospace",
          fontSize: "12px",
          lineHeight: 1.65,
          overflowX: "auto",
          margin: 0,
          background: "#080f1a",
          maxHeight: "380px",
        }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}

function parseMarkdown(text: string): Block[] {
  const lines = text.split(/\r?\n/);
  const blocks: Block[] = [];
  let currentCodeBlock: { lang: string; lines: string[] } | null = null;
  let currentListBlock: string[] | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Handle code blocks
    if (line.trim().startsWith("```")) {
      if (currentCodeBlock) {
        blocks.push({
          type: "code",
          lang: currentCodeBlock.lang,
          content: currentCodeBlock.lines.join("\n"),
        });
        currentCodeBlock = null;
      } else {
        if (currentListBlock) {
          blocks.push({ type: "list", content: currentListBlock });
          currentListBlock = null;
        }
        const lang = line.trim().slice(3).trim();
        currentCodeBlock = { lang, lines: [] };
      }
      continue;
    }

    if (currentCodeBlock) {
      currentCodeBlock.lines.push(line);
      continue;
    }

    // Handle lists
    const listMatch = line.match(/^(\s*)[-*+]\s+(.*)$/);
    if (listMatch) {
      if (!currentListBlock) {
        currentListBlock = [];
      }
      currentListBlock.push(listMatch[2]);
      continue;
    } else {
      if (currentListBlock) {
        blocks.push({ type: "list", content: currentListBlock });
        currentListBlock = null;
      }
    }

    // Handle headings
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const content = headingMatch[2].trim();
      blocks.push({ type: "heading", level, content });
      continue;
    }

    // Handle empty lines
    if (!line.trim()) {
      continue;
    }

    // Handle paragraphs
    blocks.push({ type: "paragraph", content: line.trim() });
  }

  // Flush remaining blocks
  if (currentCodeBlock) {
    blocks.push({
      type: "code",
      lang: currentCodeBlock.lang,
      content: currentCodeBlock.lines.join("\n"),
    });
  }
  if (currentListBlock) {
    blocks.push({ type: "list", content: currentListBlock });
  }

  return blocks;
}

export default function MarkdownRenderer({ content }: { content: string }) {
  if (!content) return null;

  const blocks = parseMarkdown(content);

  const getHeadingStyle = (level: number, title: string) => {
    // Check headings to apply custom badge styles
    const isError = title.toLowerCase().includes("fail") || title.toLowerCase().includes("error");
    const isSuccess = title.toLowerCase().includes("succeed") || title.toLowerCase().includes("summary");
    const isFix = title.toLowerCase().includes("fix") || title.toLowerCase().includes("insight") || title.toLowerCase().includes("cause");

    let color: string = C.ink;
    let bg = "transparent";
    let border = "none";
    let icon = null;

    if (isError) {
      color = "#f87171";
      bg = "rgba(239, 68, 68, 0.08)";
      border = "1px solid rgba(239, 68, 68, 0.2)";
      icon = <AlertTriangle style={{ width: 16, height: 16, color: C.danger }} />;
    } else if (isSuccess) {
      color = "#34d399";
      bg = "rgba(16, 185, 129, 0.08)";
      border = "1px solid rgba(16, 185, 129, 0.2)";
      icon = <ShieldCheck style={{ width: 16, height: 16, color: C.success }} />;
    } else if (isFix) {
      color = C.accentLight;
      bg = "rgba(6, 182, 212, 0.08)";
      border = "1px solid rgba(6, 182, 212, 0.2)";
      icon = <Lightbulb style={{ width: 16, height: 16, color: C.accentLight }} />;
    }

    return {
      style: {
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 700,
        fontSize: level === 1 ? "20px" : level === 2 ? "16px" : "14.5px",
        color,
        background: bg,
        border,
        padding: bg !== "transparent" ? "8px 12px" : "0",
        borderRadius: "8px",
        marginTop: "20px",
        marginBottom: "12px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
      } as React.CSSProperties,
      icon,
    };
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {blocks.map((block, index) => {
        switch (block.type) {
          case "heading": {
            const level = block.level || 3;
            // Clean markdown symbol emojis if we prepended custom ones, or keep them
            const titleText = block.content as string;
            const { style, icon } = getHeadingStyle(level, titleText);
            return (
              <div key={index} style={style}>
                {icon}
                <span>{titleText}</span>
              </div>
            );
          }

          case "list": {
            const listItems = block.content as string[];
            return (
              <ul
                key={index}
                style={{
                  paddingLeft: "4px",
                  margin: "6px 0 12px 0",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  listStyle: "none",
                }}
              >
                {listItems.map((item, idx) => (
                  <li
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                      fontSize: "13.5px",
                      lineHeight: "1.6",
                      color: C.inkMid,
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: C.primaryLight,
                        marginTop: "8px",
                        flexShrink: 0,
                        boxShadow: `0 0 8px ${C.primaryLight}`,
                      }}
                    />
                    <span style={{ flex: 1 }}>{parseInlineStyles(item)}</span>
                  </li>
                ))}
              </ul>
            );
          }

          case "code": {
            return (
              <CodeBlock
                key={index}
                code={block.content as string}
                lang={block.lang || ""}
              />
            );
          }

          case "paragraph":
          default: {
            return (
              <p
                key={index}
                style={{
                  fontFamily: "'Geist', sans-serif",
                  fontSize: "13.5px",
                  lineHeight: "1.7",
                  color: C.inkMid,
                  margin: "4px 0 8px 0",
                }}
              >
                {parseInlineStyles(block.content as string)}
              </p>
            );
          }
        }
      })}
    </div>
  );
}
