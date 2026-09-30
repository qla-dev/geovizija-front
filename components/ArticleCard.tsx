import React from 'react';
import { Article } from '../types';
import { CategoryPill } from './CategoryPill';
import { Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ArticleCardProps {
  article: Article;
  variant?: 'standard' | 'compact' | 'featured' | 'horizontal';
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, variant = 'standard' }) => {
  if (variant === 'featured') {
    return (
      <Link to={`/article/${article.id}`} className="group relative block h-full w-full overflow-hidden">
        <div className="absolute inset-0 bg-stone-900">
           <img 
            src={article.imageUrl} 
            alt={article.title} 
            className="h-full w-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105 group-hover:opacity-60"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent opacity-90" />
        <div className="absolute bottom-0 left-0 p-6 md:p-10">
          <CategoryPill id={article.categoryId} className="mb-3" />
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-white leading-tight mb-2 drop-shadow-md">
            {article.title}
          </h2>
          <p className="text-stone-200 text-sm md:text-base font-medium mb-4 line-clamp-2 max-w-2xl">
            {article.excerpt}
          </p>
          <div className="flex items-center text-stone-300 text-xs uppercase tracking-widest gap-4">
             <span>{article.author}</span>
             <span className="w-1 h-1 bg-geo-green rounded-full"></span>
             <span>{article.date}</span>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'horizontal') {
    return (
      <Link to={`/article/${article.id}`} className="group flex flex-col md:flex-row h-full bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        {/* Mobile: the image is absolutely positioned, so the box needs its own height */}
        <div className="aspect-video md:aspect-auto md:w-2/5 relative overflow-hidden bg-stone-200 flex-shrink-0">
          <img 
            src={article.imageUrl} 
            alt={article.title} 
            className="w-full h-full object-cover absolute inset-0 transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-4 left-4">
             <CategoryPill id={article.categoryId} />
          </div>
        </div>
        <div className="flex-1 p-5 md:p-6 flex flex-col justify-center">
          <h3 className="font-serif text-xl md:text-2xl font-bold text-stone-900 leading-snug mb-3 group-hover:text-geo-green transition-colors">
            {article.title}
          </h3>
          <p className="text-stone-600 text-sm leading-relaxed mb-4 line-clamp-3">
            {article.excerpt}
          </p>
          <div className="mt-auto flex items-center justify-between text-xs text-stone-400 border-t border-stone-100 pt-4">
            <div className="flex items-center gap-4">
               <span className="uppercase tracking-wider font-semibold text-stone-900">{article.author}</span>
               <span>{article.date}</span>
            </div>
            <div className="flex items-center">
               <Clock size={14} className="mr-1" />
               <span>{article.readTime} min</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'compact') {
     return (
      <Link to={`/article/${article.id}`} className="group flex gap-4 items-start py-4 border-b border-stone-200 last:border-0">
        <div className="w-24 h-24 md:w-32 md:h-24 flex-shrink-0 overflow-hidden bg-stone-200">
          <img 
            src={article.imageUrl} 
            alt={article.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        <div className="flex-1">
          <CategoryPill id={article.categoryId} className="mb-1 text-[10px]" />
          <h3 className="font-serif text-lg font-bold text-stone-900 leading-tight mb-1 group-hover:text-geo-green transition-colors">
            {article.title}
          </h3>
          <div className="flex items-center text-stone-500 text-xs mt-2">
            <Clock size={12} className="mr-1" />
            <span>{article.readTime} min čitanja</span>
          </div>
        </div>
      </Link>
     );
  }

  // Standard
  return (
    <Link to={`/article/${article.id}`} className="group block bg-white h-full shadow-sm hover:shadow-md transition-shadow">
      <div className="aspect-video w-full overflow-hidden bg-stone-200 relative">
        <img 
          src={article.imageUrl} 
          alt={article.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4">
            <CategoryPill id={article.categoryId} />
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-serif text-xl font-bold text-stone-900 leading-snug mb-2 group-hover:text-geo-green transition-colors">
          {article.title}
        </h3>
        <p className="text-stone-600 text-sm line-clamp-3 mb-4 leading-relaxed">
          {article.excerpt}
        </p>
        <div className="flex items-center justify-between text-xs text-stone-400 border-t border-stone-100 pt-4">
          <span className="uppercase tracking-wider font-semibold">{article.author}</span>
          <span>{article.readTime} min</span>
        </div>
      </div>
    </Link>
  );
};
