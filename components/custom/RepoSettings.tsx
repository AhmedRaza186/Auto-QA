"use client"
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
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Settings } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import axios from 'axios'
import { UserRepo } from './UserRepoList'

interface Props {
  repo: UserRepo;
  setReload: () => void;
}

const RepoSettings = ({ repo, setReload }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  // State for project configuration fields
  const [repoSettings, setRepoSettings] = useState({
    targetDomain: repo.targetDomain || 'http://localhost:3000',
    globalInstruction: repo.globalInstruction || ''
  });

  // Updates database with new project settings
  const handleSaveSetting = async () => {
    setLoading(true);
    try {
      await axios.post('/api/user-repo/setting', {
        repoId: repo.repoId,
        ...repoSettings
      });
      setReload(); // Triggers a UI refresh
      setIsOpen(false); // Closes dialog on success
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" /> Project Config
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Project Settings</DialogTitle>
          <DialogDescription>
            Configure the target environment and global test instructions for this repository. [3]
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-500">App URL / Domain</label>
            <Input 
              placeholder="https://your-app.com" 
              value={repoSettings.targetDomain}
              onChange={(e) => setRepoSettings({ ...repoSettings, targetDomain: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-500">Global Test Instructions</label>
            <Textarea 
              placeholder="e.g., Use username 'test' and password '123' for login."
              value={repoSettings.globalInstruction}
              onChange={(e) => setRepoSettings({ ...repoSettings, globalInstruction: e.target.value })}
            />
            <p className="text-[10px] text-gray-400">Add credentials or specific browser instructions here. [4, 5]</p>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSaveSetting} disabled={loading}>
            {loading ? 'Saving...' : 'Save Config'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default RepoSettings