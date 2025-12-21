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
  deleted_at: string | null
}

export interface Template {
  // columns
  id: string
  name: string
  value: string
  deleted_at: string | null
  created_at: string | null
  updated_at: string | null
}

export interface Page {
  // columns
  id: string
  meta: Record<string, unknown> | null
  index: boolean
  _lft: number
  _rgt: number
  parent_id: string | null
  created_at: string | null
  updated_at: string | null
  deleted_at: string | null
  template_id: string | null
}
