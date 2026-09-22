export const siteConfig = {
  name: 'Metro Pinjaman Berlesen',
  shortName: 'Metro Pinjaman Berlesen',
  description:
    'Personal and business loan enquiries with clear information and direct assistance throughout the application process.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://alfapinjaman.pages.dev',
  seo: {
    socialImage: '/optimized-media/home-hero-adviser.webp',
    socialImageAlt: 'Adviser assisting a customer with a loan enquiry',
  },
  brand: {
    logo: '/brand/junior-lee-logo.png',
    logoWidth: 154,
    logoHeight: 53,
    footerLogo: '/brand/metro-footer-logo.png',
    footerLogoWidth: 176,
    footerLogoHeight: 64,
  },
  contact: {
    email: 'metropinjamanberlesan@gmail.com',
    emailHref: 'mailto:metropinjamanberlesan@gmail.com',
    phone: '+60 10-215 0037',
    phoneE164: '+60102150037',
    phoneHref: 'tel:+60102150037',
    address: 'Jalan Metro 1, Metro Prima, 52100 Kuala Lumpur, Federal Territory of Kuala Lumpur',
    wazeUrl:
      'https://www.waze.com/ul?q=Jalan%20Metro%201%2C%20Metro%20Prima%2C%2052100%20Kuala%20Lumpur%2C%20Federal%20Territory%20of%20Kuala%20Lumpur&navigate=yes',
    googleMapsUrl:
      'https://www.google.com/maps/search/?api=1&query=Jalan%20Metro%201%2C%20Metro%20Prima%2C%2052100%20Kuala%20Lumpur%2C%20Federal%20Territory%20of%20Kuala%20Lumpur',
  },
  social: {
    whatsapp:
      'https://wa.me/60102150037?text=Hi%20Metro%20Pinjaman%20Berlesen%2C%20I%20would%20like%20to%20enquire%20about%20a%20loan%20appointment.',
  },
  navigation: [
    { label: 'About Us', path: '/about-us' },
    { label: 'Loan', path: '/loan' },
    { label: 'How to Apply', path: '/how-to-apply' },
    { label: 'Contact Us', path: '/contact' },
  ],
} as const;

const previousBrandNames = ['Alfa Pinjaman', 'Junior Lee'] as const;

export function applySiteName(value: string): string {
  return previousBrandNames.reduce(
    (current, previousName) => current
      .replaceAll(previousName, siteConfig.name)
      .replaceAll(encodeURIComponent(previousName), encodeURIComponent(siteConfig.name)),
    value,
  );
}
