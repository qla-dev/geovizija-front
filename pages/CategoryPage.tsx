import React from 'react';
import { useContent } from '../components/ContentProvider';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { SEO } from '../components/SEO';
import { AdSlot } from '../components/AdSlot';
import { Article, Category } from '../types';

// 1 članak, 2-4 članka, 5+ članaka (11-14 always "članaka")
const articlesLabel = (count: number) => {
  if (count === 0) return 'Uskoro';
  const lastTwo = count % 100, last = count % 10;
  if (last === 1 && lastTwo !== 11) return `${count} članak`;
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return `${count} članka`;
  return `${count} članaka`;
};

interface CategoryEntry {
  category: Category;
  posts: Article[];
  latest?: Article;
  image: string;
  number: string;
}

export const CategoryPage: React.FC = () => {
  const { categories, articles } = useContent();

  // Articles arrive newest first, so posts[0] is each category's latest story.
  const entries: CategoryEntry[] = categories.map((category, index) => {
    const posts = articles.filter(a => a.categoryId === category.id);
    return {
      category,
      posts,
      latest: posts[0],
      image: posts[0]?.imageUrl || category.imageUrl,
      number: String(index + 1).padStart(2, '0'),
    };
  });

  const [featured, ...rest] = entries;

  return (
    <div className="animate-fade-in bg-stone-100 min-h-screen">
      <SEO title="Kategorije | Geovizija" description="Istražite sve kategorije na Geovizija portalu. Ekologija, Priroda, Tehnologija, Putovanja i više." />

      {/* Header */}
      <header className="bg-stone-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <p className="text-geo-green text-xs font-bold uppercase tracking-[0.25em] mb-3">Istraži Geoviziju</p>
          <h1 className="font-serif font-black text-4xl md:text-6xl leading-none mb-4">Kategorije</h1>
          <p className="text-stone-400 max-w-xl text-sm md:text-base leading-relaxed">
            Priče o prirodi, ljudima i svijetu oko nas, složene po temama.
          </p>
          <div className="mt-6 flex items-center gap-4 text-xs uppercase tracking-widest text-stone-500">
            <span><span className="text-white font-bold">{categories.length}</span> tema</span>
            <span className="w-px h-3 bg-stone-700" />
            <span><span className="text-white font-bold">{articles.length}</span> priča</span>
          </div>
        </div>
      </header>

      {/* Mobile: stacked editorial list */}
      <div className="md:hidden bg-white">
        {entries.map(({ category, posts, latest, image, number }, index) => (
          <React.Fragment key={category.id}>
          {index === 4 && <AdSlot placement="feed" className="px-4 py-5 border-b border-stone-200 bg-stone-100" />}
          <Link
            to={`/category/${category.id}`}
            className="flex gap-4 px-4 py-4 border-b border-stone-200 active:bg-stone-50"
          >
            <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden bg-stone-200">
              <img src={image} alt={category.name} loading="lazy" className="w-full h-full object-cover" />
              <span className={`absolute left-0 top-0 bottom-0 w-1 ${category.color}`} />
            </div>
            <div className="flex-1 min-w-0 flex flex-col">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[10px] font-bold tracking-widest text-stone-400">{number}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">{articlesLabel(posts.length)}</span>
              </div>
              <h2 className="font-serif font-bold text-xl text-stone-900 leading-tight mt-0.5">{category.name}</h2>
              {latest && (
                <p className="text-sm text-stone-600 leading-snug line-clamp-2 mt-1">{latest.title}</p>
              )}
            </div>
            <ArrowRight size={18} className="self-center flex-shrink-0 text-stone-300" />
          </Link>
          </React.Fragment>
        ))}
      </div>

      {/* Desktop: featured tile + photo grid */}
      <div className="hidden md:block max-w-7xl mx-auto px-6 lg:px-8 py-16 md:py-24">
        <div className="grid grid-cols-3 gap-6">
          {featured && <CategoryTile entry={featured} large />}
          {rest.map((entry, i) => (
            // Two tiles sit beside the featured one; widen the last tile when the final row would leave a gap.
            <CategoryTile key={entry.category.id} entry={entry} wide={i === rest.length - 1 && (rest.length - 2) % 3 === 2} />
          ))}
        </div>
        <AdSlot placement="bottom" className="mt-10" />
      </div>
    </div>
  );
};

const CategoryTile: React.FC<{ entry: CategoryEntry; large?: boolean; wide?: boolean }> = ({ entry, large, wide }) => {
  const { category, posts, latest, image, number } = entry;

  return (
    <Link
      to={`/category/${category.id}`}
      className={`group relative block overflow-hidden bg-stone-900 ${large ? 'col-span-2 row-span-2 min-h-[560px]' : wide ? 'col-span-2 min-h-[268px]' : 'min-h-[268px]'}`}
    >
      <img
        src={image}
        alt={category.name}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
      <span className={`absolute left-0 top-0 h-1 w-full ${category.color}`} />

      <div className="absolute top-5 left-6 right-6 flex justify-between text-[11px] font-bold uppercase tracking-widest text-white/70">
        <span>{number}</span>
        <span>{articlesLabel(posts.length)}</span>
      </div>

      <div className={`absolute inset-x-0 bottom-0 ${large ? 'p-10' : 'p-6'}`}>
        <h2 className={`font-serif font-black text-white leading-none mb-3 ${large ? 'text-6xl' : 'text-3xl'}`}>
          {category.name}
        </h2>
        {latest && (
          <p className={`text-white/80 leading-snug line-clamp-2 ${large ? 'text-lg max-w-xl' : 'text-sm'}`}>
            <span className="text-geo-green font-bold uppercase text-[11px] tracking-widest mr-2">Najnovije</span>
            {latest.title}
          </p>
        )}
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-white border-b border-white/40 pb-0.5 group-hover:border-geo-green group-hover:text-geo-green transition-colors">
          Istraži temu <ArrowUpRight size={14} />
        </span>
      </div>
    </Link>
  );
};
