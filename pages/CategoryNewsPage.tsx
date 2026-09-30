import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useContent } from '../components/ContentProvider';
import { ArticleCard } from '../components/ArticleCard';
import { Grid, List, ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { SEO } from '../components/SEO';
import { AdSlot } from '../components/AdSlot';

// 6 fills whole rows in both the 2-column (mobile) and 3-column (desktop) grid
const ITEMS_PER_PAGE = 6;
const VIEW_STORAGE_KEY = 'geovizija_category_view';

// 1 članak, 2-4 članka, 5+ članaka (11-14 always "članaka")
const articlesWord = (count: number) => {
  const last = count % 10, lastTwo = count % 100;
  if (last === 1 && lastTwo !== 11) return 'članak';
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return 'članka';
  return 'članaka';
};

export const CategoryNewsPage: React.FC = () => {
  const { articles: allArticles, categories: allCategories } = useContent();
  const { categoryId } = useParams();
  const [viewMode, setViewModeState] = useState<'grid' | 'list'>(() => {
    try { return localStorage.getItem(VIEW_STORAGE_KEY) === 'grid' ? 'grid' : 'list'; } catch { return 'list'; }
  });
  const setViewMode = (mode: 'grid' | 'list') => {
    setViewModeState(mode);
    setCurrentPage(1);
    try { localStorage.setItem(VIEW_STORAGE_KEY, mode); } catch { /* storage unavailable */ }
  };
  const [currentPage, setCurrentPage] = useState(1);

  // Find Category Info
  const category = allCategories.find(c => c.id === categoryId);
  
  // Filter Articles
  const articles = useMemo(() => {
    if (!category) return [];
    const filtered = allArticles.filter(a => a.categoryId === categoryId);
    return filtered.length > 0 ? filtered : []; 
  }, [categoryId, category, allArticles]);

  // Pagination Logic
  const totalPages = Math.ceil(articles.length / ITEMS_PER_PAGE);
  const currentArticles = articles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (!category) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-10 text-center">
        <SEO title="Kategorija nije pronađena | Geovizija" />
        <h2 className="text-3xl font-serif font-bold text-stone-900 mb-4">Kategorija nije pronađena</h2>
        <Link to="/" className="text-geo-green font-bold hover:underline flex items-center gap-2">
           <Home size={18} /> Povratak na naslovnu
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in min-h-screen bg-stone-100 pb-20">
      <SEO 
        title={`${category.name} | Geovizija`}
        description={`Najnovije vijesti, analize i reportaže iz svijeta ${category.name.toLowerCase()}.`}
        image={category.imageUrl}
      />

      {/* Category Hero Header: breadcrumbs pinned to the top, title at the bottom */}
      <div className="w-full relative text-white overflow-hidden bg-stone-900">
         {/* Background: the category's newest story, falling back to the category image */}
         <img
            src={articles[0]?.imageUrl || category.imageUrl}
            alt={category.name}
            className="absolute inset-0 w-full h-full object-cover"
         />
         <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/60"></div>
         <span className={`absolute left-0 bottom-0 h-1 w-full ${category.color}`}></span>

         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-4 md:pt-8 pb-8 md:pb-14">
            <div className="flex items-center justify-between gap-3">
               <nav className="flex items-center gap-2 min-w-0 text-white/70 text-[11px] md:text-xs font-bold uppercase tracking-widest">
                  <Link to="/" className="hover:text-white transition-colors">Naslovna</Link>
                  <span className="text-white/40">/</span>
                  <Link to="/categories" className="hover:text-white transition-colors">Kategorije</Link>
                  <span className="text-white/40">/</span>
                  <span className="text-white truncate">{category.name}</span>
               </nav>

               {/* Compact view switch */}
               <div className="flex flex-shrink-0 p-0.5 bg-black/30 backdrop-blur-sm border border-white/20 rounded-full" role="group" aria-label="Prikaz">
                  {([['list', 'Lista', List], ['grid', 'Mreža', Grid]] as const).map(([mode, label, Icon]) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      aria-pressed={viewMode === mode}
                      aria-label={label}
                      title={label}
                      className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                        viewMode === mode ? 'bg-white text-stone-900' : 'text-white/70 hover:text-white'
                      }`}
                    >
                      <Icon size={15} />
                    </button>
                  ))}
               </div>
            </div>
            <h1 className="mt-20 md:mt-32 text-5xl md:text-8xl font-serif font-black mb-4 md:mb-6 drop-shadow-lg tracking-tight leading-none">
              {category.name}
            </h1>
            <p className="text-lg md:text-2xl font-serif text-white/85 max-w-2xl leading-relaxed drop-shadow-md">
              Najnovije vijesti, analize i reportaže iz svijeta {category.name.toLowerCase()}.
            </p>
            <p className="mt-4 text-[11px] md:text-xs font-bold uppercase tracking-widest text-white/60">
               <span className="text-white">{articles.length}</span> {articlesWord(articles.length)}
               {totalPages > 1 && <> · stranica {currentPage}/{totalPages}</>}
            </p>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-10">
         {/* Articles Content */}
         {articles.length === 0 ? (
             <div className="bg-white p-16 text-center border border-stone-200 shadow-sm">
                 <div className="inline-block p-4 bg-stone-100 rounded-full mb-4">
                    <Grid size={32} className="text-stone-400" />
                 </div>
                 <h3 className="text-xl font-serif font-bold text-stone-900 mb-2">Nema članaka</h3>
                 <p className="text-stone-500 text-lg mb-6">Trenutno nema članaka u ovoj kategoriji.</p>
                 <Link to="/" className="inline-flex items-center gap-2 text-geo-green font-bold uppercase text-sm tracking-wider hover:underline">
                    <Home size={16} /> Vidi ostale vijesti
                 </Link>
             </div>
         ) : (
             viewMode === 'grid' ? (
               // Grid: compact photo tiles, 2 per row on mobile
               <>
               <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                  {currentArticles.map((article) => (
                     <ArticleCard key={article.id} article={article} variant="tile" />
                  ))}
               </div>
               <AdSlot className="mt-6" />
               </>
             ) : (
               // List: one large card per row
               <div className="grid grid-cols-1 gap-6">
                  {currentArticles.map((article, i) => (
                     <React.Fragment key={article.id}>
                       <div className="h-auto md:h-64">
                          <ArticleCard article={article} variant="horizontal" />
                       </div>
                       {i === 1 && <AdSlot />}
                     </React.Fragment>
                  ))}
               </div>
             )
         )}

         {/* Pagination */}
         {totalPages > 1 && (
            <div className="mt-16 flex justify-center items-center gap-2">
               <button 
                 onClick={() => handlePageChange(currentPage - 1)}
                 disabled={currentPage === 1}
                 className="p-3 bg-white border border-stone-200 text-stone-600 hover:text-geo-green disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
               >
                 <ChevronLeft size={20} />
               </button>
               
               {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePageChange(idx + 1)}
                    className={`w-10 h-10 font-bold text-sm border shadow-sm transition-colors ${
                      currentPage === idx + 1 
                        ? 'bg-geo-green border-geo-green text-white' 
                        : 'bg-white border-stone-200 text-stone-600 hover:border-geo-green hover:text-geo-green'
                    }`}
                  >
                    {idx + 1}
                  </button>
               ))}

               <button 
                 onClick={() => handlePageChange(currentPage + 1)}
                 disabled={currentPage === totalPages}
                 className="p-3 bg-white border border-stone-200 text-stone-600 hover:text-geo-green disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
               >
                 <ChevronRight size={20} />
               </button>
            </div>
         )}
      </div>
    </div>
  );
};