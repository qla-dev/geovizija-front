import React, { useEffect } from 'react';

interface SEOProps {
  title: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article';
}

export const SEO: React.FC<SEOProps> = ({ 
  title, 
  description = "Geovizija - Premium portal za ekološke vijesti, prirodu i održivi razvoj.", 
  image = "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80",
  type = "website"
}) => {
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
    setMeta('og:url', window.location.href, 'property');
    setMeta('og:site_name', 'Geovizija', 'property');

    // Twitter Card
    setMeta('twitter:card', 'summary_large_image', 'name');
    setMeta('twitter:title', title, 'name');
    setMeta('twitter:description', description, 'name');
    setMeta('twitter:image', image, 'name');

  }, [title, description, image, type]);

  return null;
};
