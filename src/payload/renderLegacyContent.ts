import { parse } from 'node-html-parser';
import type { PublicPayloadContent, SitePageId } from './content';

type LegacyPageFile = 'index.html' | 'about_us.html' | 'loan.html' | 'how_to_apply.html' | 'contact.html';
type BindingKind = 'text' | 'image' | 'href' | 'counter';

export type LegacyContentBinding = {
  id: string;
  path: string;
  pages: LegacyPageFile[];
  kind: BindingKind;
};

export const legacyContentBindings: LegacyContentBinding[] = [
  {
    "id": "site-header-logo",
    "path": "siteSettings.header.websiteLogo",
    "pages": [
      "index.html",
      "about_us.html",
      "loan.html",
      "how_to_apply.html",
      "contact.html"
    ],
    "kind": "image"
  },
  {
    "id": "site-header-mobile-drawer-primary-logo",
    "path": "siteSettings.header.mobileDrawerLogo",
    "pages": [
      "index.html",
      "about_us.html",
      "loan.html",
      "how_to_apply.html",
      "contact.html"
    ],
    "kind": "image"
  },
  {
    "id": "site-header-mobile-drawer-secondary-logo",
    "path": "siteSettings.header.mobileDrawerLogo",
    "pages": [
      "index.html"
    ],
    "kind": "image"
  },
  {
    "id": "site-header-nav-about-us",
    "path": "siteSettings.header.aboutUsMenuLabel",
    "pages": [
      "index.html",
      "about_us.html",
      "loan.html",
      "how_to_apply.html",
      "contact.html"
    ],
    "kind": "text"
  },
  {
    "id": "site-header-mobile-drawer-primary-nav-about-us",
    "path": "siteSettings.header.aboutUsMenuLabel",
    "pages": [
      "index.html",
      "about_us.html",
      "loan.html",
      "how_to_apply.html",
      "contact.html"
    ],
    "kind": "text"
  },
  {
    "id": "site-header-mobile-drawer-secondary-nav-about-us",
    "path": "siteSettings.header.aboutUsMenuLabel",
    "pages": [
      "index.html"
    ],
    "kind": "text"
  },
  {
    "id": "site-header-nav-loan",
    "path": "siteSettings.header.loanMenuLabel",
    "pages": [
      "index.html",
      "about_us.html",
      "loan.html",
      "how_to_apply.html",
      "contact.html"
    ],
    "kind": "text"
  },
  {
    "id": "site-header-mobile-drawer-primary-nav-loan",
    "path": "siteSettings.header.loanMenuLabel",
    "pages": [
      "index.html",
      "about_us.html",
      "loan.html",
      "how_to_apply.html",
      "contact.html"
    ],
    "kind": "text"
  },
  {
    "id": "site-header-mobile-drawer-secondary-nav-loan",
    "path": "siteSettings.header.loanMenuLabel",
    "pages": [
      "index.html"
    ],
    "kind": "text"
  },
  {
    "id": "site-header-nav-how-to-apply",
    "path": "siteSettings.header.howToApplyMenuLabel",
    "pages": [
      "index.html",
      "about_us.html",
      "loan.html",
      "how_to_apply.html",
      "contact.html"
    ],
    "kind": "text"
  },
  {
    "id": "site-header-mobile-drawer-primary-nav-how-to-apply",
    "path": "siteSettings.header.howToApplyMenuLabel",
    "pages": [
      "index.html",
      "about_us.html",
      "loan.html",
      "how_to_apply.html",
      "contact.html"
    ],
    "kind": "text"
  },
  {
    "id": "site-header-mobile-drawer-secondary-nav-how-to-apply",
    "path": "siteSettings.header.howToApplyMenuLabel",
    "pages": [
      "index.html"
    ],
    "kind": "text"
  },
  {
    "id": "site-header-nav-contact-us",
    "path": "siteSettings.header.contactUsMenuLabel",
    "pages": [
      "index.html",
      "about_us.html",
      "loan.html",
      "how_to_apply.html",
      "contact.html"
    ],
    "kind": "text"
  },
  {
    "id": "site-header-mobile-drawer-primary-nav-contact-us",
    "path": "siteSettings.header.contactUsMenuLabel",
    "pages": [
      "index.html",
      "about_us.html",
      "loan.html",
      "how_to_apply.html",
      "contact.html"
    ],
    "kind": "text"
  },
  {
    "id": "site-header-mobile-drawer-secondary-nav-contact-us",
    "path": "siteSettings.header.contactUsMenuLabel",
    "pages": [
      "index.html"
    ],
    "kind": "text"
  },
  {
    "id": "site-header-apply-now-label",
    "path": "siteSettings.header.applyNowButtonLabel",
    "pages": [
      "index.html",
      "about_us.html",
      "loan.html",
      "how_to_apply.html",
      "contact.html"
    ],
    "kind": "text"
  },
  {
    "id": "site-header-mobile-drawer-primary-apply-now-label",
    "path": "siteSettings.header.applyNowButtonLabel",
    "pages": [
      "index.html",
      "about_us.html",
      "loan.html",
      "how_to_apply.html",
      "contact.html"
    ],
    "kind": "text"
  },
  {
    "id": "site-header-mobile-drawer-secondary-apply-now-label",
    "path": "siteSettings.header.applyNowButtonLabel",
    "pages": [
      "index.html"
    ],
    "kind": "text"
  },
  {
    "id": "site-footer-logo",
    "path": "siteSettings.footer.footerLogo",
    "pages": [
      "index.html",
      "about_us.html",
      "loan.html",
      "how_to_apply.html",
      "contact.html"
    ],
    "kind": "image"
  },
  {
    "id": "site-footer-brand-description",
    "path": "siteSettings.footer.brandDescription",
    "pages": [
      "index.html",
      "about_us.html",
      "loan.html",
      "how_to_apply.html",
      "contact.html"
    ],
    "kind": "text"
  },
  {
    "id": "site-footer-quick-links-heading",
    "path": "siteSettings.footer.quickLinksColumnHeading",
    "pages": [
      "index.html",
      "about_us.html",
      "loan.html",
      "how_to_apply.html",
      "contact.html"
    ],
    "kind": "text"
  },
  {
    "id": "site-footer-link-home",
    "path": "siteSettings.footer.homeLinkLabel",
    "pages": [
      "index.html",
      "about_us.html",
      "loan.html",
      "how_to_apply.html",
      "contact.html"
    ],
    "kind": "text"
  },
  {
    "id": "site-footer-link-loan-options",
    "path": "siteSettings.footer.loanOptionsLinkLabel",
    "pages": [
      "index.html",
      "about_us.html",
      "loan.html",
      "how_to_apply.html",
      "contact.html"
    ],
    "kind": "text"
  },
  {
    "id": "site-footer-link-how-to-apply",
    "path": "siteSettings.footer.howToApplyLinkLabel",
    "pages": [
      "index.html",
      "about_us.html",
      "loan.html",
      "how_to_apply.html",
      "contact.html"
    ],
    "kind": "text"
  },
  {
    "id": "site-footer-link-about-us",
    "path": "siteSettings.footer.aboutUsLinkLabel",
    "pages": [
      "index.html",
      "about_us.html",
      "loan.html",
      "how_to_apply.html",
      "contact.html"
    ],
    "kind": "text"
  },
  {
    "id": "site-footer-link-contact-us",
    "path": "siteSettings.footer.contactUsLinkLabel",
    "pages": [
      "index.html",
      "about_us.html",
      "loan.html",
      "how_to_apply.html",
      "contact.html"
    ],
    "kind": "text"
  },
  {
    "id": "site-footer-loan-information-heading",
    "path": "siteSettings.footer.loanInformationColumnHeading",
    "pages": [
      "index.html",
      "about_us.html",
      "loan.html",
      "how_to_apply.html",
      "contact.html"
    ],
    "kind": "text"
  },
  {
    "id": "site-footer-link-personal-loan",
    "path": "siteSettings.footer.personalLoanLinkLabel",
    "pages": [
      "index.html",
      "about_us.html",
      "loan.html",
      "how_to_apply.html",
      "contact.html"
    ],
    "kind": "text"
  },
  {
    "id": "site-footer-link-business-loan",
    "path": "siteSettings.footer.businessLoanLinkLabel",
    "pages": [
      "index.html",
      "about_us.html",
      "loan.html",
      "how_to_apply.html",
      "contact.html"
    ],
    "kind": "text"
  },
  {
    "id": "site-footer-link-required-documents",
    "path": "siteSettings.footer.requiredDocumentsLinkLabel",
    "pages": [
      "index.html",
      "about_us.html",
      "loan.html",
      "how_to_apply.html",
      "contact.html"
    ],
    "kind": "text"
  },
  {
    "id": "site-footer-link-interest-repayment",
    "path": "siteSettings.footer.interestRepaymentLinkLabel",
    "pages": [
      "index.html",
      "about_us.html",
      "loan.html",
      "how_to_apply.html",
      "contact.html"
    ],
    "kind": "text"
  },
  {
    "id": "site-footer-contact-heading",
    "path": "siteSettings.footer.contactColumnHeading",
    "pages": [
      "index.html",
      "about_us.html",
      "loan.html",
      "how_to_apply.html",
      "contact.html"
    ],
    "kind": "text"
  },
  {
    "id": "site-footer-phone-label",
    "path": "siteSettings.footer.phoneLabel",
    "pages": [
      "index.html",
      "about_us.html",
      "loan.html",
      "how_to_apply.html",
      "contact.html"
    ],
    "kind": "text"
  },
  {
    "id": "site-footer-phone-number",
    "path": "siteSettings.contactDetails.displayPhoneNumber",
    "pages": [
      "index.html",
      "about_us.html",
      "loan.html",
      "how_to_apply.html",
      "contact.html"
    ],
    "kind": "text"
  },
  {
    "id": "site-footer-email-label",
    "path": "siteSettings.footer.emailLabel",
    "pages": [
      "index.html",
      "about_us.html",
      "loan.html",
      "how_to_apply.html",
      "contact.html"
    ],
    "kind": "text"
  },
  {
    "id": "site-footer-email-address",
    "path": "siteSettings.contactDetails.supportEmail",
    "pages": [
      "index.html",
      "about_us.html",
      "loan.html",
      "how_to_apply.html",
      "contact.html"
    ],
    "kind": "text"
  },
  {
    "id": "site-footer-office-label",
    "path": "siteSettings.footer.officeLabel",
    "pages": [
      "index.html",
      "about_us.html",
      "loan.html",
      "how_to_apply.html",
      "contact.html"
    ],
    "kind": "text"
  },
  {
    "id": "site-footer-office-address",
    "path": "siteSettings.contactDetails.officeAddress",
    "pages": [
      "index.html",
      "about_us.html",
      "loan.html",
      "how_to_apply.html",
      "contact.html"
    ],
    "kind": "text"
  },
  {
    "id": "site-footer-hours-label",
    "path": "siteSettings.footer.hoursLabel",
    "pages": [
      "index.html",
      "about_us.html",
      "loan.html",
      "how_to_apply.html",
      "contact.html"
    ],
    "kind": "text"
  },
  {
    "id": "site-footer-business-hours",
    "path": "siteSettings.footer.businessHours",
    "pages": [
      "index.html",
      "about_us.html",
      "loan.html",
      "how_to_apply.html",
      "contact.html"
    ],
    "kind": "text"
  },
  {
    "id": "site-footer-copyright",
    "path": "siteSettings.footer.copyrightText",
    "pages": [
      "index.html",
      "about_us.html",
      "loan.html",
      "how_to_apply.html",
      "contact.html"
    ],
    "kind": "text"
  },
  {
    "id": "site-contact-support-email",
    "path": "siteSettings.contactDetails.supportEmail",
    "pages": [
      "contact.html"
    ],
    "kind": "text"
  },
  {
    "id": "site-contact-phone-number",
    "path": "siteSettings.contactDetails.displayPhoneNumber",
    "pages": [
      "contact.html"
    ],
    "kind": "text"
  },
  {
    "id": "site-contact-office-name",
    "path": "siteSettings.contactDetails.officeName",
    "pages": [
      "contact.html"
    ],
    "kind": "text"
  },
  {
    "id": "site-contact-office-address",
    "path": "siteSettings.contactDetails.officeAddress",
    "pages": [
      "contact.html"
    ],
    "kind": "text"
  },
  {
    "id": "site-contact-waze-link",
    "path": "siteSettings.contactDetails.wazeUrl",
    "pages": [
      "contact.html"
    ],
    "kind": "href"
  },
  {
    "id": "site-contact-google-maps-link",
    "path": "siteSettings.contactDetails.googleMapsUrl",
    "pages": [
      "contact.html"
    ],
    "kind": "href"
  },
  {
    "id": "home-seo-title",
    "path": "homePage.seo.title",
    "pages": [
      "index.html"
    ],
    "kind": "text"
  },
  {
    "id": "home-hero-eyebrow",
    "path": "homePage.hero.eyebrow",
    "pages": [
      "index.html"
    ],
    "kind": "text"
  },
  {
    "id": "home-hero-main-heading",
    "path": "homePage.hero.mainHeading",
    "pages": [
      "index.html"
    ],
    "kind": "text"
  },
  {
    "id": "home-hero-description",
    "path": "homePage.hero.description",
    "pages": [
      "index.html"
    ],
    "kind": "text"
  },
  {
    "id": "home-hero-primary-button-label",
    "path": "homePage.hero.primaryButtonLabel",
    "pages": [
      "index.html"
    ],
    "kind": "text"
  },
  {
    "id": "home-hero-secondary-button-label",
    "path": "homePage.hero.secondaryButtonLabel",
    "pages": [
      "index.html"
    ],
    "kind": "text"
  },
  {
    "id": "home-hero-left-top-image",
    "path": "homePage.hero.leftTopImage",
    "pages": [
      "index.html"
    ],
    "kind": "image"
  },
  {
    "id": "home-hero-right-top-image",
    "path": "homePage.hero.rightTopImage",
    "pages": [
      "index.html"
    ],
    "kind": "image"
  },
  {
    "id": "home-hero-bottom-left-image",
    "path": "homePage.hero.bottomLeftImage",
    "pages": [
      "index.html"
    ],
    "kind": "image"
  },
  {
    "id": "home-hero-bottom-right-image",
    "path": "homePage.hero.bottomRightImage",
    "pages": [
      "index.html"
    ],
    "kind": "image"
  },
  {
    "id": "home-how-it-works-heading",
    "path": "homePage.howItWorks.heading",
    "pages": [
      "index.html"
    ],
    "kind": "text"
  },
  {
    "id": "home-how-it-works-description",
    "path": "homePage.howItWorks.description",
    "pages": [
      "index.html"
    ],
    "kind": "text"
  },
  {
    "id": "home-loan-options-heading",
    "path": "homePage.loanOptions.heading",
    "pages": [
      "index.html"
    ],
    "kind": "text"
  },
  {
    "id": "home-loan-options-description",
    "path": "homePage.loanOptions.description",
    "pages": [
      "index.html"
    ],
    "kind": "text"
  },
  {
    "id": "home-why-choose-us-image",
    "path": "homePage.whyChooseUs.image",
    "pages": [
      "index.html"
    ],
    "kind": "image"
  },
  {
    "id": "home-why-choose-us-heading",
    "path": "homePage.whyChooseUs.heading",
    "pages": [
      "index.html"
    ],
    "kind": "text"
  },
  {
    "id": "home-ready-to-get-started-heading",
    "path": "homePage.readyToGetStarted.heading",
    "pages": [
      "index.html"
    ],
    "kind": "text"
  },
  {
    "id": "home-ready-to-get-started-description",
    "path": "homePage.readyToGetStarted.description",
    "pages": [
      "index.html"
    ],
    "kind": "text"
  },
  {
    "id": "home-ready-to-get-started-apply-label",
    "path": "homePage.readyToGetStarted.applyButtonLabel",
    "pages": [
      "index.html"
    ],
    "kind": "text"
  },
  {
    "id": "home-ready-to-get-started-whatsapp-label",
    "path": "homePage.readyToGetStarted.whatsappButtonLabel",
    "pages": [
      "index.html"
    ],
    "kind": "text"
  },
  {
    "id": "home-how-it-works-step-1-title",
    "path": "homePage.howItWorks.steps[0].title",
    "pages": [
      "index.html"
    ],
    "kind": "text"
  },
  {
    "id": "home-how-it-works-step-1-description",
    "path": "homePage.howItWorks.steps[0].description",
    "pages": [
      "index.html"
    ],
    "kind": "text"
  },
  {
    "id": "home-why-choose-us-feature-1-title",
    "path": "homePage.whyChooseUs.features[0].title",
    "pages": [
      "index.html"
    ],
    "kind": "text"
  },
  {
    "id": "home-why-choose-us-feature-1-description",
    "path": "homePage.whyChooseUs.features[0].description",
    "pages": [
      "index.html"
    ],
    "kind": "text"
  },
  {
    "id": "home-how-it-works-step-2-title",
    "path": "homePage.howItWorks.steps[1].title",
    "pages": [
      "index.html"
    ],
    "kind": "text"
  },
  {
    "id": "home-how-it-works-step-2-description",
    "path": "homePage.howItWorks.steps[1].description",
    "pages": [
      "index.html"
    ],
    "kind": "text"
  },
  {
    "id": "home-why-choose-us-feature-2-title",
    "path": "homePage.whyChooseUs.features[1].title",
    "pages": [
      "index.html"
    ],
    "kind": "text"
  },
  {
    "id": "home-why-choose-us-feature-2-description",
    "path": "homePage.whyChooseUs.features[1].description",
    "pages": [
      "index.html"
    ],
    "kind": "text"
  },
  {
    "id": "home-how-it-works-step-3-title",
    "path": "homePage.howItWorks.steps[2].title",
    "pages": [
      "index.html"
    ],
    "kind": "text"
  },
  {
    "id": "home-how-it-works-step-3-description",
    "path": "homePage.howItWorks.steps[2].description",
    "pages": [
      "index.html"
    ],
    "kind": "text"
  },
  {
    "id": "home-why-choose-us-feature-3-title",
    "path": "homePage.whyChooseUs.features[2].title",
    "pages": [
      "index.html"
    ],
    "kind": "text"
  },
  {
    "id": "home-why-choose-us-feature-3-description",
    "path": "homePage.whyChooseUs.features[2].description",
    "pages": [
      "index.html"
    ],
    "kind": "text"
  },
  {
    "id": "home-loan-option-1-image",
    "path": "homePage.loanOptions.cards[0].image",
    "pages": [
      "index.html"
    ],
    "kind": "image"
  },
  {
    "id": "home-loan-option-1-title",
    "path": "homePage.loanOptions.cards[0].title",
    "pages": [
      "index.html"
    ],
    "kind": "text"
  },
  {
    "id": "home-loan-option-1-description",
    "path": "homePage.loanOptions.cards[0].description",
    "pages": [
      "index.html"
    ],
    "kind": "text"
  },
  {
    "id": "home-loan-option-1-link-label",
    "path": "homePage.loanOptions.cards[0].linkLabel",
    "pages": [
      "index.html"
    ],
    "kind": "text"
  },
  {
    "id": "home-loan-option-2-image",
    "path": "homePage.loanOptions.cards[1].image",
    "pages": [
      "index.html"
    ],
    "kind": "image"
  },
  {
    "id": "home-loan-option-2-title",
    "path": "homePage.loanOptions.cards[1].title",
    "pages": [
      "index.html"
    ],
    "kind": "text"
  },
  {
    "id": "home-loan-option-2-description",
    "path": "homePage.loanOptions.cards[1].description",
    "pages": [
      "index.html"
    ],
    "kind": "text"
  },
  {
    "id": "home-loan-option-2-link-label",
    "path": "homePage.loanOptions.cards[1].linkLabel",
    "pages": [
      "index.html"
    ],
    "kind": "text"
  },
  {
    "id": "about-us-seo-title",
    "path": "aboutUsPage.seo.title",
    "pages": [
      "about_us.html"
    ],
    "kind": "text"
  },
  {
    "id": "about-us-hero-background-image",
    "path": "aboutUsPage.hero.backgroundImage",
    "pages": [
      "about_us.html"
    ],
    "kind": "image"
  },
  {
    "id": "about-us-hero-main-heading",
    "path": "aboutUsPage.hero.mainHeading",
    "pages": [
      "about_us.html"
    ],
    "kind": "text"
  },
  {
    "id": "about-us-hero-description",
    "path": "aboutUsPage.hero.description",
    "pages": [
      "about_us.html"
    ],
    "kind": "text"
  },
  {
    "id": "about-us-hero-primary-button-label",
    "path": "aboutUsPage.hero.primaryButtonLabel",
    "pages": [
      "about_us.html"
    ],
    "kind": "text"
  },
  {
    "id": "about-us-who-we-are-image",
    "path": "aboutUsPage.whoWeAre.image",
    "pages": [
      "about_us.html"
    ],
    "kind": "image"
  },
  {
    "id": "about-us-who-we-are-heading",
    "path": "aboutUsPage.whoWeAre.heading",
    "pages": [
      "about_us.html"
    ],
    "kind": "text"
  },
  {
    "id": "about-us-who-we-are-paragraph-1",
    "path": "aboutUsPage.whoWeAre.paragraphs[0]",
    "pages": [
      "about_us.html"
    ],
    "kind": "text"
  },
  {
    "id": "about-us-why-choose-us-heading",
    "path": "aboutUsPage.whyChooseUs.heading",
    "pages": [
      "about_us.html"
    ],
    "kind": "text"
  },
  {
    "id": "about-us-why-choose-us-description",
    "path": "aboutUsPage.whyChooseUs.description",
    "pages": [
      "about_us.html"
    ],
    "kind": "text"
  },
  {
    "id": "about-us-who-we-help-heading",
    "path": "aboutUsPage.whoWeHelp.heading",
    "pages": [
      "about_us.html"
    ],
    "kind": "text"
  },
  {
    "id": "about-us-who-we-help-description",
    "path": "aboutUsPage.whoWeHelp.description",
    "pages": [
      "about_us.html"
    ],
    "kind": "text"
  },
  {
    "id": "about-us-ready-heading",
    "path": "aboutUsPage.readyToGetStarted.heading",
    "pages": [
      "about_us.html"
    ],
    "kind": "text"
  },
  {
    "id": "about-us-ready-description",
    "path": "aboutUsPage.readyToGetStarted.description",
    "pages": [
      "about_us.html"
    ],
    "kind": "text"
  },
  {
    "id": "about-us-ready-apply-label",
    "path": "aboutUsPage.readyToGetStarted.applyButtonLabel",
    "pages": [
      "about_us.html"
    ],
    "kind": "text"
  },
  {
    "id": "about-us-ready-whatsapp-label",
    "path": "aboutUsPage.readyToGetStarted.whatsappButtonLabel",
    "pages": [
      "about_us.html"
    ],
    "kind": "text"
  },
  {
    "id": "about-us-who-we-are-highlight-1",
    "path": "aboutUsPage.whoWeAre.highlights[0]",
    "pages": [
      "about_us.html"
    ],
    "kind": "text"
  },
  {
    "id": "about-us-statistic-1-value",
    "path": "aboutUsPage.whoWeAre.statistics[0].value",
    "pages": [
      "about_us.html"
    ],
    "kind": "text"
  },
  {
    "id": "about-us-statistic-1-label",
    "path": "aboutUsPage.whoWeAre.statistics[0].label",
    "pages": [
      "about_us.html"
    ],
    "kind": "text"
  },
  {
    "id": "about-us-who-we-help-card-1-image",
    "path": "aboutUsPage.whoWeHelp.cards[0].image",
    "pages": [
      "about_us.html"
    ],
    "kind": "image"
  },
  {
    "id": "about-us-who-we-help-card-1-title",
    "path": "aboutUsPage.whoWeHelp.cards[0].title",
    "pages": [
      "about_us.html"
    ],
    "kind": "text"
  },
  {
    "id": "about-us-who-we-help-card-1-description",
    "path": "aboutUsPage.whoWeHelp.cards[0].description",
    "pages": [
      "about_us.html"
    ],
    "kind": "text"
  },
  {
    "id": "about-us-who-we-are-highlight-2",
    "path": "aboutUsPage.whoWeAre.highlights[1]",
    "pages": [
      "about_us.html"
    ],
    "kind": "text"
  },
  {
    "id": "about-us-statistic-2-value",
    "path": "aboutUsPage.whoWeAre.statistics[1].value",
    "pages": [
      "about_us.html"
    ],
    "kind": "text"
  },
  {
    "id": "about-us-statistic-2-label",
    "path": "aboutUsPage.whoWeAre.statistics[1].label",
    "pages": [
      "about_us.html"
    ],
    "kind": "text"
  },
  {
    "id": "about-us-who-we-help-card-2-image",
    "path": "aboutUsPage.whoWeHelp.cards[1].image",
    "pages": [
      "about_us.html"
    ],
    "kind": "image"
  },
  {
    "id": "about-us-who-we-help-card-2-title",
    "path": "aboutUsPage.whoWeHelp.cards[1].title",
    "pages": [
      "about_us.html"
    ],
    "kind": "text"
  },
  {
    "id": "about-us-who-we-help-card-2-description",
    "path": "aboutUsPage.whoWeHelp.cards[1].description",
    "pages": [
      "about_us.html"
    ],
    "kind": "text"
  },
  {
    "id": "about-us-who-we-are-highlight-3",
    "path": "aboutUsPage.whoWeAre.highlights[2]",
    "pages": [
      "about_us.html"
    ],
    "kind": "text"
  },
  {
    "id": "about-us-statistic-3-value",
    "path": "aboutUsPage.whoWeAre.statistics[2].value",
    "pages": [
      "about_us.html"
    ],
    "kind": "text"
  },
  {
    "id": "about-us-statistic-3-label",
    "path": "aboutUsPage.whoWeAre.statistics[2].label",
    "pages": [
      "about_us.html"
    ],
    "kind": "text"
  },
  {
    "id": "about-us-who-we-help-card-3-image",
    "path": "aboutUsPage.whoWeHelp.cards[2].image",
    "pages": [
      "about_us.html"
    ],
    "kind": "image"
  },
  {
    "id": "about-us-who-we-help-card-3-title",
    "path": "aboutUsPage.whoWeHelp.cards[2].title",
    "pages": [
      "about_us.html"
    ],
    "kind": "text"
  },
  {
    "id": "about-us-who-we-help-card-3-description",
    "path": "aboutUsPage.whoWeHelp.cards[2].description",
    "pages": [
      "about_us.html"
    ],
    "kind": "text"
  },
  {
    "id": "about-us-why-choose-us-feature-1-title",
    "path": "aboutUsPage.whyChooseUs.features[0].title",
    "pages": [
      "about_us.html"
    ],
    "kind": "text"
  },
  {
    "id": "about-us-why-choose-us-feature-1-description",
    "path": "aboutUsPage.whyChooseUs.features[0].description",
    "pages": [
      "about_us.html"
    ],
    "kind": "text"
  },
  {
    "id": "about-us-why-choose-us-feature-2-title",
    "path": "aboutUsPage.whyChooseUs.features[1].title",
    "pages": [
      "about_us.html"
    ],
    "kind": "text"
  },
  {
    "id": "about-us-why-choose-us-feature-2-description",
    "path": "aboutUsPage.whyChooseUs.features[1].description",
    "pages": [
      "about_us.html"
    ],
    "kind": "text"
  },
  {
    "id": "about-us-why-choose-us-feature-3-title",
    "path": "aboutUsPage.whyChooseUs.features[2].title",
    "pages": [
      "about_us.html"
    ],
    "kind": "text"
  },
  {
    "id": "about-us-why-choose-us-feature-3-description",
    "path": "aboutUsPage.whyChooseUs.features[2].description",
    "pages": [
      "about_us.html"
    ],
    "kind": "text"
  },
  {
    "id": "about-us-why-choose-us-feature-4-title",
    "path": "aboutUsPage.whyChooseUs.features[3].title",
    "pages": [
      "about_us.html"
    ],
    "kind": "text"
  },
  {
    "id": "about-us-why-choose-us-feature-4-description",
    "path": "aboutUsPage.whyChooseUs.features[3].description",
    "pages": [
      "about_us.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-seo-title",
    "path": "loanPage.seo.title",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-hero-eyebrow",
    "path": "loanPage.hero.eyebrow",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-hero-main-heading",
    "path": "loanPage.hero.mainHeading",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-hero-description",
    "path": "loanPage.hero.description",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-hero-primary-button-label",
    "path": "loanPage.hero.primaryButtonLabel",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-hero-image",
    "path": "loanPage.hero.image",
    "pages": [
      "loan.html"
    ],
    "kind": "image"
  },
  {
    "id": "loan-required-documents-heading",
    "path": "loanPage.requiredDocuments.heading",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-required-documents-description",
    "path": "loanPage.requiredDocuments.description",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-required-documents-personal-heading",
    "path": "loanPage.requiredDocuments.personalHeading",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-required-documents-business-heading",
    "path": "loanPage.requiredDocuments.businessHeading",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-required-documents-cta-heading",
    "path": "loanPage.requiredDocuments.ctaHeading",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-required-documents-cta-description",
    "path": "loanPage.requiredDocuments.ctaDescription",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-comparison-heading",
    "path": "loanPage.comparison.heading",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-comparison-description",
    "path": "loanPage.comparison.description",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-comparison-table-heading",
    "path": "loanPage.comparison.tableHeading",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-comparison-personal-title",
    "path": "loanPage.comparison.personalColumn.title",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-comparison-business-title",
    "path": "loanPage.comparison.businessColumn.title",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-comparison-personal-subtitle",
    "path": "loanPage.comparison.personalColumn.subtitle",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-comparison-business-subtitle",
    "path": "loanPage.comparison.businessColumn.subtitle",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-comparison-loan-details-heading",
    "path": "loanPage.comparison.loanDetailsHeading",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-interest-rates-heading",
    "path": "loanPage.interestRates.heading",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-interest-rates-description",
    "path": "loanPage.interestRates.description",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-interest-rates-example-heading",
    "path": "loanPage.interestRates.exampleHeading",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-interest-rates-amount-label",
    "path": "loanPage.interestRates.amountLabel",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-interest-rates-amount-value",
    "path": "loanPage.interestRates.amountValue",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-interest-rates-example-description",
    "path": "loanPage.interestRates.exampleDescription",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-personal-heading",
    "path": "loanPage.personalLoan.heading",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-personal-description",
    "path": "loanPage.personalLoan.description",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-personal-documents-link-label",
    "path": "loanPage.personalLoan.documentsLinkLabel",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-personal-apply-label",
    "path": "loanPage.personalLoan.applyButtonLabel",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-personal-whatsapp-label",
    "path": "loanPage.personalLoan.whatsappButtonLabel",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-personal-feature-1-image",
    "path": "loanPage.personalLoan.features[0].image",
    "pages": [
      "loan.html"
    ],
    "kind": "image"
  },
  {
    "id": "loan-personal-feature-1-title",
    "path": "loanPage.personalLoan.features[0].title",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-personal-feature-1-description",
    "path": "loanPage.personalLoan.features[0].description",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-personal-feature-2-image",
    "path": "loanPage.personalLoan.features[1].image",
    "pages": [
      "loan.html"
    ],
    "kind": "image"
  },
  {
    "id": "loan-personal-feature-2-title",
    "path": "loanPage.personalLoan.features[1].title",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-personal-feature-2-description",
    "path": "loanPage.personalLoan.features[1].description",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-personal-requirement-1",
    "path": "loanPage.personalLoan.requirements.items[0]",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-personal-requirement-2",
    "path": "loanPage.personalLoan.requirements.items[1]",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-personal-requirement-3",
    "path": "loanPage.personalLoan.requirements.items[2]",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-personal-requirement-4",
    "path": "loanPage.personalLoan.requirements.items[3]",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-personal-requirement-5",
    "path": "loanPage.personalLoan.requirements.items[4]",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-personal-requirement-6",
    "path": "loanPage.personalLoan.requirements.items[5]",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-personal-requirement-7",
    "path": "loanPage.personalLoan.requirements.items[6]",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-personal-requirement-8",
    "path": "loanPage.personalLoan.requirements.items[7]",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-business-heading",
    "path": "loanPage.businessLoan.heading",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-business-description",
    "path": "loanPage.businessLoan.description",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-business-documents-link-label",
    "path": "loanPage.businessLoan.documentsLinkLabel",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-business-apply-label",
    "path": "loanPage.businessLoan.applyButtonLabel",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-business-whatsapp-label",
    "path": "loanPage.businessLoan.whatsappButtonLabel",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-business-feature-1-image",
    "path": "loanPage.businessLoan.features[0].image",
    "pages": [
      "loan.html"
    ],
    "kind": "image"
  },
  {
    "id": "loan-business-feature-1-title",
    "path": "loanPage.businessLoan.features[0].title",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-business-feature-1-description",
    "path": "loanPage.businessLoan.features[0].description",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-business-feature-2-image",
    "path": "loanPage.businessLoan.features[1].image",
    "pages": [
      "loan.html"
    ],
    "kind": "image"
  },
  {
    "id": "loan-business-feature-2-title",
    "path": "loanPage.businessLoan.features[1].title",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-business-feature-2-description",
    "path": "loanPage.businessLoan.features[1].description",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-business-requirement-1",
    "path": "loanPage.businessLoan.requirements.items[0]",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-business-requirement-2",
    "path": "loanPage.businessLoan.requirements.items[1]",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-business-requirement-3",
    "path": "loanPage.businessLoan.requirements.items[2]",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-business-requirement-4",
    "path": "loanPage.businessLoan.requirements.items[3]",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-business-requirement-5",
    "path": "loanPage.businessLoan.requirements.items[4]",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-business-requirement-6",
    "path": "loanPage.businessLoan.requirements.items[5]",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-business-requirement-7",
    "path": "loanPage.businessLoan.requirements.items[6]",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-business-requirement-8",
    "path": "loanPage.businessLoan.requirements.items[7]",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-business-requirement-9",
    "path": "loanPage.businessLoan.requirements.items[8]",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-business-requirement-10",
    "path": "loanPage.businessLoan.requirements.items[9]",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-business-requirement-11",
    "path": "loanPage.businessLoan.requirements.items[10]",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-comparison-row-1-label",
    "path": "loanPage.comparison.rows[0].label",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-comparison-row-1-personal",
    "path": "loanPage.comparison.rows[0].personalValue",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-comparison-row-1-business",
    "path": "loanPage.comparison.rows[0].businessValue",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-comparison-row-2-label",
    "path": "loanPage.comparison.rows[1].label",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-comparison-row-2-personal",
    "path": "loanPage.comparison.rows[1].personalValue",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-comparison-row-2-business",
    "path": "loanPage.comparison.rows[1].businessValue",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-comparison-row-3-label",
    "path": "loanPage.comparison.rows[2].label",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-comparison-row-3-personal",
    "path": "loanPage.comparison.rows[2].personalValue",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-comparison-row-3-business",
    "path": "loanPage.comparison.rows[2].businessValue",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-comparison-row-4-label",
    "path": "loanPage.comparison.rows[3].label",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-comparison-row-4-personal",
    "path": "loanPage.comparison.rows[3].personalValue",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-comparison-row-4-business",
    "path": "loanPage.comparison.rows[3].businessValue",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-interest-rates-feature-1-title",
    "path": "loanPage.interestRates.features[0].title",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-interest-rates-feature-1-description",
    "path": "loanPage.interestRates.features[0].description",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-interest-rates-feature-2-title",
    "path": "loanPage.interestRates.features[1].title",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-interest-rates-feature-2-description",
    "path": "loanPage.interestRates.features[1].description",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-interest-rates-feature-3-title",
    "path": "loanPage.interestRates.features[2].title",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "loan-interest-rates-feature-3-description",
    "path": "loanPage.interestRates.features[2].description",
    "pages": [
      "loan.html"
    ],
    "kind": "text"
  },
  {
    "id": "how-to-apply-seo-title",
    "path": "howToApplyPage.seo.title",
    "pages": [
      "how_to_apply.html"
    ],
    "kind": "text"
  },
  {
    "id": "how-to-apply-hero-main-heading",
    "path": "howToApplyPage.hero.mainHeading",
    "pages": [
      "how_to_apply.html"
    ],
    "kind": "text"
  },
  {
    "id": "how-to-apply-hero-description",
    "path": "howToApplyPage.hero.description",
    "pages": [
      "how_to_apply.html"
    ],
    "kind": "text"
  },
  {
    "id": "how-to-apply-hero-primary-button-label",
    "path": "howToApplyPage.hero.primaryButtonLabel",
    "pages": [
      "how_to_apply.html"
    ],
    "kind": "text"
  },
  {
    "id": "how-to-apply-steps-heading",
    "path": "howToApplyPage.steps.heading",
    "pages": [
      "how_to_apply.html"
    ],
    "kind": "text"
  },
  {
    "id": "how-to-apply-steps-description",
    "path": "howToApplyPage.steps.description",
    "pages": [
      "how_to_apply.html"
    ],
    "kind": "text"
  },
  {
    "id": "how-to-apply-required-documents-image",
    "path": "howToApplyPage.requiredDocuments.image",
    "pages": [
      "how_to_apply.html"
    ],
    "kind": "image"
  },
  {
    "id": "how-to-apply-required-documents-heading",
    "path": "howToApplyPage.requiredDocuments.heading",
    "pages": [
      "how_to_apply.html"
    ],
    "kind": "text"
  },
  {
    "id": "how-to-apply-required-documents-description",
    "path": "howToApplyPage.requiredDocuments.description",
    "pages": [
      "how_to_apply.html"
    ],
    "kind": "text"
  },
  {
    "id": "how-to-apply-eligibility-heading",
    "path": "howToApplyPage.eligibility.heading",
    "pages": [
      "how_to_apply.html"
    ],
    "kind": "text"
  },
  {
    "id": "how-to-apply-eligibility-description",
    "path": "howToApplyPage.eligibility.description",
    "pages": [
      "how_to_apply.html"
    ],
    "kind": "text"
  },
  {
    "id": "how-to-apply-ready-heading",
    "path": "howToApplyPage.readyToApply.heading",
    "pages": [
      "how_to_apply.html"
    ],
    "kind": "text"
  },
  {
    "id": "how-to-apply-ready-description",
    "path": "howToApplyPage.readyToApply.description",
    "pages": [
      "how_to_apply.html"
    ],
    "kind": "text"
  },
  {
    "id": "how-to-apply-ready-whatsapp-label",
    "path": "howToApplyPage.readyToApply.whatsappButtonLabel",
    "pages": [
      "how_to_apply.html"
    ],
    "kind": "text"
  },
  {
    "id": "how-to-apply-ready-submit-label",
    "path": "howToApplyPage.readyToApply.submitButtonLabel",
    "pages": [
      "how_to_apply.html"
    ],
    "kind": "text"
  },
  {
    "id": "how-to-apply-step-1-title",
    "path": "howToApplyPage.steps.items[0].title",
    "pages": [
      "how_to_apply.html"
    ],
    "kind": "text"
  },
  {
    "id": "how-to-apply-step-1-description",
    "path": "howToApplyPage.steps.items[0].description",
    "pages": [
      "how_to_apply.html"
    ],
    "kind": "text"
  },
  {
    "id": "how-to-apply-step-2-title",
    "path": "howToApplyPage.steps.items[1].title",
    "pages": [
      "how_to_apply.html"
    ],
    "kind": "text"
  },
  {
    "id": "how-to-apply-step-2-description",
    "path": "howToApplyPage.steps.items[1].description",
    "pages": [
      "how_to_apply.html"
    ],
    "kind": "text"
  },
  {
    "id": "how-to-apply-step-3-title",
    "path": "howToApplyPage.steps.items[2].title",
    "pages": [
      "how_to_apply.html"
    ],
    "kind": "text"
  },
  {
    "id": "how-to-apply-step-3-description",
    "path": "howToApplyPage.steps.items[2].description",
    "pages": [
      "how_to_apply.html"
    ],
    "kind": "text"
  },
  {
    "id": "how-to-apply-document-1-title",
    "path": "howToApplyPage.requiredDocuments.items[0].title",
    "pages": [
      "how_to_apply.html"
    ],
    "kind": "text"
  },
  {
    "id": "how-to-apply-document-1-description",
    "path": "howToApplyPage.requiredDocuments.items[0].description",
    "pages": [
      "how_to_apply.html"
    ],
    "kind": "text"
  },
  {
    "id": "how-to-apply-eligibility-1",
    "path": "howToApplyPage.eligibility.items[0]",
    "pages": [
      "how_to_apply.html"
    ],
    "kind": "text"
  },
  {
    "id": "how-to-apply-document-2-title",
    "path": "howToApplyPage.requiredDocuments.items[1].title",
    "pages": [
      "how_to_apply.html"
    ],
    "kind": "text"
  },
  {
    "id": "how-to-apply-document-2-description",
    "path": "howToApplyPage.requiredDocuments.items[1].description",
    "pages": [
      "how_to_apply.html"
    ],
    "kind": "text"
  },
  {
    "id": "how-to-apply-eligibility-2",
    "path": "howToApplyPage.eligibility.items[1]",
    "pages": [
      "how_to_apply.html"
    ],
    "kind": "text"
  },
  {
    "id": "how-to-apply-document-3-title",
    "path": "howToApplyPage.requiredDocuments.items[2].title",
    "pages": [
      "how_to_apply.html"
    ],
    "kind": "text"
  },
  {
    "id": "how-to-apply-document-3-description",
    "path": "howToApplyPage.requiredDocuments.items[2].description",
    "pages": [
      "how_to_apply.html"
    ],
    "kind": "text"
  },
  {
    "id": "how-to-apply-eligibility-3",
    "path": "howToApplyPage.eligibility.items[2]",
    "pages": [
      "how_to_apply.html"
    ],
    "kind": "text"
  },
  {
    "id": "how-to-apply-document-4-title",
    "path": "howToApplyPage.requiredDocuments.items[3].title",
    "pages": [
      "how_to_apply.html"
    ],
    "kind": "text"
  },
  {
    "id": "how-to-apply-document-4-description",
    "path": "howToApplyPage.requiredDocuments.items[3].description",
    "pages": [
      "how_to_apply.html"
    ],
    "kind": "text"
  },
  {
    "id": "how-to-apply-eligibility-4",
    "path": "howToApplyPage.eligibility.items[3]",
    "pages": [
      "how_to_apply.html"
    ],
    "kind": "text"
  },
  {
    "id": "contact-seo-title",
    "path": "contactUsPage.seo.title",
    "pages": [
      "contact.html"
    ],
    "kind": "text"
  },
  {
    "id": "contact-form-heading",
    "path": "contactUsPage.contactForm.heading",
    "pages": [
      "contact.html"
    ],
    "kind": "text"
  },
  {
    "id": "contact-form-description",
    "path": "contactUsPage.contactForm.description",
    "pages": [
      "contact.html"
    ],
    "kind": "text"
  },
  {
    "id": "contact-form-submit-label",
    "path": "contactUsPage.contactForm.submitButtonLabel",
    "pages": [
      "contact.html"
    ],
    "kind": "text"
  },
  {
    "id": "contact-form-image",
    "path": "contactUsPage.contactForm.image",
    "pages": [
      "contact.html"
    ],
    "kind": "image"
  },
  {
    "id": "contact-method-email-heading",
    "path": "contactUsPage.contactMethods.email.heading",
    "pages": [
      "contact.html"
    ],
    "kind": "text"
  },
  {
    "id": "contact-method-email-description",
    "path": "contactUsPage.contactMethods.email.description",
    "pages": [
      "contact.html"
    ],
    "kind": "text"
  },
  {
    "id": "contact-method-phone-heading",
    "path": "contactUsPage.contactMethods.phone.heading",
    "pages": [
      "contact.html"
    ],
    "kind": "text"
  },
  {
    "id": "contact-method-phone-description",
    "path": "contactUsPage.contactMethods.phone.description",
    "pages": [
      "contact.html"
    ],
    "kind": "text"
  },
  {
    "id": "contact-method-office-heading",
    "path": "contactUsPage.contactMethods.office.heading",
    "pages": [
      "contact.html"
    ],
    "kind": "text"
  },
  {
    "id": "contact-method-office-description",
    "path": "contactUsPage.contactMethods.office.description",
    "pages": [
      "contact.html"
    ],
    "kind": "text"
  },
  {
    "id": "contact-faq-heading",
    "path": "contactUsPage.faq.heading",
    "pages": [
      "contact.html"
    ],
    "kind": "text"
  },
  {
    "id": "contact-faq-description",
    "path": "contactUsPage.faq.description",
    "pages": [
      "contact.html"
    ],
    "kind": "text"
  },
  {
    "id": "contact-still-have-questions-heading",
    "path": "contactUsPage.stillHaveQuestions.heading",
    "pages": [
      "contact.html"
    ],
    "kind": "text"
  },
  {
    "id": "contact-still-have-questions-description",
    "path": "contactUsPage.stillHaveQuestions.description",
    "pages": [
      "contact.html"
    ],
    "kind": "text"
  },
  {
    "id": "contact-faq-1-question",
    "path": "contactUsPage.faq.items[0].question",
    "pages": [
      "contact.html"
    ],
    "kind": "text"
  },
  {
    "id": "contact-faq-1-answer",
    "path": "contactUsPage.faq.items[0].answer",
    "pages": [
      "contact.html"
    ],
    "kind": "text"
  },
  {
    "id": "contact-faq-2-question",
    "path": "contactUsPage.faq.items[1].question",
    "pages": [
      "contact.html"
    ],
    "kind": "text"
  },
  {
    "id": "contact-faq-2-answer",
    "path": "contactUsPage.faq.items[1].answer",
    "pages": [
      "contact.html"
    ],
    "kind": "text"
  },
  {
    "id": "contact-faq-3-question",
    "path": "contactUsPage.faq.items[2].question",
    "pages": [
      "contact.html"
    ],
    "kind": "text"
  },
  {
    "id": "contact-faq-3-answer",
    "path": "contactUsPage.faq.items[2].answer",
    "pages": [
      "contact.html"
    ],
    "kind": "text"
  },
  {
    "id": "contact-faq-4-question",
    "path": "contactUsPage.faq.items[3].question",
    "pages": [
      "contact.html"
    ],
    "kind": "text"
  },
  {
    "id": "contact-faq-4-answer",
    "path": "contactUsPage.faq.items[3].answer",
    "pages": [
      "contact.html"
    ],
    "kind": "text"
  },
  {
    "id": "contact-faq-5-question",
    "path": "contactUsPage.faq.items[4].question",
    "pages": [
      "contact.html"
    ],
    "kind": "text"
  },
  {
    "id": "contact-faq-5-answer",
    "path": "contactUsPage.faq.items[4].answer",
    "pages": [
      "contact.html"
    ],
    "kind": "text"
  }
];

function getValue(content: PublicPayloadContent, path: string): unknown {
  return path.replace(/\[(\d+)\]/g, '.$1').split('.').reduce<unknown>((value, key) => (value && typeof value === 'object' ? (value as Record<string, unknown>)[key] : undefined), content);
}

function escapeHtmlText(value: unknown): string {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function decodeHtmlCharacterReferences(value: string): string {
  const escapedMarkup = value.replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  return parse(`<span>${escapedMarkup}</span>`).text;
}

function getSafeUrl(value: string, kind: 'href' | 'image'): string | undefined {
  const decoded = decodeHtmlCharacterReferences(value);
  const candidate = decoded.replace(/^[\u0000-\u0020\u007f]+|[\u0000-\u0020\u007f]+$/g, '');
  if (!candidate || /[\u0000-\u001f\u007f]/.test(candidate) || /^[\\/]{2}/.test(candidate)) {
    return undefined;
  }

  try {
    const parsed = new URL(candidate, 'https://legacy-page.invalid/');
    const isRelativePath = parsed.origin === 'https://legacy-page.invalid';
    if (isRelativePath) return candidate;
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return candidate;
    if (kind === 'href' && (parsed.protocol === 'mailto:' || parsed.protocol === 'tel:')) return candidate;
    return undefined;
  } catch {
    return undefined;
  }
}

function renderBinding(root: ReturnType<typeof parse>, binding: LegacyContentBinding, value: unknown) {
  if (value == null) return;
  const element = root.querySelector('#' + binding.id);
  if (!element) return;
  if (binding.kind === 'image' && typeof value === 'object' && value && 'src' in value) {
    const image = value as { src: string; alt?: string };
    const safeSrc = typeof image.src === 'string' ? getSafeUrl(image.src, 'image') : undefined;
    if (safeSrc) {
      element.setAttribute('src', safeSrc);
    }
    element.setAttribute('alt', image.alt || '');
    return;
  }
  if (binding.kind === 'href') {
    const safeHref = getSafeUrl(String(value), 'href');
    if (safeHref) element.setAttribute('href', safeHref);
    return;
  }
  if (binding.kind === 'counter') {
    const match = /^(\d+(?:\.\d+)?)(.*)$/.exec(String(value).trim());
    if (match) {
      element.setAttribute('data-target', match[1]);
      element.setAttribute('data-suffix', match[2]);
    }
    return;
  }
  element.set_content(escapeHtmlText(value));
}

export function renderLegacyContent(html: string, pageId: SitePageId, content: PublicPayloadContent): string {
  const root = parse(html, { blockTextElements: { script: true, style: true, pre: true, noscript: true } });
  const pageFile: Record<SitePageId, LegacyPageFile> = {
    home: 'index.html',
    aboutUs: 'about_us.html',
    loan: 'loan.html',
    howToApply: 'how_to_apply.html',
    contactUs: 'contact.html',
  };
  for (const binding of legacyContentBindings) {
    if (binding.pages.includes(pageFile[pageId])) renderBinding(root, binding, getValue(content, binding.path));
  }
  return root.toString();
}
