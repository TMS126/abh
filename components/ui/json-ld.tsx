import { BIZ } from '@/lib/brand'

export function LocalBusinessJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'ProfessionalService'],
    name: BIZ.name,
    alternateName: ['Apexbytes Hub', 'Apexbytes'],
    image: 'https://v0-apexbytes-hub-website.vercel.app/logo.png',
    '@id': 'https://v0-apexbytes-hub-website.vercel.app',
    url: 'https://v0-apexbytes-hub-website.vercel.app',
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
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -27.3833, // Approximate for Bothaville
      longitude: 26.6167,
    },
    areaServed: [
      { '@type': 'Place', name: 'Kgotsong' },
      { '@type': 'Place', name: 'Mpumalanga Section' },
      { '@type': 'Place', name: 'Bothaville' },
      { '@type': 'AdministrativeArea', name: 'Nala Local Municipality' },
      { '@type': 'AdministrativeArea', name: 'Lejweleputswa District Municipality' },
      { '@type': 'AdministrativeArea', name: 'Free State' },
    ],
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '07:00',
        closes: '20:00',
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
