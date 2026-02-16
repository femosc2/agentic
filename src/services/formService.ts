import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '../config/firebase'
import type { FormEntry, CreateFormInput } from '../types/form'

const FORMS_COLLECTION = 'forms'

const formsCollection = collection(db, FORMS_COLLECTION)

export async function createFormEntry(input: CreateFormInput): Promise<string> {
  const docRef = await addDoc(formsCollection, {
    type: input.type,
    title: input.title,
    description: input.description,
    createdAt: serverTimestamp(),
    userId: input.userId,
    userDisplayName: input.userDisplayName,
    userPhotoUrl: input.userPhotoUrl,
    processed: false,
  })
  return docRef.id
}

export function subscribeToForms(
  userId: string,
  onUpdate: (forms: FormEntry[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(
    formsCollection,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  )

  return onSnapshot(
    q,
    (snapshot) => {
      const forms: FormEntry[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as FormEntry[]
      onUpdate(forms)
    },
    (error) => {
      console.error('Error subscribing to forms:', error)
      onError?.(error)
    }
  )
}
