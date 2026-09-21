import type { GlobalConfig } from 'payload'

import { fixedRowArray, imageUpload, requiredText, requiredTextarea, section, seoFields, tab, tabs, titleDescriptionFields, versioning } from './fields/common'
import { triggerPagesDeployAfterNativeRestore, triggerPagesDeployAfterPublish } from '../hooks/triggerPagesDeploy'
import { withRestoreDeployEndpoint } from '../endpoints/restoreGlobalVersionWithDeploy'

const cardFields = [imageUpload('image', 'Image'), ...titleDescriptionFields(), requiredText('linkLabel', 'Link label')]

export const HomePage: GlobalConfig = withRestoreDeployEndpoint({
  slug: 'home-page', label: 'Home Page', access: { read: () => true }, admin: { group: 'Pages' }, versions: versioning,
  hooks: { beforeOperation: [triggerPagesDeployAfterNativeRestore], afterChange: [triggerPagesDeployAfterPublish] },
  fields: [tabs([
    tab('SEO', [section('seo', 'SEO', seoFields())]),
    tab('Hero', [section('hero', 'Hero', [requiredText('eyebrow', 'Eyebrow'), requiredText('mainHeading', 'Main heading'), requiredTextarea('description', 'Description'), requiredText('primaryButtonLabel', 'Primary button label'), requiredText('secondaryButtonLabel', 'Secondary button label'), imageUpload('leftTopImage', 'Left top image'), imageUpload('rightTopImage', 'Right top image'), imageUpload('bottomLeftImage', 'Bottom left image'), imageUpload('bottomRightImage', 'Bottom right image')])]),
    tab('How It Works', [section('howItWorks', 'How it works', [requiredText('heading', 'Heading'), requiredTextarea('description', 'Description'), fixedRowArray('steps', 'Steps', 3, titleDescriptionFields())])]),
    tab('Loan Options', [section('loanOptions', 'Loan options', [requiredText('heading', 'Heading'), requiredTextarea('description', 'Description'), fixedRowArray('cards', 'Loan options', 2, cardFields)])]),
    tab('Why Choose Us', [section('whyChooseUs', 'Why choose us', [imageUpload('image', 'Image'), requiredText('heading', 'Heading'), fixedRowArray('features', 'Features', 3, titleDescriptionFields())])]),
    tab('Ready To Get Started', [section('readyToGetStarted', 'Ready to get started', [requiredText('heading', 'Heading'), requiredTextarea('description', 'Description'), requiredText('applyButtonLabel', 'Apply button label'), requiredText('whatsappButtonLabel', 'WhatsApp button label')])]),
  ])],
})
