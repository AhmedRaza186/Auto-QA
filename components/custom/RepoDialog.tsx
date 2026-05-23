import React, { useContext, useEffect, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '../ui/button'
import { DialogClose } from '@radix-ui/react-dialog'
import axios from 'axios'
import { useState } from 'react'
import { Card } from '../ui/card'
import { Input } from '../ui/input'
import { UserContext } from '@/context/userContext'

type Repo = {
  id: number;
  name: string;
  full_name:string;
  html_url: string;
  private_: boolean;
  language: string;
  description: string;
  default_branch: string;
  owner: string;
}

const RepoDialog = ({ setRefreshPage }: { setRefreshPage: (refresh: boolean) => void }) => {

  const [repoList, setRepoList] = useState<Repo[]>([])
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null)
  const [userSearch, setUserSearch] = useState('')
  const { userDetail } = useContext(UserContext)
  console.log(userDetail);

  const [isOpen, setIsOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getRepos()
  }, [])

  const getRepos = async () => {
    const result = await axios.get('/api/github/repos')
    setRepoList(result.data)
    console.log(result.data)
  }

  const filterRepos = useMemo(() => {
    const query = userSearch.toLowerCase().trim()
    if (!query) return repoList

    return repoList.filter(repo => repo.name.toLowerCase().includes(query))


  }, [repoList, userSearch])

  const saveRepo = async (repo: Repo) => {
    if (!repo) return

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
      default_branch: repo.default_branch
    })

    console.log(result.data);
    setRefreshPage(true)

  }
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>
        <Button className='bg-blue-700 text-white' >+ Add</Button>

      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Repository</DialogTitle>
          <DialogDescription>
            Search and select one of your repositories from github to begin. test scripts will be generated automatically
          </DialogDescription>
        </DialogHeader>
        <div>
          <div className='p-3 border rounded-lg border-gray-200 '>
            <Input className='border-none bg-gray-50 focus:outline-none focus:border-gray-400' placeholder="Search" onChange={(e) => setUserSearch(e.target.value)} />
          </div>
          <ul className='overflow-y-auto h-60'>
            {filterRepos.map(repo => (

              <Card className={`p-4 my-2 border rounded-lg border-gray-200 hover:border-blue-400 cursor-pointer ${selectedRepo?.id === repo.id ? 'bg-gray-200' : null}`} key={repo.id} onClick={() => setSelectedRepo(repo)}>

                <div className='flex items-center justify-between'>
                  <h2 className='text-lg font-medium'>{repo.name}</h2>
                  <Button className='bg-blue-700 text-white' onClick={() => saveRepo(repo)}>Add</Button>
                </div>
              </Card>
            ))}
          </ul>
        </div>
        <DialogFooter className='flex gap-5'>
          <DialogClose>Cancel</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default RepoDialog