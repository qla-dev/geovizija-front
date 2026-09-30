import React, { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useContent } from '../components/ContentProvider';
import { CategoryPill } from '../components/CategoryPill';
import { Clock, ArrowLeft, ArrowRightLeft, MessageSquare, ThumbsUp, MousePointerClick } from 'lucide-react';
import { ShareBar } from '../components/ShareBar';
import { AdSlot } from '../components/AdSlot';
import { SEO } from '../components/SEO';

export const ArticlePage: React.FC = () => {
  const { articles: allArticles, categories: allCategories } = useContent();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const article = allArticles.find(a => a.id === id);
  

  // Mock Comment State
  const [comments, setComments] = useState([
    { id: 1, user: 'Marko H.', date: 'Prije 2 sata', text: 'Nevjerojatno je koliko malo znamo o našim vlastitim šumama. Odličan tekst!', likes: 14 },
    { id: 2, user: 'Lana Juric', date: 'Prije 4 sata', text: 'Nadam se da će se zaštita podići na višu razinu prije nego bude prekasno.', likes: 8 },
  ]);
  const [commentInput, setCommentInput] = useState('');

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

  if (!article) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <SEO title="Članak nije pronađen | Geovizija" description="Traženi članak ne postoji na našem portalu." />
        <h2 className="text-2xl font-serif mb-4">Članak nije pronađen.</h2>
        <button onClick={() => navigate('/')} className="text-geo-green font-bold hover:underline">Natrag na naslovnu</button>
      </div>
    );
  }

  const handlePostComment = () => {
      if(!commentInput.trim()) return;
      const newComment = {
          id: comments.length + 1,
          user: 'Gost',
          date: 'Upravo sada',
          text: commentInput,
          likes: 0
      };
      setComments([newComment, ...comments]);
      setCommentInput('');
  };

  const categoryName = allCategories.find(c => c.id === article.categoryId)?.name || 'Vijesti';

  return (
    <article className="animate-fade-in bg-white min-h-screen md:pb-20">
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

        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 lg:p-20 max-w-7xl mx-auto">
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

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT COLUMN: ARTICLE CONTENT */}
          <div className="lg:col-span-8">
            {/* Excerpt */}
            <p className="text-xl md:text-2xl font-serif font-medium text-stone-800 leading-relaxed mb-8 border-l-4 border-geo-green pl-6">
              {article.excerpt}
            </p>

            {/* TABS / REPORT COMPONENT */}
            <div className="mb-10 pb-4 border-b border-stone-100">
               <div className="flex flex-wrap gap-2">
                  <span className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-lg cursor-pointer transition-colors">
                     {categoryName}
                  </span>
                  <span className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-lg cursor-pointer transition-colors">
                     {article.author}
                  </span>
                  <span className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-lg cursor-pointer transition-colors">
                     2026
                  </span>
                   <span className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-lg cursor-pointer transition-colors">
                     Ekskluzivno
                  </span>
               </div>
            </div>

            {/* Main Content */}
            <div className="prose prose-lg prose-stone max-w-none font-serif text-stone-700">
              {/* One block per line: "## " subheading, "![caption](url)" image, otherwise a paragraph.
                  An ad slot follows the third paragraph. */}
              {(() => {
                let paragraphs = 0;
                return article.content.split(/\n+/).map(line => line.trim()).filter(Boolean).map((block, index) => {
                  if (block.startsWith('## ')) {
                    return <h2 key={index} className="text-2xl md:text-3xl font-bold text-stone-900 mt-10 mb-4">{block.slice(3)}</h2>;
                  }
                  const image = block.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);
                  if (image) {
                    return (
                      <figure key={index} className="my-8 -mx-4 sm:mx-0 not-prose">
                        <img src={image[2]} alt={image[1]} loading="lazy" className="w-full aspect-video object-cover bg-stone-200" />
                        {image[1] && <figcaption className="px-4 sm:px-0 mt-2 text-sm font-sans text-stone-500 leading-snug">{image[1]}</figcaption>}
                      </figure>
                    );
                  }
                  paragraphs++;
                  return (
                    <React.Fragment key={index}>
                      <p className="mb-6 leading-loose">{block}</p>
                      {paragraphs === 3 && <AdSlot variant="rectangle" className="my-8 not-prose" />}
                    </React.Fragment>
                  );
                });
              })()}
            </div>

            <ShareBar title={article.title} />

            <AdSlot className="mt-8" />

            {/* COMMENTING MECHANISM */}
            <div className="mt-16">
                <div className="flex items-center gap-3 mb-8">
                    <MessageSquare size={24} className="text-geo-green" />
                    <h3 className="font-serif font-bold text-2xl text-stone-900">Rasprava <span className="text-stone-400 text-lg font-normal">({comments.length})</span></h3>
                </div>

                {/* Input Area */}
                <div className="mb-12 bg-white rounded-sm">
                    <div className="relative">
                        <textarea 
                            value={commentInput}
                            onChange={(e) => setCommentInput(e.target.value)}
                            placeholder="Vaše mišljenje je važno. Napišite komentar..."
                            className="w-full bg-stone-50 border border-stone-200 p-6 min-h-[120px] focus:outline-none focus:border-geo-green focus:bg-white transition-all resize-y text-stone-700 placeholder-stone-400 font-serif text-lg"
                        />
                        <div className="absolute bottom-4 right-4">
                             <button 
                                onClick={handlePostComment}
                                disabled={!commentInput.trim()}
                                className="bg-stone-900 text-white px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-geo-green hover:text-stone-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                             >
                                Objavi
                             </button>
                        </div>
                    </div>
                    <p className="text-[10px] text-stone-400 mt-2 uppercase tracking-wide">
                        Komentari prolaze automatsku moderaciju.
                    </p>
                </div>

                {/* Comments List */}
                <div className="space-y-10">
                    {comments.map((comment) => (
                        <div key={comment.id} className="flex gap-4 group animate-fade-in">
                            <div className="w-10 h-10 rounded-full bg-stone-200 flex-shrink-0 flex items-center justify-center text-stone-500 font-bold font-serif border-2 border-white shadow-sm">
                                {comment.user.charAt(0)}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-baseline justify-between mb-2">
                                    <h4 className="font-bold text-stone-900 text-sm">{comment.user}</h4>
                                    <span className="text-xs text-stone-400 font-medium">{comment.date}</span>
                                </div>
                                <p className="text-stone-600 text-base leading-relaxed mb-3 font-serif">
                                    {comment.text}
                                </p>
                                <div className="flex items-center gap-6">
                                    <button className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-400 hover:text-geo-green transition-colors">
                                        <ThumbsUp size={14} />
                                        <span>{comment.likes > 0 ? comment.likes : 'Sviđa mi se'}</span>
                                    </button>
                                    <button className="text-xs font-bold uppercase tracking-wider text-stone-400 hover:text-stone-900 transition-colors">
                                        Odgovori
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* SUGGESTED ARTICLES ("Možda vas zanima") */}
            <div className="mt-10 md:mt-16 pt-8 border-t border-stone-200">
                <div className="flex items-center justify-between mb-5 md:mb-6">
                    <h3 className="text-xl font-bold text-stone-800">Možda vas zanima</h3>
                    <MousePointerClick size={20} className="text-stone-400" />
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-3 gap-y-6 md:gap-x-6 md:gap-y-10">
                    {suggestedArticles.map(article => (
                        <Link to={`/article/${article.id}`} key={article.id} className="group block">
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
                      <Link to={`/article/${rel.id}`} key={rel.id} className="group flex gap-4 items-start">
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

               {/* Ad Placeholder / Sidebar Extra */}
               <div className="bg-stone-100 h-[300px] w-full flex flex-col items-center justify-center border border-stone-200 text-center p-4">
                  <span className="text-stone-400 text-xs uppercase font-bold tracking-widest mb-2">Oglas</span>
                  <p className="text-stone-500 font-serif italic">Vaš prozor u svijet prirode.</p>
               </div>

            </div>
          </div>

        </div>
      </div>
    </article>
  );
};