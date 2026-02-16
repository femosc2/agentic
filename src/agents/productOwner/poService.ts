import {
  collection,
  query,
  where,
  limit,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore'
import { adminDb } from '../config/firebaseAdmin.js'
import { runClaude, parseJsonFromOutput } from '../shared/claudeRunner.js'

interface UnprocessedItem {
  id: string
  collectionName: 'emails' | 'forms'
  userId: string
  userDisplayName: string | null
  userPhotoUrl: string | null
  content: string
}

interface GeneratedTask {
  title: string
  description: string
}

async function fetchUnprocessedEmails(): Promise<UnprocessedItem[]> {
  const q = query(
    collection(adminDb, 'emails'),
    where('processed', '==', false),
    limit(5)
  )
  const snapshot = await getDocs(q)

  return snapshot.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      collectionName: 'emails' as const,
      userId: data.userId,
      userDisplayName: data.userDisplayName,
      userPhotoUrl: data.userPhotoUrl,
      content: `Email subject: ${data.subject}\nEmail body: ${data.body}`,
    }
  })
}

async function fetchUnprocessedForms(): Promise<UnprocessedItem[]> {
  const q = query(
    collection(adminDb, 'forms'),
    where('processed', '==', false),
    limit(5)
  )
  const snapshot = await getDocs(q)

  return snapshot.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      collectionName: 'forms' as const,
      userId: data.userId,
      userDisplayName: data.userDisplayName,
      userPhotoUrl: data.userPhotoUrl,
      content: `Type: ${data.type}\nTitle: ${data.title}\nDescription: ${data.description}`,
    }
  })
}

function buildPrompt(item: UnprocessedItem): string {
  return `You are a Product Owner. Analyze the following user feedback and generate a well-structured development task.

USER FEEDBACK:
${item.content}

Respond with ONLY a JSON object (no markdown, no explanation) in this exact format:
{
  "title": "Short imperative task title (max 80 chars)",
  "description": "Detailed description including:\\n- User story (As a [user], I want [goal], so that [benefit])\\n- Acceptance criteria (bulleted list)\\n- Definition of done"
}

Rules:
- Title should be actionable and start with a verb (Add, Fix, Update, Implement, etc.)
- Description must include a user story and at least 2 acceptance criteria
- Keep it focused on a single deliverable
- If the feedback is vague, make reasonable assumptions and note them`
}

async function generateTask(item: UnprocessedItem): Promise<GeneratedTask | null> {
  const prompt = buildPrompt(item)
  const result = await runClaude(prompt)

  if (!result.success) {
    console.error(`[PO] Claude failed for ${item.collectionName}/${item.id}:`, result.error)
    return null
  }

  const parsed = parseJsonFromOutput(result.output) as GeneratedTask | null
  if (!parsed?.title || !parsed?.description) {
    console.error(`[PO] Failed to parse Claude output for ${item.collectionName}/${item.id}`)
    return null
  }

  return parsed
}

async function createDraftTask(item: UnprocessedItem, task: GeneratedTask): Promise<string> {
  const docRef = await addDoc(collection(adminDb, 'tasks'), {
    title: task.title,
    description: task.description,
    status: 'draft',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    userId: item.userId,
    userDisplayName: item.userDisplayName,
    userPhotoUrl: item.userPhotoUrl,
    source: 'product-owner',
    sourceRef: `${item.collectionName}/${item.id}`,
  })
  return docRef.id
}

export async function processNextItem(): Promise<boolean> {
  const emails = await fetchUnprocessedEmails()
  const forms = await fetchUnprocessedForms()
  const items = [...emails, ...forms]

  if (items.length === 0) {
    console.log('[PO] No unprocessed items found')
    return false
  }

  const item = items[0]
  console.log(`[PO] Processing ${item.collectionName}/${item.id}`)

  // Claim with transaction to prevent double-processing
  const docRef = doc(adminDb, item.collectionName, item.id)
  const claimed = await runTransaction(adminDb, async (tx) => {
    const snap = await tx.get(docRef)
    if (!snap.exists() || snap.data()?.processed === true) {
      return false
    }
    tx.update(docRef, { processed: true })
    return true
  })

  if (!claimed) {
    console.log(`[PO] Item already processed, skipping`)
    return true
  }

  const task = await generateTask(item)
  if (!task) {
    // Revert processed flag on failure
    await updateDoc(docRef, { processed: false })
    console.error(`[PO] Failed to generate task, reverted processed flag`)
    return true
  }

  const taskId = await createDraftTask(item, task)
  await updateDoc(docRef, { taskId })

  console.log(`[PO] Created draft task ${taskId}: ${task.title}`)
  return true
}
