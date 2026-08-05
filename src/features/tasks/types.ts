export const Status = {
  BACKLOG: 'BACKLOG',
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
  CANCELLED: 'CANCELLED'
} as const;
export type Status = (typeof Status)[keyof typeof Status];

export const TaskTag = {
  IOS: 'IOS',
  ANDROID: 'ANDROID',
  NODE_JS: 'NODE_JS',
  REACT: 'REACT',
  RAILS: 'RAILS'
} as const;
export type TaskTag = (typeof TaskTag)[keyof typeof TaskTag];

export const PointEstimate = {
  ZERO: 'ZERO',
  ONE: 'ONE',
  TWO: 'TWO',
  FOUR: 'FOUR',
  EIGHT: 'EIGHT'
} as const;
export type PointEstimate = (typeof PointEstimate)[keyof typeof PointEstimate];

export const UserType = {
  ADMIN: 'ADMIN',
  CANDIDATE: 'CANDIDATE',
} as const;
export type UserType = typeof UserType[keyof typeof UserType]

export interface User {
  id: string
  fullName: string
  avatar: string | null
  email: string
  type: UserType
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: string
  name: string
  status: Status
  tags: TaskTag[]
  pointEstimate: PointEstimate
  dueDate: string
  assignee: User | null
  creator: User
  position: number
  createdAt: string
}

