import type { GlobalConfig } from 'payload'

import { fixedRowArray, imageUpload, requiredText, requiredTextarea, section, seoFields, tab, tabs, titleDescriptionFields, versioning } from './fields/common'
import { triggerPagesDeployAfterNativeRestore, triggerPagesDeployAfterPublish } from '../hooks/triggerPagesDeploy'
import { withRestoreDeployEndpoint } from '../endpoints/restoreGlobalVersionWithDeploy'

export const HowToApplyPage: GlobalConfig = withRestoreDeployEndpoint({
  slug: 'how-to-apply-page', label: 'How To Apply Page', access: { read: () => true }, admin: { group: 'Pages' }, versions: versioning,
  hooks: { beforeOperation: [triggerPagesDeployAfterNativeRestore], afterChange: [triggerPagesDeployAfterPublish] },
  fields: [tabs([
    tab('SEO', [section('seo', 'SEO', seoFields())]),
    tab('Hero', [section('hero', 'Hero', [requiredText('mainHeading', 'Main heading'), requiredTextarea('description', 'Description'), requiredText('primaryButtonLabel', 'Primary button label')])]),
    tab('Step-By-Step Process', [section('steps', 'Step-by-step process', [requiredText('heading', 'Heading'), requiredTextarea('description', 'Description'), fixedRowArray('items', 'Steps', 3, titleDescriptionFields())])]),
    tab('Required Documents', [section('requiredDocuments', 'Required documents', [imageUpload('image', 'Image'), requiredText('heading', 'Heading'), requiredTextarea('description', 'Description'), fixedRowArray('items', 'Documents', 4, titleDescriptionFields())])]),
    tab('Eligibility Requirements', [section('eligibility', 'Eligibility requirements', [requiredText('heading', 'Heading'), requiredTextarea('description', 'Description'), fixedRowArray('items', 'Requirements', 4, [requiredTextarea('text', 'Requirement')])])]),
    tab('Ready To Apply', [section('readyToApply', 'Ready to apply', [requiredText('heading', 'Heading'), requiredTextarea('description', 'Description'), requiredText('whatsappButtonLabel', 'WhatsApp button label'), requiredText('submitButtonLabel', 'Submit button label')])]),
  ])],
})
