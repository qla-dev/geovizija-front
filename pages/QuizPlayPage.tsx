import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, X, Trophy, RotateCcw, Share2 } from 'lucide-react';
import { SEO } from '../components/SEO';
import { api } from '../services/api';
import { Quiz } from '../types';
import { formatQuizDate, getQuizResult, QuizResult, saveQuizResult } from '../services/quizResults';

const LETTERS = ['A', 'B', 'C', 'D'];

const verdict = (score: number, total: number) => {
  const ratio = score / total;
  if (ratio === 1) return 'Savršeno! Pravi istraživač.';
  if (ratio >= 0.8) return 'Odlično! Svijet ti je na dlanu.';
  if (ratio >= 0.5) return 'Solidno! Još malo do vrha.';
  return 'Svaki dan je nova prilika. Vrati se sutra!';
};

export const QuizPlayPage: React.FC = () => {
  const { date = 'today' } = useParams<{ date: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<QuizResult | undefined>();
  const [reviewing, setReviewing] = useState(false);

  const load = () => {
    setError(null);
    api.quiz(date)
      .then(q => {
        setQuiz(q);
        // A finished quiz opens on its result instead of replaying.
        const saved = getQuizResult(q.date);
        if (saved) { setResult(saved); setAnswers(saved.answers); }
        if (date === 'today') navigate(`/quiz/${q.date}`, { replace: true });
      })
      // 503 carries a friendly message from the API; other server errors must not show raw details
      .catch((e: Error & { status?: number }) => setError(e.status === 503 || (e.status && e.status < 500) ? e.message : 'Kviz trenutno nije dostupan. Pokušajte ponovo malo kasnije.'));
  };

  useEffect(load, [date]);

  if (error) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 p-8 text-center bg-stone-100">
        <p className="text-stone-700">{error}</p>
        <button onClick={load} className="px-6 py-3 bg-stone-900 text-white text-xs font-bold uppercase tracking-widest">Pokušaj ponovo</button>
        <Link to="/quiz" className="text-sm text-stone-500 underline">Nazad na kvizove</Link>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-5 bg-stone-950 text-white p-8 text-center">
        <div className="w-12 h-12 border-4 border-stone-700 border-t-geo-green rounded-full animate-spin" />
        <p className="font-serif text-xl">Pripremamo kviz…</p>
        <p className="text-stone-500 text-sm max-w-xs">Prvi posjetilac dana pokreće novi kviz, što može potrajati do pola minute.</p>
      </div>
    );
  }

  const total = quiz.questions.length;
  const finish = (finalAnswers: number[]) => {
    const score = finalAnswers.filter((a, i) => a === quiz.questions[i].correctIndex).length;
    const saved = { score, total, answers: finalAnswers, finishedAt: new Date().toISOString() };
    saveQuizResult(quiz.date, saved);
    setResult(saved);
  };

  // --- Result screen ---
  if (result && !reviewing) {
    const percent = Math.round((result.score / result.total) * 100);
    const shareText = `Geovizija kviz ${formatQuizDate(quiz.date)}: ${result.score}/${result.total} 🌍`;
    return (
      <div className="animate-fade-in min-h-[80vh] bg-stone-950 text-white">
        <SEO title={`Rezultat: ${result.score}/${result.total} | Geovizija kviz`} />
        <div className="max-w-xl mx-auto px-4 py-10 md:py-16 text-center">
          <p className="text-geo-green text-xs font-bold uppercase tracking-[0.25em]">{formatQuizDate(quiz.date)}</p>
          <h1 className="font-serif font-black text-3xl md:text-4xl mt-2">{quiz.title}</h1>

          <div className="relative w-44 h-44 mx-auto my-8">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="44" fill="none" stroke="#292524" strokeWidth="8" />
              <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round"
                className="text-geo-green transition-all duration-1000" strokeDasharray={`${percent * 2.764} 276.4`} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Trophy size={22} className="text-geo-green mb-1" />
              <span className="font-serif font-black text-5xl leading-none">{result.score}</span>
              <span className="text-stone-500 text-sm">od {result.total}</span>
            </div>
          </div>

          <p className="font-serif text-xl">{verdict(result.score, result.total)}</p>

          <div className="mt-8 grid grid-cols-10 gap-1.5 max-w-xs mx-auto">
            {quiz.questions.map((q, i) => (
              <span key={q.id} className={`aspect-square rounded-sm ${result.answers[i] === q.correctIndex ? 'bg-geo-green' : 'bg-rose-500/80'}`} />
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-3">
            <button onClick={() => { setReviewing(true); setIndex(0); }} className="flex items-center justify-center gap-2 py-4 bg-white text-stone-900 font-black uppercase tracking-widest text-xs">
              <RotateCcw size={16} /> Pregledaj odgovore
            </button>
            {typeof navigator.share === 'function' && (
              <button onClick={() => navigator.share({ text: shareText, url: window.location.href }).catch(() => {})} className="flex items-center justify-center gap-2 py-4 border border-white/20 font-bold uppercase tracking-widest text-xs">
                <Share2 size={16} /> Podijeli rezultat
              </button>
            )}
            <Link to="/quiz" className="py-3 text-stone-400 text-sm hover:text-white">Svi kvizovi</Link>
          </div>
        </div>
      </div>
    );
  }

  // --- Question screen (play or review) ---
  const question = quiz.questions[index];
  const chosen = answers[index];
  const answered = chosen !== undefined;

  const choose = (option: number) => {
    if (answered || reviewing) return;
    const next = [...answers];
    next[index] = option;
    setAnswers(next);
  };

  const goNext = () => {
    if (index < total - 1) setIndex(index + 1);
    else if (reviewing) setReviewing(false);
    else finish(answers);
  };

  const optionStyle = (option: number) => {
    if (!answered) return 'bg-white border-stone-200 text-stone-900 hover:border-stone-900 active:scale-[0.99]';
    if (option === question.correctIndex) return 'bg-geo-green/10 border-geo-green text-stone-900';
    if (option === chosen) return 'bg-rose-50 border-rose-400 text-stone-900';
    return 'bg-white border-stone-200 text-stone-400';
  };

  return (
    <div className="animate-fade-in min-h-[80vh] bg-stone-100">
      <SEO title={`${quiz.title} | Geovizija kviz`} />

      {/* Progress */}
      <div className="bg-stone-950 text-white">
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-5">
          <div className="flex items-center justify-between text-xs uppercase tracking-widest">
            <Link to="/quiz" className="flex items-center gap-1 text-stone-400 hover:text-white" aria-label="Nazad na kvizove">
              <ArrowLeft size={16} /> Kvizovi
            </Link>
            <span className="text-stone-400">{reviewing ? 'Pregled · ' : ''}<span className="text-white font-bold">{index + 1}</span> / {total}</span>
          </div>
          <div className="mt-4 grid gap-1" style={{ gridTemplateColumns: `repeat(${total}, 1fr)` }}>
            {quiz.questions.map((q, i) => {
              const a = answers[i];
              const color = a === undefined ? (i === index ? 'bg-white' : 'bg-stone-700')
                : a === q.correctIndex ? 'bg-geo-green' : 'bg-rose-500';
              return <span key={q.id} className={`h-1.5 rounded-full transition-colors ${color} ${i === index ? 'ring-2 ring-white/30' : ''}`} />;
            })}
          </div>
        </div>
      </div>

      <div key={index} className={`max-w-2xl mx-auto px-4 pt-6 md:py-10 animate-fade-in ${answered ? 'pb-28 md:pb-10' : 'pb-6'}`}>
        {question.topic && <p className="text-[11px] font-bold uppercase tracking-widest text-geo-green">{question.topic}</p>}
        <h1 className="font-serif font-bold text-2xl md:text-3xl text-stone-900 leading-snug mt-2">{question.question}</h1>

        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-1">
          {question.options.map((option, i) => (
            <button
              key={i}
              onClick={() => choose(i)}
              disabled={answered}
              className={`flex flex-col items-start gap-3 min-h-[120px] md:min-h-0 md:flex-row md:items-center md:gap-4 w-full text-left border-2 p-3 md:px-4 md:py-4 transition-all ${optionStyle(i)}`}
            >
              <span className={`w-8 h-8 flex-shrink-0 flex items-center justify-center text-xs font-black rounded-full ${
                answered && i === question.correctIndex ? 'bg-geo-green text-white'
                  : answered && i === chosen ? 'bg-rose-500 text-white' : 'bg-stone-100 text-stone-500'}`}>
                {answered && i === question.correctIndex ? <Check size={16} /> : answered && i === chosen ? <X size={16} /> : LETTERS[i]}
              </span>
              <span className="font-medium leading-snug text-[15px] md:text-base">{option}</span>
            </button>
          ))}
        </div>

        {answered && (
          <div className="mt-6 animate-fade-in">
            <div className={`border-l-4 px-4 py-3 bg-white ${chosen === question.correctIndex ? 'border-geo-green' : 'border-rose-400'}`}>
              <p className={`text-xs font-black uppercase tracking-widest ${chosen === question.correctIndex ? 'text-geo-green' : 'text-rose-500'}`}>
                {chosen === question.correctIndex ? 'Tačno!' : 'Netačno'}
              </p>
              {question.explanation && <p className="text-stone-700 text-sm leading-relaxed mt-1">{question.explanation}</p>}
            </div>

            <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-40 px-4 py-3 bg-stone-100/95 backdrop-blur-sm border-t border-stone-200 md:static md:p-0 md:mt-5 md:bg-transparent md:border-0 md:backdrop-blur-none">
            <button onClick={goNext} className="w-full flex items-center justify-center gap-2 bg-stone-950 text-white py-4 font-black uppercase tracking-widest text-xs shadow-lg md:shadow-none hover:bg-geo-green hover:text-stone-950 transition-colors">
              {index < total - 1 ? <>Sljedeće pitanje <ArrowRight size={16} /></> : reviewing ? 'Nazad na rezultat' : <>Pogledaj rezultat <Trophy size={16} /></>}
            </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
