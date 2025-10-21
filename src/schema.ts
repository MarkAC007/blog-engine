import { defaultDescription, siteName, siteUrl, toAbsoluteUrl } from './config';

export function buildWebSiteSchema(options?: { title?: string; description?: string; url?: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: options?.title || siteName,
    url: options?.url || siteUrl,
    description: options?.description || defaultDescription,
  } as const;
}

export function buildBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  } as const;
}

export function buildArticleSchema(input: {
  title: string;
  description: string;
  url: string;
  image?: string;
  author?: string;
  datePublished?: string;
  dateModified?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.title,
    description: input.description,
    url: input.url,
    image: input.image ? [toAbsoluteUrl(input.image)] : undefined,
    author: input.author ? { '@type': 'Person', name: input.author } : undefined,
    datePublished: input.datePublished,
    dateModified: input.dateModified || input.datePublished,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': input.url,
    },
  } as const;
}

