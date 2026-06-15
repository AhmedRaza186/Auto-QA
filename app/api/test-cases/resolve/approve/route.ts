import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { TestCasesTable, users } from "@/db/schema";
import {
  getRef,
  createRef,
  getCommitTreeSha,
  createTree,
  createCommit,
  updateRef,
  createPullRequest,
} from "@/lib/github-git";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { testCaseId } = body;

    if (!testCaseId) {
      return NextResponse.json(
        { error: "testCaseId is required" },
        { status: 400 }
      );
    }

    // 1. Fetch test case and proposed changes
    const [testCase] = await db
      .select()
      .from(TestCasesTable)
      .where(eq(TestCasesTable.id, testCaseId))
      .limit(1);

    if (!testCase) {
      return NextResponse.json({ error: "Test case not found" }, { status: 404 });
    }

    if (testCase.fixStatus !== "generated") {
      return NextResponse.json(
        { error: "No generated fix available for approval" },
        { status: 400 }
      );
    }

    const proposedChanges = (testCase.fixProposedChanges || []) as {
      filePath: string;
      originalContent: string;
      newContent: string;
    }[];

    if (proposedChanges.length === 0) {
      return NextResponse.json(
        { error: "Proposed changes are empty" },
        { status: 400 }
      );
    }

    const clerkUser = await currentUser();
    const email = clerkUser?.primaryEmailAddress?.emailAddress;

    if (!email) {
      return NextResponse.json({ error: "Unauthorized access to test case" }, { status: 401 });
    }

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user || Number(testCase.userId) !== user.id) {
      return NextResponse.json({ error: "Unauthorized access to test case" }, { status: 401 });
    }

    const githubToken = user.githubToken;

    if (!githubToken) {
      return NextResponse.json(
        { error: "GitHub account not connected" },
        { status: 401 }
      );
    }

    // Update state to committing
    await db
      .update(TestCasesTable)
      .set({ fixStatus: "committing", fixError: null })
      .where(eq(TestCasesTable.id, testCaseId));

    const owner = testCase.repoOwner;
    const repo = testCase.repoName;
    const defaultBranch = testCase.branch || "main";
    const timestamp = Math.floor(Date.now() / 1000);
    const newBranchName = `ai-fix-${testCaseId}-${timestamp}`;
    const commitMessage = `fix(qa): resolve failing test case "${testCase.title}"`;

    try {
      // Step A: Get latest commit SHA from the base/default branch
      const baseCommitSha = await getRef(owner, repo, `heads/${defaultBranch}`, githubToken);

      // Step B: Create new branch pointing to this base SHA
      await createRef(owner, repo, `refs/heads/${newBranchName}`, baseCommitSha, githubToken);

      // Step C: Get tree SHA of the base commit
      const baseTreeSha = await getCommitTreeSha(owner, repo, baseCommitSha, githubToken);

      // Step D: Create new tree containing the modified files
      const filesToCommit = proposedChanges.map((change) => ({
        path: change.filePath,
        content: change.newContent,
      }));
      const newTreeSha = await createTree(owner, repo, baseTreeSha, filesToCommit, githubToken);

      // Step E: Create new commit linking to parent base SHA
      const newCommitSha = await createCommit(
        owner,
        repo,
        commitMessage,
        newTreeSha,
        baseCommitSha,
        githubToken
      );

      // Step F: Update branch ref to point to new commit
      await updateRef(owner, repo, `heads/${newBranchName}`, newCommitSha, githubToken);

      // Step G: Open Pull Request
      const prTitle = `AI Fix: Resolve failing test case "${testCase.title}"`;
      const prBody = `### 🤖 Auto-generated AI Fix

This PR resolves the failing test case **"${testCase.title}"** identified by the AI test agent.

#### Test Context
- **Description**: ${testCase.description}
- **Expected Result**: ${testCase.expectedResult}
- **Target Route**: \`${testCase.targetRoute || "/"}\`

#### AI Root Cause Analysis & Fix Explanation:
${testCase.fixAnalysis || "No analysis provided."}

#### Modified Files:
${proposedChanges.map((c) => `- \`${c.filePath}\``).join("\n")}

***
*Review and merge to resolve the issue.*`;

      const pullRequestUrl = await createPullRequest(
        owner,
        repo,
        prTitle,
        prBody,
        newBranchName,
        defaultBranch,
        githubToken
      );

      // 3. Update DB with PR URL
      await db
        .update(TestCasesTable)
        .set({
          fixStatus: "pr_created",
          fixBranchName: newBranchName,
          fixPullRequestUrl: pullRequestUrl,
          fixError: null,
        })
        .where(eq(TestCasesTable.id, testCaseId));

      return NextResponse.json({
        success: true,
        fixStatus: "pr_created",
        pullRequestUrl,
        branchName: newBranchName,
      });
    } catch (gitError: any) {
      console.error("Git operation failed:", gitError);
      const errMsg = gitError.message || "Failed to commit changes and open PR on GitHub.";
      
      await db
        .update(TestCasesTable)
        .set({
          fixStatus: "failed",
          fixError: errMsg,
        })
        .where(eq(TestCasesTable.id, testCaseId));

      return NextResponse.json({ error: errMsg }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Failed to approve and push fix:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "An unexpected error occurred during PR creation",
      },
      { status: 500 }
    );
  }
}
