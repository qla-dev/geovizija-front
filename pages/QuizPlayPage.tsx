import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { setQuizProgress } from '../services/quizProgress';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, X, Trophy, RotateCcw, Share2 } from 'lucide-react';
import { SEO } from '../components/SEO';
import { AdSlot } from '../components/AdSlot';
import { api } from '../services/api';
import { Quiz } from '../types';
import { formatQuizDate, getQuizResult, QuizResult, saveQuizResult } from '../services/quizResults';

const LETTERS = ['A', 'B', 'C', 'D'];
const FLASH_MS = 3000;

interface FlashProps {
  correct: boolean;
  answer: string;
  explanation: string | null;
}

/** Full-screen right/wrong flash with the explanation; closes after 3s or on tap. */
const AnswerFlash: React.FC<FlashProps & { onClose: () => void }> = ({ correct, answer, explanation, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, FLASH_MS);
    return () => clearTimeout(timer);
  }, [onClose]);

  return createPortal(
    <div
      onClick={onClose}
      role="alertdialog"
      aria-live="assertive"
      className={`fixed inset-0 z-[110] flex flex-col items-center justify-center px-6 text-center text-white cursor-pointer animate-flash-in ${
        correct ? 'bg-gradient-to-b from-emerald-500 to-emerald-700' : 'bg-gradient-to-b from-rose-500 to-rose-700'
      }`}
    >
      <div className="w-28 h-28 rounded-full bg-white/20 ring-8 ring-white/10 flex items-center justify-center animate-flash-pop">
        {correct ? <Check size={64} strokeWidth={3} /> : <X size={64} strokeWidth={3} />}
      </div>
      <p className="mt-8 font-serif font-black text-5xl">{correct ? 'Tačno!' : 'Netačno'}</p>
      {!correct && (
        <p className="mt-3 text-white/80 text-sm uppercase tracking-widest">
          Tačan odgovor: <span className="text-white font-bold normal-case tracking-normal text-base">{answer}</span>
        </p>
      )}
      {explanation && <p className="mt-6 max-w-md text-lg leading-relaxed text-white/95">{explanation}</p>}
      <p className="mt-10 text-[11px] uppercase tracking-widest text-white/60">Dodirni za nastavak</p>

      {/* 3s countdown */}
      <div className="absolute inset-x-0 bottom-0 h-1.5 bg-white/20">
        <div className="h-full bg-white animate-flash-countdown" />
      </div>
    </div>,
    document.body,
  );
};

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
  const [flash, setFlash] = useState<FlashProps | null>(null);
  const closeFlash = useCallback(() => setFlash(null), []);

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

  // Drive the header's bottom-border stepper while a question is on screen
  const showingQuestions = quiz !== null && (!result || reviewing);
  useEffect(() => {
    setQuizProgress(showingQuestions && quiz
      ? { current: index, results: quiz.questions.map((q, i) => answers[i] === undefined ? null : answers[i] === q.correctIndex) }
      : null);
  }, [showingQuestions, quiz, index, answers]);
  useEffect(() => () => setQuizProgress(null), []);

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
    setFlash({
      correct: option === question.correctIndex,
      answer: question.options[question.correctIndex],
      explanation: question.explanation,
    });
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

      <div key={index} className={`max-w-2xl mx-auto px-4 pt-6 md:py-10 animate-fade-in ${answered ? 'pb-28 md:pb-10' : 'pb-6'}`}>
        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest">
          <Link to="/quiz" className="flex items-center gap-1 text-stone-400 hover:text-stone-900" aria-label="Nazad na kvizove">
            <ArrowLeft size={14} /> Kvizovi
          </Link>
          <span className="text-stone-400">{reviewing ? 'Pregled · ' : ''}<span className="text-stone-900">{index + 1}</span> / {total}</span>
        </div>
        {question.topic && <p className="mt-5 text-[11px] font-bold uppercase tracking-widest text-geo-green">{question.topic}</p>}
        <h1 className="font-serif font-bold text-2xl md:text-3xl text-stone-900 leading-snug mt-2">{question.question}</h1>

        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-1">
          {question.options.map((option, i) => (
            <button
              key={i}
              onClick={() => choose(i)}
              disabled={answered}
              className={`flex items-center gap-2.5 min-h-[64px] md:gap-4 w-full text-left border-2 p-2.5 md:px-4 md:py-4 transition-all ${optionStyle(i)}`}
            >
              <span className={`w-7 h-7 md:w-8 md:h-8 flex-shrink-0 flex items-center justify-center text-xs font-black rounded-full ${
                answered && i === question.correctIndex ? 'bg-geo-green text-white'
                  : answered && i === chosen ? 'bg-rose-500 text-white' : 'bg-stone-100 text-stone-500'}`}>
                {answered && i === question.correctIndex ? <Check size={16} /> : answered && i === chosen ? <X size={16} /> : LETTERS[i]}
              </span>
              <span className="font-medium leading-tight text-sm md:text-base">{option}</span>
            </button>
          ))}
        </div>

        {/* Ad below the answers */}
        <AdSlot className="mt-8" />

        {answered && (
          <div className="mt-6">
            <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-40 px-4 py-3 bg-stone-100/95 backdrop-blur-sm border-t border-stone-200 md:static md:p-0 md:mt-5 md:bg-transparent md:border-0 md:backdrop-blur-none">
            <button onClick={goNext} className="w-full flex items-center justify-center gap-2 bg-stone-950 text-white py-4 font-black uppercase tracking-widest text-xs shadow-lg md:shadow-none hover:bg-geo-green hover:text-stone-950 transition-colors">
              {index < total - 1 ? <>Sljedeće pitanje <ArrowRight size={16} /></> : reviewing ? 'Nazad na rezultat' : <>Pogledaj rezultat <Trophy size={16} /></>}
            </button>
            </div>
          </div>
        )}
      </div>

      {flash && <AnswerFlash {...flash} onClose={closeFlash} />}
    </div>
  );
};
