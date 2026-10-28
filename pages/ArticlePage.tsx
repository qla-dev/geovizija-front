import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useContent } from '../components/ContentProvider';
import { CategoryPill } from '../components/CategoryPill';
import { Clock, ArrowLeft, ArrowRightLeft, MousePointerClick } from 'lucide-react';
import { ShareBar } from '../components/ShareBar';
import { SEO } from '../components/SEO';
import { Comments } from '../components/Comments';
import { api, ApiError } from '../services/api';
import { Article } from '../types';

interface ArticleLookup {
  slug: string;
  status: 'loading' | 'ready' | 'not-found' | 'error';
  article?: Article;
}

export const ArticlePage: React.FC = () => {
  const { articles: allArticles, categories: allCategories } = useContent();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [lookup, setLookup] = useState<ArticleLookup | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  // Old links use the numeric id; they are moved to the slug URL below.
  const cachedArticle = allArticles.find(a => a.slug === slug) ?? allArticles.find(a => a.id === slug);
  const currentLookup = lookup?.slug === slug ? lookup : null;
  const article = cachedArticle ?? currentLookup?.article;
  const id = article?.id;

  useEffect(() => {
    if (!slug || cachedArticle) return;
    let active = true;
    setLookup({ slug, status: 'loading' });
    // A list's contents cannot tell us whether a direct article URL exists.
    api.post(slug).then(
      article => { if (active) setLookup({ slug, status: 'ready', article }); },
      error => {
        if (active) setLookup({ slug, status: error instanceof ApiError && error.status === 404 ? 'not-found' : 'error' });
      },
    );
    return () => { active = false; };
  }, [slug, cachedArticle, retryCount]);

  useEffect(() => {
    if (article && article.slug !== slug) navigate(`/article/${article.slug}`, { replace: true });
  }, [article, slug, navigate]);
  

  // Filter related articles for the sidebar
  const relatedArticles = allArticles
    .filter(a => a.id !== id) // Exclude current
    .slice(0, 4); // Take 4

  // Suggested articles for the bottom grid: 6 random others, shuffled once per article
  // (not on every render, which reshuffled them while typing a comment)
  const suggestedArticles = useMemo(() => allArticles
    .filter(a => a.id !== id)
    .map(a => ({ a, key: Math.random() }))
    .sort((x, y) => x.key - y.key)
    .map(({ a }) => a)
    .slice(0, 6), [allArticles, id]);

  if (!article && slug && currentLookup?.status !== 'not-found') {
    if (currentLookup?.status === 'error') {
      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 p-8 text-center" role="alert">
          <SEO title="Članak trenutno nije dostupan | Geovizija" />
          <p className="text-stone-700">Članak trenutno nije moguće učitati. Pokušajte ponovo.</p>
          <button onClick={() => setRetryCount(count => count + 1)} className="px-5 py-2 bg-geo-green text-white font-bold">Pokušaj ponovo</button>
        </div>
      );
    }
    return (
      <div className="min-h-[50vh] flex items-center justify-center" role="status" aria-label="Učitavanje članka">
        <SEO title="Učitavanje članka | Geovizija" />
        <div className="w-10 h-10 border-4 border-stone-300 border-t-geo-green rounded-full animate-spin" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <SEO title="Članak nije pronađen | Geovizija" description="Traženi članak ne postoji na našem portalu." />
        <h2 className="text-2xl font-serif mb-4">Članak nije pronađen.</h2>
        <button onClick={() => navigate('/')} className="text-geo-green font-bold hover:underline">Natrag na naslovnu</button>
      </div>
    );
  }

  const categoryName = allCategories.find(c => c.id === article.categoryId)?.name || 'Vijesti';

  return (
    <article className="animate-fade-in bg-white min-h-screen">
      <SEO 
        title={`${article.title} | Geovizija`}
        description={article.excerpt}
        image={article.imageUrl}
        type="article"
      />

      {/* Article Hero */}
      <div className="h-[60vh] relative w-full overflow-hidden">
        <img 
          src={article.imageUrl} 
          alt={article.title} 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/40 to-transparent opacity-90" />
        
        <div className="absolute top-4 left-4 z-20 md:hidden">
             <button onClick={() => navigate(-1)} className="text-white p-2 bg-black/20 backdrop-blur-md rounded-full">
               <ArrowLeft size={24} />
             </button>
        </div>

        <div className="absolute bottom-0 left-0 w-full px-6 pt-6 pb-5 md:px-12 md:pb-6 lg:px-20 max-w-7xl mx-auto">
           <CategoryPill id={article.categoryId} className="mb-4 text-sm px-3 py-1" />
           <h1 className="font-serif text-3xl md:text-5xl lg:text-7xl font-bold text-white leading-tight mb-6 drop-shadow-lg max-w-5xl">
             {article.title}
           </h1>
           {/* Author, reading time and date share one row on every screen size */}
           <div className="flex flex-row items-center gap-3 sm:gap-6 text-white font-medium tracking-wide text-xs sm:text-sm">
              <div className="flex items-center gap-2 min-w-0">
                 <div className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 rounded-full bg-geo-green flex items-center justify-center text-stone-900 font-bold text-sm sm:text-lg">
                   {article.author.charAt(0)}
                 </div>
                 <div className="flex flex-col min-w-0">
                   <span className="uppercase text-[10px] sm:text-xs text-stone-300">Autor</span>
                   <span className="truncate">{article.author}</span>
                 </div>
              </div>
              <div className="w-px h-8 bg-white/20 flex-shrink-0"></div>
              <div className="flex items-center gap-2 flex-shrink-0">
                 <Clock size={16} className="text-geo-green hidden sm:block" />
                 <div className="flex flex-col">
                   <span className="uppercase text-[10px] sm:text-xs text-stone-300">
                     <span className="sm:hidden">Čitanje</span>
                     <span className="hidden sm:inline">Vrijeme čitanja</span>
                   </span>
                   <span className="whitespace-nowrap">{article.readTime} min</span>
                 </div>
              </div>
              <div className="w-px h-8 bg-white/20 flex-shrink-0"></div>
              <div className="flex flex-col flex-shrink-0">
                   <span className="uppercase text-[10px] sm:text-xs text-stone-300">Objavljeno</span>
                   <span className="whitespace-nowrap">{article.date}</span>
              </div>
           </div>
        </div>
      </div>
      {article.imageCredit && (
        <p className="max-w-7xl mx-auto px-4 sm:px-6 pt-2 text-right text-xs font-sans text-stone-500 leading-snug">{article.imageCredit}</p>
      )}

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-8 md:pt-8 md:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT COLUMN: ARTICLE CONTENT */}
          <div className="lg:col-span-8">
            {/* Excerpt */}
            <p className="text-xl md:text-2xl font-serif font-medium text-stone-800 leading-relaxed mb-6 md:mb-8 border-l-4 border-geo-green pl-6">
              {article.excerpt}
            </p>

            {/* TABS / REPORT COMPONENT (same 24/32 px spacing above and below the intro and the tags) */}
            <div className="mb-6 md:mb-8 pb-6 md:pb-8 border-b border-stone-100">
               <div className="flex flex-wrap gap-2">
                  {/* The category opens its page; the other tags are labels only. */}
                  <Link to={`/category/${article.categoryId}`} className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-lg transition-colors">
                     {categoryName}
                  </Link>
                  <span className="px-4 py-2 bg-stone-100 text-stone-700 text-xs font-bold rounded-lg">
                     {article.author}
                  </span>
                  <span className="px-4 py-2 bg-stone-100 text-stone-700 text-xs font-bold rounded-lg">{article.date.split(" ").pop()}</span>
                  <span className="px-4 py-2 bg-stone-100 text-stone-700 text-xs font-bold rounded-lg">
                     Ekskluzivno
                  </span>
               </div>
            </div>

            {/* Main Content */}
            <div className="prose prose-lg prose-stone max-w-none font-serif text-stone-700">
              {/* One block per line: "## " subheading, "![caption](url)" image, otherwise a paragraph.
                  An ad slot follows the third paragraph. */}
              {(() => {
                return article.content.split(/\n+/).map(line => line.trim()).filter(Boolean).map((block, index) => {
                  if (block.startsWith('## ')) {
                    return <h2 key={index} className="text-2xl md:text-3xl font-bold text-stone-900 mt-10 mb-4">{block.slice(3)}</h2>;
                  }
                  const image = block.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);
                  if (image) {
                    return (
                      <figure key={index} className="my-8 -mx-4 sm:mx-0 not-prose">
                        <img src={image[2]} alt={image[1]} loading="lazy" className="w-full aspect-video object-cover bg-stone-200" />
                        {/* Captions temporarily hidden (not relevant enough); remove `false &&` to restore. */}
                        {false && image[1] && <figcaption className="px-4 sm:px-0 mt-2 text-sm font-sans text-stone-500 leading-snug">{image[1]}</figcaption>}
                        {article.imageCredits?.[image[2]] && (
                          <figcaption className="px-4 sm:px-0 mt-2 text-right text-xs font-sans text-stone-500 leading-snug">{article.imageCredits[image[2]]}</figcaption>
                        )}
                      </figure>
                    );
                  }
                  return <p key={index} className="mb-6 leading-loose">{block}</p>;
                });
              })()}
            </div>

            <ShareBar title={article.title} />

            <Comments postId={article.id} />

            {/* SUGGESTED ARTICLES ("Možda vas zanima") */}
            <div className="mt-8 pt-8 border-t border-stone-200">
                <div className="flex items-center justify-between mb-5 md:mb-6">
                    <h3 className="text-xl font-bold text-stone-800">Možda vas zanima</h3>
                    <MousePointerClick size={20} className="text-stone-400" />
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-3 gap-y-6 md:gap-x-6 md:gap-y-10">
                    {suggestedArticles.map(article => (
                        <Link to={`/article/${article.slug}`} key={article.id} className="group block">
                            <div className="aspect-[3/2] w-full overflow-hidden bg-stone-200 mb-3 relative">
                                <img 
                                    src={article.imageUrl} 
                                    alt={article.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 mb-1.5 line-clamp-1">
                                    {allCategories.find(c => c.id === article.categoryId)?.name}
                                </span>
                                <h4 className="font-serif font-bold text-stone-900 text-sm leading-snug group-hover:text-geo-green transition-colors mb-2 line-clamp-3">
                                    {article.title}
                                </h4>
                                <span className="text-[10px] text-stone-400">
                                    {article.date}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

          </div>

          {/* RIGHT COLUMN: STICKY SIDEBAR */}
          <div className="lg:col-span-4 hidden lg:block">
            <div className="sticky top-28 space-y-8">
               
               {/* Related News Widget */}
               <div>
                 <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-6">
                    <h3 className="font-bold text-stone-700 text-lg">Više na istu temu</h3>
                    <ArrowRightLeft className="text-stone-400" size={18} />
                 </div>
                 
                 <div className="flex flex-col gap-6">
                    {relatedArticles.map((rel) => (
                      <Link to={`/article/${rel.slug}`} key={rel.id} className="group flex gap-4 items-start">
                         <div className="w-28 h-20 bg-stone-200 flex-shrink-0 overflow-hidden relative">
                            <img 
                              src={rel.imageUrl} 
                              alt={rel.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                            />
                         </div>
                         <div className="flex-1 min-w-0">
                            <span className="text-[10px] text-red-600 font-bold uppercase tracking-wider block mb-1 truncate">
                               {allCategories.find(c => c.id === rel.categoryId)?.name || 'Povezano'}
                            </span>
                            <h4 className="font-serif font-bold text-stone-800 text-sm leading-snug group-hover:text-geo-green transition-colors line-clamp-3">
                               {rel.title}
                            </h4>
                            <span className="text-[10px] text-stone-400 mt-1 block">
                               {rel.date}
                            </span>
                         </div>
                      </Link>
                    ))}
                 </div>
               </div>

            </div>
          </div>

        </div>
      </div>
    </article>
  );
};
