import React, { useEffect, useState } from 'react';
import { DocumentItem } from '../types';
import { api, getApiBaseUrl } from '../services/api';

import {
  Sparkles,
  BookOpen,
  HelpCircle,
  MessageSquare,
  ChevronDown,
  RefreshCw,
  AlertCircle,
  FolderOpen,
  ArrowRight,
  Send,
} from 'lucide-react';

interface StudyAssistantPageProps {
  documents: DocumentItem[];
  selectedDocument: DocumentItem | null;
  onSelectDocument: (doc: DocumentItem) => void;
  onNavigateToAskAi: (doc: DocumentItem) => void;
  onNavigateToQuiz: (doc: DocumentItem) => void;
}

interface Topic {
  id: number;
  title: string;
  content: string;
}

interface SummaryData {
  document_id: number;
  filename: string;
  summary: string;
}

interface QuestionData {
  question: string;
  answer: string;
  topic?: string;
}

export const StudyAssistantPage: React.FC<StudyAssistantPageProps> = ({
  documents,
  selectedDocument,
  onSelectDocument,
  onNavigateToAskAi,
  onNavigateToQuiz,
}) => {
  const [activeDoc, setActiveDoc] = useState<DocumentItem | null>(
    selectedDocument
  );

  const [summary, setSummary] = useState<string>('');
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [customQuery, setCustomQuery] = useState('');
  const [customAnswer, setCustomAnswer] = useState<string>('');

  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [loadingAsk, setLoadingAsk] = useState(false);

  const [error, setError] = useState<string>('');
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(0);

  useEffect(() => {
    setActiveDoc(selectedDocument);
    setSummary('');
    setQuestions([]);
    setCustomAnswer('');
    setError('');
    setExpandedQuestion(0);
  }, [selectedDocument]);

  const handleDocChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const found = documents.find(
      (doc) => String(doc.id) === e.target.value
    );

    if (found) {
      setActiveDoc(found);
      onSelectDocument(found);

      // IMPORTANT:
      // Clear all results when switching documents.
      setSummary('');
      setQuestions([]);
      setCustomAnswer('');
      setError('');
      setExpandedQuestion(0);
    }
  };

  const getToken = () => {
    return api.getStoredToken();
  };

  const generateSummary = async () => {
    if (!activeDoc) {
      setError('Please select a document first.');
      return;
    }

    const token = getToken();

    if (!token) {
      setError('Your session has expired. Please log in again.');
      return;
    }

    setLoadingSummary(true);
    setError('');
    setSummary('');

    try {
      const response = await fetch(
        `${getApiBaseUrl()}/study/${activeDoc.id}/summary`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.detail || 'Failed to generate summary.'
        );
      }

      const data: SummaryData = await response.json();

      setSummary(data.summary || 'No summary was returned.');
    } catch (err) {
      console.error('Summary generation failed:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to generate summary.'
      );
    } finally {
      setLoadingSummary(false);
    }
  };

  const generateQuestions = async () => {
    if (!activeDoc) {
      setError('Please select a document first.');
      return;
    }

    const token = getToken();

    if (!token) {
      setError('Your session has expired. Please log in again.');
      return;
    }

    setLoadingQuestions(true);
    setError('');
    setQuestions([]);

    try {
      const response = await fetch(
        `${getApiBaseUrl()}/study/${activeDoc.id}/questions`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.detail || 'Failed to generate questions.'
        );
      }

      const data = await response.json();

      const receivedQuestions = Array.isArray(data.questions)
        ? data.questions
        : [];

      setQuestions(receivedQuestions);
      setExpandedQuestion(
        receivedQuestions.length > 0 ? 0 : null
      );
    } catch (err) {
      console.error('Question generation failed:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to generate questions.'
      );
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleAskPrompt = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!activeDoc) {
      setError('Please select a document first.');
      return;
    }

    if (!customQuery.trim()) {
      return;
    }

    const token = getToken();

    if (!token) {
      setError('Your session has expired. Please log in again.');
      return;
    }

    setLoadingAsk(true);
    setError('');
    setCustomAnswer('');

    try {
      const response = await fetch(
        `${getApiBaseUrl()}/study/${activeDoc.id}/ask`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question: customQuery.trim(),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.detail || 'Failed to answer your question.'
        );
      }

      const data = await response.json();

      setCustomAnswer(
        data.answer || 'No answer was returned.'
      );
    } catch (err) {
      console.error('Ask AI failed:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to answer your question.'
      );
    } finally {
      setLoadingAsk(false);
    }
  };

  if (documents.length === 0) {
    return (
      <div className="w-full max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#eff4ff] text-[#3525cd] flex items-center justify-center mb-4">
            <FolderOpen className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold text-[#0b1c30]">
            No documents yet
          </h2>

          <p className="text-sm text-slate-500 mt-2">
            Upload a PDF from My Documents to start studying with AI.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">

      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0b1c30]">
            Study Assistant
          </h1>

          <span className="px-2.5 py-0.5 rounded-full bg-[#eff4ff] text-[#3525cd] text-xs font-semibold">
            AI Study Tools
          </span>
        </div>

        <p className="text-sm text-slate-500 mt-1">
          Learn smarter from your uploaded notes.
        </p>
      </div>

      {/* Document Selector */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

          <div>
            <h2 className="text-sm font-bold text-[#0b1c30]">
              Select your document
            </h2>

            <p className="text-xs text-slate-500 mt-1">
              AI will use the selected document for all study actions.
            </p>
          </div>

          <div className="relative w-full md:w-[380px]">
            <select
              value={activeDoc?.id ?? ''}
              onChange={handleDocChange}
              className="w-full h-11 px-4 pr-10 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-[#0b1c30] focus:outline-none focus:border-[#3525cd] appearance-none cursor-pointer"
            >
              {documents.map((doc) => (
                <option
                  key={doc.id}
                  value={doc.id}
                >
                  {doc.title || doc.filename || `Document ${doc.id}`}
                </option>
              ))}
            </select>

            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />

          <div>
            <p className="text-sm font-semibold text-red-700">
              Something went wrong
            </p>

            <p className="text-xs text-red-600 mt-1">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Summary */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[#eff4ff] text-[#3525cd] flex items-center justify-center mb-3">
            <BookOpen className="w-5 h-5" />
          </div>

          <h3 className="text-base font-bold text-[#0b1c30]">
            Summarize Notes
          </h3>

          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Get a clear summary generated from your selected PDF.
          </p>

          <button
            type="button"
            onClick={generateSummary}
            disabled={loadingSummary || !activeDoc}
            className="mt-4 w-full py-2.5 rounded-xl bg-[#3525cd] hover:bg-[#4f46e5] disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2"
          >
            {loadingSummary ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Summary
              </>
            )}
          </button>
        </div>

        {/* Questions */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[#e9ddff] text-[#6b38d4] flex items-center justify-center mb-3">
            <HelpCircle className="w-5 h-5" />
          </div>

          <h3 className="text-base font-bold text-[#0b1c30]">
            Generate Questions
          </h3>

          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Create practice questions directly from your notes.
          </p>

          <button
            type="button"
            onClick={generateQuestions}
            disabled={loadingQuestions || !activeDoc}
            className="mt-4 w-full py-2.5 rounded-xl bg-[#3525cd] hover:bg-[#4f46e5] disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2"
          >
            {loadingQuestions ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <HelpCircle className="w-4 h-4" />
                Generate Questions
              </>
            )}
          </button>
        </div>

        {/* Ask AI */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[#e2dfff] text-[#0f0069] flex items-center justify-center mb-3">
            <MessageSquare className="w-5 h-5" />
          </div>

          <h3 className="text-base font-bold text-[#0b1c30]">
            Ask About Your Notes
          </h3>

          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Ask questions and get answers based on your selected PDF.
          </p>

          <button
            type="button"
            onClick={() => {
              if (activeDoc) {
                onNavigateToAskAi(activeDoc);
              }
            }}
            disabled={!activeDoc}
            className="mt-4 w-full py-2.5 rounded-xl bg-[#3525cd] hover:bg-[#4f46e5] disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Ask AI
          </button>
        </div>

      </div>

      {/* Summary Result */}
      {summary && (
        <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200 shadow-sm">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-[#eff4ff] text-[#3525cd] flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>

              <div>
                <h2 className="text-lg sm:text-xl font-bold text-[#0b1c30]">
                  AI Summary
                </h2>

                <p className="text-xs text-slate-500 mt-0.5">
                  Generated from{' '}
                  {activeDoc?.title ||
                    activeDoc?.filename ||
                    'selected document'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={generateSummary}
              disabled={loadingSummary}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#eff4ff] hover:bg-slate-100 text-[#0b1c30] text-xs font-semibold"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  loadingSummary ? 'animate-spin' : ''
                }`}
              />
              Generate Again
            </button>
          </div>

          <div className="mt-5 p-5 rounded-2xl bg-[#eff4ff] border border-[#dce9ff]">
            <span className="text-[11px] font-bold text-[#3525cd] uppercase tracking-wider">
              Summary
            </span>

            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line mt-2">
              {summary}
            </p>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => {
                if (activeDoc) {
                  onNavigateToQuiz(activeDoc);
                }
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#3525cd] hover:bg-[#4f46e5] text-white rounded-xl text-xs font-semibold"
            >
              Take Practice Quiz
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* Questions Result */}
      {questions.length > 0 && (
        <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200 shadow-sm">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#e9ddff] text-[#6b38d4] flex items-center justify-center">
                <HelpCircle className="w-5 h-5" />
              </div>

              <div>
                <h2 className="text-lg sm:text-xl font-bold text-[#0b1c30]">
                  Study Questions
                </h2>

                <p className="text-xs text-slate-500 mt-0.5">
                  Generated from{' '}
                  {activeDoc?.title ||
                    activeDoc?.filename ||
                    'selected document'}
                </p>
              </div>
            </div>

            <span className="text-xs font-semibold px-3 py-1 bg-[#eff4ff] text-[#3525cd] rounded-full">
              {questions.length} Questions
            </span>

          </div>

          <div className="mt-5 flex flex-col gap-3">

            {questions.map((question, index) => {
              const isExpanded =
                expandedQuestion === index;

              return (
                <div
                  key={index}
                  className="rounded-xl border border-slate-200 overflow-hidden"
                >

                  <button
                    type="button"
                    onClick={() =>
                      setExpandedQuestion(
                        isExpanded ? null : index
                      )
                    }
                    className="w-full p-4 text-left flex items-start justify-between gap-3 hover:bg-slate-50"
                  >

                    <div className="flex items-start gap-3">

                      <span className="w-7 h-7 rounded-full bg-[#eff4ff] text-[#3525cd] text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {index + 1}
                      </span>

                      <span className="text-sm font-semibold text-[#0b1c30]">
                        {question.question}
                      </span>

                    </div>

                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />

                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 bg-[#eff4ff]/40 border-t border-slate-100">

                      <p className="text-[11px] font-bold text-[#6b38d4] uppercase tracking-wider mb-2">
                        Answer
                      </p>

                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                        {question.answer}
                      </p>

                      {question.topic && (
                        <div className="mt-3">
                          <span className="text-[10px] text-slate-500">
                            Topic:{' '}
                          </span>

                          <span className="text-[10px] font-semibold bg-white border border-slate-200 px-2 py-1 rounded-full">
                            {question.topic}
                          </span>
                        </div>
                      )}

                    </div>
                  )}

                </div>
              );
            })}

          </div>

        </div>
      )}

      {/* Ask AI directly on this page */}
      <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200 shadow-sm">

        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">

          <div className="w-10 h-10 rounded-xl bg-[#e2dfff] text-[#0f0069] flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>

          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#0b1c30]">
              Ask About Your Notes
            </h2>

            <p className="text-xs text-slate-500 mt-0.5">
              Ask anything about the selected document.
            </p>
          </div>

        </div>

        <form
          onSubmit={handleAskPrompt}
          className="mt-5 flex flex-col gap-3"
        >

          <label className="text-xs font-bold text-slate-700">
            Your Question
          </label>

          <div className="flex flex-col sm:flex-row gap-2">

            <input
              type="text"
              value={customQuery}
              onChange={(e) =>
                setCustomQuery(e.target.value)
              }
              placeholder="Ask something about your notes..."
              className="flex-1 h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm text-[#0b1c30] placeholder:text-slate-400 focus:outline-none focus:border-[#3525cd]"
            />

            <button
              type="submit"
              disabled={
                loadingAsk ||
                !activeDoc ||
                !customQuery.trim()
              }
              className="px-5 h-11 bg-[#3525cd] hover:bg-[#4f46e5] disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
            >
              {loadingAsk ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}

              {loadingAsk ? 'Thinking...' : 'Ask AI'}
            </button>

          </div>

        </form>

        {customAnswer && (
          <div className="mt-5 p-5 rounded-2xl bg-[#eff4ff] border border-[#dce9ff]">

            <div className="flex items-center gap-2 text-[#3525cd] font-bold text-xs mb-2">
              <Sparkles className="w-4 h-4" />
              AI Answer
            </div>

            <p className="text-sm text-slate-800 whitespace-pre-line leading-relaxed">
              {customAnswer}
            </p>

          </div>
        )}

      </div>

    </div>
  );
};