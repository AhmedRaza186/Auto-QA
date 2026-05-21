import { UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import React from 'react'

const WorkspaceHeader = () => {
   return (
      <div className='flex justify-between w-full p-4'>
         {/* Logo */}
         <Image src={"/logo.svg"} alt="logo" width={100} height={100} />
         {/* menu */}
         <ul className='flex justify-center gap-8 list-none font-bold'>
            <li className='hover:text-[#38bdf8] hover:transition-all cursor-pointer'>Workspace</li>
            <li className='hover:text-[#38bdf8] hover:transition-all cursor-pointer'>Pricing</li>
            <li className='hover:text-[#38bdf8] hover:transition-all cursor-pointer'>Support</li>
         </ul>
         {/* UserButton */}
         <UserButton />
      </div>
   )
}

export default WorkspaceHeader