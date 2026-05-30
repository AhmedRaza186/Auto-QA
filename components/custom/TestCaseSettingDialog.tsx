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
import { SettingsIcon, Save, X } from 'lucide-react'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { TestCase } from './UserRepoList'
import axios from 'axios'
import { C } from '@/app/lib/theme'

type props = {
  testCase?: TestCase
  setReload: any
}

const TestCaseSettingDialog = ({ testCase, setReload }: props) => {
  const [formTestCase, setFormTestCase] = useState({
    title: testCase?.title || '',
    description: testCase?.description || '',
    targetRoute: testCase?.targetRoute || '',
    expectedResult: testCase?.expectedResult || '',
  })

  const handleInputChange = (fieldName: string, value: string) => {
    setFormTestCase((prev) => ({ ...prev, [fieldName]: value }))
  }

  const updateTestCase = async () => {
    const result = await axios.post('/api/test-cases/settings', {
      ...formTestCase,
      testCaseId: testCase?.id,
    })
    console.log(result?.data)
    setReload()
  }

  const labelStyle: React.CSSProperties = {
    fontFamily: "'Geist Mono', monospace",
    fontSize: 10.5,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: C.subtle,
    fontWeight: 600,
    display: 'block',
    marginBottom: 6,
  }

  const inputStyle: React.CSSProperties = {
    background: C.surfaceAlt,
    border: `1px solid ${C.border}`,
    color: C.ink,
    fontFamily: "'Geist', sans-serif",
    fontSize: 13,
    borderRadius: 8,
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          style={{
            width: 32, height: 32, borderRadius: 8,
            border: `1px solid ${C.border}`,
            background: C.surfaceAlt, color: C.muted,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.borderColor = C.primaryMid
            ;(e.currentTarget as HTMLButtonElement).style.color = C.primary
            ;(e.currentTarget as HTMLButtonElement).style.background = C.primaryBg
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.borderColor = C.border
            ;(e.currentTarget as HTMLButtonElement).style.color = C.muted
            ;(e.currentTarget as HTMLButtonElement).style.background = C.surfaceAlt
          }}
          title="Edit test case settings"
        >
          <SettingsIcon style={{ width: 14, height: 14 }} />
        </button>
      </DialogTrigger>

      <DialogContent style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        color: C.ink,
        maxWidth: 480,
      }}>
        <DialogHeader>
          <DialogTitle style={{
            display: 'flex', alignItems: 'center', gap: 8,
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700, fontSize: 16, color: C.ink,
          }}>
            <SettingsIcon style={{ width: 18, height: 18, color: C.primary }} />
            Edit Test Case
          </DialogTitle>
          <DialogDescription style={{ fontFamily: "'Geist', sans-serif", fontSize: 13, color: C.muted }}>
            Modifying these fields clears any pre-generated Playwright scripts to keep them in sync.
          </DialogDescription>
        </DialogHeader>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 4 }}>
          <div>
            <label style={labelStyle}>Test Title</label>
            <Input
              value={formTestCase.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Test title"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Description / Action</label>
            <Textarea
              value={formTestCase.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="What does this test do?"
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          <div>
            <label style={labelStyle}>Target Route / Path</label>
            <Input
              value={formTestCase.targetRoute}
              onChange={(e) => handleInputChange('targetRoute', e.target.value)}
              placeholder="/dashboard or /api/users"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Expected Result</label>
            <Textarea
              value={formTestCase.expectedResult}
              onChange={(e) => handleInputChange('expectedResult', e.target.value)}
              placeholder="What should happen after the test runs?"
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>
        </div>

        <DialogFooter style={{ marginTop: 4, display: 'flex', gap: 10 }}>
          <DialogClose asChild>
            <button style={{
              fontFamily: "'Geist', sans-serif", fontWeight: 500, fontSize: 13,
              padding: '8px 18px', borderRadius: 8,
              border: `1px solid ${C.border}`, background: 'transparent', color: C.muted,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <X style={{ width: 14, height: 14 }} />
              Cancel
            </button>
          </DialogClose>
          <button
            onClick={updateTestCase}
            style={{
              fontFamily: "'Geist', sans-serif", fontWeight: 600, fontSize: 13,
              padding: '8px 20px', borderRadius: 8, border: 'none',
              background: `linear-gradient(135deg, ${C.primaryDark}, ${C.primary})`,
              color: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              boxShadow: `0 4px 14px ${C.primary}38`,
              transition: 'all 0.2s',
            }}
          >
            <Save style={{ width: 14, height: 14 }} />
            Update Case
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default TestCaseSettingDialog