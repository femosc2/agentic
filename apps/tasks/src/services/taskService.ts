import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  where,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '../config/firebase'
import type { Task, CreateTaskInput } from '../types/task'

const TASKS_COLLECTION = 'tasks'

export const tasksCollection = collection(db, TASKS_COLLECTION)

export async function createTask(input: CreateTaskInput): Promise<string> {
  const docRef = await addDoc(tasksCollection, {
    title: input.title,
    description: input.description || null,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    userId: input.userId,
    userDisplayName: input.userDisplayName,
    userPhotoUrl: input.userPhotoUrl,
  })
  return docRef.id
}

export async function deleteTask(taskId: string): Promise<void> {
  const taskRef = doc(db, TASKS_COLLECTION, taskId)
  await deleteDoc(taskRef)
}

export function subscribeToTasks(
  userId: string,
  onUpdate: (tasks: Task[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(
    tasksCollection,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  )

  return onSnapshot(
    q,
    (snapshot) => {
      const tasks: Task[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Task[]
      onUpdate(tasks)
    },
    (error) => {
      console.error('Error subscribing to tasks:', error)
      onError?.(error)
    }
  )
}
