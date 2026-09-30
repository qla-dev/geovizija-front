// Quiz results are kept per browser (no accounts yet).
const KEY = 'geovizija_quiz_results';

export interface QuizResult {
  score: number;
  total: number;
  answers: number[]; // chosen option index per question
  finishedAt: string;
}

const readAll = (): Record<string, QuizResult> => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
};

export const getQuizResult = (date: string): QuizResult | undefined => readAll()[date];

export const getAllQuizResults = readAll;

export const saveQuizResult = (date: string, result: QuizResult) => {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...readAll(), [date]: result }));
  } catch {
    // storage unavailable (private mode): the result just isn't remembered
  }
};

/** Consecutive days, ending today or yesterday, with a finished quiz. */
export const currentStreak = (today: string): number => {
  const results = readAll();
  const day = new Date(`${today}T12:00:00`);
  if (!results[today]) day.setDate(day.getDate() - 1);
  let streak = 0;
  while (results[day.toISOString().slice(0, 10)]) {
    streak++;
    day.setDate(day.getDate() - 1);
  }
  return streak;
};

const MONTHS = ['Januar', 'Februar', 'Mart', 'April', 'Maj', 'Juni', 'Juli', 'August', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'];

export const formatQuizDate = (date: string) => {
  const [y, m, d] = date.split('-').map(Number);
  return `${d}. ${MONTHS[m - 1]} ${y}`;
};
