import type { User } from './user'

export interface Mentor extends Omit<User, 'professional'> {
  description?: string
  category: string
  company?: {
    name: string
    logo: string
  }
}

export interface Alumni extends Omit<User, 'professional'> {
  description?: string
  category: string
  batch: string
}
