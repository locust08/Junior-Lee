import type { GlobalConfig } from 'payload'

import { fixedRowArray, imageUpload, requiredText, requiredTextarea, section, seoFields, tab, tabs, titleDescriptionFields, versioning } from './fields/common'
import { triggerPagesDeployAfterNativeRestore, triggerPagesDeployAfterPublish } from '../hooks/triggerPagesDeploy'
import { withRestoreDeployEndpoint } from '../endpoints/restoreGlobalVersionWithDeploy'

const loanFeatureFields = [imageUpload('image', 'Image'), ...titleDescriptionFields()]
const requirementFields = [requiredTextarea('text', 'Requirement')]

const loanSection = (name: 'personalLoan' | 'businessLoan', label: string, requirementRows: number) =>
  section(name, label, [
    requiredText('heading', 'Heading'),
    requiredTextarea('description', 'Description'),
    requiredText('documentsLinkLabel', 'Documents link label'),
    requiredText('applyButtonLabel', 'Apply button label'),
    requiredText('whatsappButtonLabel', 'WhatsApp button label'),
    fixedRowArray('features', 'Features', 2, loanFeatureFields),
    section('requirements', 'Required documents', [
      fixedRowArray('items', 'Requirements', requirementRows, requirementFields),
    ]),
  ])

export const LoanPage: GlobalConfig = withRestoreDeployEndpoint({
  slug: 'loan-page', label: 'Loan Page', access: { read: () => true }, admin: { group: 'Pages' }, versions: versioning,
  hooks: { beforeOperation: [triggerPagesDeployAfterNativeRestore], afterChange: [triggerPagesDeployAfterPublish] },
  fields: [tabs([
    tab('SEO', [section('seo', 'SEO', seoFields())]),
    tab('Hero', [section('hero', 'Hero', [requiredText('eyebrow', 'Eyebrow'), requiredText('mainHeading', 'Main heading'), requiredTextarea('description', 'Description'), requiredText('primaryButtonLabel', 'Primary button label'), imageUpload('image', 'Image')])]),
    tab('Personal Loan', [loanSection('personalLoan', 'Personal loan', 8)]),
    tab('Business Loan', [loanSection('businessLoan', 'Business loan', 11)]),
    tab('Loan Comparison', [section('comparison', 'Loan comparison', [
      requiredText('heading', 'Heading'), requiredTextarea('description', 'Description'), requiredText('tableHeading', 'Table heading'),
      section('personalColumn', 'Personal loan column', [requiredText('title', 'Title'), requiredText('subtitle', 'Subtitle')]),
      section('businessColumn', 'Business loan column', [requiredText('title', 'Title'), requiredText('subtitle', 'Subtitle')]),
      fixedRowArray('rows', 'Comparison rows', 4, [requiredText('label', 'Label'), requiredTextarea('personalValue', 'Personal loan value'), requiredTextarea('businessValue', 'Business loan value')]),
      requiredText('loanDetailsHeading', 'Loan details heading'),
    ])]),
    tab('Required Documents', [section('requiredDocuments', 'Required documents', [requiredText('heading', 'Heading'), requiredTextarea('description', 'Description'), requiredText('personalHeading', 'Personal heading'), requiredText('businessHeading', 'Business heading'), requiredText('ctaHeading', 'CTA heading'), requiredTextarea('ctaDescription', 'CTA description')])]),
    tab('Interest Rates & Repayment', [section('interestRates', 'Interest rates and repayment', [requiredText('heading', 'Heading'), requiredTextarea('description', 'Description'), fixedRowArray('features', 'Features', 3, titleDescriptionFields()), requiredText('exampleHeading', 'Example heading'), requiredText('amountLabel', 'Amount label'), requiredText('amountValue', 'Amount value'), requiredTextarea('exampleDescription', 'Example description')])]),
  ])],
})
