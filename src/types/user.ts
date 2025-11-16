import { RankType } from './profile'

export interface User {
  id: string
  username: string
  age: number
  rank: RankType
  verified: boolean
  createdAt: Date
}

export interface SignupFormData {
  username: string
  password: string
  age: number
}
