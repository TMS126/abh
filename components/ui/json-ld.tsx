// components/ui/json-ld.tsx
import { BIZ, HOURS } from '@/lib/brand'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://apexbytes.vercel.app'

export function LocalBusinessJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'ProfessionalService'],
    name: BIZ.name,
    alternateName: ['Apexbytes Hub', 'Apexbytes'],
    image: `${SITE_URL}/logo.png`,
    '@id': SITE_URL,
    url: SITE_URL,
    telephone: BIZ.phoneE164,
    priceRange: 'R',
    address: {
      '@type': 'PostalAddress',
      streetAddress: BIZ.address,
      addressLocality: 'Bothaville',
      addressRegion: 'Free State',
      postalCode: '9660',
      addressCountry: 'ZA',
    },
    // FIX: was hardcoded to an "Approximate for Bothaville" placeholder
    // that didn't match BIZ.lat/BIZ.lng. Now derives from the one real
    // source of truth.
    geo: {
      '@type': 'GeoCoordinates',
      latitude: BIZ.lat,
      longitude: BIZ.lng,
    },
    areaServed: [
      { '@type': 'Place', name: 'Kgotsong' },
      { '@type': 'Place', name: 'Mpumalanga Section' },
      { '@type': 'Place', name: 'Bothaville' },
      { '@type': 'AdministrativeArea', name: 'Nala Local Municipality' },
      { '@type': 'AdministrativeArea', name: 'Lejweleputswa District Municipality' },
      { '@type': 'AdministrativeArea', name: 'Free State' },
    ],
    // FIX: previously a single blanket "07:00–20:00, all 7 days" block that
    // didn't reflect that Tech/Design/E-Service run shorter hours. Now built
    // directly from the HOURS object in lib/brand.ts — the same single
    // source of truth the rest of the site already displays to customers —
    // instead of a second, separately-hardcoded guess.
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '07:00',
        closes: '20:00',
        // Print Hub · Document Hub — matches HOURS.printAndDoc
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '17:00',
        // Tech Hub · Design Hub · E-Service Hub — matches HOURS.techDesignEservice
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday'],
        opens: '09:00',
        closes: '12:00',
        // Tech Hub · Design Hub · E-Service Hub, Saturday — matches HOURS.techDesignEservice
      },
    ],
    sameAs: [
      `https://wa.me/${BIZ.phoneE164.replace('+', '')}`,
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'ApexbytesHub Services',
      itemListElement: [
        {
          '@type': 'OfferCatalog',
          name: 'Print Hub',
          itemListElement: [
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Printing & Photocopying' } },
          ],
        },
        {
          '@type': 'OfferCatalog',
          name: 'Design Hub',
          itemListElement: [
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Graphic & Logo Design' } },
          ],
        },
        {
          '@type': 'OfferCatalog',
          name: 'Document Hub',
          itemListElement: [
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Scanning, Typing, Laminating & Binding' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'CV Writing' } },
          ],
        },
        {
          '@type': 'OfferCatalog',
          name: 'E-Service Hub',
          itemListElement: [
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'SASSA Applications' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'SARS eFiling Assistance' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Home Affairs Application Assistance' } },
          ],
        },
        {
          '@type': 'OfferCatalog',
          name: 'Tech Hub',
          itemListElement: [
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Computer & Laptop Repairs' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Tech Support' } },
          ],
        },
      ],
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
            } 
