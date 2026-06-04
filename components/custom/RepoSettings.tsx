
import React, { useState } from 'react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Settings2, Save, X } from 'lucide-react'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { UserRepo } from './UserRepoList'
import axios from 'axios'
import { C } from '@/app/lib/theme'

type props = {
  repo: UserRepo
  setReload: () => void
}

const RepoSettings = ({ repo, setReload }: props) => {
  const [isOpen, setIsOpen] = useState(false)
  const [repoSettings, setRepoSettings] = useState({
    targetDomain: repo?.targetDomain || '',
    globalInstruction: repo?.gloablInstruction || '',
  })

  const handleSaveSettings = async () => {
    const result = await axios.post('/api/github/user-repo/settings', {
      repoId: repo.repoId,
      targetDomain: repoSettings.targetDomain,
      globalInstruction: repoSettings.globalInstruction,
    })
    setIsOpen(false)
    setReload()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
      <DialogTrigger asChild>
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: "'Geist', sans-serif",
            fontWeight: 500,
            fontSize: 12.5,
            padding: '7px 14px',
            borderRadius: 8,
            border: `1px solid ${C.border}`,
            background: C.surfaceAlt,
            color: C.inkMid,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.borderColor = C.primaryMid
            ;(e.currentTarget as HTMLButtonElement).style.color = C.ink
            ;(e.currentTarget as HTMLButtonElement).style.background = C.primaryBg
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.borderColor = C.border
            ;(e.currentTarget as HTMLButtonElement).style.color = C.inkMid
            ;(e.currentTarget as HTMLButtonElement).style.background = C.surfaceAlt
          }}
        >
          <Settings2 style={{ width: 14, height: 14 }} />
          Project Config
        </button>
      </DialogTrigger>

      <DialogContent
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          color: C.ink,
        }}
      >
        <DialogHeader>
          <DialogTitle
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: 16,
              color: C.ink,
            }}
          >
            <Settings2 style={{ width: 18, height: 18, color: C.primary }} />
            Project / Repo Settings
          </DialogTitle>
          <DialogDescription
            style={{ fontFamily: "'Geist', sans-serif", fontSize: 13, color: C.muted }}
          >
            Configure project-level defaults used during Playwright script generation and execution.
          </DialogDescription>
        </DialogHeader>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 8 }}>
          {/* Target domain */}
          <div>
            <label
              style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: 10.5,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: C.subtle,
                fontWeight: 600,
                display: 'block',
                marginBottom: 6,
              }}
            >
              App URL / Default Website
            </label>
            <Input
              value={repoSettings?.targetDomain}
              onChange={(e) => setRepoSettings({ ...repoSettings, targetDomain: e.target.value })}
              placeholder="https://your-app.com"
              style={{
                background: C.surfaceAlt,
                border: `1px solid ${C.border}`,
                color: C.ink,
                fontFamily: "'Geist Mono', monospace",
                fontSize: 13,
                borderRadius: 8,
              }}
            />
            <p style={{ fontFamily: "'Geist', sans-serif", fontSize: 11.5, color: C.subtle, marginTop: 4 }}>
              The target address where Playwright will connect and run test cases.
            </p>
          </div>

          {/* Global instruction */}
          <div>
            <label
              style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: 10.5,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: C.subtle,
                fontWeight: 600,
                display: 'block',
                marginBottom: 6,
              }}
            >
              Global Test Instructions
            </label>
            <Textarea
              value={repoSettings?.globalInstruction}
              onChange={(e) => setRepoSettings({ ...repoSettings, globalInstruction: e.target.value })}
              placeholder="Auth credentials, setup steps, cookies, etc."
              rows={4}
              style={{
                background: C.surfaceAlt,
                border: `1px solid ${C.border}`,
                color: C.ink,
                fontFamily: "'Geist', sans-serif",
                fontSize: 13,
                borderRadius: 8,
                resize: 'vertical',
              }}
            />
            <p style={{ fontFamily: "'Geist', sans-serif", fontSize: 11.5, color: C.subtle, marginTop: 4 }}>
              Auth credentials, cookies, setup / teardown steps — automatically appended to AI prompts.
            </p>
          </div>
        </div>

        <DialogFooter style={{ marginTop: 4, display: 'flex', gap: 10 }}>
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
                transition: 'all 0.2s',
              }}
            >
              <X style={{ width: 14, height: 14 }} />
              Cancel
            </button>
          </DialogClose>
          <button
            onClick={handleSaveSettings}
            style={{
              fontFamily: "'Geist', sans-serif",
              fontWeight: 600,
              fontSize: 13,
              padding: '8px 20px',
              borderRadius: 8,
              border: 'none',
              background: `linear-gradient(135deg, ${C.primaryDark}, ${C.primary})`,
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: `0 4px 14px ${C.primary}38`,
              transition: 'all 0.2s',
            }}
          >
            <Save style={{ width: 14, height: 14 }} />
            Save Config
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default RepoSettings