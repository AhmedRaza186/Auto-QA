import React, { useContext, useEffect, useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { DialogClose } from '@radix-ui/react-dialog'
import axios from 'axios'
import { Card } from '../ui/card'
import { Input } from '../ui/input'
import { UserContext } from '@/context/userContext'
import { C } from '@/app/lib/theme'
import { GitBranch, Lock, Unlock, Plus, X } from 'lucide-react'

export type Repo = {
  id: number
  name: string
  full_name: string
  html_url: string
  private_: boolean
  language: string
  description: string
  default_branch: string
  owner: string
}

import { UserRepo } from './UserRepoList'

const RepoDialog = ({
  setRefreshPage,
  userRepoList,
}: {
  setRefreshPage: (refresh: boolean) => void
  userRepoList: UserRepo[]
}) => {
  const [repoList, setRepoList] = useState<Repo[]>([])
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null)
  const [userSearch, setUserSearch] = useState('')
  const { userDetail } = useContext(UserContext)
  const [isOpen, setIsOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getRepos()
  }, [])

  const getRepos = async () => {
    const result = await axios.get('/api/github/repos')
    setRepoList(result.data)
  }

  const filterRepos = useMemo(() => {
    const query = userSearch.toLowerCase().trim()
    if (!query) return repoList
    return repoList.filter((repo) => repo.name.toLowerCase().includes(query))
  }, [repoList, userSearch])

  const saveRepo = async (repo: Repo) => {
    if (!repo) return
    setSaving(true)
    const result = await axios.post('/api/github/user-repo', {
      repoId: repo.id,
      userId: userDetail?.id,
      repoName: repo.name,
      full_name: repo.full_name,
      private_: repo.private_,
      description: repo.description,
      owner: repo.owner,
      language: repo.language,
      html_url: repo.html_url,
      default_branch: repo.default_branch,
    })
    console.log(result.data)
    setRefreshPage(true)
    setSaving(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          style={{
            fontFamily: "'Geist', sans-serif",
            fontWeight: 600,
            fontSize: 13,
            padding: '9px 18px',
            borderRadius: 9,
            border: 'none',
            cursor: 'pointer',
            background: `linear-gradient(135deg, ${C.primaryDark}, ${C.primary})`,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            boxShadow: `0 4px 14px ${C.primary}38`,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'
            ;(e.currentTarget as HTMLButtonElement).style.boxShadow = `0 8px 24px ${C.primary}55`
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.transform = 'none'
            ;(e.currentTarget as HTMLButtonElement).style.boxShadow = `0 4px 14px ${C.primary}38`
          }}
        >
          <Plus style={{ width: 14, height: 14 }} />
          Add Repo
        </button>
      </DialogTrigger>

      <DialogContent
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          color: C.ink,
          maxWidth: 480,
        }}
      >
        <DialogHeader>
          <DialogTitle
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: 16,
              color: C.ink,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <GitBranch style={{ width: 18, height: 18, color: C.primary }} />
            Add Repository
          </DialogTitle>
          <DialogDescription
            style={{ fontFamily: "'Geist', sans-serif", fontSize: 13, color: C.muted }}
          >
            Search and select a GitHub repository to begin generating Playwright test scripts automatically.
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div
          style={{
            background: C.surfaceAlt,
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            padding: '0.5rem 0.75rem',
            marginTop: 4,
          }}
        >
          <Input
            placeholder="Search repositories…"
            onChange={(e) => setUserSearch(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: C.ink,
              fontFamily: "'Geist', sans-serif",
              fontSize: 13,
              outline: 'none',
              boxShadow: 'none',
            }}
          />
        </div>

        {/* Repo list */}
        <ul
          style={{
            overflowY: 'auto',
            maxHeight: 260,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            marginTop: 4,
            padding: 0,
            listStyle: 'none',
          }}
        >
          {filterRepos.map((repo) => {
            const isAdded = userRepoList.some((ur) => ur.repoId === repo.id)
            const isSelected = selectedRepo?.id === repo.id
            return (
              <li
                key={repo.id}
                onClick={() => setSelectedRepo(repo)}
                style={{
                  background: isSelected ? C.primaryBg : C.surfaceAlt,
                  border: `1px solid ${isSelected ? C.primaryMid : C.border}`,
                  borderRadius: 10,
                  padding: '0.75rem 1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      background: C.primaryBg,
                      border: `1px solid ${C.primaryMid}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {repo.private_ ? (
                      <Lock style={{ width: 13, height: 13, color: C.primary }} />
                    ) : (
                      <Unlock style={{ width: 13, height: 13, color: C.primary }} />
                    )}
                  </div>
                  <div>
                    <p
                      style={{
                        fontFamily: "'Geist', sans-serif",
                        fontWeight: 600,
                        fontSize: 13.5,
                        color: C.ink,
                        marginBottom: 2,
                      }}
                    >
                      {repo.name}
                    </p>
                    {repo.language && (
                      <p style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: C.subtle }}>
                        {repo.language}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  disabled={isAdded}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (!isAdded) saveRepo(repo)
                  }}
                  style={{
                    fontFamily: "'Geist', sans-serif",
                    fontWeight: 600,
                    fontSize: 12,
                    padding: '5px 14px',
                    borderRadius: 7,
                    border: 'none',
                    cursor: isAdded ? 'not-allowed' : 'pointer',
                    background: isAdded ? C.border : `linear-gradient(135deg, ${C.primaryDark}, ${C.primary})`,
                    color: isAdded ? C.subtle : '#fff',
                    flexShrink: 0,
                    transition: 'all 0.2s',
                  }}
                >
                  {isAdded ? '✓ Added' : '+ Add'}
                </button>
              </li>
            )
          })}
        </ul>

        <DialogFooter style={{ marginTop: 8 }}>
          <DialogClose asChild>
            <button
              style={{
                fontFamily: "'Geist', sans-serif",
                fontWeight: 500,
                fontSize: 13,
                padding: '8px 18px',
                borderRadius: 8,
                border: `1px solid ${C.border}`,
                background: 'transparent',
                color: C.muted,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <X style={{ width: 14, height: 14 }} />
              Close
            </button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default RepoDialog