import {
  createUserWithEmailAndPassword,
  deleteUser,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { auth } from '@/config/firebase'
import { createUserProfile, updateLastLogin } from './userService'
import type { CyberBullUser } from '@/types/auth'

export async function loginWithEmailPassword(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password)
  await updateLastLogin(credential.user.uid)
  return credential.user
}

export async function registerCyberBullAccount(params: {
  firstName: string
  lastName: string
  email: string
  password: string
  language: string
}) {
  const credential = await createUserWithEmailAndPassword(auth, params.email, params.password)

  const profile: Omit<CyberBullUser, 'createdAt' | 'lastLogin'> = {
    firstName: params.firstName,
    lastName: params.lastName,
    email: params.email,
    role: 'student',
    school: '',
    schoolVerified: false,
    language: params.language,
    theme: 'light',
    profilePhoto: '',
    passwordChanged: false,
    accountStatus: 'active',
  }

  try {
    await createUserProfile(credential.user.uid, profile)
  } catch (error) {
    await deleteUser(credential.user)
    throw error
  }

  await updateLastLogin(credential.user.uid)
  return credential.user
}

export async function sendResetLink(email: string) {
  await sendPasswordResetEmail(auth, email)
}

export async function logoutUser() {
  await signOut(auth)
}
