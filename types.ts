export enum CategoryId {
  PRIRODA = 'priroda',
  PUTOVANJA = 'putovanja',
  DRUSTVO = 'drustvo',
  STANOVNISTVO = 'stanovnistvo',
  KULTURA = 'kultura',
  ZANIMLJIVOSTI = 'zanimljivosti',
  TEHNOLOGIJA = 'tehnologija',
  SKOLSTVO = 'skolstvo'
}

export interface Category {
  id: CategoryId;
  name: string;
  color: string;
  imageUrl: string;
}

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string; // Full mock content
  categoryId: CategoryId;
  imageUrl: string;
  author: string;
  date: string;
  readTime: number;
  featured?: boolean;
}

export interface QuizSummary {
  date: string; // Y-m-d
  title: string;
  intro: string | null;
  questionsCount: number;
}

export interface QuizQuestion {
  id: number;
  topic: string | null;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string | null;
}

export interface Quiz extends QuizSummary {
  questions: QuizQuestion[];
}
