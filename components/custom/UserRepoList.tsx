'use client'

import React, { useContext, useState } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  CheckCircle2,
  Sparkles,
  TrendingUp,
  XCircle,
  ListChecks,
  Loader2,
  Loader2Icon,
  Link2Icon,
  GitBranch,
} from 'lucide-react'
import axios from 'axios'
import { UserContext } from '@/context/userContext'
import TestCasesList from './TestCasesList'
import RepoSettings from './RepoSettings'
import { C } from '@/app/lib/theme'

export interface UserRepo {
  id: number
  userId: number
  repoId: number
  name: string
  full_name: string
  private_: number
  html_url: string
  description: string | null
  owner: string
  default_branch: string
  language: string | null
  targetDomain?: string
  gloablInstruction?: string
}

interface Props {
  repoList: UserRepo[]
  setReload: () => void
}

export type TestCase = {
  id: number
  title: string
  description: string
  type: string
  repoId: number
  targetFiles: string[]
  expectedResult: string
  repoName: string
  repoOwner: string
  targetRoute: string
  status: string
  playwrightScript?: string | null
  logs?: string[] | null
  sessionId?: string | null
  sessionUrl?: string | null
}

type StatusData = {
  totalTests: number
  passedTests: number
  failedTests: number
  passRate: number
}

const UserRepoList = ({ repoList, setReload }: Props) => {
  const { userDetail } = useContext(UserContext)
  const [loading, setLoading] = useState(false)
  const [testCaseloading, setTestCaseloading] = useState(false)
  const [testCases, setTestCases] = useState<TestCase[]>([])
  const [statusData, setStatusData] = useState<StatusData>({
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    passRate: 0,
  })

  const handleGenerateTestCases = async (repo: UserRepo) => {
    try {
      setLoading(true)
      const res = await axios.post('/api/generate-test-cases', {
        userId: userDetail?.id,
        repoId: repo.repoId,
        owner: repo.owner,
        repo: repo.name,
        branch: repo.default_branch,
      })
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  async function getTestCases(repoId: number) {
    try {
      setTestCaseloading(true)
      setTestCases([])
      const res = await axios.get(`/api/test-cases?repoId=${repoId}`)
      const userTestCases = res.data as TestCase[]
      const passedTests = userTestCases?.filter((tc) => tc.status === 'passed').length || 0
      const failedTests = userTestCases?.filter((tc) => tc.status === 'failed').length || 0
      const passRate = userTestCases?.length ? Math.round((passedTests / userTestCases.length) * 100) : 0
      setStatusData({ totalTests: res.data.length, passedTests, failedTests, passRate })
      setTestCases(res.data)
    } catch (error) {
    } finally {
      setTestCaseloading(false)
    }
  }

  return (
    <div>
      <p
        style={{
          fontFamily: "'Geist Mono', monospace",
          fontSize: 11,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: C.subtle,
          marginBottom: '1.25rem',
          fontWeight: 600,
        }}
      >
        Repositories
      </p>

      <Accordion
        type="single"
        collapsible
        onValueChange={(value) => {
          if (value) getTestCases(Number(value))
        }}
      >
        {repoList.map((repo) => (
          <AccordionItem
            value={repo.repoId.toString()}
            key={repo.repoId}
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 14,
              marginBottom: 10,
              padding: '0 1.25rem',
              overflow: 'hidden',
            }}
          >
            {/* Trigger */}
            <AccordionTrigger style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 9,
                    background: C.primaryBg,
                    border: `1px solid ${C.primaryMid}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <GitBranch style={{ width: 16, height: 16, color: C.primary }} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <h2
                    style={{
                      fontFamily: "'Geist', sans-serif",
                      fontWeight: 600,
                      fontSize: 14.5,
                      color: C.ink,
                      marginBottom: 2,
                    }}
                  >
                    {repo.full_name}
                  </h2>
                  <p style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11.5, color: C.muted }}>
                    {repo.default_branch}
                    {repo.language && ` · ${repo.language}`}
                  </p>
                </div>
              </div>
            </AccordionTrigger>

            {/* Content */}
            <AccordionContent>
              <div style={{ paddingTop: '1rem', paddingBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: 18 }}>

                {/* Target domain row */}
                <div
                  style={{
                    background: C.surfaceAlt,
                    border: `1px solid ${C.border}`,
                    borderRadius: 10,
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <Link2Icon style={{ width: 16, height: 16, color: C.primary }} />
                    <span style={{ fontFamily: "'Geist', sans-serif", fontSize: 13, color: C.muted }}>Target Domain:</span>
                    <span
                      style={{
                        fontFamily: "'Geist Mono', monospace",
                        fontSize: 12.5,
                        color: C.primary,
                        background: C.primaryBg,
                        border: `1px solid ${C.primaryMid}`,
                        borderRadius: 6,
                        padding: '2px 10px',
                        fontWeight: 500,
                      }}
                    >
                      {repo?.targetDomain || '—'}
                    </span>
                  </div>
                  <RepoSettings repo={repo} setReload={setReload} />
                </div>

                {/* Status cards */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                    gap: 12,
                  }}
                >
                  <StatusCard
                    title="Total Tests"
                    value={statusData?.totalTests}
                    icon={<ListChecks style={{ width: 18, height: 18, color: C.primary }} />}
                    accent={C.primary}
                    accentBg={C.primaryBg}
                  />
                  <StatusCard
                    title="Passed"
                    value={statusData?.passedTests}
                    icon={<CheckCircle2 style={{ width: 18, height: 18, color: '#10B981' }} />}
                    accent="#10B981"
                    accentBg="#022c22"
                  />
                  <StatusCard
                    title="Failed"
                    value={statusData?.failedTests}
                    icon={<XCircle style={{ width: 18, height: 18, color: '#EF4444' }} />}
                    accent="#EF4444"
                    accentBg="#2d0a0a"
                  />
                  <StatusCard
                    title="Pass Rate"
                    value={`${statusData?.passRate}%`}
                    icon={<TrendingUp style={{ width: 18, height: 18, color: '#818CF8' }} />}
                    accent="#818CF8"
                    accentBg={C.primaryBg}
                  />
                </div>

                {/* Test cases list */}
                {!testCaseloading && testCases.length > 0 && (
                  <TestCasesList
                    testCases={testCases}
                    onReload={(repoId: number) => getTestCases(repoId)}
                    repository={repo}
                  />
                )}

                {/* Generate / Loading */}
                {testCaseloading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: C.muted }}>
                    <Loader2Icon style={{ width: 18, height: 18, animation: 'spin 1s linear infinite', color: C.primary }} />
                    <span style={{ fontFamily: "'Geist', sans-serif", fontSize: 13 }}>Loading test cases…</span>
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column' as const,
                      gap: 6,
                      padding: '1rem 1.25rem',
                      background: C.surfaceAlt,
                      border: `1px solid ${C.border}`,
                      borderRadius: 12,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                      <div>
                        <h3
                          style={{
                            fontFamily: "'Geist', sans-serif",
                            fontWeight: 600,
                            fontSize: 14,
                            color: C.ink,
                            marginBottom: 4,
                          }}
                        >
                          Generate AI Test Cases
                        </h3>
                        <p style={{ fontFamily: "'Geist', sans-serif", fontSize: 12.5, color: C.muted, lineHeight: 1.5 }}>
                          Analyze this repository and auto-generate Playwright test scripts using AI.
                        </p>
                      </div>

                      <button
                        onClick={() => handleGenerateTestCases(repo)}
                        disabled={loading}
                        style={{
                          fontFamily: "'Geist', sans-serif",
                          fontWeight: 600,
                          fontSize: 13,
                          padding: '9px 20px',
                          borderRadius: 9,
                          border: 'none',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          background: loading
                            ? C.border
                            : `linear-gradient(135deg, ${C.primaryDark}, ${C.primary})`,
                          color: loading ? C.subtle : '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 7,
                          boxShadow: loading ? 'none' : `0 4px 14px ${C.primary}38`,
                          transition: 'all 0.2s ease',
                          flexShrink: 0,
                        }}
                        onMouseEnter={(e) => {
                          if (!loading) {
                            ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'
                            ;(e.currentTarget as HTMLButtonElement).style.boxShadow = `0 8px 24px ${C.primary}55`
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!loading) {
                            ;(e.currentTarget as HTMLButtonElement).style.transform = 'none'
                            ;(e.currentTarget as HTMLButtonElement).style.boxShadow = `0 4px 14px ${C.primary}38`
                          }
                        }}
                      >
                        {loading ? (
                          <>
                            <Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} />
                            Generating…
                          </>
                        ) : (
                          <>
                            <Sparkles style={{ width: 14, height: 14 }} />
                            Generate Test Cases
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}

export default UserRepoList

// ── Status Card ──────────────────────────────────────────────────────
function StatusCard({
  title,
  value,
  icon,
  accent,
  accentBg,
}: {
  title: string
  value: string | number
  icon: React.ReactNode
  accent: string
  accentBg: string
}) {
  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: '1rem 1.125rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'border-color 0.25s',
      }}
    >
      <div>
        <p
          style={{
            fontFamily: "'Geist', sans-serif",
            fontSize: 11.5,
            color: C.muted,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            fontWeight: 500,
            marginBottom: 4,
          }}
        >
          {title}
        </p>
        <h3
          style={{
            fontFamily: "'Geist Mono', monospace",
            fontSize: '1.5rem',
            fontWeight: 700,
            color: accent,
            lineHeight: 1,
          }}
        >
          {value}
        </h3>
      </div>
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: '50%',
          background: accentBg,
          border: `1px solid ${accent}40`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </div>
    </div>
  )
}