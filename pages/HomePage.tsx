import React, { useRef, useState, useEffect } from 'react';
import { MOCK_ARTICLES, CATEGORIES } from '../constants';
import { ArticleCard } from '../components/ArticleCard';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Camera, Zap, Globe, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { CategoryPill } from '../components/CategoryPill';
import { SEO } from '../components/SEO';

export const HomePage: React.FC = () => {
  // --- HERO SLIDER STATE ---
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  
  // Select articles for the hero slider (Nature, Tech, Travel, Nature)
  const heroArticles = [
    MOCK_ARTICLES[0],  // Perućica (Nature)
    MOCK_ARTICLES[10], // Architecture (Tech)
    MOCK_ARTICLES[11], // Destinations (Travel)
    MOCK_ARTICLES[6]   // Lynx (Nature)
  ];

  // Auto-slide logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroArticles.length);
    }, 6000); // 6 seconds per slide
    return () => clearInterval(timer);
  }, [currentHeroIndex, heroArticles.length]); // Reset timer on interaction

  // Data Slicing
  const featuredArticle = MOCK_ARTICLES[0]; // Kept for reference if needed, but heroArticles is used
  // Increased sidebar count to 4 (Indices 1, 2, 3, 4)
  const sidebarArticles = MOCK_ARTICLES.slice(1, 5);
  const techArticles = MOCK_ARTICLES.filter(a => a.categoryId === 'tehnologija');
  const natureArticles = MOCK_ARTICLES.filter(a => a.categoryId === 'priroda');
  const travelArticles = MOCK_ARTICLES.filter(a => a.categoryId === 'putovanja');

  // Prepare Travel Sidebar Items (3 existing + 1 dummy to make 4)
  const travelSidebarItems = [
      ...travelArticles.slice(1, 4),
      {
          id: 'dummy-travel-extra',
          title: 'Zeleni otoci: Održivi turizam na Maldivima',
          imageUrl: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&q=80',
      }
  ];
  
  // Mix articles for TV section (Indices 5, 6, 7 + one extra dummy for 4 items)
  const mixArticles = [
    MOCK_ARTICLES[5],
    MOCK_ARTICLES[6],
    MOCK_ARTICLES[7],
    {
       ...MOCK_ARTICLES[4],
       id: 'dummy-video-4',
       title: 'Podvodni svijet Jadrana: Skrivene špilje',
       imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80'
    }
  ];
  
  // Prepare Tech Section Data (1 Big, 4 Small)
  const bigTechArticle = techArticles[0];
  const smallTechArticles = [
      ...techArticles.slice(1),
      ...mixArticles.filter(a => !techArticles.some(t => t.id === a.id))
  ].slice(0, 4);

  // If we still don't have 4, fill from general pool (excluding already used)
  if (smallTechArticles.length < 4) {
      const remaining = MOCK_ARTICLES.filter(a => 
          a.id !== bigTechArticle.id && 
          !smallTechArticles.some(s => s.id === a.id)
      );
      smallTechArticles.push(...remaining.slice(0, 4 - smallTechArticles.length));
  }
  
  // Shifted slider articles (Indices 9-14)
  const moreArticles = MOCK_ARTICLES.slice(9, 14);
  
  // Specific articles for sections (Index 8)
  const multimediaArticle = MOCK_ARTICLES[8]; 
  const photoOfDayUrl = "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=2674&auto=format&fit=crop";

  // Slider Logic (Bottom Section)
  const sliderRef = useRef<HTMLDivElement>(null);

  const scrollSlider = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      // Approximate width of card (320) + gap (24)
      const scrollAmount = 344; 
      const currentScroll = sliderRef.current.scrollLeft;
      const newScroll = direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount;
      sliderRef.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="animate-fade-in bg-stone-100">
      <SEO 
        title="Geovizija | Ekološki Portal" 
        description="Vaš prozor u svijet prirode. Najnovije vijesti o ekologiji, putovanjima i tehnologiji."
      />
      
      {/* --- SECTION 1: HERO (Slider + Sidebar) --- */}
      <section className="grid grid-cols-1 lg:grid-cols-3 lg:h-[650px]">
        {/* Main Hero Slider */}
        <div className="lg:col-span-2 h-[500px] lg:h-full relative group overflow-hidden bg-stone-900">
           {heroArticles.map((article, index) => (
             <div 
               key={article.id}
               className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                 index === currentHeroIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
               }`}
             >
                <ArticleCard article={article} variant="featured" />
             </div>
           ))}
           
           {/* Progress Bar / Indicators */}
           <div className="absolute bottom-0 left-0 w-full z-20 flex gap-1 px-0">
              {heroArticles.map((_, index) => (
                <button 
                  key={index}
                  onClick={() => setCurrentHeroIndex(index)}
                  className="h-1.5 flex-1 bg-white/20 relative overflow-hidden group/indicator cursor-pointer"
                >
                  <div 
                    className={`absolute top-0 left-0 h-full bg-geo-green transition-all duration-300 ${
                       index === currentHeroIndex 
                         ? 'w-full origin-left animate-progress' 
                         : index < currentHeroIndex ? 'w-full' : 'w-0'
                    }`}
                  ></div>
                </button>
              ))}
           </div>
           
           {/* Navigation Arrows - Moved to Top Right */}
           <div className="absolute top-8 right-8 z-30 flex gap-2">
              <button 
                 onClick={() => setCurrentHeroIndex((prev) => (prev === 0 ? heroArticles.length - 1 : prev - 1))}
                 className="p-3 bg-black/40 text-white hover:bg-geo-green hover:text-stone-900 transition-colors border border-white/20 backdrop-blur-sm"
              >
                 <ChevronLeft size={20} />
              </button>
              <button 
                 onClick={() => setCurrentHeroIndex((prev) => (prev + 1) % heroArticles.length)}
                 className="p-3 bg-black/40 text-white hover:bg-geo-green hover:text-stone-900 transition-colors border border-white/20 backdrop-blur-sm"
              >
                 <ChevronRight size={20} />
              </button>
           </div>
        </div>

        {/* Sidebar News */}
        <div className="lg:col-span-1 bg-white p-6 md:p-8 flex flex-col h-full border-l border-stone-200">
          <div className="flex items-center justify-between mb-6 border-b-2 border-geo-green pb-2">
            <h4 className="font-serif font-black text-stone-900 uppercase tracking-widest text-sm">
              Najnovije
            </h4>
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          </div>
          
          <div className="flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar flex-1">
            {sidebarArticles.map((article) => (
              <ArticleCard key={article.id} article={article} variant="compact" />
            ))}
          </div>
          
          <Link to="/categories" className="mt-6 flex items-center justify-center w-full py-3 text-xs font-black text-white bg-stone-950 uppercase tracking-widest hover:bg-geo-green transition-colors">
             Sve vijesti <ArrowRight size={14} className="ml-2" />
          </Link>
        </div>
      </section>

      {/* --- NEW SECTION: MORE FROM GEOVIZIJA (SLIDER) --- */}
      <section className="bg-black text-white py-16 md:py-24 border-t border-stone-800 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
                <h3 className="font-bold text-xs md:text-sm tracking-[0.2em] uppercase text-stone-100">
                    Više sa Geovizije
                </h3>
                <div className="flex gap-2">
                    <button 
                        onClick={() => scrollSlider('left')} 
                        className="p-2 border border-stone-700 hover:bg-stone-800 hover:border-geo-green text-white transition-all rounded-full"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button 
                        onClick={() => scrollSlider('right')} 
                        className="p-2 border border-stone-700 hover:bg-stone-800 hover:border-geo-green text-white transition-all rounded-full"
                        aria-label="Scroll right"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
            
            <div className="w-[calc(100%_+_50vw_-_50%)] -mr-[calc(50vw_-_50%)]">
                <div 
                    ref={sliderRef}
                    className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory no-scrollbar scroll-smooth pr-[calc(50vw_-_50%)]"
                >
                    {moreArticles.map((article) => {
                        const category = CATEGORIES.find(c => c.id === article.categoryId);
                        const catColorBg = category?.color || 'bg-stone-500';
                        const catColorBorder = catColorBg.replace('bg-', 'border-');

                        return (
                            <Link 
                                to={`/article/${article.id}`} 
                                key={article.id} 
                                className="group flex flex-col flex-shrink-0 w-[280px] md:w-[320px] snap-start"
                            >
                                <div className={`aspect-[4/3] overflow-hidden bg-stone-900 mb-5 relative border-t-4 ${catColorBorder}`}>
                                    <img 
                                        src={article.imageUrl} 
                                        alt={article.title}
                                        className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
                                </div>
                                
                                <div className="flex flex-col flex-1">
                                    <div className="mb-3 flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${catColorBg}`}></span>
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-300 group-hover:text-white transition-colors">
                                            {category?.name}
                                        </span>
                                    </div>
                                    <h4 className="font-serif text-lg font-bold leading-snug mb-3 text-white group-hover:text-geo-green transition-colors">
                                        {article.title}
                                    </h4>
                                    <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed font-medium">
                                        {article.excerpt}
                                    </p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
      </section>

      {/* --- SECTION 2: PHOTO OF THE DAY --- */}
      <section className="relative h-[80vh] w-full overflow-hidden flex items-end">
         <img 
            src={photoOfDayUrl} 
            alt="Prizor dana" 
            className="absolute inset-0 w-full h-full object-cover"
         />
         <div className="absolute inset-0 bg-stone-900/30"></div>
         
         <div className="relative z-10 w-full bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent pt-32 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-end justify-between gap-8">
               <div className="max-w-2xl">
                  <div className="flex items-center gap-2 text-white/80 mb-4">
                     <Camera size={20} />
                     <span className="text-sm font-bold uppercase tracking-widest">Prizor Dana</span>
                  </div>
                  <h2 className="text-4xl md:text-6xl font-serif font-bold text-white leading-none mb-4">
                     Magla nad Velebitom
                  </h2>
                  <p className="text-lg text-stone-300 font-serif italic">
                     "Jutarnja tišina koju prekida samo zvuk vjetra u krošnjama, podsjetnik na divlju ljepotu koja nas okružuje."
                  </p>
               </div>
               <div className="flex gap-4">
                   <button className="bg-transparent border border-white text-white hover:bg-white hover:text-stone-900 px-6 py-3 text-sm font-bold uppercase tracking-wider transition-all">
                      Preuzmi pozadinu
                   </button>
                   <button className="bg-geo-green text-stone-950 hover:bg-white px-6 py-3 text-sm font-bold uppercase tracking-wider transition-colors">
                      Vidi galeriju
                   </button>
               </div>
            </div>
         </div>
      </section>

      {/* --- SECTION 3: TECHNOLOGY SPOTLIGHT (White BG) --- */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10 pb-4 border-b border-stone-300">
             <div>
               <span className="text-geo-green font-bold uppercase tracking-widest text-xs mb-2 block">Inovacije</span>
               <h2 className="text-4xl font-serif font-black text-stone-900">Tehnologija i Budućnost</h2>
             </div>
             <Link to="/category/tehnologija" className="hidden md:flex items-center text-sm font-bold text-stone-500 hover:text-geo-green transition-colors">
               Vidi sve <ArrowRight size={16} className="ml-2" />
             </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
             {/* Left Side: 2x2 Grid of Small Items */}
             <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
                {smallTechArticles.map((article) => (
                   <div key={article.id} className="col-span-1">
                      <ArticleCard article={article} />
                   </div>
                ))}
             </div>

             {/* Right Side: Big Feature */}
             <div className="lg:col-span-2 relative group cursor-pointer h-full min-h-[500px] lg:min-h-0">
                <div className="h-full w-full overflow-hidden relative bg-stone-200">
                   <img 
                     src={bigTechArticle?.imageUrl} 
                     className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                     alt={bigTechArticle?.title}
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent opacity-80"></div>
                   <div className="absolute bottom-0 p-8">
                      <span className="bg-white text-stone-950 text-xs font-bold px-3 py-1 uppercase tracking-wider mb-4 inline-block">Izdvojeno</span>
                      <h3 className="text-3xl md:text-5xl font-serif font-bold text-white mb-3 leading-tight">{bigTechArticle?.title}</h3>
                      <p className="text-stone-300 line-clamp-3 text-lg leading-relaxed">{bigTechArticle?.excerpt}</p>
                   </div>
                </div>
             </div>
          </div>
      </section>

      {/* --- SECTION 4: MULTIMEDIA / DARK MODE --- */}
      <section className="bg-stone-950 text-white py-16 md:py-24 border-t border-stone-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl md:text-4xl font-serif font-bold flex items-center gap-3">
              <Play className="text-geo-green fill-geo-green" size={32} />
              Geovizija<span className="text-geo-green">TV</span>
            </h2>
            <button className="text-xs font-bold uppercase tracking-widest text-stone-400 hover:text-white transition-colors">
              Pogledaj arhivu
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             {/* Main Video Player Placeholder - LEFT Content (Dynamic Height based on playlist) */}
             <div className="lg:col-span-2 relative group cursor-pointer overflow-hidden border border-stone-800 bg-stone-900 min-h-[400px] lg:min-h-0">
                {/* Image absolute to fill the stretched height */}
                <img 
                  src={multimediaArticle?.imageUrl || "https://picsum.photos/seed/video1/800/600"} 
                  alt="Video thumbnail" 
                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-500"
                />
                <div className="absolute inset-0 flex items-center justify-center z-10">
                   <div className="w-20 h-20 rounded-full bg-geo-green/90 text-stone-900 flex items-center justify-center pl-2 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                      <Play size={40} fill="currentColor" />
                   </div>
                </div>
                <div className="absolute bottom-0 left-0 p-8 w-full bg-gradient-to-t from-black via-black/60 to-transparent z-10">
                   <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider mb-3 inline-block">Uživo</span>
                   <h3 className="text-2xl md:text-3xl font-serif font-bold leading-tight">{multimediaArticle?.title}</h3>
                </div>
             </div>

             {/* Playlist Side - RIGHT Content (Dictates height of the row) */}
             <div className="flex flex-col gap-4">
                {mixArticles.map((item, idx) => (
                  <div key={idx} className="flex gap-4 p-4 bg-stone-900 hover:bg-stone-800 transition-colors cursor-pointer border-l-2 border-transparent hover:border-geo-green group flex-1">
                     <div className="w-24 h-full min-h-[60px] bg-stone-800 flex-shrink-0 relative overflow-hidden">
                        <img src={item.imageUrl} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Play size={16} className="text-white drop-shadow-md" fill="white" />
                        </div>
                     </div>
                     <div className="flex flex-col justify-center">
                        <span className="text-[10px] text-geo-green font-bold uppercase mb-1">Epizoda {idx + 1}</span>
                        <h4 className="font-serif text-sm font-medium text-stone-200 line-clamp-2 leading-snug group-hover:text-white">{item.title}</h4>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </section>

      {/* --- SECTION 5: NATURE & FACTS --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left Content (8 cols) */}
            <div className="lg:col-span-8">
               <h3 className="text-2xl font-serif font-black text-stone-900 mb-8 pb-2 border-b border-stone-200">
                  Priče iz prirode
               </h3>
               <div className="space-y-8">
                  {natureArticles.map((article) => (
                    <div key={article.id} className="flex flex-col md:flex-row gap-6 group cursor-pointer">
                       <div className="w-full md:w-64 h-48 overflow-hidden bg-stone-200 flex-shrink-0">
                          <img src={article.imageUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                       </div>
                       <div className="flex-1 py-2">
                          <span className="text-geo-green text-xs font-bold uppercase tracking-wider mb-2 block">Ekologija</span>
                          <h4 className="text-xl md:text-2xl font-serif font-bold text-stone-900 mb-3 group-hover:text-geo-green transition-colors">
                             {article.title}
                          </h4>
                          <p className="text-stone-600 line-clamp-2 mb-4 leading-relaxed">
                             {article.excerpt}
                          </p>
                          <div className="flex items-center text-xs text-stone-400 font-bold uppercase tracking-wider">
                             {article.author} • {article.readTime} min
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            {/* Right Sidebar - Did you know? (4 cols) */}
            <div className="lg:col-span-4 space-y-8">
               {/* Updated to Primary Green */}
               <div className="bg-geo-green p-8 text-stone-900 relative overflow-hidden">
                  <Zap className="absolute top-4 right-4 text-stone-900/10 w-24 h-24 rotate-12" />
                  <h4 className="font-serif font-black text-2xl mb-4 relative z-10">Jeste li znali?</h4>
                  <p className="font-serif text-lg leading-relaxed mb-6 relative z-10">
                     Jedno zrelo stablo može apsorbirati do 22 kilograma ugljičnog dioksida godišnje i proizvesti dovoljno kisika za dvije osobe.
                  </p>
                  <button className="text-xs font-black uppercase tracking-widest border-b-2 border-stone-900 pb-1 hover:text-white hover:border-white transition-colors">
                     Još činjenica
                  </button>
               </div>

               <div className="border border-stone-200 p-6">
                  <h4 className="font-bold text-sm uppercase tracking-widest text-stone-400 mb-6">Uredništvo preporučuje</h4>
                  <ul className="space-y-4">
                     {[1, 2, 3].map((i) => (
                        <li key={i} className="flex gap-4 items-start group cursor-pointer">
                           <span className="text-3xl font-serif font-bold text-stone-200 group-hover:text-geo-green transition-colors">{i}</span>
                           <p className="text-stone-700 font-medium text-sm leading-snug group-hover:underline decoration-geo-green underline-offset-4">
                              Kako male promjene u kućanstvu mogu spasiti planet?
                           </p>
                        </li>
                     ))}
                  </ul>
               </div>
            </div>

         </div>
      </div>

      {/* --- NEW SECTION: PUTOVANJA (TRAVEL) --- */}
      <section className="relative bg-stone-950 text-white overflow-hidden py-16 md:py-24">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
             <img 
               src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80" 
               alt="Travel Background" 
               className="w-full h-full object-cover opacity-40" 
             />
             <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/80 to-transparent"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Title centered with line accent */}
              <div className="flex flex-col items-center mb-12">
                 <h2 className="text-4xl md:text-5xl font-serif font-black tracking-wide uppercase mb-4 text-center">
                    Putovanja
                 </h2>
                 <div className="w-24 h-1 bg-geo-green"></div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                 
                 {/* Main Feature (8 cols) - Dynamic Height based on content */}
                 <div className="lg:col-span-8 group relative cursor-pointer min-h-[400px] lg:min-h-0 h-full">
                    {travelArticles[0] && (
                      <Link to={`/article/${travelArticles[0].id}`} className="block h-full relative overflow-hidden bg-stone-900">
                         <img 
                            src={travelArticles[0].imageUrl} 
                            alt={travelArticles[0].title} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                         />
                         <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black via-black/70 to-transparent">
                            <div className="flex items-center gap-2 mb-3">
                               <Globe size={16} className="text-geo-green" />
                               <span className="text-xs font-bold uppercase tracking-widest text-stone-300">
                                  Najbolje u 2026.
                               </span>
                            </div>
                            <h3 className="text-3xl md:text-5xl font-serif font-bold leading-tight mb-2 text-white">
                               {travelArticles[0].title}
                            </h3>
                            <p className="text-stone-300 line-clamp-2 md:text-lg">
                               {travelArticles[0].excerpt}
                            </p>
                         </div>
                      </Link>
                    )}
                 </div>

                 {/* Sidebar List (4 cols) */}
                 <div className="lg:col-span-4 flex flex-col h-full">
                    <div className="flex-1">
                       <div className="flex items-center gap-2 mb-6 border-l-4 border-geo-green pl-4">
                          <h3 className="text-xl font-bold uppercase tracking-widest text-white">
                             Najnovije priče
                          </h3>
                       </div>
                       
                       <div className="space-y-4">
                          {travelSidebarItems.map((article) => (
                             <Link key={article.id} to={article.id.startsWith('dummy') ? '#' : `/article/${article.id}`} className="flex gap-4 group">
                                <div className="w-24 h-24 bg-stone-800 flex-shrink-0 overflow-hidden">
                                   <img 
                                     src={article.imageUrl} 
                                     alt={article.title} 
                                     className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                                   />
                                </div>
                                <div>
                                   <span className="text-[10px] font-bold text-geo-green uppercase tracking-wider block mb-1">
                                      Putovanja
                                   </span>
                                   <h4 className="font-serif text-sm font-bold text-stone-200 leading-snug group-hover:text-white group-hover:underline decoration-geo-green underline-offset-4">
                                      {article.title}
                                   </h4>
                                </div>
                             </Link>
                          ))}
                       </div>
                    </div>

                    <Link to="/category/putovanja" className="mt-8 inline-flex items-center text-xs font-bold uppercase tracking-widest text-stone-400 hover:text-geo-green transition-colors">
                       Pogledaj sve destinacije <ArrowRight size={14} className="ml-2" />
                    </Link>
                 </div>
              </div>

              {/* Bottom Row of Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 pt-12 border-t border-stone-800">
                 
                 <div className="bg-white text-stone-900 p-8 flex flex-col items-center text-center">
                    <MapPin size={32} className="text-geo-green mb-4" />
                    <h4 className="font-serif text-xl font-bold mb-2">Istraži prirodu</h4>
                    <p className="text-sm text-stone-600 mb-4">Pronađi skrivene parkove i rezervate u svojoj blizini.</p>
                    <button className="text-xs font-black uppercase tracking-widest border-b-2 border-stone-900 hover:text-geo-green hover:border-geo-green transition-colors pb-1">
                       Kreni
                    </button>
                 </div>

                 <div className="relative h-64 md:h-auto overflow-hidden group">
                     <img src="https://images.unsplash.com/photo-1542259659-4ab2825c9325?auto=format&fit=crop&q=80" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                     <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex flex-col justify-end p-6">
                        <span className="bg-geo-green text-stone-900 text-[10px] font-bold px-2 py-1 uppercase tracking-wider inline-block w-max mb-2">Partneri</span>
                        <h4 className="text-white font-serif text-lg font-bold">Ekspedicije s biolozima</h4>
                     </div>
                 </div>

                 <div className="relative h-64 md:h-auto overflow-hidden group">
                     <img src="https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&q=80" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                     <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex flex-col justify-end p-6">
                        <h4 className="text-white font-serif text-lg font-bold">Foto natječaj 2026.</h4>
                        <Link to="/" className="text-geo-green text-xs font-bold uppercase tracking-widest mt-2 hover:text-white transition-colors">Prijavi se &rarr;</Link>
                     </div>
                 </div>

              </div>
          </div>
      </section>

      {/* --- NEWSLETTER --- */}
      <div className="bg-stone-900 py-16 md:py-24 border-t border-stone-800">
         <div className="max-w-4xl mx-auto px-4 text-center">
            <span className="text-geo-green font-bold uppercase tracking-widest text-xs mb-4 block">Newsletter</span>
            <h2 className="text-3xl md:text-5xl font-serif font-black text-white mb-6">
               Pratite Zelenu Revoluciju
            </h2>
            <p className="text-stone-400 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
               Prijavite se na naš tjedni pregled najvažnijih ekoloških vijesti, znanstvenih otkrića i inspirativnih priča. Bez spama, samo priroda.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
               <input 
                  type="email" 
                  placeholder="Vaša email adresa" 
                  className="w-full px-6 py-4 bg-stone-800 border border-stone-700 text-white placeholder-stone-500 focus:outline-none focus:border-geo-green focus:ring-1 focus:ring-geo-green transition-all" 
               />
               <button className="w-full sm:w-auto bg-geo-green text-stone-950 font-black px-8 py-4 uppercase tracking-wider hover:bg-white transition-colors whitespace-nowrap">
                  Pretplati se
               </button>
            </div>
            <p className="text-stone-600 text-xs mt-6">
               Pritiskom na gumb slažete se s našim uvjetima korištenja i pravilima privatnosti.
            </p>
         </div>
      </div>

    </div>
  );
};