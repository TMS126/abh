import { BIZ } from '@/lib/brand'

export function LocalBusinessJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: BIZ.name,
    image: 'https://v0-apexbytes-hub-website.vercel.app/logo.png',
    '@id': 'https://v0-apexbytes-hub-website.vercel.app',
    url: 'https://v0-apexbytes-hub-website.vercel.app',
    telephone: BIZ.phoneE164,
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
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
