import WorkspaceHeader from '@/components/custom/WorkspaceHeader'
import React from 'react'

const WorkspaceLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div style={{ minHeight: '100vh', background: '#0F172A', fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}>
      <WorkspaceHeader />
      {children}
    </div>
  )
}

export default WorkspaceLayout