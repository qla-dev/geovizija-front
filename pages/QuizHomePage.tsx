import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Flame, Trophy, ChevronRight, Check, Play, RotateCcw } from 'lucide-react';
import { SEO } from '../components/SEO';
import { api } from '../services/api';
import { QuizSummary } from '../types';
import { currentStreak, formatQuizDate, getAllQuizResults } from '../services/quizResults';

export const QuizHomePage: React.FC = () => {
  const [quizzes, setQuizzes] = useState<QuizSummary[] | null>(null);
  const [today, setToday] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const results = getAllQuizResults();

  useEffect(() => {
    api.quizzes()
      .then(({ quizzes, today }) => { setQuizzes(quizzes); setToday(today); })
      .catch((e: Error) => setError(e.message));
  }, []);

  const todayQuiz = quizzes?.find(q => q.date === today);
  const todayResult = today ? results[today] : undefined;
  const past = (quizzes ?? []).filter(q => q.date !== today);
  const played = Object.values(results);
  const streak = today ? currentStreak(today) : 0;
  const average = played.length ? Math.round(played.reduce((sum, r) => sum + (r.score / r.total) * 100, 0) / played.length) : null;

  return (
    <div className="animate-fade-in bg-stone-100 min-h-screen">
      <SEO title="Dnevni kviz | Geovizija" description="Svaki dan novih 10 pitanja o prirodi, geografiji i svijetu oko nas." />

      {/* Hero: today's quiz */}
      <section className="relative overflow-hidden bg-stone-950 text-white">
        <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-geo-green/20 blur-3xl" />
        <div className="absolute -left-20 bottom-0 w-64 h-64 rounded-full bg-emerald-700/20 blur-3xl" />
        <div className="relative max-w-3xl mx-auto px-4 py-8 md:py-12">
          <p className="flex items-center gap-2 text-geo-green text-xs font-bold uppercase tracking-[0.25em]">
            <Brain size={14} /> Dnevni kviz
          </p>
          <h1 className="font-serif font-black text-4xl md:text-6xl leading-none mt-3">
            {todayQuiz?.title ?? 'Današnji kviz'}
          </h1>
          <p className="text-stone-400 mt-3 max-w-xl leading-relaxed">
            {todayQuiz?.intro ?? 'Svaki dan 10 novih pitanja o prirodi, geografiji i svijetu oko nas.'}
          </p>

          <div className="mt-6 flex items-center gap-3 text-xs uppercase tracking-widest text-stone-500">
            {today && <span>{formatQuizDate(today)}</span>}
            <span className="w-px h-3 bg-stone-700" />
            <span>10 pitanja</span>
          </div>

          <div className="mt-7">
            {todayResult ? (
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-5 py-4 flex-1">
                  <Trophy className="text-geo-green" size={28} />
                  <div>
                    <p className="text-[11px] uppercase tracking-widest text-stone-400">Tvoj rezultat danas</p>
                    <p className="font-serif font-black text-3xl leading-none mt-1">{todayResult.score}<span className="text-stone-500 text-xl">/{todayResult.total}</span></p>
                  </div>
                </div>
                <Link to={`/quiz/${today}`} className="flex items-center justify-center gap-2 px-6 py-4 border border-white/20 font-bold uppercase tracking-widest text-xs hover:bg-white hover:text-stone-900 transition-colors">
                  <RotateCcw size={16} /> Pregledaj odgovore
                </Link>
              </div>
            ) : (
              <Link to="/quiz/today" className="group inline-flex w-full sm:w-auto items-center justify-center gap-3 bg-geo-green text-stone-950 px-8 py-4 font-black uppercase tracking-widest text-sm hover:bg-white transition-colors">
                <Play size={18} fill="currentColor" /> Započni današnji kviz
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-3xl mx-auto px-4 -mt-px">
        <div className="grid grid-cols-3 bg-white border-x border-b border-stone-200 divide-x divide-stone-200">
          {[
            { icon: Flame, label: 'Niz dana', value: streak },
            { icon: Check, label: 'Odigrano', value: played.length },
            { icon: Trophy, label: 'Prosjek', value: average === null ? '–' : `${average}%` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="py-4 text-center">
              <Icon size={16} className="mx-auto text-geo-green mb-1" />
              <p className="font-serif font-black text-2xl text-stone-900 leading-none">{value}</p>
              <p className="text-[10px] uppercase tracking-widest text-stone-400 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Archive */}
      <section className="max-w-3xl mx-auto px-4 py-8 md:py-12">
        <h2 className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-3">Prethodni kvizovi</h2>

        {error && <p className="text-stone-500 bg-white border border-stone-200 p-6 text-center">Kvizovi trenutno nisu dostupni.</p>}
        {!error && quizzes === null && <div className="h-32 bg-white border border-stone-200 animate-pulse" />}
        {quizzes !== null && past.length === 0 && (
          <p className="text-stone-500 bg-white border border-stone-200 p-6 text-center">Ovo je prvi kviz. Vrati se sutra po novi!</p>
        )}

        {past.length > 0 && (
          <ul className="bg-white border border-stone-200 divide-y divide-stone-100">
            {past.map(quiz => {
              const result = results[quiz.date];
              return (
                <li key={quiz.date}>
                  <Link to={`/quiz/${quiz.date}`} className="flex items-center gap-4 px-4 py-4 hover:bg-stone-50 transition-colors">
                    <div className="w-12 h-12 flex-shrink-0 bg-stone-900 text-white flex flex-col items-center justify-center leading-none">
                      <span className="font-serif font-black text-lg">{Number(quiz.date.slice(8))}</span>
                      <span className="text-[9px] uppercase tracking-widest text-stone-400">{formatQuizDate(quiz.date).split(' ')[1].slice(0, 3)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-serif font-bold text-stone-900 leading-snug truncate">{quiz.title}</p>
                      <p className="text-xs text-stone-400 mt-0.5">{formatQuizDate(quiz.date)}</p>
                    </div>
                    {result ? (
                      <span className="text-sm font-black text-geo-green whitespace-nowrap">{result.score}/{result.total}</span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Igraj</span>
                    )}
                    <ChevronRight size={18} className="text-stone-300 flex-shrink-0" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
};
