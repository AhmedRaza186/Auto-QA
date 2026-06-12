import WorkspaceMain from '@/components/custom/WorkspaceMain'
import React, { Suspense } from 'react'

const Workspace = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-16">
      <Suspense fallback={
        <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
          Loading…
        </div>
      }>
        <WorkspaceMain />
      </Suspense>
    </div>
  )
}

export default Workspace