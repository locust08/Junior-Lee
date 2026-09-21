import type { GlobalConfig } from 'payload'

import { fixedRowArray, imageUpload, requiredText, requiredTextarea, section, seoFields, tab, tabs, versioning } from './fields/common'
import { triggerPagesDeployAfterNativeRestore, triggerPagesDeployAfterPublish } from '../hooks/triggerPagesDeploy'
import { withRestoreDeployEndpoint } from '../endpoints/restoreGlobalVersionWithDeploy'

const contactMethodFields = (name: string, label: string, includeDescription = true) => section(
  name,
  label,
  [
    requiredText('heading', 'Heading'),
    ...(includeDescription ? [requiredTextarea('description', 'Description')] : []),
  ],
)

export const ContactUsPage: GlobalConfig = withRestoreDeployEndpoint({
  slug: 'contact-us-page', label: 'Contact Us Page', access: { read: () => true }, admin: { group: 'Pages' }, versions: versioning,
  hooks: { beforeOperation: [triggerPagesDeployAfterNativeRestore], afterChange: [triggerPagesDeployAfterPublish] },
  fields: [tabs([
    tab('SEO', [section('seo', 'SEO', seoFields())]),
    tab('Contact Us And Appointment Form', [section('contactForm', 'Contact us and appointment form', [requiredText('heading', 'Heading'), requiredTextarea('description', 'Description'), requiredText('submitButtonLabel', 'Submit button label'), imageUpload('image', 'Image')])]),
    tab('Contact Details', [section('contactMethods', 'Contact methods', [contactMethodFields('email', 'Email'), contactMethodFields('phone', 'Phone'), contactMethodFields('office', 'Office')])]),
    tab('FAQ', [section('faq', 'FAQ', [requiredText('heading', 'Heading'), requiredTextarea('description', 'Description'), fixedRowArray('items', 'Questions and answers', 5, [requiredText('question', 'Question'), requiredTextarea('answer', 'Answer')])])]),
    tab('Still Have Questions', [section('stillHaveQuestions', 'Still have questions', [requiredText('heading', 'Heading'), requiredTextarea('description', 'Description')])]),
  ])],
})
