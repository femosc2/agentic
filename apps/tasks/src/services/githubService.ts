import type { GitHubCommit, Commit } from '../types/commit'
import { githubConfig } from '../config/github'

const GITHUB_API_BASE = 'https://api.github.com'

function transformCommit(ghCommit: GitHubCommit): Commit {
  return {
    sha: ghCommit.sha,
    shortSha: ghCommit.sha.slice(0, 7),
    message: ghCommit.commit.message,
    authorName: ghCommit.commit.author.name,
    authorLogin: ghCommit.author?.login ?? null,
    avatarUrl: ghCommit.author?.avatar_url ?? null,
    date: new Date(ghCommit.commit.author.date),
    url: ghCommit.html_url,
  }
}

export async function fetchCommits(limit = 30): Promise<Commit[]> {
  const { owner, repo, branch } = githubConfig

  if (!owner || !repo) {
    throw new Error('GitHub repository not configured. Set VITE_GITHUB_OWNER and VITE_GITHUB_REPO environment variables.')
  }

  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits?sha=${branch}&per_page=${limit}`

  const response = await fetch(url)

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('GitHub API rate limit exceeded. Try again later (limit resets hourly).')
    }
    if (response.status === 404) {
      throw new Error(`Repository ${owner}/${repo} not found or is private.`)
    }
    throw new Error(`Failed to fetch commits: ${response.statusText}`)
  }

  const data: GitHubCommit[] = await response.json()
  return data.map(transformCommit)
}
