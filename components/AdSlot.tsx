import React, { useEffect, useRef, useState } from 'react';

// Google AdSense unit. The loader script is in index.html; auto ads are off,
// so every ad on the site comes from one of these slots.
//   banner     320x100 on mobile, 728x90 from md
//   rectangle  300x250 (sidebar)
//   inArticle  fluid in-article unit between paragraphs
type AdVariant = 'banner' | 'rectangle' | 'inArticle';

// Where the slot sits on the page, mapped to the ad units in the AdSense account.
type AdPlacement = 'section' | 'feed' | 'bottom' | 'quiz' | 'sidebar' | 'article';

const AD_CLIENT = 'ca-pub-2999890187609831';

const AD_UNITS: Record<AdPlacement, string> = {
  section: '8849497816', // "header footer" - banners between home page sections
  feed: '8849497816',    // "header footer" - banner inside article lists
  bottom: '7975362945',  // "donji banner"  - end of article / category pages
  quiz: '6347312853',    // "footer"        - below quiz answers
  sidebar: '6347312853', // "footer"        - article sidebar
  article: '4085035036', // "intext"        - in-article, after the third paragraph
};

const SIZES: Record<AdVariant, string> = {
  banner: 'w-[320px] h-[100px] md:w-[728px] md:h-[90px]',
  rectangle: 'w-[300px] h-[250px]',
  inArticle: 'w-full min-h-[250px]',
};

declare global {
  interface Window { adsbygoogle?: unknown[] }
}

export const AdSlot: React.FC<{ variant?: AdVariant; placement?: AdPlacement; className?: string }> = ({
  variant = 'banner',
  placement = 'section',
  className = '',
}) => {
  const ref = useRef<HTMLModElement>(null);
  // The slot reserves its space (label + sized box) while the ad loads, so it is in the viewport for
  // AdSense to request an ad. Only when AdSense answers "unfilled" (no ad for this view) does it collapse.
  const [unfilled, setUnfilled] = useState(false);

  useEffect(() => {
    const ins = ref.current;
    if (!ins) return;
    const check = () => setUnfilled(ins.getAttribute('data-ad-status') === 'unfilled');
    const observer = new MutationObserver(check);
    observer.observe(ins, { attributes: true, attributeFilter: ['data-ad-status'] });
    check();

    // StrictMode runs effects twice; AdSense throws if a slot is filled twice.
    if (!ins.getAttribute('data-adsbygoogle-status')) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {
        // Blocked by an ad blocker or not loaded yet - the placeholder stays empty.
      }
    }
    return () => observer.disconnect();
  }, []);

  const fluid = variant === 'inArticle';

  return (
    <aside
      className={`w-full flex flex-col items-center ${unfilled ? 'hidden' : className}`}
      aria-label="Oglas"
      aria-hidden={unfilled}
    >
      <span className="mb-1 text-[10px] font-bold uppercase tracking-[0.25em] text-stone-400">Oglas</span>
      <ins
        ref={ref}
        className={`adsbygoogle max-w-full ${SIZES[variant]}`}
        style={fluid ? { display: 'block', textAlign: 'center' } : { display: 'inline-block' }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={AD_UNITS[placement]}
        {...(fluid ? { 'data-ad-layout': 'in-article', 'data-ad-format': 'fluid' } : {})}
        {...(import.meta.env.DEV ? { 'data-adtest': 'on' } : {})}
      />
    </aside>
  );
};
