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
import type { Email, CreateEmailInput } from '../types/email'

const EMAILS_COLLECTION = 'emails'

const emailsCollection = collection(db, EMAILS_COLLECTION)

export async function createEmail(input: CreateEmailInput): Promise<string> {
  const docRef = await addDoc(emailsCollection, {
    to: input.to,
    subject: input.subject,
    body: input.body,
    createdAt: serverTimestamp(),
    userId: input.userId,
    userDisplayName: input.userDisplayName,
    userPhotoUrl: input.userPhotoUrl,
    processed: false,
  })
  return docRef.id
}

export function subscribeToEmails(
  userId: string,
  onUpdate: (emails: Email[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(
    emailsCollection,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  )

  return onSnapshot(
    q,
    (snapshot) => {
      const emails: Email[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Email[]
      onUpdate(emails)
    },
    (error) => {
      console.error('Error subscribing to emails:', error)
      onError?.(error)
    }
  )
}
