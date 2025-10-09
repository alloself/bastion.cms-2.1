export interface Permission {
  // columns
  id: string
  name: string
  guard_name: string
  created_at: string | null
  updated_at: string | null
  // relations
  roles?: Role[]
  users?: User[]
  permissions?: Permission[]
}

export interface Role {
  // columns
  id: string
  name: string
  guard_name: string
  created_at: string | null
  updated_at: string | null
  // relations
  permissions?: Permission[]
  users?: User[]
}

export interface User {
  // columns
  id: string
  email: string
  email_verified_at: string | null
  created_at: string | null
  updated_at: string | null
  // relations
  roles?: Role[]
  permissions?: Permission[]
}
