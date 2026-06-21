import { collection, doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { AuthProfile, CyberBullUser, UserRole } from '@/types/auth'
import { asDate } from '@/lib/firebaseDate'

const usersCollection = collection(db, 'users')

export function toProfile(uid: string, data: Partial<CyberBullUser> | undefined): AuthProfile | null {
  if (!data) return null
  return {
    uid,
    firstName: data.firstName ?? '',
    lastName: data.lastName ?? '',
    email: data.email ?? '',
    role: (data.role as UserRole) ?? 'student',
    school: data.school ?? '',
    schoolVerified: data.schoolVerified ?? false,
    createdAt: asDate(data.createdAt),
    lastLogin: asDate(data.lastLogin),
    language: data.language ?? 'nl',
    theme: data.theme ?? 'light',
    profilePhoto: data.profilePhoto ?? '',
    passwordChanged: data.passwordChanged ?? false,
    accountStatus: data.accountStatus ?? 'active',
  }
}

export async function getUserProfile(uid: string) {
  const snapshot = await getDoc(doc(usersCollection, uid))
  return toProfile(uid, snapshot.data() as CyberBullUser | undefined)
}

export async function createUserProfile(uid: string, profile: Omit<CyberBullUser, 'createdAt' | 'lastLogin'>) {
  await setDoc(doc(usersCollection, uid), {
    ...profile,
    createdAt: serverTimestamp(),
    lastLogin: serverTimestamp(),
  })
}

export async function updateLastLogin(uid: string) {
  await updateDoc(doc(usersCollection, uid), { lastLogin: serverTimestamp() })
}
