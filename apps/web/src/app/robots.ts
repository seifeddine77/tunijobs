import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tunijobs.tn';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/offres', '/offres/*', '/carte', '/ia-cv'],
        disallow: ['/admin', '/admin/*', '/recruteur/*', '/candidat/*', '/api/*'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
