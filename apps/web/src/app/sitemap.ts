import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tunijobs.tn';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/offres`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/carte`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/ia-cv`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  try {
    const res = await fetch(`${apiUrl}/jobs?limit=100`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      const jobRoutes: MetadataRoute.Sitemap = (data.items || []).map((job: any) => ({
        url: `${baseUrl}/offres/${job.slug}`,
        lastModified: new Date(job.updatedAt || job.createdAt),
        changeFrequency: 'daily',
        priority: 0.8,
      }));
      return [...staticRoutes, ...jobRoutes];
    }
  } catch (e) {
    // Fallback gracieux si l'API est indisponible lors du build statique
  }

  return staticRoutes;
}
