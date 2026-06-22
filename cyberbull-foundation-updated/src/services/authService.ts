import {
  createUserWithEmailAndPassword,
  deleteUser,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { auth } from '@/config/firebase'
import { createUserProfile, updateLastLogin } from './userService'
import { buildCyberBullEmail, generateCyberBullUsername } from '@/lib/authIdentity'
import type { CyberBullUser } from '@/types/auth'

export async function loginWithIdentity(domain: string, username: string, password: string) {
  const email = buildCyberBullEmail(username, domain)
  const credential = await signInWithEmailAndPassword(auth, email, password)
  await updateLastLogin(credential.user.uid)
  return credential.user
}

export async function registerCyberBullAccount(params: {
  firstName: string
  lastName: string
  domain: string
  password: string
  language: string
}) {
  const username = generateCyberBullUsername(params.firstName, params.lastName)
  const email = buildCyberBullEmail(username, params.domain)
  const credential = await createUserWithEmailAndPassword(auth, email, params.password)

  const profile: Omit<CyberBullUser, 'createdAt' | 'lastLogin'> = {
    firstName: params.firstName,
    lastName: params.lastName,
    email,
    role: 'student',
    school: params.domain,
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

export async function sendResetLinkForIdentity(domain: string, username: string) {
  await sendPasswordResetEmail(auth, buildCyberBullEmail(username, domain))
}

export async function logoutUser() {
  await signOut(auth)
}
