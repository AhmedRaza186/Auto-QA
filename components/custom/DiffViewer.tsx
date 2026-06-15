import React, { useMemo } from "react";
import { FileCode } from "lucide-react";
import { C } from "@/app/lib/theme";

interface Props {
  filePath: string;
  originalContent: string;
  newContent: string;
}

interface DiffLine {
  type: "added" | "removed" | "unchanged";
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

export default function DiffViewer({ filePath, originalContent, newContent }: Props) {
  const diffLines = useMemo(() => {
    const oldLines = (originalContent || "").split(/\r?\n/);
    const newLines = (newContent || "").split(/\r?\n/);

    // Dynamic programming LCS (Longest Common Subsequence) algorithm
    const dp: number[][] = Array(oldLines.length + 1)
      .fill(null)
      .map(() => Array(newLines.length + 1).fill(0));

    for (let i = 1; i <= oldLines.length; i++) {
      for (let j = 1; j <= newLines.length; j++) {
        if (oldLines[i - 1] === newLines[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    const result: DiffLine[] = [];
    let i = oldLines.length;
    let j = newLines.length;

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
        result.unshift({
          type: "unchanged",
          content: oldLines[i - 1],
          oldLineNumber: i,
          newLineNumber: j,
        });
        i--;
        j--;
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        result.unshift({
          type: "added",
          content: newLines[j - 1],
          newLineNumber: j,
        });
        j--;
      } else {
        result.unshift({
          type: "removed",
          content: oldLines[i - 1],
          oldLineNumber: i,
        });
        i--;
      }
    }

    return result;
  }, [originalContent, newContent]);

  return (
    <div
      style={{
        borderRadius: 12,
        border: `1px solid ${C.border}`,
        overflow: "hidden",
        background: "#030712",
        display: "flex",
        flexDirection: "column",
        margin: "10px 0",
      }}
    >
      {/* File Header */}
      <div
        style={{
          background: "#0f172a",
          padding: "10px 14px",
          borderBottom: `1px solid ${C.border}`,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <FileCode style={{ width: 14, height: 14, color: C.primary }} />
        <span
          style={{
            fontFamily: "'Geist Mono', monospace",
            fontSize: 12,
            fontWeight: 600,
            color: C.inkMid,
          }}
        >
          {filePath}
        </span>
      </div>

      {/* Diff Content */}
      <div
        style={{
          overflowX: "auto",
          maxHeight: 400,
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontFamily: "'Geist Mono', monospace",
            fontSize: 11,
            lineHeight: 1.5,
            textAlign: "left",
          }}
        >
          <tbody>
            {diffLines.map((line, index) => {
              let bg = "transparent";
              let color: string = C.muted;
              let sign = " ";
              
              if (line.type === "added") {
                bg = "rgba(16, 185, 129, 0.12)";
                color = "#34d399";
                sign = "+";
              } else if (line.type === "removed") {
                bg = "rgba(239, 68, 68, 0.12)";
                color = "#f87171";
                sign = "-";
              } else {
                color = "#94a3b8"; // unchanged code color
              }

              const lineNumStyle: React.CSSProperties = {
                width: 35,
                minWidth: 35,
                textAlign: "right",
                paddingRight: 10,
                color: "#475569",
                userSelect: "none",
                borderRight: "1px solid #1e293b",
                background: "#080f1a",
              };

              return (
                <tr
                  key={index}
                  style={{
                    background: bg,
                    color: color,
                  }}
                >
                  {/* Old line number */}
                  <td style={lineNumStyle}>
                    {line.oldLineNumber !== undefined ? line.oldLineNumber : ""}
                  </td>
                  {/* New line number */}
                  <td style={lineNumStyle}>
                    {line.newLineNumber !== undefined ? line.newLineNumber : ""}
                  </td>
                  {/* Sign (+ or -) */}
                  <td
                    style={{
                      width: 20,
                      minWidth: 20,
                      textAlign: "center",
                      userSelect: "none",
                      color: line.type === "added" ? "#10b981" : line.type === "removed" ? "#ef4444" : "#475569",
                      fontWeight: 700,
                    }}
                  >
                    {sign}
                  </td>
                  {/* Code line content */}
                  <td
                    style={{
                      paddingLeft: 8,
                      whiteSpace: "pre",
                    }}
                  >
                    {line.content}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
