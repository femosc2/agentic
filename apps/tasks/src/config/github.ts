export const githubConfig = {
  owner: import.meta.env.VITE_GITHUB_OWNER || '',
  repo: import.meta.env.VITE_GITHUB_REPO || '',
  branch: import.meta.env.VITE_GITHUB_BRANCH || 'master',
}
