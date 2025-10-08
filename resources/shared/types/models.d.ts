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
  // exists
  roles_exists: boolean
  users_exists: boolean
  permissions_exists: boolean
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
  // exists
  permissions_exists: boolean
  users_exists: boolean
}

export interface User {
  // columns
  id: string
  email: string
  email_verified_at: string | null
  two_factor_secret: string | null
  two_factor_recovery_codes: string | null
  two_factor_confirmed_at: string | null
  created_at: string | null
  updated_at: string | null
  // overrides
  tokens: never
  notifications: never
  // relations
  roles?: Role[]
  permissions?: Permission[]
  // exists
  roles_exists: boolean
  permissions_exists: boolean
}
