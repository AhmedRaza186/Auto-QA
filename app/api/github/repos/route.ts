import axios from "axios"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(){
    const cookieStore = await cookies()
       const token= cookieStore.get('github_access_token')?.value
       if(!token){
        return NextResponse.json(JSON.stringify({error:'Github not found'}), {status:400})
       }
       const allRepos = []
       let page = 1
       while(true){
        const res = await axios.get(`https://api.github.com/user/repos?per_page=100&page=${page}&sort=updated`,{
            headers:{
                Authorization:`Bearer ${token}`,
                Accept:'application/vnd.github+json'
            }
        })
  const repos = await res.data
  if(!repos.length) break
  allRepos.push(...repos)
   page++
}
return NextResponse.json(allRepos.map(repo=>({
    id:repo.id,
    name:repo.name,
    html_url:repo.html_url,
    full_name:repo.full_name,
    private:repo.private_,
    language:repo.language,
    description:repo.description,
    default_branch:repo.default_branch,
    owner:repo.owner.login
})))
}