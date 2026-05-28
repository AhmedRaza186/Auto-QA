import test from 'node:test'
import React, { useState } from 'react'
import { TestCase } from './UserRepoList'
import { Checkbox } from '../ui/checkbox'
import { Badge } from '../ui/badge'
import { Play, RefreshCw, Settings, SettingsIcon } from 'lucide-react'
import { Button } from '../ui/button'
// import TestCaseSettingDialog from './TestCaseSettingDialog'
// import TestExecutionModal from './TestCaseExecutionModel'

type Props = {
    testCases: TestCase[],
    onReload: any,
    repository: any
}

function TestCasesList({ testCases, onReload, repository }: Props) {

    const [selectedTestCases,setSelectedTestCases] = useState<TestCase[]>([])

    const handleSelectedTestCase = (checked:boolean | string ,testCase:TestCase)=>{
             if (checked) {
            setSelectedTestCases((prev: any) => [...prev, testCase])
        }
        else {
            setSelectedTestCases((prev: any) => prev.filter((item: any) => item.id !== testCase.id))
        }
    }

return(
<div>
<div className='flex justify-between items-center'>
        <h2 className='font-medium flex gap-1 text-primary'>Generated Test Cases 
       </h2>
        <Button size={'sm'} onClick={() => onReload(testCases[0]?.repoId)}><RefreshCw className='w-3 h-3 mr-1'/> Refresh</Button>
</div>
    <div className='border rounded-md mt-3'>
        {testCases.map((testCase, index) => (
            <div key={index} className='p-4 border-b flex items-center justify-between'>
                <div className='flex gap-3 items-center'>
                    <Checkbox checked={selectedTestCases?.some((item:any)=>item.id===testCase.id)}onCheckedChange={(checked) => handleSelectedTestCase(checked,testCase)} />
                    <div>
                        <h2>{testCase?.title}</h2>
                        <p className='text-xs text-gray-500'>
                            {testCase?.description}
                        </p>
                    </div>
                </div>
                
                <div className='flex gap-5 '>
                    <Badge variant={'secondary'}>{testCase?.type}</Badge>
                    <Badge variant={'secondary'}>Pending</Badge>
                    <Button size={'icon'}>
                        <SettingsIcon className='w-4 h-4 hover:rotate-90 transition-transform'/>
                    </Button>
                </div>
            </div>
        ))}
        <div className='flex items-center justify-between p-4 bg-gray-100'>
            <h2>Run Selected test Case</h2>
            <Button disabled={selectedTestCases.length == 0}><Play className='w-4 h-4 mr-2'/>Run</Button>
        </div>
    </div>
</div>
)
}

export default TestCasesList