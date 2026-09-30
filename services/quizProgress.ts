import { useSyncExternalStore } from 'react';

// Lets the quiz page drive the header's bottom border as a stepper.
export interface QuizProgress {
  current: number; // index of the question on screen
  results: (boolean | null)[]; // per question: true correct, false wrong, null unanswered
}

let progress: QuizProgress | null = null;
const listeners = new Set<() => void>();

export const setQuizProgress = (next: QuizProgress | null) => {
  progress = next;
  listeners.forEach(listener => listener());
};

export const useQuizProgress = () =>
  useSyncExternalStore(
    listener => { listeners.add(listener); return () => listeners.delete(listener); },
    () => progress,
  );
