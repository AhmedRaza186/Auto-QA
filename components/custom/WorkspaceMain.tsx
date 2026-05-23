'use client'
import { UserContext } from '@/context/userContext'
import Image from 'next/image'
import React, { useContext, useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import EmptyWorkspace from './EmptyWorkspace'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import RepoDialog from './RepoDialog'

const WorkspaceMain = () => {

    const { userDetails } = useContext(UserContext)
    const router = useRouter()
    const [token, setToken] = useState('')
    useEffect(() => {
        getGithubUserToken()
    })
    const getGithubUserToken = async () => {
        const res = await axios.get('/api/github/token')
        console.log(res.data.token);
        setToken(res.data.token)

    }
    const addRepo = () => {
        router.push('api/github')
    }
    return (
        <div>
            <div className='flex justify-between items-center'>
                <h2 className='text-4xl font-medium'>Workspace</h2>
                <h2 className='text-blue-800 bg-blue-100 px-2 rounded-lg'>Remaining Credits: {userDetails?.credits}</h2>
            </div>
            <Card className="mt-5 flex items-center gap-3 justify-between p-4 border rounded-lg border-gray-200">
                <div className='flex gap-4 items-center'>
                    <Image src={"/github.png"} alt="github" width={40} height={40} />
                    <h2 className='text-lg font-medium'>Connect Github & Add repo</h2>
                </div>
                <div>
                    {
                        !token ? <Button className='bg-blue-700 text-white' onClick={addRepo}>Setup</Button> :
                            <RepoDialog setRefreshPage={(refresh: boolean) => console.log(refresh)
                            } />}
                </div>
            </Card>

            <Card className='mt-10 border rounded-lg border-gray-200'>
                <CardContent>
                    <EmptyWorkspace />
                </CardContent>
            </Card>
        </div>
    )
}

export default WorkspaceMain