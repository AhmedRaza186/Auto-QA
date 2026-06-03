

import WorkspaceMain from '@/components/custom/WorkspaceMain'
import React, { Suspense } from 'react'


const Workspace = () => {
  
  return (
    <>
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 2rem 4rem' }}>
         <Suspense fallback={<div>Loading...</div>}>
        <WorkspaceMain />
      </Suspense>
    </div>
    </>
  )
}

export default Workspace