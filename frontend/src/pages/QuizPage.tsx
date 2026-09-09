import React, { useEffect, useState } from 'react';
import { DocumentItem, QuizQuestion } from '../types';
import { api } from '../services/api';

interface QuizPageProps {
  documents: DocumentItem[];
  selectedDocument: DocumentItem | null;
  onSelectDocument: (doc: DocumentItem) => void;
}

const QuizPage: React.FC<QuizPageProps> = ({
  documents,
  selectedDocument,
  onSelectDocument,
}) => {
  const [activeDoc, setActiveDoc] = useState<DocumentItem | null>(
    selectedDocument || documents[0] || null
  );

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, 'A' | 'B' | 'C' | 'D'>
  >({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (selectedDocument) {
      setActiveDoc(selectedDocument);
    }
  }, [selectedDocument]);

  const handleDocumentChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const doc = documents.find(
      (item) => String(item.id) === event.target.value
    );

    if (!doc) return;

    setActiveDoc(doc);
    onSelectDocument(doc);

    // Reset quiz when document changes
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setIsSubmitted(false);
    setError('');
  };

  const generateQuiz = async () => {
    if (!activeDoc) {
      setError('Please select a document first.');
      return;
    }

    setLoading(true);
    setError('');
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setIsSubmitted(false);

    try {
      const generatedQuestions = await api.getQuiz(activeDoc.id);

      if (!generatedQuestions || generatedQuestions.length === 0) {
        throw new Error('No quiz questions were generated.');
      }

      setQuestions(generatedQuestions);
    } catch (err) {
      console.error('Quiz generation failed:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to generate quiz. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (
    answer: 'A' | 'B' | 'C' | 'D'
  ) => {
    if (isSubmitted) return;

    setSelectedAnswers((previous) => ({
      ...previous,
      [currentQuestionIndex]: answer,
    }));
  };

  const calculateScore = () => {
    let score = 0;

    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctKey) {
        score++;
      }
    });

    return score;
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((previous) => previous + 1);
    } else {
      setIsSubmitted(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((previous) => previous - 1);
    }
  };

  const handleTryAgain = () => {
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setIsSubmitted(false);
    setError('');
  };

  const currentQuestion = questions[currentQuestionIndex];

  // -------------------------------
  // NO DOCUMENTS
  // -------------------------------
  if (!documents.length) {
    return (
      <div className="min-h-full p-6">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold text-slate-900">
            Quiz
          </h1>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">
              No documents available
            </h2>

            <p className="mt-2 text-slate-500">
              Upload a PDF first to generate a quiz.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------
  // QUIZ RESULTS
  // -------------------------------
  if (isSubmitted && questions.length > 0) {
    const score = calculateScore();
    const percentage = Math.round(
      (score / questions.length) * 100
    );

    return (
      <div className="min-h-full p-6">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-3xl font-bold text-slate-900">
            Quiz Results
          </h1>

          <p className="mt-2 text-slate-500">
            Results for {activeDoc?.title}
          </p>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="text-center">
              <div className="text-5xl font-bold text-indigo-600">
                {score}/{questions.length}
              </div>

              <p className="mt-2 text-lg text-slate-600">
                {percentage}% correct
              </p>
            </div>

            <div className="mt-8 space-y-5">
              {questions.map((question, index) => {
                const selected = selectedAnswers[index];
                const isCorrect =
                  selected === question.correctKey;

                return (
                  <div
                    key={question.id}
                    className="rounded-xl border border-slate-200 p-5"
                  >
                    <div className="flex items-start gap-3">
                      <span className="font-semibold text-slate-700">
                        {index + 1}.
                      </span>

                      <p className="font-medium text-slate-900">
                        {question.question}
                      </p>
                    </div>

                    <div className="mt-3 text-sm">
                      <p>
                        <span className="font-medium">
                          Your answer:
                        </span>{' '}
                        {selected || 'Not answered'}
                      </p>

                      <p className="mt-1">
                        <span className="font-medium">
                          Correct answer:
                        </span>{' '}
                        {question.correctKey}
                      </p>
                    </div>

                    <p
                      className={`mt-3 text-sm font-medium ${
                        isCorrect
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {isCorrect
                        ? 'Correct'
                        : 'Incorrect'}
                    </p>

                    {question.explanation && (
                      <p className="mt-2 text-sm text-slate-500">
                        {question.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleTryAgain}
              className="mt-8 w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
            >
              Generate New Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------
  // QUIZ ACTIVE
  // -------------------------------
  if (questions.length > 0 && currentQuestion) {
    const selectedAnswer =
      selectedAnswers[currentQuestionIndex];

    return (
      <div className="min-h-full p-6">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Quiz
              </h1>

              <p className="mt-1 text-slate-500">
                {activeDoc?.title}
              </p>
            </div>

            <div className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
              Question {currentQuestionIndex + 1} of{' '}
              {questions.length}
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            {/* Progress */}
            <div className="mb-8 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-indigo-600 transition-all"
                style={{
                  width: `${
                    ((currentQuestionIndex + 1) /
                      questions.length) *
                    100
                  }%`,
                }}
              />
            </div>

            {/* Question */}
            <h2 className="text-xl font-semibold leading-relaxed text-slate-900">
              {currentQuestion.question}
            </h2>

            {/* Options */}
            <div className="mt-8 space-y-3">
              {currentQuestion.options.map((option) => {
                const isSelected =
                  selectedAnswer === option.key;

                return (
                  <button
                    key={option.key}
                    onClick={() =>
                      handleAnswerSelect(option.key)
                    }
                    disabled={isSubmitted}
                    className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border font-semibold ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-600 text-white'
                          : 'border-slate-300 text-slate-600'
                      }`}
                    >
                      {option.key}
                    </span>

                    <span className="text-slate-800">
                      {option.text}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Navigation */}
            <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="rounded-xl border border-slate-200 px-5 py-3 font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <button
                onClick={handleNext}
                disabled={!selectedAnswer}
                className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {currentQuestionIndex === questions.length - 1
                  ? 'Submit Quiz'
                  : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------
  // START / LOADING STATE
  // -------------------------------
  return (
    <div className="min-h-full p-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-slate-900">
          Quiz
        </h1>

        <p className="mt-2 text-slate-500">
          Generate an AI-powered quiz from your study material.
        </p>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          {/* Document selector */}
          <label className="block text-sm font-semibold text-slate-700">
            Select document
          </label>

          <select
            value={activeDoc ? String(activeDoc.id) : ''}
            onChange={handleDocumentChange}
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="" disabled>
              Select a document
            </option>

            {documents.map((doc) => (
              <option
                key={doc.id}
                value={String(doc.id)}
              >
                {doc.title}
              </option>
            ))}
          </select>

          {/* Error */}
          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Start card */}
          <div className="mt-8 rounded-xl bg-slate-50 p-6">
            <h2 className="text-xl font-semibold text-slate-900">
              Ready to test your knowledge?
            </h2>

            <p className="mt-2 text-slate-500">
              Gemini will generate a quiz from the selected
              document.
            </p>

            <button
              onClick={generateQuiz}
              disabled={!activeDoc || loading}
              className="mt-6 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? 'Generating Quiz...'
                : 'Generate Quiz'}
            </button>
          </div>

          {/* Loading */}
          {loading && (
            <div className="mt-6 text-center text-sm text-slate-500">
              AI is creating questions from your notes. This may
              take a few seconds...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizPage;