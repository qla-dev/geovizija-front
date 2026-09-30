import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Article, Category } from '../types';
import { api } from '../services/api';

interface Content {
  articles: Article[];
  categories: Category[];
}

const ContentContext = createContext<Content>({ articles: [], categories: [] });

/** Loads categories and published posts from the Laravel API once for the whole site. */
export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<Content | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setError(null);
    Promise.all([api.categories(), api.posts()])
      .then(([categories, articles]) => setContent({ categories, articles }))
      .catch((e: Error) => setError(e.message));
  }, []);

  useEffect(load, [load]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-stone-100 p-8 text-center">
        <p className="text-stone-700">Sadržaj trenutno nije dostupan.</p>
        <p className="text-sm text-stone-500">{error}</p>
        <button onClick={load} className="px-5 py-2 bg-geo-green text-white font-bold">Pokušaj ponovo</button>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100">
        <div className="w-10 h-10 border-4 border-stone-300 border-t-geo-green rounded-full animate-spin" />
      </div>
    );
  }

  return <ContentContext.Provider value={content}>{children}</ContentContext.Provider>;
};

export const useContent = () => useContext(ContentContext);
