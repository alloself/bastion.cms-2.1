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

export interface Fileable {
  // relations
  fileable?: Fileable
  file?: File
}

export interface File {
  // columns
  id: string
  url: unknown
  name: string
  extension: string
  created_at: string | null
  updated_at: string | null
  // relations
  fileables?: Fileable[]
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
  created_at: string | null
  updated_at: string | null
  deleted_at: string | null
  template_id: string | null
  // overrides
  parent_id: string | null
  has_children: boolean | null
  // relations
  template?: Template
  link?: Link
  parent?: Page
  children?: Page[]
  links?: Link[]
}

export interface Link {
  // columns
  id: string
  title: string
  subtitle: string | null
  slug: string
  url: string | null
  linkable_id: string | null
  linkable_type: string | null
  deleted_at: string | null
  created_at: string | null
  updated_at: string | null
  // relations
  linkable?: Link
}
