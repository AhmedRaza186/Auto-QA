import React, { useState } from 'react'
import { TestCase } from './UserRepoList'
import { Checkbox } from '../ui/checkbox'
import { Badge } from '../ui/badge'
import { Play, RefreshCw, Settings, SettingsIcon } from 'lucide-react'
import { Button } from '../ui/button'
import TestCaseSettingDialog from './TestCaseSettingDialog'
import TestExecutionModal from './TestCaseExecutionModel'
// import TestCaseSettingDialog from './TestCaseSettingDialog'
// import TestExecutionModal from './TestCaseExecutionModel'

type Props = {
    testCases: TestCase[],
    onReload: any,
    repository: any
}

function TestCasesList({ testCases, onReload, repository }: Props) {

    const [selectedTestCases,setSelectedTestCases] = useState<TestCase[]>([])
        const [isModelOpen, setIsModelOpen] = useState(false);


    const handleSelectedTestCase = (checked:boolean | string ,testCase:TestCase)=>{
             if (checked) {
            setSelectedTestCases((prev: any) => [...prev, testCase])
        }
        else {
            setSelectedTestCases((prev: any) => prev.filter((item: any) => item.id !== testCase.id))
        }
    }

    const handleSelectAll = (checked: boolean | string) => {
        if (checked) {
            setSelectedTestCases([...testCases]);
        } else {
            setSelectedTestCases([]);
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
        {testCases.length > 0 && (
            <div className='p-4 border-b bg-gray-50 flex items-center gap-3'>
                <Checkbox 
                    checked={selectedTestCases.length === testCases.length} 
                    onCheckedChange={handleSelectAll} 
                />
                <span className='text-sm font-medium'>Select All ({selectedTestCases.length}/{testCases.length})</span>
            </div>
        )}
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
                    <Badge variant={'secondary'} >{testCase?.type}</Badge>
                    {testCase?.status === 'failed' && (
                        <Badge variant={'destructive'} className='text-red-200 font-normal'>Failed</Badge>
                    )}
                    {testCase?.status === 'passed' && (
                        <Badge variant={'default'} className='text-green-200 font-normal bg-green-700'>Passed</Badge>
                    )}
                    {testCase?.status === 'running' && (
                        <Badge variant={'default'} className='text-yellow-200 font-normal bg-yellow-700'>Running</Badge>
                    )}
                    {testCase?.status === 'generated' && (
                        <Badge variant={'secondary'}>Pending</Badge>
                    )}
                    {(!['failed', 'passed', 'running', 'generated'].includes(testCase?.status)) && (
                        <Badge variant={'secondary'} className='text-gray-600'>Queued</Badge>
                    )}
                    <TestCaseSettingDialog testCase={testCase} setReload={onReload}/>
                </div>
            </div>
        ))}
        <div className='flex items-center justify-between p-4 bg-gray-100'>
            <h2>Run Selected test Case</h2>
            <Button disabled={selectedTestCases.length == 0} onClick={() => setIsModelOpen(true)}><Play className='w-4 h-4 mr-2'/>Run</Button>
            
        </div>
          <TestExecutionModal
                testCases={selectedTestCases}
                repository={repository}
                isOpen={isModelOpen}
                onClose={() => setIsModelOpen(false)}
                onRunComplete={() => onReload(repository?.repoId)}
            />
    </div>
</div>
)
}

export default TestCasesList