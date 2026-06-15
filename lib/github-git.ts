import axios from "axios";

interface GitFile {
  path: string;
  content: string;
}

const GITHUB_API_BASE = "https://api.github.com";

function getHeaders(token: string) {
  return {
    Authorization: `token ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

/**
 * Gets the SHA of a reference (e.g. 'heads/main')
 */
export async function getRef(
  owner: string,
  repo: string,
  ref: string,
  token: string
): Promise<string> {
  const cleanRef = ref.replace(/^refs\//, "");
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/ref/${cleanRef}`;
  try {
    const res = await axios.get(url, { headers: getHeaders(token) });
    return res.data.object.sha;
  } catch (error: any) {
    throw new Error(`Failed to get ref ${ref}: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Creates a new git reference (branch)
 */
export async function createRef(
  owner: string,
  repo: string,
  ref: string, // e.g. 'refs/heads/new-branch'
  sha: string,
  token: string
): Promise<void> {
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/refs`;
  try {
    await axios.post(
      url,
      {
        ref,
        sha,
      },
      { headers: getHeaders(token) }
    );
  } catch (error: any) {
    throw new Error(`Failed to create ref ${ref}: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Gets the tree SHA of a commit SHA
 */
export async function getCommitTreeSha(
  owner: string,
  repo: string,
  commitSha: string,
  token: string
): Promise<string> {
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/commits/${commitSha}`;
  try {
    const res = await axios.get(url, { headers: getHeaders(token) });
    return res.data.tree.sha;
  } catch (error: any) {
    throw new Error(`Failed to get tree SHA for commit ${commitSha}: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Creates a new git tree based on a base tree SHA
 */
export async function createTree(
  owner: string,
  repo: string,
  baseTreeSha: string,
  files: GitFile[],
  token: string
): Promise<string> {
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees`;
  const tree = files.map((file) => ({
    path: file.path,
    mode: "100644", // standard file mode
    type: "blob",
    content: file.content,
  }));

  try {
    const res = await axios.post(
      url,
      {
        base_tree: baseTreeSha,
        tree,
      },
      { headers: getHeaders(token) }
    );
    return res.data.sha;
  } catch (error: any) {
    throw new Error(`Failed to create Git tree: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Creates a new Git commit
 */
export async function createCommit(
  owner: string,
  repo: string,
  message: string,
  treeSha: string,
  parentSha: string,
  token: string
): Promise<string> {
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/commits`;
  try {
    const res = await axios.post(
      url,
      {
        message,
        tree: treeSha,
        parents: [parentSha],
      },
      { headers: getHeaders(token) }
    );
    return res.data.sha;
  } catch (error: any) {
    throw new Error(`Failed to create Git commit: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Updates a branch reference to point to a new commit SHA
 */
export async function updateRef(
  owner: string,
  repo: string,
  ref: string, // e.g. 'heads/new-branch'
  commitSha: string,
  token: string
): Promise<void> {
  const cleanRef = ref.replace(/^refs\//, "");
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/refs/${cleanRef}`;
  try {
    await axios.patch(
      url,
      {
        sha: commitSha,
        force: true,
      },
      { headers: getHeaders(token) }
    );
  } catch (error: any) {
    throw new Error(`Failed to update ref ${ref}: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Opens a Pull Request from a head branch to a base branch
 */
export async function createPullRequest(
  owner: string,
  repo: string,
  title: string,
  body: string,
  headBranch: string, // e.g. 'new-branch' or 'owner:new-branch'
  baseBranch: string, // e.g. 'main'
  token: string
): Promise<string> {
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls`;
  try {
    const res = await axios.post(
      url,
      {
        title,
        body,
        head: headBranch,
        base: baseBranch,
      },
      { headers: getHeaders(token) }
    );
    return res.data.html_url;
  } catch (error: any) {
    throw new Error(`Failed to create pull request: ${error.response?.data?.message || error.message}`);
  }
}
