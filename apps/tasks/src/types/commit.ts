export interface GitHubCommit {
  sha: string
  commit: {
    message: string
    author: {
      name: string
      date: string
    }
  }
  author: {
    login: string
    avatar_url: string
  } | null
  html_url: string
}

export interface Commit {
  sha: string
  shortSha: string
  message: string
  authorName: string
  authorLogin: string | null
  avatarUrl: string | null
  date: Date
  url: string
}
