import { useEffect } from 'react';

interface SEOData {
  title?: string;
  fullTitle?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  jsonLd?: Record<string, any>;
}

const SITE_NAME = 'TS HUB';
const BASE_URL = 'https://techshivam.in';

function setMeta(name: string, content: string, attr: 'name' | 'property' = 'name') {
  if (!content) return;
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLink(rel: string, href: string) {
  if (!href) return;
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function setJsonLd(id: string, data: Record<string, any>) {
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement('script');
    el.id = id;
    el.type = 'application/ld+json';
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

export function useSEO(data: SEOData) {
  useEffect(() => {
    const fullTitle = data.fullTitle
      ? data.fullTitle
      : data.title
      ? `${data.title} | ${SITE_NAME} - Download Mods, Games & Apps`
      : `${SITE_NAME} - Download Premium Mods, Games, Apps & Courses`;
    const description =
      data.description ||
      'Download latest premium mods, modded apps, games, courses and assets for free at TS HUB. Daily updated collection of Android mods.';
    const keywords =
      data.keywords ||
      'mods, modded apps, mod apk, premium mods, android games, app mods, mod download, free mods, ts hub, techshivam';
    const url = data.url || `${BASE_URL}${window.location.pathname}${window.location.hash || ''}`;
    const image = data.image || 'https://i.postimg.cc/Y9CH9XBQ/IMG-20251112-091800-841.jpg';

    document.title = fullTitle;
    setMeta('description', description);
    setMeta('keywords', keywords);

    // Open Graph
    setMeta('og:title', fullTitle, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:image', image, 'property');
    setMeta('og:url', url, 'property');
    setMeta('og:type', data.type || 'website', 'property');
    setMeta('og:site_name', SITE_NAME, 'property');

    // Twitter
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', description);
    setMeta('twitter:image', image);

    // Canonical
    setLink('canonical', url);

    // JSON-LD
    if (data.jsonLd) {
      setJsonLd('jsonld-page', data.jsonLd);
    }
  }, [
    data.title,
    data.description,
    data.keywords,
    data.image,
    data.url,
    data.type,
    JSON.stringify(data.jsonLd || {}),
  ]);
}
