export type UserRole = 'student' | 'teacher' | 'moderator' | 'admin' | 'owner'
export type AccountStatus = 'active' | 'suspended' | 'banned'

export interface CyberBullUser {
  firstName: string
  lastName: string
  email: string
  role: UserRole
  school: string
  schoolVerified: boolean
  createdAt: Date | null
  lastLogin: Date | null
  language: string
  theme: 'light' | 'dark'
  profilePhoto: string
  passwordChanged: boolean
  accountStatus: AccountStatus
}

export interface AuthProfile extends CyberBullUser {
  uid: string
}
