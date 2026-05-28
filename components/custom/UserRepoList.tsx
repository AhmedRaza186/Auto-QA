import React, { useContext, useState } from 'react'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import Image from 'next/image'
import { Button } from '../ui/button'
import {
    CheckCircle2,
    Sparkles,
    TrendingUp,
    XCircle,
    ListChecks,
    Loader2,
    Loader2Icon
} from 'lucide-react'
import axios from 'axios'
import { UserContext } from '@/context/userContext'
import TestCasesList from './TestCasesList'

export interface UserRepo {
    id: number
    userId: number
    repoId: number
    name: string
    full_name: string
    private_: number
    html_url: string
    description: string | null
    owner: string
    default_branch: string
    language: string | null
}

interface Props {
    repoList: UserRepo[]
}

export type TestCase = {
    id: number;
    title: string;
    description: string;
    type: string;
    repoId: number;
    targetFiles: string[];
    expectedResult: string;
    repoName: string;
    repoOwner: string;
    targetRoute: string;
    status: string;
    browserbaseScript: string;
}

type StatusData = {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    passRate: number;
}

const UserRepoList = ({ repoList }: Props) => {
    // Add missing status variables
    const totalTests = 0
    const passedTests = 0
    const failedTests = 0
    const passRate = 0

    const { userDetail } = useContext(UserContext)
    const [loading, setLoading] = useState(false)
    const [testCaseloading, setTestCaseloading] = useState(false)
    const [testCases, setTestCases] = useState<TestCase[]>([])
    const [statusData,setStatusData] = useState<StatusData>({totalTests:0,passedTests:0,failedTests:0,passRate:0})
    

    const handleGenerateTestCases = async (repo: UserRepo) => {
        try {
            setLoading(true)

            const res = await axios.post('/api/generate-test-cases', {
                userId: userDetail?.id,
                repoId: repo.repoId,
                owner: repo.owner,
                repo: repo.name,
                branch: repo.default_branch
            })

            console.log(res.data, 'res.data')
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    async function getTestCases(repoId: number) {

        try {
            setTestCaseloading(true)
            setTestCases([])

            const res = await axios.get(`/api/test-cases?repoId=${repoId}`)

            console.log(res.data, 'res.data')
             const userTestCases = res.data as TestCase[];
            const passedTests = userTestCases?.filter(testCase => testCase.status == 'passed').length || 0;
        const failedTests = userTestCases?.filter(testCase => testCase.status == 'failed').length || 0;
        const passRate = userTestCases?.length ? Math.round((passedTests / userTestCases.length) * 100) : 0;

            setStatusData({
             totalTests: res.data.length,
            passedTests: passedTests,
            failedTests: failedTests,
            passRate: passRate
            })
            setTestCases(res.data)
        } catch (error) {
            console.log(error)
        } finally {
            setTestCaseloading(false)
        }
    }

    return (
        <div className='mt-10'>
            <h2 className='text-lg font-medium mb-5'>REPOSITORIES</h2>

            <Accordion
                type="single"
                collapsible
                onValueChange={(value) => {
                    if (value) {
                        getTestCases(Number(value))
                    }
                }}
            >
                {repoList.map((repo) => (
                    <AccordionItem
                        value={repo.repoId.toString()}
                        className='border px-5 rounded-xl'
                        key={repo.repoId}
                    >
                        <AccordionTrigger>
                            <div className='flex items-center gap-3'>
                                <Image
                                    src='/github.png'
                                    alt='github'
                                    width={30}
                                    height={30}
                                />

                                <div className='flex flex-col items-start gap-1'>
                                    <h2>{repo.full_name}</h2>

                                    <p className='text-xs text-gray-500'>
                                        {repo.default_branch} • {repo.language}
                                    </p>
                                </div>
                            </div>
                        </AccordionTrigger>

                        <AccordionContent>
                            <div className='pt-4 space-y-5'>
                                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
                                    <StatusCard
                                        title="Total Tests"
                                        value={totalTests}
                                        icon={
                                            <ListChecks className='h-5 w-5 text-blue-600' />
                                        }
                                        bgColor="bg-blue-50"
                                    />

                                    <StatusCard
                                        title="Passed"
                                        value={passedTests}
                                        icon={
                                            <CheckCircle2 className='h-5 w-5 text-green-600' />
                                        }
                                        bgColor="bg-green-50"
                                    />

                                    <StatusCard
                                        title="Failed"
                                        value={failedTests}
                                        icon={
                                            <XCircle className='h-5 w-5 text-red-600' />
                                        }
                                        bgColor="bg-red-50"
                                    />

                                    <StatusCard
                                        title="Pass Rate"
                                        value={`${passRate}%`}
                                        icon={
                                            <TrendingUp className='h-5 w-5 text-purple-600' />
                                        }
                                        bgColor="bg-purple-50"
                                    />
                                </div>
                                {!testCaseloading && testCases.length > 0
                                    && <TestCasesList testCases={testCases} onReload={(repoId: number) => getTestCases(repoId)}
                                        repository={repo}
                                    />}
                                {testCaseloading ? (
                                    <div className='flex items-center gap-2'>
                                        <Loader2Icon className='animate-spin h-5 w-5' />
                                        <span>Loading...</span>
                                    </div>
                                ) : (
                                    <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                                        <div>
                                            <h3 className='font-medium'>
                                                Generate AI Test Cases
                                            </h3>

                                            <p className='text-sm text-gray-500 mt-1'>
                                                Analyze this repository and
                                                generate automated test cases
                                                using AI.
                                            </p>
                                        </div>

                                        <Button
                                            className='gap-2'
                                            onClick={() =>
                                                handleGenerateTestCases(repo)
                                            }
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className='h-4 w-4 animate-spin' />
                                                    Loading...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className='h-4 w-4' />
                                                    Generate Test Cases
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    )
}

export default UserRepoList

function StatusCard({
    title,
    value,
    icon,
    bgColor
}: {
    title: string
    value: string | number
    icon: React.ReactNode
    bgColor: string
}) {
    return (
        <div className='border rounded-xl p-4 flex items-center justify-between bg-white'>
            <div>
                <p className='text-sm text-gray-500'>{title}</p>
                <h3 className='text-2xl font-semibold mt-1'>{value}</h3>
            </div>

            <div
                className={`h-10 w-10 rounded-full flex items-center justify-center ${bgColor}`}
            >
                {icon}
            </div>
        </div>
    )
}