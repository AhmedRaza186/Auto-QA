'use client'
import { UserContext } from '@/context/userContext'
import React, { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import axios from 'axios'
import RepoDialog from './RepoDialog'
import UserRepoList, { UserRepo } from './UserRepoList'
import EmptyWorkspace from './EmptyWorkspace'
import { C } from '@/app/lib/theme'
import { Zap, GitBranch } from 'lucide-react'

const WorkspaceMain = () => {
  const { userDetail, setUserDetail } = useContext(UserContext)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [token, setToken] = useState('')
  const [userRepoList, setUserRepoList] = useState<UserRepo[]>([])

  useEffect(() => {
    getGithubUserToken()
  }, [])

  useEffect(() => {
    if (userDetail?.id) {
      getAddedRepos()
    }
  }, [userDetail])

  // Poll for credit update after a successful checkout payment
  useEffect(() => {
    if (searchParams.get('success') === 'true' && setUserDetail) {
      const interval = setInterval(async () => {
        try {
          const res = await axios.post('/api/users')
          if (res?.data?.user) {
            setUserDetail(res.data.user)
          }
        } catch (e) {
          console.error('Error fetching updated user details:', e)
        }
      }, 3000)

      // Clean up/stop polling after 18 seconds
      const timeout = setTimeout(() => {
        clearInterval(interval)
      }, 18000)

      return () => {
        clearInterval(interval)
        clearTimeout(timeout)
      }
    }
  }, [searchParams, setUserDetail])

  const getGithubUserToken = async () => {
    const res = await axios.get('/api/github/token')
    setToken(res.data.token)
  }

  const addRepo = () => {
    router.push('/api/github')
  }

  const getAddedRepos = async () => {
    const result = await axios.get('/api/github/user-repo?userId=' + userDetail?.id)
    setUserRepoList(result.data)
  }

  return (
    <div>
      {/* Payment banner */}
      {(searchParams.get('success') === 'true' || searchParams.get('canceled') === 'true') && (
        <div
          className={`mb-5 rounded-xl px-4 py-3 text-[13px] border ${
            searchParams.get('success') === 'true'
              ? 'bg-[#022c22] border-[#10B98140] text-[#34d399]'
              : 'bg-[#1c1a08] border-[#F59E0B40] text-[#fbbf24]'
          }`}
          style={{ fontFamily: "'Geist', sans-serif" }}
        >
          {searchParams.get('success') === 'true'
            ? 'Payment successful. Credits will be updated shortly.'
            : 'Payment canceled. No changes were made.'}
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-6 border-b border-[#334155]">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-bold tracking-tight mb-1"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: C.ink, letterSpacing: '-0.02em' }}
          >
            Workspace
          </h1>
          <p className="text-[13px]" style={{ fontFamily: "'Geist', sans-serif", color: C.muted }}>
            Manage repositories and generate AI-powered Playwright test suites
          </p>
        </div>

        {/* Credits badge */}
        <div
          className="flex items-center gap-2 rounded-[10px] px-4 py-2 self-start sm:self-auto flex-shrink-0"
          style={{ background: C.primaryBg, border: `1px solid ${C.primaryMid}` }}
        >
          <Zap style={{ width: 15, height: 15, color: C.primary }} />
          <span className="text-[13px] font-medium" style={{ fontFamily: "'Geist', sans-serif", color: C.inkMid }}>
            Credits:&nbsp;
          </span>
          <span className="text-sm font-bold" style={{ fontFamily: "'Geist Mono', monospace", color: C.primary }}>
            {userDetail?.credits ?? '—'}
          </span>
        </div>
      </div>

      {/* GitHub Connect Card */}
      <div
        className="rounded-[14px] p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 transition-[border-color] duration-200"
        style={{ background: C.surface, border: `1px solid ${C.border}` }}
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <div
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-[10px] flex items-center justify-center flex-shrink-0"
            style={{ background: C.primaryBg, border: `1px solid ${C.primaryMid}` }}
          >
            <GitBranch style={{ width: 20, height: 20, color: C.primary }} />
          </div>
          <div>
            <h2
              className="font-semibold text-sm sm:text-[15px] mb-0.5"
              style={{ fontFamily: "'Geist', sans-serif", color: C.ink }}
            >
              Connect GitHub &amp; Add Repository
            </h2>
            <p className="text-xs sm:text-[12.5px]" style={{ fontFamily: "'Geist', sans-serif", color: C.muted }}>
              Link your GitHub account to start generating Playwright test cases
            </p>
          </div>
        </div>

        <div className="flex-shrink-0">
          {!token ? (
            <button
              onClick={addRepo}
              className="font-semibold text-[13px] px-5 py-2 rounded-[9px] border-none cursor-pointer text-white transition-all duration-200 hover:-translate-y-px"
              style={{
                fontFamily: "'Geist', sans-serif",
                background: `linear-gradient(135deg, ${C.primaryDark}, ${C.primary})`,
                boxShadow: `0 4px 14px ${C.primary}38`,
              }}
            >
              ⬡ Setup GitHub
            </button>
          ) : (
            <RepoDialog setRefreshPage={() => getAddedRepos()} userRepoList={userRepoList} />
          )}
        </div>
      </div>

      {/* Repo list / empty state */}
      <div>
        {userRepoList?.length === 0 ? (
          <EmptyWorkspace />
        ) : (
          <UserRepoList repoList={userRepoList} setReload={() => getAddedRepos()} />
        )}
      </div>
    </div>
  )
}

export default WorkspaceMain