/**
 * GitHub API Service
 * 
 * Handles all GitHub API interactions with proper error handling,
 * rate limiting awareness, and token management.
 */

import { prisma } from '@/lib/prisma'
import { decryptToken } from './github-encryption'

export interface GitHubUser {
  id: number
  login: string
  name?: string
  email?: string
  avatar_url?: string
  bio?: string
  public_repos?: number
  followers?: number
  following?: number
}

export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description?: string
  private: boolean
  fork: boolean
  language?: string
  stargazers_count: number
  forks_count: number
  updated_at: string
  default_branch: string
  html_url: string
  owner: {
    login: string
    id: number
    avatar_url?: string
    type?: string
  }
}

export interface GitHubFile {
  name: string
  path: string
  sha: string
  size: number
  type: 'file' | 'dir'
  content?: string
  encoding?: string
  url: string
  html_url: string
}

export interface GitHubCommit {
  sha: string
  commit: {
    message: string
    author: {
      name: string
      email: string
      date: string
    }
  }
  author?: {
    login: string
    avatar_url?: string
  }
  html_url: string
}

export interface GitHubBranch {
  name: string
  commit: {
    sha: string
    url: string
  }
  protected: boolean
}

/**
 * Get decrypted GitHub access token for a user
 */
async function getUserGitHubToken(userId: string): Promise<string | null> {
  try {
    const githubAccount = await prisma.gitHubAccount.findUnique({
      where: { userId },
      select: { accessToken: true }
    })

    if (!githubAccount) {
      return null
    }

    // Decrypt the token
    return decryptToken(githubAccount.accessToken)
  } catch (error) {
    console.error('Error getting GitHub token:', error)
    return null
  }
}

/**
 * Make authenticated GitHub API request
 */
export async function githubApiRequest(
  userId: string,
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getUserGitHubToken(userId)
  
  if (!token) {
    throw new Error('GitHub account not connected or token unavailable')
  }

  const url = endpoint.startsWith('http') ? endpoint : `https://api.github.com${endpoint}`
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'YourApp/1.0',
      ...options.headers,
    },
  })

  // Handle rate limiting
  if (response.status === 403) {
    const remaining = response.headers.get('x-ratelimit-remaining')
    const reset = response.headers.get('x-ratelimit-reset')
    
    if (remaining === '0') {
      const resetTime = reset ? new Date(parseInt(reset) * 1000) : null
      throw new Error(
        `GitHub API rate limit exceeded. Reset at: ${resetTime?.toLocaleString() || 'unknown'}`
      )
    }
  }

  return response
}

/**
 * Get authenticated GitHub user info
 */
export async function getGitHubUser(userId: string): Promise<GitHubUser> {
  const response = await githubApiRequest(userId, '/user')
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`GitHub API error: ${response.status} - ${error}`)
  }
  
  return response.json()
}

/**
 * List user's repositories
 */
export async function listRepositories(
  userId: string,
  options: {
    type?: 'all' | 'owner' | 'member'
    sort?: 'created' | 'updated' | 'pushed' | 'full_name'
    direction?: 'asc' | 'desc'
    per_page?: number
    page?: number
  } = {}
): Promise<GitHubRepo[]> {
  const params = new URLSearchParams()
  if (options.type) params.append('type', options.type)
  if (options.sort) params.append('sort', options.sort)
  if (options.direction) params.append('direction', options.direction)
  if (options.per_page) params.append('per_page', options.per_page.toString())
  if (options.page) params.append('page', options.page.toString())

  const query = params.toString()
  const endpoint = `/user/repos${query ? `?${query}` : ''}`
  
  const response = await githubApiRequest(userId, endpoint)
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`GitHub API error: ${response.status} - ${error}`)
  }
  
  return response.json()
}

/**
 * Get repository contents (files and directories)
 */
export async function getRepositoryContents(
  userId: string,
  owner: string,
  repo: string,
  path: string = '',
  ref?: string
): Promise<GitHubFile | GitHubFile[]> {
  const params = new URLSearchParams()
  if (ref) params.append('ref', ref)
  
  const query = params.toString()
  const endpoint = `/repos/${owner}/${repo}/contents/${path}${query ? `?${query}` : ''}`
  
  const response = await githubApiRequest(userId, endpoint)
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`GitHub API error: ${response.status} - ${error}`)
  }
  
  return response.json()
}

/**
 * Get a specific file's content
 */
export async function getFileContent(
  userId: string,
  owner: string,
  repo: string,
  path: string,
  ref?: string
): Promise<string> {
  const contents = await getRepositoryContents(userId, owner, repo, path, ref) as GitHubFile
  
  if (contents.type !== 'file' || !contents.content) {
    throw new Error('Path is not a file or has no content')
  }
  
  // Decode base64 content
  return Buffer.from(contents.content, 'base64').toString('utf8')
}

/**
 * Get all files in repository recursively using Git Trees API
 */
export async function getAllRepositoryFiles(
  userId: string,
  owner: string,
  repo: string,
  ref?: string
): Promise<Array<{ path: string; sha: string }>> {
  // Get the branch reference
  const branch = ref || 'main'
  const refResponse = await githubApiRequest(userId, `/repos/${owner}/${repo}/git/refs/heads/${branch}`)
  
  if (!refResponse.ok) {
    // Repository might be empty
    return []
  }
  
  const refData = await refResponse.json()
  const commitSha = refData.object.sha
  
  // Get the commit
  const commitResponse = await githubApiRequest(userId, `/repos/${owner}/${repo}/git/commits/${commitSha}`)
  if (!commitResponse.ok) {
    return []
  }
  
  const commitData = await commitResponse.json()
  const treeSha = commitData.tree.sha
  
  // Get the tree recursively
  const treeResponse = await githubApiRequest(userId, `/repos/${owner}/${repo}/git/trees/${treeSha}?recursive=1`)
  if (!treeResponse.ok) {
    return []
  }
  
  const treeData = await treeResponse.json()
  const files: Array<{ path: string; sha: string }> = []
  
  if (treeData.tree) {
    for (const item of treeData.tree) {
      if (item.type === 'blob') {
        files.push({ path: item.path, sha: item.sha })
      }
    }
  }
  
  return files
}

/**
 * Create or update a file in a repository
 */
export async function createOrUpdateFile(
  userId: string,
  owner: string,
  repo: string,
  path: string,
  content: string,
  message: string,
  branch?: string,
  sha?: string // Required for updates
): Promise<{ commit: { sha: string } }> {
  const token = await getUserGitHubToken(userId)
  if (!token) {
    throw new Error('GitHub account not connected')
  }

  // Encode content to base64
  const encodedContent = Buffer.from(content, 'utf8').toString('base64')
  
  const body: any = {
    message,
    content: encodedContent,
  }
  
  if (branch) body.branch = branch
  if (sha) body.sha = sha // Required for updates
  
  const response = await githubApiRequest(userId, `/repos/${owner}/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`GitHub API error: ${response.status} - ${error}`)
  }
  
  return response.json()
}

/**
 * Delete a file from a repository
 */
export async function deleteFile(
  userId: string,
  owner: string,
  repo: string,
  path: string,
  message: string,
  sha: string, // Required - current file SHA
  branch?: string
): Promise<{ commit: { sha: string } }> {
  const body: any = {
    message,
    sha,
  }
  
  if (branch) body.branch = branch
  
  const response = await githubApiRequest(userId, `/repos/${owner}/${repo}/contents/${path}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`GitHub API error: ${response.status} - ${error}`)
  }
  
  return response.json()
}

/**
 * Commit multiple files in a single commit using Git Data API
 */
export async function commitMultipleFiles(
  userId: string,
  owner: string,
  repo: string,
  files: Array<{
    path: string
    content: string
    mode?: '100644' | '100755' | '040000' | '160000' | '120000' // '100644' is normal file
  }>,
  deletions: Array<{
    path: string
    sha: string
  }>,
  message: string,
  branch: string = 'main'
): Promise<{ commit: { sha: string } }> {
  const token = await getUserGitHubToken(userId)
  if (!token) {
    throw new Error('GitHub account not connected')
  }

  // Get the current branch reference
  let currentCommitSha: string | null = null
  let baseTreeSha: string | null = null
  
  const refResponse = await githubApiRequest(userId, `/repos/${owner}/${repo}/git/refs/heads/${branch}`)
  if (refResponse.ok) {
    const refData = await refResponse.json()
    currentCommitSha = refData.object.sha
    
    // Get the current commit
    const commitResponse = await githubApiRequest(userId, `/repos/${owner}/${repo}/git/commits/${currentCommitSha}`)
    if (commitResponse.ok) {
      const commitData = await commitResponse.json()
      baseTreeSha = commitData.tree.sha
    }
  } else {
    // Branch doesn't exist - repository might be empty
    // Check if repository has any commits
    const repoResponse = await githubApiRequest(userId, `/repos/${owner}/${repo}`)
    if (repoResponse.ok) {
      const repoData = await repoResponse.json()
      // If repository is empty, baseTreeSha will remain null
      if (repoData.default_branch && repoData.default_branch !== branch) {
        // Try to get default branch
        const defaultRefResponse = await githubApiRequest(userId, `/repos/${owner}/${repo}/git/refs/heads/${repoData.default_branch}`)
        if (defaultRefResponse.ok) {
          const defaultRef = await defaultRefResponse.json()
          currentCommitSha = defaultRef.object.sha
          const commitResponse = await githubApiRequest(userId, `/repos/${owner}/${repo}/git/commits/${currentCommitSha}`)
          if (commitResponse.ok) {
            const commitData = await commitResponse.json()
            baseTreeSha = commitData.tree.sha
          }
        }
      }
    }
  }

  // Get existing tree if we have a base tree
  let existingTree: any[] = []
  if (baseTreeSha) {
    const treeResponse = await githubApiRequest(userId, `/repos/${owner}/${repo}/git/trees/${baseTreeSha}?recursive=1`)
    if (treeResponse.ok) {
      const treeData = await treeResponse.json()
      existingTree = treeData.tree || []
    }
  }

  // Create a map of existing files (excluding deletions)
  const deletionPaths = new Set(deletions.map(d => d.path))
  const existingFiles = new Map<string, any>()
  for (const item of existingTree) {
    if (item.type === 'blob' && !deletionPaths.has(item.path)) {
      existingFiles.set(item.path, item)
    }
  }

  // Create blobs for new/updated files
  const tree: Array<{
    path: string
    mode: string
    type: string
    sha?: string
    content?: string
  }> = []

  // Add all existing files (excluding ones being updated or deleted)
  const updatePaths = new Set(files.map(f => f.path))
  for (const [path, item] of existingFiles.entries()) {
    if (!updatePaths.has(path)) {
      tree.push({
        path: item.path,
        mode: item.mode,
        type: item.type,
        sha: item.sha
      })
    }
  }

  // Create blobs and add new/updated files
  for (const file of files) {
    const blobResponse = await githubApiRequest(userId, `/repos/${owner}/${repo}/git/blobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: Buffer.from(file.content, 'utf8').toString('base64'),
        encoding: 'base64'
      })
    })
    if (!blobResponse.ok) {
      throw new Error(`Failed to create blob for ${file.path}`)
    }
    const blobData = await blobResponse.json()
    
    tree.push({
      path: file.path,
      mode: file.mode || '100644',
      type: 'blob',
      sha: blobData.sha
    })
  }

  // Create new tree
  const newTreeResponse = await githubApiRequest(userId, `/repos/${owner}/${repo}/git/trees`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tree })
  })
  if (!newTreeResponse.ok) {
    const error = await newTreeResponse.text()
    throw new Error(`Failed to create tree: ${error}`)
  }
  const newTreeData = await newTreeResponse.json()
  const newTreeSha = newTreeData.sha

  // Get author info from user
  const userResponse = await githubApiRequest(userId, '/user')
  if (!userResponse.ok) {
    throw new Error('Failed to get user info')
  }
  const userData = await userResponse.json()

  // Create commit
  const commitBody: any = {
    message,
    tree: newTreeSha,
    author: {
      name: userData.name || userData.login,
      email: userData.email || `${userData.login}@users.noreply.github.com`,
      date: new Date().toISOString()
    },
    committer: {
      name: userData.name || userData.login,
      email: userData.email || `${userData.login}@users.noreply.github.com`,
      date: new Date().toISOString()
    }
  }
  
  // Only add parents if this is not the initial commit
  if (currentCommitSha) {
    commitBody.parents = [currentCommitSha]
  }
  
  const commitResponse2 = await githubApiRequest(userId, `/repos/${owner}/${repo}/git/commits`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(commitBody)
  })
  if (!commitResponse2.ok) {
    const error = await commitResponse2.text()
    throw new Error(`Failed to create commit: ${error}`)
  }
  const commitData2 = await commitResponse2.json()

  // Update or create branch reference
  const updateRefResponse = await githubApiRequest(userId, `/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
    method: currentCommitSha ? 'PATCH' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(
      currentCommitSha
        ? { sha: commitData2.sha }
        : { ref: `refs/heads/${branch}`, sha: commitData2.sha }
    )
  })
  if (!updateRefResponse.ok) {
    const error = await updateRefResponse.text()
    throw new Error(`Failed to update branch: ${error}`)
  }

  return { commit: { sha: commitData2.sha } }
}

/**
 * List commits for a repository
 */
export async function listCommits(
  userId: string,
  owner: string,
  repo: string,
  options: {
    sha?: string // Branch or commit SHA
    path?: string // Filter by file path
    author?: string
    since?: string // ISO 8601 date
    until?: string // ISO 8601 date
    per_page?: number
    page?: number
  } = {}
): Promise<GitHubCommit[]> {
  const params = new URLSearchParams()
  if (options.sha) params.append('sha', options.sha)
  if (options.path) params.append('path', options.path)
  if (options.author) params.append('author', options.author)
  if (options.since) params.append('since', options.since)
  if (options.until) params.append('until', options.until)
  if (options.per_page) params.append('per_page', options.per_page.toString())
  if (options.page) params.append('page', options.page.toString())

  const query = params.toString()
  const endpoint = `/repos/${owner}/${repo}/commits${query ? `?${query}` : ''}`
  
  const response = await githubApiRequest(userId, endpoint)
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`GitHub API error: ${response.status} - ${error}`)
  }
  
  return response.json()
}

/**
 * List branches for a repository
 */
export async function listBranches(
  userId: string,
  owner: string,
  repo: string
): Promise<GitHubBranch[]> {
  const response = await githubApiRequest(userId, `/repos/${owner}/${repo}/branches`)
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`GitHub API error: ${response.status} - ${error}`)
  }
  
  return response.json()
}

/**
 * Create a new branch
 */
export async function createBranch(
  userId: string,
  owner: string,
  repo: string,
  branchName: string,
  fromBranchOrSha: string // Branch name (e.g., "main") or commit SHA to branch from
): Promise<GitHubBranch> {
  let sha: string
  
  // Try to get the branch reference first
  try {
    const refResponse = await githubApiRequest(userId, `/repos/${owner}/${repo}/git/refs/heads/${fromBranchOrSha}`)
    if (refResponse.ok) {
      const refData = await refResponse.json()
      sha = refData.object.sha
    } else {
      // If it's not a branch name, assume it's a commit SHA
      sha = fromBranchOrSha
    }
  } catch {
    // If branch lookup fails, assume it's a commit SHA
    sha = fromBranchOrSha
  }
  
  // Create the new branch
  const response = await githubApiRequest(userId, `/repos/${owner}/${repo}/git/refs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ref: `refs/heads/${branchName}`,
      sha,
    }),
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`GitHub API error: ${response.status} - ${error}`)
  }
  
  return response.json()
}

/**
 * Create a pull request
 */
export async function createPullRequest(
  userId: string,
  owner: string,
  repo: string,
  title: string,
  body: string,
  head: string, // Branch to merge FROM
  base: string  // Branch to merge INTO
): Promise<any> {
  const response = await githubApiRequest(userId, `/repos/${owner}/${repo}/pulls`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title,
      body,
      head,
      base,
    }),
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`GitHub API error: ${response.status} - ${error}`)
  }
  
  return response.json()
}

/**
 * Check if token is valid by making a test API call
 */
export async function validateToken(userId: string): Promise<boolean> {
  try {
    await getGitHubUser(userId)
    return true
  } catch (error) {
    console.error('Token validation failed:', error)
    return false
  }
}

/**
 * Create a new GitHub repository
 */
export async function createRepository(
  userId: string,
  name: string,
  options: {
    description?: string
    private?: boolean
    auto_init?: boolean
    gitignore_template?: string
    license_template?: string
  } = {}
): Promise<GitHubRepo> {
  const body: any = {
    name,
    ...options
  }

  const response = await githubApiRequest(userId, '/user/repos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`GitHub API error: ${response.status} - ${error}`)
  }

  return response.json()
}
