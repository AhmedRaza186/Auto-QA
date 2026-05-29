"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { motion } from "framer-motion";
import { Github, Cpu, Activity, ArrowRight, CheckCircle2, Terminal, Briefcase } from "lucide-react";

export default function Home() {
  // Animation variants for scannable re-use
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] text-zinc-100 flex flex-col font-sans selection:bg-sky-500/30 selection:text-sky-200 relative overflow-x-hidden">

      {/* Premium Ambient Background Noise & Gradients */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f2e_1px,transparent_1px),linear-gradient(to_bottom,#1f1f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#030303]/70 border-b border-zinc-900 px-6 py-4 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <Cpu className="w-4 h-4 text-black" />
            </div>
            <h1 className="font-bold text-lg tracking-tight">
              AI QA <span className="text-sky-400">Agent</span>
            </h1>
          </Link>

          <nav className="flex items-center gap-6">
            <Link href="#features" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors font-medium">
              Features
            </Link>
            <Link href="#preview" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors font-medium">
              Demo
            </Link>
            <span className="h-4 w-px bg-zinc-800" />
            <UserButton afterSignOutUrl="/" />
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative max-w-7xl mx-auto flex flex-col items-center text-center px-6 pt-28 pb-16 flex-1 z-10">

        {/* Animated Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-sky-400 text-xs font-medium tracking-wide backdrop-blur-sm shadow-xl"
        >
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
          </span>
          AI-Powered Test Automation For GitHub Repos
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-black mt-8 leading-[1.15] max-w-4xl tracking-tight text-white"
        >
          Generate & run QA tests for your{" "}
          <span className="bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent drop-shadow-sm">
            GitHub projects
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-zinc-400 mt-6 max-w-2xl text-base sm:text-lg font-normal leading-relaxed"
        >
          Connect your repository instantly. Our intelligent AI worker inspects your codebase, writes precise End-to-End frameworks, and guarantees code health.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 w-full sm:w-auto"
        >
          <Link
            href="/workspace"
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-black font-semibold hover:bg-zinc-200 transition-all shadow-lg shadow-white/5"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* PASTE THE WORKSPACE BUTTON HERE */}
          <Link
            href="/workspace"
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400 font-semibold hover:bg-amber-500/20 hover:border-amber-500/50 transition-all shadow-lg shadow-amber-500/5"
          >
            <Briefcase className="w-4 h-4" />
            Go to Workspace
          </Link>

          <Link
            href="#features"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl border border-zinc-800 bg-zinc-950/50 text-zinc-300 font-medium hover:bg-zinc-900 hover:text-white transition-all backdrop-blur-sm"
          >
            Learn More
          </Link>
        </motion.div>

        {/* Interactive Simulated Terminal Box */}
        <motion.div
          id="preview"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, type: "spring", stiffness: 50 }}
          className="mt-20 w-full max-w-4xl rounded-xl border border-zinc-800/80 bg-[#09090b]/90 shadow-[0_0_50px_-12px_rgba(14,165,233,0.15)] overflow-hidden backdrop-blur-md"
        >
          {/* Window Mac Dots */}
          <div className="flex items-center justify-between border-b border-zinc-900 bg-zinc-950 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-rose-500/70" />
              <div className="h-3 w-3 rounded-full bg-amber-500/70" />
              <div className="h-3 w-3 rounded-full bg-emerald-500/70" />
            </div>
            <div className="text-xs text-zinc-500 font-mono flex items-center gap-1.5">
              <Terminal className="w-3 h-3" /> bash — agent-logs
            </div>
            <div className="w-12" />
          </div>

          {/* Terminal Strings */}
          <div className="p-6 font-mono text-xs sm:text-sm space-y-3 text-left selection:bg-zinc-800">
            <div className="flex items-center gap-2 text-zinc-500">
              <span>$</span>
              <span className="text-zinc-300">npx ai-test-agent@latest initiate ./repo</span>
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="flex items-center gap-2 text-sky-400"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" /> Analyzing file trees & routes architecture...
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8 }}
              className="flex items-center gap-2 text-indigo-400"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" /> Mapping edge-cases & building 14 functional test blocks...
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.6 }}
              className="flex items-center gap-2 text-emerald-400"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" /> Injecting robust Playwright config engine.
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3.2 }}
              className="pt-2 text-emerald-500 font-bold"
            >
              ✔ Pipelines synchronized successfully. Ready to deploy.
            </motion.div>
          </div>
        </motion.div>
      </main>

      {/* Features Grid with Scroll Trigger Animations */}
      <section id="features" className="relative px-6 py-24 max-w-7xl mx-auto w-full z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-sky-500/5 to-transparent blur-3xl opacity-30 pointer-events-none" />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-3 gap-6 relative"
        >
          {[
            {
              title: "Native GitHub Link",
              desc: "Instantly hook securely into private or public repositories. Track branches and pull requests automatically without manual script updates.",
              icon: <Github className="w-5 h-5 text-sky-400" />,
            },
            {
              title: "Autonomous Spec Engines",
              desc: "Deep parsing LLMs intelligently infer your custom workflows to compile dynamic integration testing blocks instantly.",
              icon: <Cpu className="w-5 h-5 text-indigo-400" />,
            },
            {
              title: "Runtime Analytics Hub",
              desc: "Monitor runtime execution metrics safely inside cloud containers. Evaluate code coverage and review UI trace timelines live.",
              icon: <Activity className="w-5 h-5 text-purple-400" />,
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              variants={fadeIn}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="p-8 rounded-2xl border border-zinc-900 bg-[#09090b]/40 hover:bg-[#09090b]/80 hover:border-zinc-800 transition-all group backdrop-blur-sm relative"
            >
              <div className="h-10 w-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-5 group-hover:border-zinc-700 transition-colors">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-lg text-white group-hover:text-sky-400 transition-colors">{feature.title}</h3>
              <p className="text-zinc-400 text-sm mt-3 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-zinc-900 bg-[#050507]/60 backdrop-blur-sm text-center py-8 text-xs text-zinc-500 tracking-wide z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© {new Date().getFullYear()} AI QA Agent Inc. All rights reserved.</div>
          <div className="text-zinc-600">Built with Next.js Engine & Tailwind CSS</div>
        </div>
      </footer>
    </div>
  );
}