export type PageType =
  | 'login'
  | 'register'
  | 'dashboard'
  | 'my-documents'
  | 'study-assistant'
  | 'quiz'
  | 'ask-ai';

export interface User {
  id: string | number;
  email: string;
  fullName: string;
  studentId?: string;
  major?: string;
  classYear?: string;
  token?: string;
}

export interface DocumentItem {
  id: number | string;
  title: string;
  fileSize: string;
  pageCount: number;
  uploadDate: string;
  status: 'ready' | 'processing' | 'error';
  progress?: number;
  fileUrl?: string;
}

export interface SummaryTopic {
  id: string;
  title: string;
  content: string;
}

export interface DocumentSummary {
  documentId: number | string;
  documentTitle: string;
  executiveOverview: string;
  topics: SummaryTopic[];
}

export interface StudyQuestion {
  id: number;
  question: string;
  answer: string;
  topic?: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: {
    key: 'A' | 'B' | 'C' | 'D';
    text: string;
  }[];
  correctKey: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

export interface QuizSubmission {
  selectedAnswers: Record<number, 'A' | 'B' | 'C' | 'D'>;
  score: number;
  total: number;
  completedAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  citations?: string[];
  documentId?: number | string;
}

export interface ApiContractSpec {
  method: 'GET' | 'POST' | 'DELETE' | 'PUT';
  path: string;
  details: string;
}