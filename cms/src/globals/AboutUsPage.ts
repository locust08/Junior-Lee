import type { GlobalConfig } from 'payload'

import { fixedRowArray, imageUpload, requiredText, requiredTextarea, section, seoFields, tab, tabs, titleDescriptionFields, versioning } from './fields/common'
import { triggerPagesDeployAfterNativeRestore, triggerPagesDeployAfterPublish } from '../hooks/triggerPagesDeploy'
import { withRestoreDeployEndpoint } from '../endpoints/restoreGlobalVersionWithDeploy'

const singleTextField = [requiredTextarea('text', 'Text')]

export const AboutUsPage: GlobalConfig = withRestoreDeployEndpoint({
  slug: 'about-us-page', label: 'About Us Page', access: { read: () => true }, admin: { group: 'Pages' }, versions: versioning,
  hooks: { beforeOperation: [triggerPagesDeployAfterNativeRestore], afterChange: [triggerPagesDeployAfterPublish] },
  fields: [tabs([
    tab('SEO', [section('seo', 'SEO', seoFields())]),
    tab('Hero', [section('hero', 'Hero', [imageUpload('backgroundImage', 'Background image'), requiredText('mainHeading', 'Main heading'), requiredTextarea('description', 'Description'), requiredText('primaryButtonLabel', 'Primary button label')])]),
    tab('Who We Are', [section('whoWeAre', 'Who we are', [imageUpload('image', 'Image'), requiredText('heading', 'Heading'), fixedRowArray('paragraphs', 'Paragraphs', 1, singleTextField), fixedRowArray('highlights', 'Highlights', 3, singleTextField), fixedRowArray('statistics', 'Statistics', 3, [requiredText('value', 'Value'), requiredText('label', 'Label')])])]),
    tab('Why Choose Us', [section('whyChooseUs', 'Why choose us', [requiredText('heading', 'Heading'), requiredTextarea('description', 'Description'), fixedRowArray('features', 'Features', 4, titleDescriptionFields())])]),
    tab('Who We Help', [section('whoWeHelp', 'Who we help', [requiredText('heading', 'Heading'), requiredTextarea('description', 'Description'), fixedRowArray('cards', 'Cards', 3, [imageUpload('image', 'Image'), ...titleDescriptionFields()])])]),
    tab('Ready To Get Started', [section('readyToGetStarted', 'Ready to get started', [requiredText('heading', 'Heading'), requiredTextarea('description', 'Description'), requiredText('applyButtonLabel', 'Apply button label'), requiredText('whatsappButtonLabel', 'WhatsApp button label')])]),
  ])],
})
