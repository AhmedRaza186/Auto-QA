'use client'

import { UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import React, { useContext, useMemo, useState } from 'react'
import { C } from '@/app/lib/theme'
import { UserContext } from '@/context/userContext'
import BillingDialog from './BillingDialog'

const NAV_LINKS = ['Workspace', 'Pricing', 'Docs']

const WorkspaceHeader = () => {
  const [hovered, setHovered] = useState<string | null>(null)
  const { userDetail } = useContext(UserContext)

  const creditsText = useMemo(() => {
    if (userDetail?.credits === null || userDetail?.credits === undefined) return '—'
    try {
      return Number(userDetail.credits).toLocaleString()
    } catch {
      return String(userDetail.credits)
    }
  }, [userDetail?.credits])

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: `${C.bg}e6`,
        backdropFilter: 'blur(18px) saturate(180%)',
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem',
        }}
      >
        {/* Logo */}
        <Link href="/">
          <Image src="/logo-white.svg" alt="AutoTest AI" width={110} height={36} style={{ cursor: 'pointer' }} />
        </Link>

        {/* Nav */}
        <nav style={{ display: 'flex', gap: 2 }}>
          {NAV_LINKS.map((label) => {
            const href = label === 'Workspace' ? '/workspace' : label === 'Docs' ? '/docs' : '#pricing'
            const isHov = hovered === label
            return (
              <Link
                key={label}
                href={href}
                onMouseEnter={() => setHovered(label)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  fontFamily: "'Geist', sans-serif",
                  fontSize: 13,
                  color: isHov ? C.ink : C.muted,
                  textDecoration: 'none',
                  padding: '6px 14px',
                  borderRadius: 8,
                  background: isHov ? C.primaryBg : 'transparent',
                  border: isHov ? `1px solid ${C.primaryMid}` : '1px solid transparent',
                  transition: 'color 0.2s, background 0.2s, border-color 0.2s',
                  fontWeight: 500,
                }}
              >
                {label}
              </Link>
              
            )
          })}
        </nav>

        {/* User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              padding: '6px 10px',
            }}
          >
            <span style={{ fontFamily: "'Geist', sans-serif", fontSize: 12.5, color: C.muted, fontWeight: 600 }}>
              Credits
            </span>
            <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 13.5, color: C.primary, fontWeight: 800 }}>
              {creditsText}
            </span>
          </div>

          <BillingDialog triggerText="Buy credits" />
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
        </div>
      </div>
    </header>
  )
}

export default WorkspaceHeader