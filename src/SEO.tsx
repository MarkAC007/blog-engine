import { Helmet } from 'react-helmet-async';
import { defaultDescription, defaultOgImage, defaultTitle, siteName, siteUrl, toAbsoluteUrl, twitterHandle } from './config';

export type SEOProps = {
  title?: string;
  description?: string;
  canonical?: string;
  noindex?: boolean;
  nofollow?: boolean;
  ogImage?: string;
  ogType?: string;
  publishedTime?: string;
  modifiedTime?: string;
  locale?: string;
  schema?: Record<string, unknown> | Array<Record<string, unknown>>;
};

export function SEO({
  title,
  description,
  canonical,
  noindex,
  nofollow,
  ogImage,
  ogType = 'website',
  publishedTime,
  modifiedTime,
  locale = 'en_US',
  schema,
}: SEOProps) {
  const resolvedTitle = title ? `${title} | ${siteName}` : defaultTitle;
  const resolvedDescription = description || defaultDescription;
  const resolvedUrl = canonical || siteUrl;
  const robots = `${noindex ? 'noindex' : 'index'}, ${nofollow ? 'nofollow' : 'follow'}`;
  const absoluteOgImage = toAbsoluteUrl(ogImage || defaultOgImage);

  const schemaArray = Array.isArray(schema) ? schema : schema ? [schema] : [];

  return (
    <Helmet prioritizeSeoTags>
      <title>{resolvedTitle}</title>
      <meta name="description" content={resolvedDescription} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={resolvedUrl} />

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={resolvedTitle} />
      <meta property="og:description" content={resolvedDescription} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:url" content={resolvedUrl} />
      {absoluteOgImage ? <meta property="og:image" content={absoluteOgImage} /> : null}
      {publishedTime ? <meta property="article:published_time" content={publishedTime} /> : null}
      {modifiedTime ? <meta property="article:modified_time" content={modifiedTime} /> : null}
      <meta property="og:locale" content={locale} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:title" content={resolvedTitle} />
      <meta name="twitter:description" content={resolvedDescription} />
      {absoluteOgImage ? <meta name="twitter:image" content={absoluteOgImage} /> : null}

      {/* JSON-LD */}
      {schemaArray.map((entry, idx) => (
        <script key={idx} type="application/ld+json">
          {JSON.stringify(entry)}
        </script>
      ))}
    </Helmet>
  );
}

// Helper schema builders moved to ./schema to satisfy react-refresh rule

