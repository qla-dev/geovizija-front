import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Keep in sync with index.html (static defaults) and og.php (crawler previews).
export const SITE_TAGLINE = 'Balkanski lider u istraživanju';
export const SITE_DESCRIPTION = 'Geovizija - balkanski lider u istraživanju prirode, ljudi i svijeta oko nas.';
export const SITE_IMAGE = 'https://geovizija.com/og-default.jpg';

interface SEOProps {
  title: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article';
}

export const SEO: React.FC<SEOProps> = ({ 
  title, 
  description = SITE_DESCRIPTION,
  image = SITE_IMAGE,
  type = "website"
}) => {
  // Re-run on path changes too, e.g. an old /article/{id} link replaced by its slug URL.
  const { pathname } = useLocation();

  useEffect(() => {
    // Update Document Title
    document.title = title;

    // Helper to find or create meta tags
    const setMeta = (name: string, content: string, attr: 'name' | 'property' = 'name') => {
      let element = document.querySelector(`meta[${attr}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Standard Meta
    setMeta('description', description);

    // Open Graph (Facebook, LinkedIn, etc.)
    setMeta('og:title', title, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:image', image, 'property');
    setMeta('og:type', type, 'property');
    const url = window.location.origin + window.location.pathname;
    setMeta('og:url', url, 'property');
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', url);
    setMeta('og:site_name', 'Geovizija', 'property');

    // Twitter Card
    setMeta('twitter:card', 'summary_large_image', 'name');
    setMeta('twitter:title', title, 'name');
    setMeta('twitter:description', description, 'name');
    setMeta('twitter:image', image, 'name');

  }, [title, description, image, type, pathname]);

  return null;
};
