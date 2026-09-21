import type { GlobalConfig } from 'payload'

import { imageUpload, optionalText, requiredText, requiredTextarea, section, tab, tabs, versioning } from './fields/common'
import { triggerPagesDeployAfterNativeRestore, triggerPagesDeployAfterPublish } from '../hooks/triggerPagesDeploy'
import { withRestoreDeployEndpoint } from '../endpoints/restoreGlobalVersionWithDeploy'

export const SiteSettings: GlobalConfig = withRestoreDeployEndpoint({
  slug: 'site-settings',
  label: 'Site Settings',
  access: { read: () => true },
  admin: { group: 'Website' },
  versions: versioning,
  hooks: {
    beforeOperation: [triggerPagesDeployAfterNativeRestore],
    afterChange: [triggerPagesDeployAfterPublish],
  },
  fields: [tabs([
    tab('Header', [
      section('header', 'Header', [
        imageUpload('websiteLogo', 'Website logo'),
        imageUpload('mobileDrawerLogo', 'Mobile drawer logo'),
        requiredText('aboutUsMenuLabel', 'About us menu label'),
        requiredText('loanMenuLabel', 'Loan menu label'),
        requiredText('howToApplyMenuLabel', 'How to apply menu label'),
        requiredText('contactUsMenuLabel', 'Contact us menu label'),
        requiredText('applyNowButtonLabel', 'Apply now button label'),
      ]),
    ]),
    tab('Footer', [
      section('footer', 'Footer', [
        imageUpload('footerLogo', 'Footer logo'),
        requiredTextarea('brandDescription', 'Brand description'),
        requiredText('quickLinksColumnHeading', 'Quick links column heading'),
        requiredText('homeLinkLabel', 'Home link label'),
        requiredText('loanOptionsLinkLabel', 'Loan options link label'),
        requiredText('howToApplyLinkLabel', 'How to apply link label'),
        requiredText('aboutUsLinkLabel', 'About us link label'),
        requiredText('contactUsLinkLabel', 'Contact us link label'),
        requiredText('loanInformationColumnHeading', 'Loan information column heading'),
        requiredText('personalLoanLinkLabel', 'Personal loan link label'),
        requiredText('businessLoanLinkLabel', 'Business loan link label'),
        requiredText('requiredDocumentsLinkLabel', 'Required documents link label'),
        requiredText('interestRepaymentLinkLabel', 'Interest and repayment link label'),
        requiredText('contactColumnHeading', 'Contact column heading'),
        requiredText('phoneLabel', 'Phone label'),
        requiredText('emailLabel', 'Email label'),
        requiredText('officeLabel', 'Office label'),
        requiredText('hoursLabel', 'Hours label'),
        requiredText('businessHours', 'Business hours'),
        requiredText('copyrightText', 'Copyright text'),
      ]),
    ]),
    tab('Contact Details', [
      section('contactDetails', 'Contact details', [
        requiredText('supportEmail', 'Support email'),
        requiredText('displayPhoneNumber', 'Display phone number'),
        requiredText('officeName', 'Office name'),
        requiredTextarea('officeAddress', 'Office address'),
        optionalText('wazeUrl', 'Waze URL'),
        optionalText('googleMapsUrl', 'Google Maps URL'),
      ]),
    ]),
  ])],
})
