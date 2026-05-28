'use client'
import { UserContext } from '@/context/userContext'
import Image from 'next/image'
import React, { useContext, useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import EmptyWorkspace from './EmptyWorkspace'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import RepoDialog, { Repo } from './RepoDialog'

import UserRepoList, { UserRepo } from './UserRepoList'

const WorkspaceMain = () => {

    const { userDetail } = useContext(UserContext)
    const router = useRouter()
    const [token, setToken] = useState('')
    const [userRepoList,setUserRepoList]=useState<UserRepo[]>([])
    
    useEffect(() => {
        getGithubUserToken()
      
    },[])
    
    useEffect(()=>{
        if (userDetail?.id) {
            getAddedRepos()
        }
    },[userDetail])
    const getGithubUserToken = async () => {
        const res = await axios.get('/api/github/token')
        console.log(res.data.token);
        setToken(res.data.token)

    }
    const addRepo = () => {
        router.push('api/github')
    }
    const getAddedRepos = async () =>{
        const result = await axios.get('/api/github/user-repo?userId=' + userDetail?.id)
        setUserRepoList(result.data)
    }
    return (
        <div>
            <div className='flex justify-between items-center'>
                <h2 className='text-4xl font-medium'>Workspace</h2>
                <h2 className='text-blue-800 bg-blue-100 px-2 rounded-lg'>Remaining Credits: {userDetail?.credits}</h2>
            </div>
            <Card className="mt-5 flex items-center gap-3 justify-between p-4 border rounded-lg border-gray-200">
                <div className='flex gap-4 items-center'>
                    <Image src={"/github.png"} alt="github" width={40} height={40} />
                    <h2 className='text-lg font-medium'>Connect Github & Add repo</h2>
                </div>
                <div>
                    {
                        !token ? <Button className='bg-blue-700 text-white' onClick={addRepo}>Setup</Button> :
                            <RepoDialog setRefreshPage={() => getAddedRepos()} userRepoList={userRepoList} />
                    }
                </div>
            </Card>

            <div className='mt-10'>
                {userRepoList?.length === 0 ? (
                    <Card className='border rounded-lg border-gray-200'>
                        <CardContent>
                            <EmptyWorkspace />
                        </CardContent>
                    </Card>
                )
                : (
                    <UserRepoList repoList={userRepoList} />
                    
                )
            }
            </div>
        </div>
    )
}

export default WorkspaceMain