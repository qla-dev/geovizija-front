import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useContent } from '../components/ContentProvider';
import { ArticleCard } from '../components/ArticleCard';
import { Grid, List, ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { SEO } from '../components/SEO';

const ITEMS_PER_PAGE = 5;

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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
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

         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-4 md:pt-8 pb-20 md:pb-28">
            <nav className="flex items-center gap-2 text-white/70 text-[11px] md:text-xs font-bold uppercase tracking-widest">
               <Link to="/" className="hover:text-white transition-colors">Naslovna</Link>
               <span className="text-white/40">/</span>
               <Link to="/categories" className="hover:text-white transition-colors">Kategorije</Link>
               <span className="text-white/40">/</span>
               <span className="text-white truncate">{category.name}</span>
            </nav>
            <h1 className="mt-20 md:mt-32 text-5xl md:text-8xl font-serif font-black mb-4 md:mb-6 drop-shadow-lg tracking-tight leading-none">
              {category.name}
            </h1>
            <p className="text-lg md:text-2xl font-serif text-white/85 max-w-2xl leading-relaxed drop-shadow-md">
              Najnovije vijesti, analize i reportaže iz svijeta {category.name.toLowerCase()}.
            </p>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
         {/* Controls Bar: stacked with a full-width switch on mobile, one row on desktop */}
         <div className="bg-white p-3 md:p-4 shadow-lg flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-6 md:mb-8 border border-stone-200">
            <div className="text-stone-500 font-medium text-xs md:text-sm uppercase md:normal-case tracking-widest md:tracking-normal px-1">
               <span className="text-stone-900 font-bold">{articles.length}</span> {articlesWord(articles.length)}
               {totalPages > 1 && <span className="text-stone-400"> · stranica {currentPage}/{totalPages}</span>}
            </div>

            <div className="grid grid-cols-2 w-full md:w-auto md:inline-grid bg-stone-100 p-1 gap-1" role="group" aria-label="Prikaz">
               {([['list', 'Lista', List], ['grid', 'Mreža', Grid]] as const).map(([mode, label, Icon]) => (
                 <button
                   key={mode}
                   onClick={() => setViewMode(mode)}
                   aria-pressed={viewMode === mode}
                   className={`flex items-center justify-center gap-2 py-2.5 md:py-2 md:px-4 text-xs font-bold uppercase tracking-widest transition-colors ${
                     viewMode === mode ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-900'
                   }`}
                 >
                   <Icon size={16} className={viewMode === mode ? 'text-geo-green' : ''} /> {label}
                 </button>
               ))}
            </div>
         </div>

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
             <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {currentArticles.map((article) => (
                   <div key={article.id} className={viewMode === 'grid' ? 'md:h-[480px]' : 'h-auto md:h-64'}>
                      <ArticleCard 
                        article={article} 
                        variant={viewMode === 'grid' ? 'standard' : 'horizontal'} 
                      />
                   </div>
                ))}
             </div>
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