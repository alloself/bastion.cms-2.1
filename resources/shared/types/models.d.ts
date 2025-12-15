export interface Attribute {
  // columns
  id: number
  name: string
  key: string
  deleted_at: string | null
  created_at: string | null
  updated_at: string | null
}

export interface AuditModel {
  // columns
  id: string
  user_type: string | null
  user_id: string | null
  event: string
  auditable_type: string
  auditable_id: number
  old_values: Record<string, unknown> | null
  new_values: Record<string, unknown> | null
  url: string | null
  ip_address: string | null
  user_agent: string | null
  tags: string | null
  created_at: string | null
  updated_at: string | null
  // relations
  auditable?: AuditModel
  user?: AuditModel
}

export interface Block {
  // columns
  id: number
  name: string
  content: string | null
  order: number
  _lft: number
  _rgt: number
  parent_id: string | null
  created_at: string | null
  updated_at: string | null
  deleted_at: string | null
  template_id: string | null
}

export interface DataCollection {
  // columns
  id: number
  name: string
  meta: Record<string, unknown> | null
  order: number
  _lft: number
  _rgt: number
  parent_id: string | null
  template_id: string | null
  page_id: string | null
  created_at: string | null
  updated_at: string | null
  deleted_at: string | null
}

export interface DataEntity {
  // columns
  id: number
  name: string | null
  meta: Record<string, unknown> | null
  content: string | null
  order: number
  parent_id: string | null
  template_id: string | null
  created_at: string | null
  updated_at: string | null
  deleted_at: string | null
}

export interface File {
  // columns
  id: number
  url: string
  name: string
  extension: string
  deleted_at: string | null
  created_at: string | null
  updated_at: string | null
}

export interface Link {
  // columns
  id: number
  title: string
  subtitle: string | null
  slug: string
  url: string | null
  linkable_id: string | null
  linkable_type: string | null
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
  // relations
  audits?: AuditModel[]
}

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

export interface Attributeable {
  // relations
  attributeable?: Attributeable
  attribute?: Attribute
}

export interface Fileable {
  // relations
  fileable?: Fileable
  file?: File
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

export interface Template {
  // columns
  id: string
  name: string
  value: string
  deleted_at: string | null
  created_at: string | null
  updated_at: string | null
  // relations
  audits?: AuditModel[]
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
