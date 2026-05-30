'use client'

import React, { useState } from 'react'
import { TestCase } from './UserRepoList'
import { Checkbox } from '../ui/checkbox'
import { Play, RefreshCw } from 'lucide-react'
import TestCaseSettingDialog from './TestCaseSettingDialog'
import TestExecutionModal from './TestCaseExecutionModel'
import { C } from '@/app/lib/theme'

type Props = {
  testCases: TestCase[]
  onReload: any
  repository: any
}

// ── Status pill ────────────────────────────────────────────────────
function StatusPill({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; dot: string; label: string }> = {
    passed:    { bg: '#022c22', color: '#34d399', dot: '#10B981', label: 'Passed'   },
    failed:    { bg: '#2d0a0a', color: '#f87171', dot: '#EF4444', label: 'Failed'   },
    running:   { bg: '#1c1a08', color: '#fbbf24', dot: '#F59E0B', label: 'Running'  },
    generated: { bg: C.primaryBg, color: C.primary, dot: C.primaryLight, label: 'Pending' },
  }
  const s = map[status] ?? { bg: C.surfaceAlt, color: C.subtle, dot: C.border, label: 'Queued' }

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 11, fontFamily: "'Geist Mono', monospace", fontWeight: 600,
      padding: '3px 10px', borderRadius: 999,
      background: s.bg, color: s.color,
      border: `1px solid ${s.dot}40`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
      {s.label}
    </span>
  )
}

// ── Type pill ─────────────────────────────────────────────────────
function TypePill({ type }: { type: string }) {
  return (
    <span style={{
      fontSize: 10.5, fontFamily: "'Geist Mono', monospace", fontWeight: 600,
      padding: '2px 9px', borderRadius: 6,
      background: C.primaryBg, color: C.primaryLight,
      border: `1px solid ${C.primaryMid}`,
      textTransform: 'uppercase', letterSpacing: '0.04em',
    }}>
      {type}
    </span>
  )
}

function TestCasesList({ testCases, onReload, repository }: Props) {
  const [selectedTestCases, setSelectedTestCases] = useState<TestCase[]>([])
  const [isModelOpen, setIsModelOpen] = useState(false)

  const handleSelectedTestCase = (checked: boolean | string, testCase: TestCase) => {
    if (checked) setSelectedTestCases((prev) => [...prev, testCase])
    else setSelectedTestCases((prev) => prev.filter((item) => item.id !== testCase.id))
  }

  const handleSelectAll = (checked: boolean | string) => {
    if (checked) setSelectedTestCases([...testCases])
    else setSelectedTestCases([])
  }

  const allSelected = selectedTestCases.length === testCases.length && testCases.length > 0

  return (
    <div>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <p style={{
          fontFamily: "'Geist Mono', monospace", fontSize: 11,
          textTransform: 'uppercase', letterSpacing: '0.1em',
          color: C.subtle, fontWeight: 600,
        }}>
          Generated Test Cases
        </p>
        <button
          onClick={() => onReload(testCases[0]?.repoId)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontFamily: "'Geist', sans-serif", fontSize: 12, fontWeight: 500,
            padding: '5px 12px', borderRadius: 7,
            border: `1px solid ${C.border}`, background: C.surfaceAlt, color: C.inkMid,
            cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.borderColor = C.primaryMid
            ;(e.currentTarget as HTMLButtonElement).style.color = C.ink
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.borderColor = C.border
            ;(e.currentTarget as HTMLButtonElement).style.color = C.inkMid
          }}
        >
          <RefreshCw style={{ width: 12, height: 12 }} />
          Refresh
        </button>
      </div>

      {/* Table */}
      <div style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 12, overflow: 'hidden',
      }}>
        {/* Select-all row */}
        {testCases.length > 0 && (
          <div style={{
            padding: '10px 16px',
            borderBottom: `1px solid ${C.border}`,
            background: C.surfaceAlt,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <Checkbox
              checked={allSelected}
              onCheckedChange={handleSelectAll}
              style={{ borderColor: C.border }}
            />
            <span style={{ fontFamily: "'Geist', sans-serif", fontSize: 12.5, color: C.muted, fontWeight: 500 }}>
              Select All — {selectedTestCases.length} / {testCases.length} selected
            </span>
          </div>
        )}

        {/* Rows */}
        {testCases.map((testCase, index) => {
          const isChecked = selectedTestCases.some((item) => item.id === testCase.id)
          return (
            <div
              key={testCase.id}
              style={{
                padding: '12px 16px',
                borderBottom: index < testCases.length - 1 ? `1px solid ${C.border}` : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                background: isChecked ? `${C.primary}08` : 'transparent',
                transition: 'background 0.2s',
              }}
            >
              {/* Left: checkbox + text */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, minWidth: 0 }}>
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={(checked) => handleSelectedTestCase(checked, testCase)}
                  style={{ marginTop: 2, borderColor: C.border, flexShrink: 0 }}
                />
                <div style={{ minWidth: 0 }}>
                  <h2 style={{
                    fontFamily: "'Geist', sans-serif", fontWeight: 600, fontSize: 13.5,
                    color: C.ink, marginBottom: 3,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {testCase?.title}
                  </h2>
                  <p style={{
                    fontFamily: "'Geist', sans-serif", fontSize: 12, color: C.muted, lineHeight: 1.5,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {testCase?.description}
                  </p>
                </div>
              </div>

              {/* Right: badges + settings */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <TypePill type={testCase?.type} />
                <StatusPill status={testCase?.status} />
                <TestCaseSettingDialog testCase={testCase} setReload={onReload} />
              </div>
            </div>
          )
        })}

        {/* Footer: run bar */}
        <div style={{
          padding: '12px 16px',
          borderTop: `1px solid ${C.border}`,
          background: C.surfaceAlt,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        }}>
          <span style={{ fontFamily: "'Geist', sans-serif", fontSize: 13, color: C.muted }}>
            {selectedTestCases.length === 0
              ? 'Select test cases above to run'
              : `${selectedTestCases.length} test case${selectedTestCases.length > 1 ? 's' : ''} selected`}
          </span>
          <button
            disabled={selectedTestCases.length === 0}
            onClick={() => setIsModelOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              fontFamily: "'Geist', sans-serif", fontWeight: 600, fontSize: 13,
              padding: '9px 20px', borderRadius: 9, border: 'none',
              cursor: selectedTestCases.length === 0 ? 'not-allowed' : 'pointer',
              background: selectedTestCases.length === 0
                ? C.border
                : `linear-gradient(135deg, ${C.primaryDark}, ${C.primary})`,
              color: selectedTestCases.length === 0 ? C.subtle : '#fff',
              boxShadow: selectedTestCases.length === 0 ? 'none' : `0 4px 14px ${C.primary}38`,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (selectedTestCases.length > 0) {
                ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'
                ;(e.currentTarget as HTMLButtonElement).style.boxShadow = `0 8px 24px ${C.primary}55`
              }
            }}
            onMouseLeave={(e) => {
              if (selectedTestCases.length > 0) {
                ;(e.currentTarget as HTMLButtonElement).style.transform = 'none'
                ;(e.currentTarget as HTMLButtonElement).style.boxShadow = `0 4px 14px ${C.primary}38`
              }
            }}
          >
            <Play style={{ width: 13, height: 13 }} />
            Run Tests
          </button>
        </div>
      </div>

      <TestExecutionModal
        testCases={selectedTestCases}
        repository={repository}
        isOpen={isModelOpen}
        onClose={() => setIsModelOpen(false)}
      />
    </div>
  )
}

export default TestCasesList