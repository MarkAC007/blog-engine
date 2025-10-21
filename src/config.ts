export const siteUrl = import.meta.env.VITE_SITE_URL || 'https://ai-blog-engine.io';

export const siteName = 'AI Blog Engine';

export const defaultTitle = 'AI Blog Engine - Modern Blog Publishing';

export const defaultDescription =
  'A modern, AI-assisted blog publishing system with markdown support, SEO optimization, and automated image generation using OpenAI and Google Gemini.';

export const twitterHandle = '@ai-blog-engine';

export const defaultOgImage = '/images/2762a14c-6434-44f6-925b-76aaf1fe4217.png';

export function toAbsoluteUrl(pathname?: string): string | undefined {
  if (!pathname) return undefined;
  try {
    if (pathname.startsWith('http://') || pathname.startsWith('https://')) return pathname;
    const base = siteUrl.endsWith('/') ? siteUrl.slice(0, -1) : siteUrl;
    const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
    return `${base}${path}`;
  } catch {
    return undefined;
  }
}

