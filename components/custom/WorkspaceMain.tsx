'use client'
import { UserContext } from '@/context/userContext'
import Image from 'next/image'
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
      {(searchParams.get('success') === 'true' || searchParams.get('canceled') === 'true') && (
        <div
          style={{
            marginBottom: '1.25rem',
            background: searchParams.get('success') === 'true' ? '#022c22' : '#1c1a08',
            border: `1px solid ${searchParams.get('success') === 'true' ? '#10B98140' : '#F59E0B40'}`,
            borderRadius: 12,
            padding: '10px 14px',
            fontFamily: "'Geist', sans-serif",
            fontSize: 13,
            color: searchParams.get('success') === 'true' ? '#34d399' : '#fbbf24',
          }}
        >
          {searchParams.get('success') === 'true'
            ? 'Payment successful. Credits will be updated shortly.'
            : 'Payment canceled. No changes were made.'}
        </div>
      )}
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          paddingBottom: '1.5rem',
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '1.875rem',
              fontWeight: 700,
              color: C.ink,
              letterSpacing: '-0.02em',
              marginBottom: 4,
            }}
          >
            Workspace
          </h1>
          <p style={{ fontFamily: "'Geist', sans-serif", fontSize: 13, color: C.muted }}>
            Manage repositories and generate AI-powered Playwright test suites
          </p>
        </div>

        {/* Credits badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: C.primaryBg,
            border: `1px solid ${C.primaryMid}`,
            borderRadius: 10,
            padding: '8px 16px',
          }}
        >
          <Zap style={{ width: 15, height: 15, color: C.primary }} />
          <span style={{ fontFamily: "'Geist', sans-serif", fontSize: 13, color: C.inkMid, fontWeight: 500 }}>
            Credits:&nbsp;
          </span>
          <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 14, color: C.primary, fontWeight: 700 }}>
            {userDetail?.credits ?? '—'}
          </span>
        </div>
      </div>

      {/* GitHub Connect Card */}
      <div
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 14,
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem',
          transition: 'border-color 0.25s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 10,
              background: C.primaryBg,
              border: `1px solid ${C.primaryMid}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <GitBranch style={{ width: 20, height: 20, color: C.primary }} />
          </div>
          <div>
            <h2
              style={{
                fontFamily: "'Geist', sans-serif",
                fontWeight: 600,
                fontSize: 15,
                color: C.ink,
                marginBottom: 2,
              }}
            >
              Connect GitHub &amp; Add Repository
            </h2>
            <p style={{ fontFamily: "'Geist', sans-serif", fontSize: 12.5, color: C.muted }}>
              Link your GitHub account to start generating Playwright test cases
            </p>
          </div>
        </div>

        <div>
          {!token ? (
            <button
              onClick={addRepo}
              style={{
                fontFamily: "'Geist', sans-serif",
                fontWeight: 600,
                fontSize: 13,
                padding: '9px 20px',
                borderRadius: 9,
                border: 'none',
                cursor: 'pointer',
                background: `linear-gradient(135deg, ${C.primaryDark}, ${C.primary})`,
                color: '#fff',
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