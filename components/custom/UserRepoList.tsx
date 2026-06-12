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
      await axios.post('/api/generate-test-cases', {
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
        className="text-[11px] uppercase tracking-[0.12em] font-semibold mb-5"
        style={{ fontFamily: "'Geist Mono', monospace", color: C.subtle }}
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
            className="rounded-[14px] mb-3 px-4 sm:px-5 overflow-hidden"
            style={{ background: C.surface, border: `1px solid ${C.border}` }}
          >
            {/* Trigger */}
            <AccordionTrigger className="py-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-[9px] flex items-center justify-center flex-shrink-0"
                  style={{ background: C.primaryBg, border: `1px solid ${C.primaryMid}` }}
                >
                  <GitBranch style={{ width: 16, height: 16, color: C.primary }} />
                </div>
                <div className="text-left">
                  <h2
                    className="font-semibold text-[14px] sm:text-[14.5px] mb-0.5"
                    style={{ fontFamily: "'Geist', sans-serif", color: C.ink }}
                  >
                    {repo.full_name}
                  </h2>
                  <p className="text-[11px] sm:text-[11.5px]" style={{ fontFamily: "'Geist Mono', monospace", color: C.muted }}>
                    {repo.default_branch}
                    {repo.language && ` · ${repo.language}`}
                  </p>
                </div>
              </div>
            </AccordionTrigger>

            {/* Content */}
            <AccordionContent>
              <div className="pt-4 pb-5 flex flex-col gap-4">

                {/* Target domain row */}
                <div
                  className="rounded-[10px] p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  style={{ background: C.surfaceAlt, border: `1px solid ${C.border}` }}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link2Icon style={{ width: 16, height: 16, color: C.primary, flexShrink: 0 }} />
                    <span className="text-[13px]" style={{ fontFamily: "'Geist', sans-serif", color: C.muted }}>Target Domain:</span>
                    <span
                      className="text-[12.5px] font-medium rounded-[6px] px-2.5 py-0.5"
                      style={{
                        fontFamily: "'Geist Mono', monospace",
                        color: C.primary,
                        background: C.primaryBg,
                        border: `1px solid ${C.primaryMid}`,
                      }}
                    >
                      {repo?.targetDomain || '—'}
                    </span>
                  </div>
                  <div className="flex-shrink-0">
                    <RepoSettings repo={repo} setReload={setReload} />
                  </div>
                </div>

                {/* Status cards grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
                  <div className="flex items-center gap-2.5" style={{ color: C.muted }}>
                    <Loader2Icon
                      style={{ width: 18, height: 18, animation: 'spin 1s linear infinite', color: C.primary }}
                    />
                    <span className="text-[13px]" style={{ fontFamily: "'Geist', sans-serif" }}>Loading test cases…</span>
                  </div>
                ) : (
                  <div
                    className="flex flex-col gap-1.5 p-4 sm:p-5 rounded-[12px]"
                    style={{ background: C.surfaceAlt, border: `1px solid ${C.border}` }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 flex-wrap">
                      <div>
                        <h3
                          className="font-semibold text-[14px] mb-1"
                          style={{ fontFamily: "'Geist', sans-serif", color: C.ink }}
                        >
                          Generate AI Test Cases
                        </h3>
                        <p className="text-[12.5px] leading-relaxed" style={{ fontFamily: "'Geist', sans-serif", color: C.muted }}>
                          Analyze this repository and auto-generate Playwright test scripts using AI.
                        </p>
                      </div>

                      <button
                        onClick={() => handleGenerateTestCases(repo)}
                        disabled={loading}
                        className="flex items-center gap-2 font-semibold text-[13px] px-5 py-2 rounded-[9px] border-none transition-all duration-200 flex-shrink-0 disabled:cursor-not-allowed hover:enabled:-translate-y-px"
                        style={{
                          fontFamily: "'Geist', sans-serif",
                          cursor: loading ? 'not-allowed' : 'pointer',
                          background: loading
                            ? C.border
                            : `linear-gradient(135deg, ${C.primaryDark}, ${C.primary})`,
                          color: loading ? C.subtle : '#fff',
                          boxShadow: loading ? 'none' : `0 4px 14px ${C.primary}38`,
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
      className="rounded-[12px] p-3 sm:p-4 flex items-center justify-between transition-[border-color] duration-200"
      style={{ background: C.surface, border: `1px solid ${C.border}` }}
    >
      <div>
        <p
          className="text-[11px] sm:text-[11.5px] uppercase tracking-[0.06em] font-medium mb-1"
          style={{ fontFamily: "'Geist', sans-serif", color: C.muted }}
        >
          {title}
        </p>
        <h3
          className="text-xl sm:text-2xl font-bold leading-none"
          style={{ fontFamily: "'Geist Mono', monospace", color: accent }}
        >
          {value}
        </h3>
      </div>
      <div
        className="w-9 h-9 sm:w-[38px] sm:h-[38px] rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: accentBg, border: `1px solid ${accent}40` }}
      >
        {icon}
      </div>
    </div>
  )
}