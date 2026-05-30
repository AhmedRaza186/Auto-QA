import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation – Auto-QA",
  description: "Comprehensive documentation for the Auto-QA platform."
};

export default function DocsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: "#0F172A", color: "#F8FAFC" }}>
        {children}
      </body>
    </html>
  );
  
}
