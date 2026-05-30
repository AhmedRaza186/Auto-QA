'use client'

import Image from 'next/image'
import React from 'react'
import { useRouter } from 'next/navigation'
import { C } from '@/app/lib/theme'
import { GitBranch } from 'lucide-react'

const EmptyWorkspace = () => {
  const router = useRouter()

  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        padding: '4rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 16,
      }}
    >
      {/* Icon container */}
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 18,
          background: C.primaryBg,
          border: `1px solid ${C.primaryMid}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 8,
        }}
      >
        <GitBranch style={{ width: 32, height: 32, color: C.primary }} />
      </div>

      <h2
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '1.25rem',
          fontWeight: 700,
          color: C.ink,
          letterSpacing: '-0.01em',
        }}
      >
        No Repositories Connected
      </h2>

      <p
        style={{
          fontFamily: "'Geist', sans-serif",
          fontSize: 14,
          color: C.muted,
          maxWidth: 380,
          lineHeight: 1.65,
        }}
      >
        Connect your <span style={{ color: C.ink, fontWeight: 600 }}>GitHub</span> account and add a repository to
        start generating and executing Playwright test cases with AI.
      </p>

      <button
        onClick={() => router.push('/api/github')}
        style={{
          marginTop: 8,
          fontFamily: "'Geist', sans-serif",
          fontWeight: 600,
          fontSize: 14,
          padding: '11px 24px',
          borderRadius: 10,
          border: 'none',
          cursor: 'pointer',
          background: `linear-gradient(135deg, ${C.primaryDark}, ${C.primary})`,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          boxShadow: `0 4px 14px ${C.primary}38`,
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.boxShadow = `0 8px 24px ${C.primary}55`
          ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.boxShadow = `0 4px 14px ${C.primary}38`
          ;(e.currentTarget as HTMLButtonElement).style.transform = 'none'
        }}
      >
        <GitBranch style={{ width: 16, height: 16 }} />
        Connect Repository
      </button>
    </div>
  )
}

export default EmptyWorkspace