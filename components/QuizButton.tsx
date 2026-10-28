import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Brain } from 'lucide-react';

// Shortcut to today's quiz, fixed bottom-left on every page; on mobile it sits above the BottomNav bar.
export const QuizButton: React.FC = () => {
  const { pathname } = useLocation();
  if (pathname.startsWith('/quiz')) return null;

  return (
    <Link
      to="/quiz/today"
      className="flex fixed left-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] md:left-5 md:bottom-5 z-40 items-center gap-2 bg-geo-green text-stone-950 px-5 py-3 font-black uppercase tracking-widest text-xs shadow-lg hover:bg-stone-950 hover:text-white transition-colors"
    >
      <Brain size={18} strokeWidth={2.5} />
      Počni današnji kviz
    </Link>
  );
};
