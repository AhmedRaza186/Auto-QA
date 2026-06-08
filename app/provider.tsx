"use client"
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { UserContext } from '@/context/userContext';

const Provider = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {

    useEffect(() => {
        registerUser()
    }, [])

    const registerUser = async () => {
        try {
            const res = await axios.post('/api/users')
            setUserDetail(res?.data?.user ?? null)
        } catch (e) {
            setUserDetail(null)
        }
    }
    const [userDetail, setUserDetail] = useState<any>(null)
    return (
        <UserContext.Provider value={{ userDetail, setUserDetail }}>
            <div>{children}</div>
        </UserContext.Provider>
    )
}

export default Provider