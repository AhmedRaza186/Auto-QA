import "../globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Documentation – Auto-QA",
  description: "Comprehensive documentation for the Auto-QA platform.",
};

export default function DocsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div style={{ minHeight: "100vh" }}>
      {children}
    </div>
  );
}