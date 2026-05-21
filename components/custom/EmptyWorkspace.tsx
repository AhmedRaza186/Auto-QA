import Image from 'next/image'
import React from 'react'
import { Button } from '../ui/button'
import { Link } from 'lucide-react'

const EmptyWorkspace = () => {
  return (
   <div className='flex flex-col mt-10 items-center'>
    <Image src="/open-folder.png" alt='folder' width={70} height={70}/>
    <h2 className='text-xl font-medium'>No Repos Connected</h2>
    <p className='text-center text-gray-500 w-[400px]'>Connect your <span className='font-bold'>Github</span> account to and add a repository to generate and run test cases</p>
    <Button className='p-4 bg-blue-700 text-white mt-5'><Link className='h-5 w-4 mr-2'/> Connect Repo</Button>
   </div>
  )
}

export default EmptyWorkspace