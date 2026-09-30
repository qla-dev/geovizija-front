import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useContent } from '../components/ContentProvider';
import { ArticleCard } from '../components/ArticleCard';
import { Grid, List, ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { SEO } from '../components/SEO';

const ITEMS_PER_PAGE = 5;

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

      {/* Category Hero Header */}
      <div className={`w-full py-20 md:py-32 relative text-white shadow-xl overflow-hidden`}>
         {/* Background Image */}
         <img 
            src={category.imageUrl} 
            alt={category.name}
            className="absolute inset-0 w-full h-full object-cover"
         />
         {/* Color Overlay */}
         <div className={`absolute inset-0 ${category.color} opacity-90 mix-blend-multiply`}></div>
         
         {/* Decorative big letter */}
         <div className="absolute -right-10 -bottom-20 text-white/10 font-serif text-[12rem] md:text-[25rem] font-black leading-none select-none">
            {category.name.charAt(0)}
         </div>
         
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex items-center gap-2 text-white/80 text-xs font-bold uppercase tracking-widest mb-6">
               <Link to="/" className="hover:text-white transition-colors">Naslovna</Link>
               <span>/</span>
               <Link to="/categories" className="hover:text-white transition-colors">Kategorije</Link>
               <span>/</span>
               <span className="text-white border-b border-white pb-0.5">{category.name}</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-serif font-black mb-6 drop-shadow-lg tracking-tight">
              {category.name}
            </h1>
            <p className="text-xl md:text-2xl font-serif text-white/90 max-w-2xl leading-relaxed drop-shadow-md">
              Najnovije vijesti, analize i reportaže iz svijeta {category.name.toLowerCase()}. Istražite dublje.
            </p>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
         {/* Controls Bar */}
         <div className="bg-white p-4 rounded-sm shadow-lg flex flex-col md:flex-row justify-between items-center gap-4 mb-8 border border-stone-200">
            <div className="text-stone-500 font-medium text-sm">
               Prikazano <span className="text-stone-900 font-bold">{currentArticles.length}</span> od <span className="text-stone-900 font-bold">{articles.length}</span> članaka
            </div>
            
            <div className="flex items-center gap-2">
               <span className="text-xs uppercase font-bold text-stone-400 mr-2 hidden md:inline">Prikaz:</span>
               <button 
                 onClick={() => setViewMode('grid')}
                 className={`p-2 rounded hover:bg-stone-100 transition-colors ${viewMode === 'grid' ? 'text-geo-green bg-stone-50 ring-1 ring-stone-200' : 'text-stone-400'}`}
                 title="Mreža"
               >
                 <Grid size={20} />
               </button>
               <button 
                 onClick={() => setViewMode('list')}
                 className={`p-2 rounded hover:bg-stone-100 transition-colors ${viewMode === 'list' ? 'text-geo-green bg-stone-50 ring-1 ring-stone-200' : 'text-stone-400'}`}
                 title="Lista"
               >
                 <List size={20} />
               </button>
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
                   <div key={article.id} className={viewMode === 'grid' ? 'h-[480px]' : 'h-auto md:h-64'}>
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