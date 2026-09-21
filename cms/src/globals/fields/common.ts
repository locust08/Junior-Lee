import type { Field } from 'payload'

type DefaultValue = string | undefined

export const requiredText = (name: string, label: string, defaultValue?: DefaultValue): Field => ({
  name,
  type: 'text',
  label,
  required: true,
  defaultValue,
})

export const optionalText = (name: string, label: string, defaultValue?: DefaultValue): Field => ({
  name,
  type: 'text',
  label,
  defaultValue,
})

export const requiredTextarea = (name: string, label: string, defaultValue?: DefaultValue): Field => ({
  name,
  type: 'textarea',
  label,
  required: true,
  defaultValue,
})

export const imageUpload = (name: string, label: string): Field => ({
  name,
  type: 'upload',
  label,
  relationTo: 'media',
})

export const seoFields = (): Field[] => [
  requiredText('title', 'Page title'),
  optionalText('description', 'Meta description'),
]

export const titleDescriptionFields = (): Field[] => [
  requiredText('title', 'Title'),
  requiredTextarea('description', 'Description'),
]

export const fixedRowArray = (name: string, label: string, rows: number, fields: Field[]): Field => ({
  name,
  type: 'array',
  label,
  minRows: rows,
  maxRows: rows,
  fields,
})

type Tab = { label: string; fields: Field[] }

export const tab = (label: string, fields: Field[]): Tab => ({ label, fields })

export const tabs = (items: Tab[]): Field => ({ type: 'tabs', tabs: items })

export const versioning = {
  drafts: true,
  max: 20,
}

export const section = (name: string, label: string, fields: Field[]): Field => ({
  name,
  type: 'group',
  label,
  fields,
})
