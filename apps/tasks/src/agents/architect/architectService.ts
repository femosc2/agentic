import {
  collection,
  query,
  where,
  limit,
  getDocs,
  doc,
  updateDoc,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore'
import { adminDb } from '../config/firebaseAdmin.js'
import { runClaude, parseJsonFromOutput } from '../shared/claudeRunner.js'

interface ArchitectAnalysis {
  repos: string[]
  impactedFiles: string[]
  complexity: 'low' | 'medium' | 'high'
  notes: string
}

function buildPrompt(title: string, description: string): string {
  return `You are a Software Architect. Analyze the following task and determine which files and repositories will be impacted.

TASK:
Title: ${title}
Description: ${description}

Analyze the codebase and respond with ONLY a JSON object (no markdown, no explanation) in this exact format:
{
  "repos": ["list of repository names that need changes"],
  "impactedFiles": ["list of file paths that will need modification"],
  "complexity": "low | medium | high",
  "notes": "Brief architectural notes: approach, risks, dependencies"
}

Rules:
- List actual file paths found in the codebase
- Complexity: low = 1-3 files, simple changes; medium = 4-8 files or moderate logic; high = 9+ files or architectural changes
- Notes should be concise (2-3 sentences max)
- Focus on implementation impact, not the task description`
}

export async function processNextDraft(): Promise<boolean> {
  const q = query(
    collection(adminDb, 'tasks'),
    where('status', '==', 'draft'),
    limit(1)
  )
  const snapshot = await getDocs(q)

  if (snapshot.empty) {
    console.log('[Architect] No draft tasks found')
    return false
  }

  const taskDoc = snapshot.docs[0]
  const taskRef = doc(adminDb, 'tasks', taskDoc.id)
  const data = taskDoc.data()

  // Claim with transaction
  const claimed = await runTransaction(adminDb, async (tx) => {
    const fresh = await tx.get(taskRef)
    if (!fresh.exists() || fresh.data()?.status !== 'draft') {
      return false
    }
    tx.update(taskRef, {
      status: 'draft',
      updatedAt: serverTimestamp(),
    })
    return true
  })

  if (!claimed) {
    console.log('[Architect] Task already claimed, skipping')
    return true
  }

  console.log(`[Architect] Analyzing task ${taskDoc.id}: ${data.title}`)

  const workingDir = process.env.AGENT_WORKING_DIR || process.cwd()
  const prompt = buildPrompt(data.title, data.description || '')
  const result = await runClaude(prompt, workingDir)

  if (!result.success) {
    console.error(`[Architect] Claude failed for task ${taskDoc.id}:`, result.error)
    return true
  }

  const analysis = parseJsonFromOutput(result.output) as ArchitectAnalysis | null

  if (!analysis) {
    console.error(`[Architect] Failed to parse analysis for task ${taskDoc.id}`)
    return true
  }

  // Validate complexity value
  const validComplexity = ['low', 'medium', 'high'].includes(analysis.complexity)
    ? analysis.complexity
    : 'medium'

  await updateDoc(taskRef, {
    status: 'pending',
    updatedAt: serverTimestamp(),
    architectReview: {
      repos: analysis.repos || [],
      impactedFiles: analysis.impactedFiles || [],
      complexity: validComplexity,
      notes: analysis.notes || '',
      analyzedAt: serverTimestamp(),
    },
  })

  console.log(`[Architect] Promoted task ${taskDoc.id} to pending (complexity: ${validComplexity})`)
  return true
}
