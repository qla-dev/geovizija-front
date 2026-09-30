import React from 'react';

// Placeholder for an ad unit until a real ad network is wired in.
//   banner     320x100 on mobile, 728x90 from md
//   rectangle  300x250 (in-article / sidebar)
type AdVariant = 'banner' | 'rectangle';

const SIZES: Record<AdVariant, { box: string; label: string }> = {
  banner: { box: 'h-[100px] md:h-[90px] max-w-[728px]', label: '320×100 · 728×90' },
  rectangle: { box: 'h-[250px] max-w-[300px]', label: '300×250' },
};

export const AdSlot: React.FC<{ variant?: AdVariant; className?: string }> = ({ variant = 'banner', className = '' }) => {
  const size = SIZES[variant];

  return (
    <aside className={`w-full ${className}`} aria-label="Oglas">
      <div className={`mx-auto w-full ${size.box} flex flex-col items-center justify-center gap-1 bg-stone-200/60 border border-dashed border-stone-300 text-stone-400`}>
        <span className="text-[10px] font-bold uppercase tracking-[0.25em]">Oglas</span>
        <span className="text-[10px] tracking-widest">{size.label}</span>
      </div>
    </aside>
  );
};
