import React, { useState, useRef, useEffect } from 'react';
import { DocumentItem } from '../types';
import { FastApiContractFooter } from '../components/FastApiContractFooter';
import { api } from '../services/api';
import {
  Send,
  ChevronDown,
  BookOpen,
  FileText,
  User as UserIcon,
  Bot,
} from 'lucide-react';

interface AskAiPageProps {
  documents: DocumentItem[];
  selectedDocument: DocumentItem | null;
  onSelectDocument: (doc: DocumentItem) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  citations?: string[];
}

export const AskAiPage: React.FC<AskAiPageProps> = ({
  documents,
  selectedDocument,
  onSelectDocument,
}) => {
  const [activeDoc, setActiveDoc] = useState<DocumentItem | null>(
    selectedDocument || documents[0] || null
  );

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Start with NO old/sample conversation
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  /*
   * Keep active document synchronized with the document
   * selected by the parent component.
   */
  useEffect(() => {
    if (selectedDocument) {
      setActiveDoc(selectedDocument);
    } else if (!activeDoc && documents.length > 0) {
      setActiveDoc(documents[0]);
    }
  }, [selectedDocument, documents]);

  /*
   * When the document changes, clear the previous conversation.
   */
  useEffect(() => {
    if (!activeDoc) {
      setMessages([]);
      return;
    }

    setMessages([
      {
        id: `welcome-${activeDoc.id}-${Date.now()}`,
        sender: 'assistant',
        text: `Hello! I am your AI Study Companion. I am ready to answer questions based on "${activeDoc.title}". What would you like to know?`,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    ]);
  }, [activeDoc?.id]);

  /*
   * Automatically scroll to the newest message.
   */
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages, isTyping]);

  /*
   * Send question to FastAPI.
   */
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputQuery.trim() || !activeDoc || isTyping) {
      return;
    }

    const userText = inputQuery.trim();

    setInputQuery('');

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const response = await api.askQuestion(
        activeDoc.id,
        userText
      );

      const aiMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: response.answer,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        citations: response.citations || [],
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Ask AI failed:', error);

      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: 'assistant',
        text:
          error instanceof Error
            ? error.message
            : 'Unable to get an answer. Please try again.',
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  /*
   * Change active document.
   */
  const handleDocChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const found = documents.find(
      (doc) => String(doc.id) === e.target.value
    );

    if (!found) return;

    setActiveDoc(found);
    onSelectDocument(found);
  };

  /*
   * Generic suggestions.
   * These are NOT tied to any specific subject.
   */
  const samplePrompts = [
    'What are the key concepts in these notes?',
    'Explain the most important topic simply.',
    'What should I remember for my exam?',
  ];

  return (
    <div className="flex flex-col w-full gap-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0b1c30] tracking-tight">
              Ask AI
            </h1>

            <span className="px-2.5 py-0.5 rounded-full bg-[#e2dfff] text-[#0f0069] text-xs font-semibold">
              Grounded QA
            </span>
          </div>

          <p className="text-sm text-slate-500 mt-1">
            Ask questions about your uploaded study material.
          </p>
        </div>

        {/* Document Selector */}
        <div className="relative min-w-[280px] sm:min-w-[320px]">
          <div className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl flex items-center gap-2 shadow-xs">
            <BookOpen className="w-4 h-4 text-[#3525cd] flex-shrink-0" />

            <select
              value={activeDoc ? String(activeDoc.id) : ''}
              onChange={handleDocChange}
              aria-label="Select document"
              className="w-full h-full bg-transparent text-xs font-semibold text-[#0b1c30] focus:outline-none cursor-pointer appearance-none pr-6 truncate"
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

            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Chat Window */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col h-[600px] overflow-hidden">

        {/* Status */}
        <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>

            <span>
              Grounded against:{' '}
              <strong className="text-slate-700 font-semibold">
                {activeDoc?.title || 'No document selected'}
              </strong>
            </span>
          </div>

          <span className="text-[11px] font-mono text-slate-400">
            Strict Citation Mode
          </span>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto flex flex-col gap-4">

          {!activeDoc && (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <BookOpen className="w-10 h-10 mx-auto text-slate-300" />

                <h2 className="mt-3 font-semibold text-slate-700">
                  Select a document
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Choose an uploaded PDF to start asking questions.
                </p>
              </div>
            </div>
          )}

          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 max-w-3xl ${
                  isUser
                    ? 'self-end flex-row-reverse'
                    : 'self-start'
                }`}
              >

                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs shadow-xs ${
                    isUser
                      ? 'bg-[#3525cd] text-white'
                      : 'bg-[#e2dfff] text-[#0f0069]'
                  }`}
                >
                  {isUser ? (
                    <UserIcon className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>

                {/* Message */}
                <div
                  className={`flex flex-col gap-1 p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-[#3525cd] text-white rounded-tr-xs'
                      : 'bg-[#eff4ff]/80 text-[#0b1c30] border border-slate-200/70 rounded-tl-xs'
                  }`}
                >
                  <p className="whitespace-pre-line font-normal">
                    {msg.text}
                  </p>

                  {/* Real citations returned by backend */}
                  {msg.citations &&
                    msg.citations.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-[#3525cd] font-semibold text-[11px]">
                          <FileText className="w-3 h-3" />

                          <span>
                            Sources
                          </span>
                        </div>

                        {msg.citations.map(
                          (citation, index) => (
                            <p
                              key={index}
                              className="text-[11px] italic text-slate-500 bg-white/60 p-1.5 rounded border border-slate-200/50"
                            >
                              {citation}
                            </p>
                          )
                        )}
                      </div>
                    )}

                  <span
                    className={`text-[10px] self-end mt-1 ${
                      isUser
                        ? 'text-indigo-200'
                        : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {/* AI typing indicator */}
          {isTyping && (
            <div className="flex items-start gap-3 max-w-lg self-start animate-pulse">
              <div className="w-8 h-8 rounded-xl bg-[#e2dfff] text-[#0f0069] flex items-center justify-center text-xs shadow-xs">
                <Bot className="w-4 h-4" />
              </div>

              <div className="p-3.5 bg-[#eff4ff]/80 rounded-2xl rounded-tl-xs border border-slate-200/70 text-xs text-slate-600 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#3525cd] animate-bounce"></span>

                <span className="w-2 h-2 rounded-full bg-[#3525cd] animate-bounce [animation-delay:0.2s]"></span>

                <span className="w-2 h-2 rounded-full bg-[#3525cd] animate-bounce [animation-delay:0.4s]"></span>

                <span className="text-slate-500 text-xs ml-1">
                  Reading your notes...
                </span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Generic Suggestions */}
        {activeDoc && (
          <div className="px-4 py-2 bg-slate-50/60 border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-xs text-slate-600">
            <span className="text-slate-400 text-[11px] whitespace-nowrap">
              Suggested:
            </span>

            {samplePrompts.map((prompt, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setInputQuery(prompt)}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs whitespace-nowrap text-slate-700 transition-colors cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-100">
          <form
            onSubmit={handleSend}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) =>
                setInputQuery(e.target.value)
              }
              disabled={!activeDoc || isTyping}
              placeholder={
                activeDoc
                  ? `Ask a question based on ${activeDoc.title}...`
                  : 'Select a document first...'
              }
              className="flex-1 h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-[#0b1c30] placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#3525cd] disabled:opacity-60"
            />

            <button
              type="submit"
              disabled={
                !inputQuery.trim() ||
                !activeDoc ||
                isTyping
              }
              className="h-11 px-5 bg-[#3525cd] hover:bg-[#4f46e5] text-white rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
            >
              <Send className="w-4 h-4" />

              <span className="hidden sm:inline">
                Ask
              </span>
            </button>
          </form>
        </div>
      </div>

      {/* Backend Contract */}
      <FastApiContractFooter
        specs={[
          {
            method: 'POST',
            path: '/study/{document_id}/ask',
            details:
              'payload: {"question": string} • returns {"answer": string, "citations": []}',
          },
        ]}
      />
    </div>
  );
};