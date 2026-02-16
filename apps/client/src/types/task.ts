import type { Timestamp } from 'firebase/firestore'

export type TaskStatus = 'draft' | 'pending' | 'in_progress' | 'completed' | 'failed'

export interface TaskResult {
  branchName: string
  commitHash: string
  prUrl?: string
  error?: string
}

export interface ArchitectReview {
  repos: string[]
  impactedFiles: string[]
  complexity: 'low' | 'medium' | 'high'
  notes: string
  analyzedAt: Timestamp
}

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  createdAt: Timestamp
  updatedAt: Timestamp
  result?: TaskResult
  source?: 'user' | 'product-owner'
  sourceRef?: string
  architectReview?: ArchitectReview
}
