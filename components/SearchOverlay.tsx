import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Search, X, Clock, ArrowRight } from 'lucide-react';
import { useContent } from './ContentProvider';
import { Article, Category } from '../types';

// Lowercase and strip diacritics so "sume" matches "šume" and "dj" matches "đ".
const normalize = (text: string) =>
  text.toLowerCase().replace(/đ/g, 'dj').normalize('NFD').replace(/[̀-ͯ]/g, '');

type Result =
  | { kind: 'category'; category: Category; count: number }
  | { kind: 'article'; article: Article; score: number; snippet: string };

const MAX_ARTICLES = 12;

// Body text without in-text image lines ('![caption](url)') and subheading markers.
const bodyText = (content: string) => content.replace(/^!\[[^\]]*\]\([^)]*\)$/gm, '').replace(/^## /gm, '');

/** Snippet of the text around the first matching word. */
const snippetAround = (text: string, term: string) => {
  const index = normalize(text).indexOf(term);
  if (index < 0) return '';
  const start = Math.max(0, index - 60);
  return (start > 0 ? '…' : '') + text.slice(start, index + 120).trim() + '…';
};

export const SearchOverlay: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const { articles, categories } = useContent();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);

  // Lock page scroll while open; clear the field and drop focus (hides the keyboard) when closed.
  // Focusing happens synchronously in openSearch(), not here.
  useEffect(() => {
    if (!open) {
      inputRef.current?.blur();
      return;
    }
    setQuery('');
    setActive(0);
    inputRef.current?.focus({ preventScroll: true }); // already focused when opened by a tap
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const categoryName = (id: string) => categories.find(c => c.id === id)?.name ?? '';

  const results: Result[] = useMemo(() => {
    const terms = normalize(query).split(/\s+/).filter(t => t.length > 1);
    if (terms.length === 0) return [];

    const categoryResults: Result[] = categories
      .filter(c => terms.every(t => normalize(c.name).includes(t)))
      .map(c => ({ kind: 'category', category: c, count: articles.filter(a => a.categoryId === c.id).length }));

    const articleResults = articles
      .map(article => {
        const title = normalize(article.title);
        const excerpt = normalize(article.excerpt ?? '');
        const content = normalize(bodyText(article.content ?? ''));
        const meta = normalize(`${article.author} ${categoryName(article.categoryId)}`);
        let score = 0;
        for (const term of terms) {
          const termScore = (title.includes(term) ? 10 : 0) + (excerpt.includes(term) ? 4 : 0)
            + (meta.includes(term) ? 3 : 0) + (content.includes(term) ? 1 : 0);
          if (termScore === 0) return null; // every term must match somewhere
          score += termScore;
        }
        const inTitleOrExcerpt = terms.every(t => title.includes(t) || excerpt.includes(t));
        return {
          kind: 'article' as const,
          article,
          score,
          snippet: inTitleOrExcerpt ? article.excerpt : snippetAround(bodyText(article.content ?? ''), terms[0]) || article.excerpt,
        };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_ARTICLES);

    return [...categoryResults, ...articleResults];
  }, [query, articles, categories]);

  useEffect(() => setActive(0), [query]);

  const openResult = (result: Result) => {
    onClose();
    navigate(result.kind === 'category' ? `/category/${result.category.id}` : `/article/${result.article.slug}`);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') onClose();
    else if (event.key === 'ArrowDown') { event.preventDefault(); setActive(i => Math.min(i + 1, results.length - 1)); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); setActive(i => Math.max(i - 1, 0)); }
    else if (event.key === 'Enter' && results[active]) openResult(results[active]);
  };

  // Stays mounted while closed (invisible, not display:none) so openSearch() can focus the input
  // inside the tap itself: iOS Safari only opens the keyboard for focus() within the user gesture.

  const hasQuery = normalize(query).trim().length > 1;

  // Portal to <body>: the sticky header is its own stacking context and would trap the overlay's z-index.
  return createPortal(
    <div
      className={`fixed inset-0 z-[100] flex flex-col bg-stone-950/95 backdrop-blur-sm transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onKeyDown={onKeyDown}
      role="dialog"
      aria-modal="true"
      aria-label="Pretraga"
      aria-hidden={!open}
    >
      {/* Search field */}
      <div className="border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 flex items-center gap-3 h-16 md:h-20">
          <Search size={22} className="text-geo-green flex-shrink-0" />
          <input
            ref={inputRef}
            id={SEARCH_INPUT_ID}
            tabIndex={open ? 0 : -1}
            value={query}
            onChange={e => setQuery(e.target.value)}
            type="search"
            enterKeyHint="search"
            placeholder="Pretraži članke, teme, autore…"
            className="flex-1 min-w-0 bg-transparent text-white text-lg md:text-2xl font-serif placeholder:text-stone-500 outline-none"
            aria-label="Pojam za pretragu"
          />
          <button onClick={onClose} className="p-2 -mr-2 text-stone-400 hover:text-white" aria-label="Zatvori pretragu">
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="max-w-3xl mx-auto px-4 py-4 md:py-6">
          {!hasQuery && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-stone-500 mb-3">Teme</p>
              <div className="flex flex-wrap gap-2">
                {categories.map(c => (
                  <button key={c.id} onClick={() => openResult({ kind: 'category', category: c, count: 0 })}
                    className="px-3 py-1.5 border border-white/15 text-stone-300 text-sm hover:border-geo-green hover:text-white transition-colors">
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {hasQuery && results.length === 0 && (
            <p className="text-stone-400 py-10 text-center">Nema rezultata za „{query.trim()}”.</p>
          )}

          {hasQuery && results.length > 0 && (
            <>
              <p className="text-[11px] font-bold uppercase tracking-widest text-stone-500 mb-2">
                {results.length} {results.length === 1 ? 'rezultat' : 'rezultata'}
              </p>
              <ul className="divide-y divide-white/10">
                {results.map((result, index) => (
                  <li key={result.kind === 'category' ? `c-${result.category.id}` : `a-${result.article.id}`}>
                    <button
                      onClick={() => openResult(result)}
                      onMouseEnter={() => setActive(index)}
                      className={`w-full flex gap-3 md:gap-4 py-3 px-2 -mx-2 text-left transition-colors ${index === active ? 'bg-white/5' : ''}`}
                    >
                      {result.kind === 'category' ? (
                        <>
                          <div className={`w-14 h-14 md:w-16 md:h-16 flex-shrink-0 ${result.category.color} flex items-center justify-center font-serif font-black text-2xl text-white`}>
                            {result.category.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0 self-center">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-geo-green">Tema</p>
                            <p className="text-white font-serif font-bold text-lg">{result.category.name}</p>
                            <p className="text-stone-500 text-xs">{result.count} priča</p>
                          </div>
                          <ArrowRight size={18} className="self-center text-stone-600" />
                        </>
                      ) : (
                        <>
                          <img src={result.article.imageUrl} alt="" loading="lazy" className="w-20 h-14 md:w-28 md:h-20 object-cover flex-shrink-0 bg-stone-800" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-geo-green">{categoryName(result.article.categoryId)}</p>
                            <p className="text-white font-serif font-bold leading-snug line-clamp-2">{result.article.title}</p>
                            <p className="hidden md:block text-stone-400 text-sm line-clamp-2 mt-1">{result.snippet}</p>
                            <p className="flex items-center gap-1 text-stone-500 text-xs mt-1"><Clock size={11} /> {result.article.readTime} min</p>
                          </div>
                        </>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
};

/** Lets other components (e.g. the bottom nav) open the header's search. */
export const OPEN_SEARCH_EVENT = 'geovizija:open-search';
const SEARCH_INPUT_ID = 'geovizija-search-input';

/** Call directly from a click/tap handler: focusing synchronously is what opens the mobile keyboard. */
export const openSearch = () => {
  document.getElementById(SEARCH_INPUT_ID)?.focus({ preventScroll: true });
  window.dispatchEvent(new Event(OPEN_SEARCH_EVENT));
};
