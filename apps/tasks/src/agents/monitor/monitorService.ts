import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { adminDb } from '../config/firebaseAdmin.js'

const GITHUB_OWNER = process.env.GITHUB_OWNER || process.env.VITE_GITHUB_OWNER || ''
const GITHUB_REPO = process.env.GITHUB_REPO || process.env.VITE_GITHUB_REPO || ''
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || ''

interface MergedPR {
  prUrl: string
  commitHash: string
}

async function fetchMergedPR(taskId: string): Promise<MergedPR | null> {
  if (!GITHUB_OWNER || !GITHUB_REPO) return null

  const branch = `task/${taskId}`
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/pulls?state=closed&head=${GITHUB_OWNER}:${branch}&per_page=1`

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  }
  if (GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`
  }

  const response = await fetch(url, { headers })
  if (!response.ok) {
    console.error(`[Monitor] GitHub API error ${response.status} for branch ${branch}`)
    return null
  }

  const prs = await response.json() as Array<{ merged_at: string | null; html_url: string; merge_commit_sha: string }>
  const pr = prs[0]

  if (!pr || !pr.merged_at) return null

  return {
    prUrl: pr.html_url,
    commitHash: pr.merge_commit_sha || '',
  }
}

export async function reconcileInProgressTasks(): Promise<boolean> {
  if (!GITHUB_OWNER || !GITHUB_REPO) {
    console.log('[Monitor] GITHUB_OWNER or GITHUB_REPO not configured, skipping')
    return false
  }

  const snapshot = await getDocs(
    query(collection(adminDb, 'tasks'), where('status', '==', 'in_progress'))
  )

  if (snapshot.empty) {
    console.log('[Monitor] No in_progress tasks found')
    return false
  }

  console.log(`[Monitor] Checking ${snapshot.size} in_progress task(s) against GitHub...`)

  let anyCompleted = false

  for (const taskDoc of snapshot.docs) {
    const taskId = taskDoc.id
    const data = taskDoc.data()

    const merged = await fetchMergedPR(taskId)

    if (merged) {
      console.log(`[Monitor] Task ${taskId} ("${data.title}") has merged PR — marking completed`)
      await updateDoc(doc(adminDb, 'tasks', taskId), {
        status: 'completed',
        updatedAt: serverTimestamp(),
        result: {
          branchName: `task/${taskId}`,
          commitHash: merged.commitHash,
          prUrl: merged.prUrl,
        },
      })
      anyCompleted = true
    } else {
      console.log(`[Monitor] Task ${taskId} — no merged PR yet`)
    }
  }

  return anyCompleted
}
