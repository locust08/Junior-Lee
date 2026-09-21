import { siteConfig } from '../../config/site.ts';

export type SitePageId = 'home' | 'aboutUs' | 'loan' | 'howToApply' | 'contactUs';

export type ImageValue = { src: string; alt: string };
export type LabeledText = { title: string; description: string };

export type PublicPayloadContent = {
  siteSettings: {
    header: { websiteLogo: ImageValue; mobileDrawerLogo: ImageValue; aboutUsMenuLabel: string; loanMenuLabel: string; howToApplyMenuLabel: string; contactUsMenuLabel: string; applyNowButtonLabel: string; };
    footer: {
      footerLogo: ImageValue; brandDescription: string; quickLinksColumnHeading: string; homeLinkLabel: string; loanOptionsLinkLabel: string; howToApplyLinkLabel: string; aboutUsLinkLabel: string; contactUsLinkLabel: string;
      loanInformationColumnHeading: string; personalLoanLinkLabel: string; businessLoanLinkLabel: string; requiredDocumentsLinkLabel: string; interestRepaymentLinkLabel: string;
      contactColumnHeading: string; phoneLabel: string; emailLabel: string; officeLabel: string; hoursLabel: string; businessHours: string; copyrightText: string;
    };
    contactDetails: { supportEmail: string; displayPhoneNumber: string; officeName: string; officeAddress: string; wazeUrl: string; googleMapsUrl: string; };
  };
  homePage: Record<string, unknown>; aboutUsPage: Record<string, unknown>; loanPage: Record<string, unknown>; howToApplyPage: Record<string, unknown>; contactUsPage: Record<string, unknown>;
};

export const defaultPayloadContent: PublicPayloadContent = {
  "siteSettings": {
    "header": {
      "websiteLogo": {
        "src": "/brand/junior-lee-logo.png",
        "alt": "Junior Lee"
      },
      "mobileDrawerLogo": {
        "src": "/brand/junior-lee-logo.png",
        "alt": "Junior Lee"
      },
      "aboutUsMenuLabel": "About Us",
      "loanMenuLabel": "Loan",
      "howToApplyMenuLabel": "How to Apply",
      "contactUsMenuLabel": "Contact Us",
      "applyNowButtonLabel": "Apply Now"
    },
    "footer": {
      "footerLogo": {
        "src": "/brand/junior-lee-logo.png",
        "alt": "Junior Lee"
      },
      "brandDescription": "Personal and business loan enquiries with clear information and direct assistance throughout the application process.",
      "quickLinksColumnHeading": "Quick Links",
      "homeLinkLabel": "Home",
      "loanOptionsLinkLabel": "Loan Options",
      "howToApplyLinkLabel": "How to Apply",
      "aboutUsLinkLabel": "About Us",
      "contactUsLinkLabel": "Contact Us",
      "loanInformationColumnHeading": "Loan Information",
      "personalLoanLinkLabel": "Personal Loan",
      "businessLoanLinkLabel": "Business Loan",
      "requiredDocumentsLinkLabel": "Required Documents",
      "interestRepaymentLinkLabel": "Interest & Repayment",
      "contactColumnHeading": "Contact",
      "phoneLabel": "Phone / WhatsApp:",
      "emailLabel": "Email:",
      "officeLabel": "Office:",
      "hoursLabel": "Hours:",
      "businessHours": "Open 24 hours, 7 days a week",
      "copyrightText": "© 2026 Junior Lee. All rights reserved."
    },
    "contactDetails": {
      "supportEmail": siteConfig.contact.email,
      "displayPhoneNumber": siteConfig.contact.phone,
      "officeName": siteConfig.name,
      "officeAddress": siteConfig.contact.address,
      "wazeUrl": siteConfig.contact.wazeUrl,
      "googleMapsUrl": siteConfig.contact.googleMapsUrl
    }
  },
  "homePage": {
    "seo": {
      "title": "Junior Lee Malaysia | Personal & Business Loan Enquiries",
      "description": "Explore personal and business loan information in Malaysia, including indicative rates, repayment options and application support from Junior Lee."
    },
    "hero": {
      "eyebrow": "Junior Lee",
      "mainHeading": "Pay Off Your Debts",
      "description": "Are you paying more than 10% interest on your credit cards? Junior Lee provides loan information for credit card repayment, high interest debt, and major purchase enquiries. A repayment option designed to provide clear and manageable loan information.",
      "primaryButtonLabel": "Apply Now",
      "secondaryButtonLabel": "View Loan Details",
      "leftTopImage": {
        "src": "flow-assets/metro/home-hero-adviser.webp",
        "alt": "Adviser assisting a customer with a loan enquiry"
      },
      "rightTopImage": {
        "src": "flow-assets/metro/home-personal-documents.webp",
        "alt": "Couple reviewing personal loan documents at home"
      },
      "bottomLeftImage": {
        "src": "flow-assets/metro/home-business-cafe.webp",
        "alt": "Small-business owner reviewing working capital documents"
      },
      "bottomRightImage": {
        "src": "flow-assets/metro/required-documents-closeup.webp",
        "alt": "Organised loan application documents on a desk"
      }
    },
    "howItWorks": {
      "heading": "How It Works",
      "description": "Choose your loan, submit your application, and wait for the application review outcome.",
      "steps": [
        {
          "title": "Select Your Loan and Apply",
          "description": "Choose the loan that works for you and complete the application form."
        },
        {
          "title": "Application Review",
          "description": "We will review your application details and contact you about the next step."
        },
        {
          "title": "Receive Funds After Approval",
          "description": "If the application is accepted, funds may be disbursed after document verification and final confirmation."
        }
      ]
    },
    "loanOptions": {
      "heading": "Loan Options",
      "description": "Review the personal and business loan options available from Junior Lee.",
      "cards": [
        {
          "image": {
            "src": "flow-assets/metro/personal-loan-consultation.webp",
            "alt": "Customer discussing a personal loan application with an adviser"
          },
          "title": "Personal Loan",
          "description": "A personal loan may help fund a big expense, consolidate debt, or meet short-term cash needs.",
          "linkLabel": "View Loan Details"
        },
        {
          "image": {
            "src": "flow-assets/metro/business-financing-documents.webp",
            "alt": "Small-business owner reviewing financing documents"
          },
          "title": "Business Loan",
          "description": "Business loan support for working capital, stock purchases, overheads, and business activities.",
          "linkLabel": "View Loan Details"
        }
      ]
    },
    "whyChooseUs": {
      "image": {
        "src": "flow-assets/metro/home-why-adviser-files.webp",
        "alt": "Adviser organising loan application files"
      },
      "heading": "Why Choose Us",
      "features": [
        {
          "title": "No ATM Card",
          "description": "We do not require any ATM card."
        },
        {
          "title": "Open to all Malaysians",
          "description": "Our service is open to all Malaysians."
        },
        {
          "title": "No Guarantor",
          "description": "We do not require a guarantor from you for your loan application."
        }
      ]
    },
    "readyToGetStarted": {
      "heading": "Ready to get started?",
      "description": `Apply Now or contact us on WhatsApp at ${siteConfig.contact.phone} for personal and business loan enquiries.`,
      "applyButtonLabel": "Apply Now",
      "whatsappButtonLabel": "Chat on WhatsApp"
    }
  },
  "aboutUsPage": {
    "seo": {
      "title": "About Junior Lee | Loan Enquiry Support Malaysia",
      "description": "Learn how Junior Lee supports personal and business loan enquiries across Malaysia with clear information and application guidance."
    },
    "hero": {
      "backgroundImage": {
        "src": "flow-assets/metro/customer-support-consultation.webp",
        "alt": "Customer-service representative assisting with a loan enquiry"
      },
      "mainHeading": "Supporting Personal and Business Loan Enquiries",
      "description": "Clear loan information and application guidance for individuals and businesses across Malaysia.",
      "primaryButtonLabel": "Contact Us"
    },
    "whoWeAre": {
      "image": {
        "src": "flow-assets/metro/about-company-adviser.webp",
        "alt": "Adviser reviewing loan service documents"
      },
      "heading": "Who we are",
      "paragraphs": [
        "Junior Lee provides enquiry support for personal and business loans. We help customers understand available loan information, prepare the required documents and follow the application process."
      ],
      "highlights": [
        "Clear loan information",
        "Application guidance",
        "Personal and business loan support"
      ],
      "statistics": [
        {
          "value": "2",
          "label": "Loan types"
        },
        {
          "value": "24/7",
          "label": "Service availability"
        },
        {
          "value": "6–60",
          "label": "Month repayment options"
        }
      ]
    },
    "whyChooseUs": {
      "heading": "Why choose us",
      "description": "Practical application requirements and availability, clearly presented for loan enquiries.",
      "features": [
        {
          "title": "Open to all Malaysians",
          "description": "Loan enquiry support is available for Malaysian applicants."
        },
        {
          "title": "No ATM card required",
          "description": "Applicants do not need to provide an ATM card."
        },
        {
          "title": "No guarantor required",
          "description": "A guarantor is not required for the loan application."
        },
        {
          "title": "Available 24 hours, 7 days a week",
          "description": "Our team is available for enquiries every day."
        }
      ]
    },
    "whoWeHelp": {
      "heading": "Who we help",
      "description": "We support individuals, business owners and applicants seeking personal or business financing information.",
      "cards": [
        {
          "image": {
            "src": "flow-assets/metro/who-help-phone-support.webp",
            "alt": "Support representative answering a loan enquiry by phone"
          },
          "title": "Individuals",
          "description": "Support for personal loan information, enquiry steps and application preparation."
        },
        {
          "image": {
            "src": "flow-assets/metro/who-help-food-business.webp",
            "alt": "Food-business owner preparing financing records"
          },
          "title": "Small-business owners",
          "description": "Guidance for business loan enquiries related to working capital, stock or overheads."
        },
        {
          "image": {
            "src": "flow-assets/metro/who-help-document-prep.webp",
            "alt": "Applicant preparing company loan documents"
          },
          "title": "Companies and corporate groups",
          "description": "Information support for company loan enquiries and application requirements."
        }
      ]
    },
    "readyToGetStarted": {
      "heading": "Need help with your loan enquiry?",
      "description": "Contact our team for information about personal loans, business loans and the application process.",
      "applyButtonLabel": "Apply Now",
      "whatsappButtonLabel": "Chat on WhatsApp"
    }
  },
  "loanPage": {
    "seo": {
      "title": "Personal & Business Loan Options | Junior Lee",
      "description": "Compare personal and business loan information, required documents, indicative rates and repayment periods with Junior Lee."
    },
    "hero": {
      "eyebrow": "Junior Lee",
      "mainHeading": "Personal & Business Loan Options",
      "description": "Choose between personal loan and business loan options, review the required documents, and contact Junior Lee for application support.",
      "primaryButtonLabel": "Contact Us",
      "image": {
        "src": "flow-assets/metro/loan-hero-adviser.webp",
        "alt": "Loan adviser discussing personal and business loan options"
      }
    },
    "personalLoan": {
      "heading": "Personal Loan",
      "description": "A personal loan might be right for you if you want to fund a big expense or consolidate debt. This loan scheme provides loans to individuals with a source of income and comes with a monthly repayment plan to meet personal needs.",
      "documentsLinkLabel": "View required documents",
      "applyButtonLabel": "Apply Now",
      "whatsappButtonLabel": "Chat on WhatsApp",
      "features": [
        {
          "image": {
            "src": "flow-assets/metro/loan-personal-applicant.webp",
            "alt": "Personal loan applicant reviewing documents"
          },
          "title": "Loan from RM500–RM100,000",
          "description": "Minimum monthly salary of RM3,000 and a steady source of income."
        },
        {
          "image": {
            "src": "flow-assets/metro/loan-repayment-advice.webp",
            "alt": "Adviser explaining a repayment plan"
          },
          "title": "Monthly repayment plan",
          "description": "A personal loan can also be defined as a short term loan and may be the answer to short-term cash needs because the repayment period is normally shorter than other types of loan such as housing loan or a mortgage."
        }
      ],
      "requirements": {
        "items": [
          "NRIC and contact number",
          "Latest 3 months' payslips",
          "Latest 3 months' bank statements",
          "Latest electricity bill",
          "Latest water bill",
          "Sale and Purchase Agreement, where applicable",
          "Tenancy agreement, where applicable",
          "Latest EPF statement"
        ]
      }
    },
    "businessLoan": {
      "heading": "Business Loan",
      "description": "Explore business loan support for working capital, stock purchases, overheads and other business activities.",
      "documentsLinkLabel": "View required documents",
      "applyButtonLabel": "Apply Now",
      "whatsappButtonLabel": "Chat on WhatsApp",
      "features": [
        {
          "image": {
            "src": "flow-assets/metro/loan-business-retail.webp",
            "alt": "Retail business owner reviewing working capital documents"
          },
          "title": "Working capital support",
          "description": "Funds may be used for purchasing stock, managing overheads and other business activities, to fulfil working capital needs."
        },
        {
          "image": {
            "src": "flow-assets/metro/loan-business-workshop.webp",
            "alt": "Service business owner discussing funding documents"
          },
          "title": "Business funding information",
          "description": "Junior Lee offers services and solutions for small businesses and corporate groups with financing needs."
        }
      ],
      "requirements": {
        "items": [
          "NRIC copy",
          "Name card",
          "Borang B",
          "Borang D",
          "Latest 3 months' bank statements",
          "Sale and Purchase Agreement, where applicable",
          "Utility bill",
          "Form 24/49",
          "Form 42",
          "Form 11A",
          "Latest EPF statement"
        ]
      }
    },
    "comparison": {
      "heading": "Loan Comparison",
      "description": "Compare personal and business loan options so you can choose the financing that fits your needs.",
      "tableHeading": "Compare loan types",
      "personalColumn": {
        "title": "Personal Loan",
        "subtitle": "For individual needs"
      },
      "businessColumn": {
        "title": "Business Loan",
        "subtitle": "For company growth"
      },
      "rows": [
        {
          "label": "Best for",
          "personalValue": "Big expenses, debt consolidation, major purchases, or short-term cash needs",
          "businessValue": "Working capital, purchasing stock, managing overheads, or business activities"
        },
        {
          "label": "Indicative rate",
          "personalValue": "8%–12% APR",
          "businessValue": "8%–12% APR"
        },
        {
          "label": "Loan amount",
          "personalValue": "RM500–RM100,000 for personal loan",
          "businessValue": "Contact Us for business loan details"
        },
        {
          "label": "Repayment tenure",
          "personalValue": "6–60 month repayment period",
          "businessValue": "6–60 month repayment period"
        }
      ],
      "loanDetailsHeading": "Loan details"
    },
    "requiredDocuments": {
      "heading": "Required Documents",
      "description": "Prepare the relevant documents before submitting your loan enquiry.",
      "personalHeading": "Personal Loan Documents",
      "businessHeading": "Business Loan Documents",
      "ctaHeading": "Need help preparing your documents?",
      "ctaDescription": "Contact our team if you need help understanding the application requirements."
    },
    "interestRates": {
      "heading": "Interest Rate",
      "description": "Indicative rate range information for Junior Lee loan enquiries.",
      "features": [
        {
          "title": "Indicative rate range",
          "description": "8%–12% APR"
        },
        {
          "title": "Repayment period",
          "description": "6–60 month repayment period"
        },
        {
          "title": "Personal-loan amount",
          "description": "RM500–RM100,000 personal-loan amount"
        }
      ],
      "exampleHeading": "Representative example",
      "amountLabel": "Amount borrowed",
      "amountValue": "RM5,000",
      "exampleDescription": "180-day period. Interest: RM448. Total payable: RM5,448."
    }
  },
  "howToApplyPage": {
    "seo": {
      "title": "How to Apply for a Loan | Junior Lee",
      "description": "Follow the Junior Lee loan enquiry process, prepare the required documents and select a preferred callback appointment."
    },
    "hero": {
      "mainHeading": "Submit Your Loan Enquiry in Simple Steps",
      "description": "Choose the loan that works for you, fill in the form for your application, and our team will review your application and contact you about the next step.",
      "primaryButtonLabel": "Apply Now"
    },
    "steps": {
      "heading": "Step-by-Step Process",
      "description": "The application process is simple: select your loan, apply, wait for review, and receive the next-step update from Junior Lee.",
      "items": [
        {
          "title": "Select Your Loan and Apply",
          "description": "Choose the loan that works for you and complete the application form."
        },
        {
          "title": "Application Review",
          "description": "We will review your application details and contact you about the next step."
        },
        {
          "title": "Receive Funds After Approval",
          "description": "If the application is accepted, funds may be disbursed after document verification and final confirmation."
        }
      ]
    },
    "requiredDocuments": {
      "image": {
        "src": "flow-assets/metro/how-apply-documents.webp",
        "alt": "Applicant preparing loan application documents"
      },
      "heading": "Required Documents",
      "description": "Prepare these documents before submitting your loan enquiry.",
      "items": [
        {
          "title": "NRIC / NRIC copy",
          "description": "Required for personal loan and business loan applications."
        },
        {
          "title": "Income and bank documents",
          "description": "Latest 3 months payslip and latest 3 months bank statement for personal loan applications."
        },
        {
          "title": "Utility and property documents",
          "description": "Latest electric & water bill, S&P, tenancy agreement, and latest EPF statement where applicable."
        },
        {
          "title": "Business documents",
          "description": "Name card, Borang B & D, Form 24/49, 42, 11A, and latest bank statement where applicable."
        }
      ]
    },
    "eligibility": {
      "heading": "Application Notes",
      "description": "Review these notes before you submit an enquiry.",
      "items": [
        "Our service is open to Malaysians.",
        "Personal loan applicants should have a source of income and a minimum monthly salary of RM3,000.",
        "Prepare the required documents for the loan type you are applying for.",
        "No ATM card or guarantor is required for your loan application."
      ]
    },
    "readyToApply": {
      "heading": "Ready to Apply?",
      "description": "Submit your enquiry using the form below or chat with us on WhatsApp. You can also choose a preferred appointment slot for our team to follow up.",
      "whatsappButtonLabel": "Chat on WhatsApp",
      "submitButtonLabel": "Apply Now"
    }
  },
  "contactUsPage": {
    "seo": {
      "title": "Contact Junior Lee | Loan Enquiries & Appointments",
      "description": "Contact Junior Lee for personal and business loan enquiries, application guidance or an appointment in Kuala Lumpur."
    },
    "contactForm": {
      "heading": "Contact Us",
      "description": "Contact Junior Lee for personal and business loan information, application guidance and customer support. Our enquiry channels are available 24 hours, 7 days a week.",
      "submitButtonLabel": "Apply Now",
      "image": {
        "src": "flow-assets/metro/contact-phone-support.webp",
        "alt": "Customer-service representative assisting by phone and online enquiry"
      }
    },
    "contactMethods": {
      "email": {
        "heading": "Email",
        "description": "Email us for loan enquiries and application support."
      },
      "phone": {
        "heading": "Phone",
        "description": "Open 24 hours, 7 days a week"
      },
      "office": {
        "heading": "HQ Office",
        "description": "Visit us at our office"
      }
    },
    "faq": {
      "heading": "FAQ",
      "description": "Here you will find the answers to the frequently asked questions.",
      "items": [
        {
          "question": "What loan services do you offer?",
          "answer": "Junior Lee provides information and enquiry support for personal and business loans."
        },
        {
          "question": "How fast can I receive the money?",
          "answer": "Processing and disbursement time may vary depending on document verification and final confirmation."
        },
        {
          "question": "Who can apply?",
          "answer": "The service is open to Malaysians. Personal loan applicants should have a source of income and a minimum monthly salary of RM3,000."
        },
        {
          "question": "Do I need an ATM card or guarantor?",
          "answer": "No. Junior Lee does not require your ATM card or a guarantor for your loan application."
        },
        {
          "question": "What documents are required?",
          "answer": "Document requirements differ between personal and business loan enquiries. Review the complete Required Documents section on the Loan Options page."
        }
      ]
    },
    "stillHaveQuestions": {
      "heading": "Still have questions?",
      "description": "Contact us using the form above or chat with us on WhatsApp."
    }
  }
};
