import React, { useState, useRef } from 'react';
import { PageType, DocumentItem } from '../types';
import { StateSwitcher, StateOption } from '../components/StateSwitcher';
import { FastApiContractFooter } from '../components/FastApiContractFooter';
import {
  UploadCloud,
  FileText,
  HelpCircle,
  CheckSquare,
  MessageSquare,
  MoreVertical,
  Search,
  ChevronDown,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  FolderOpen,
  Sparkles,
  Download,
  Edit2,
  Trash2,
  Hourglass,
  Terminal,
} from 'lucide-react';

interface MyDocumentsPageProps {
  documents: DocumentItem[];
  onSelectDocument: (doc: DocumentItem, targetAction?: 'summary' | 'questions' | 'quiz' | 'ask') => void;
  onUploadFile: (file: File) => void;
  onDeleteDocument: (id: number | string) => void;
}

export const MyDocumentsPage: React.FC<MyDocumentsPageProps> = ({
  documents,
  onSelectDocument,
  onUploadFile,
  onDeleteDocument,
}) => {
  const [activePreviewState, setActivePreviewState] = useState<string>('default');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<'recent' | 'az' | 'size' | 'pages'>('recent');
  const [activeMenuId, setActiveMenuId] = useState<string | number | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDismissedSuccess, setIsDismissedSuccess] = useState(false);
  const [isDismissedError, setIsDismissedError] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const previewOptions: StateOption[] = [
    { id: 'default', label: 'Default View (Populated)' },
    { id: 'uploading', label: 'Uploading State' },
    { id: 'upload-success', label: 'Upload Success' },
    { id: 'upload-error', label: 'Upload Error / Invalid' },
    { id: 'empty', label: 'Empty State' },
    { id: 'loading', label: 'Skeleton Loading' },
    { id: 'error-500', label: 'Fetch Error (500)' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setActivePreviewState('upload-error');
      setIsDismissedError(false);
      return;
    }

    setActivePreviewState('uploading');
    setTimeout(() => {
      onUploadFile(file);
      setActivePreviewState('upload-success');
      setIsDismissedSuccess(false);
    }, 1200);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
        setActivePreviewState('upload-error');
        setIsDismissedError(false);
      } else {
        setActivePreviewState('uploading');
        setTimeout(() => {
          onUploadFile(file);
          setActivePreviewState('upload-success');
          setIsDismissedSuccess(false);
        }, 1200);
      }
    }
  };

  // Filter & Sort
  const filteredDocs = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedDocs = [...filteredDocs].sort((a, b) => {
    if (sortMode === 'az') return a.title.localeCompare(b.title);
    if (sortMode === 'pages') return b.pageCount - a.pageCount;
    if (sortMode === 'size') {
      const sizeA = parseFloat(a.fileSize) || 0;
      const sizeB = parseFloat(b.fileSize) || 0;
      return sizeB - sizeA;
    }
    return 0; // recent default
  });

  const readyDocsCount = documents.filter((d) => d.status === 'ready').length;

  return (
    <div className="flex flex-col w-full gap-6 max-w-7xl mx-auto">
      {/* Hidden File Picker */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf"
        className="hidden"
      />

      {/* Preview State Switcher */}
      <StateSwitcher
        activeState={activePreviewState}
        options={previewOptions}
        onSelectState={(state) => {
          setActivePreviewState(state);
          setIsDismissedSuccess(false);
          setIsDismissedError(false);
        }}
      />

      {/* Page Title & Connection Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0b1c30] tracking-tight">
              My Documents
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#e5eeff] text-[#3525cd] text-xs font-semibold">
              v2.4 Indexer
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manage your study materials and start learning with AI synthesis engines.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200/80 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-mono font-medium text-slate-600">
              API: Connected
            </span>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3525cd] hover:bg-[#4f46e5] text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
          >
            <UploadCloud className="w-4 h-4" />
            <span>+ Upload Notes</span>
          </button>
        </div>
      </div>

      {/* ================= STATE CONTAINER: FETCH ERROR (500) ================= */}
      {activePreviewState === 'error-500' && (
        <div className="w-full bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center justify-center text-center max-w-xl mx-auto my-4">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4 shadow-xs">
            <AlertCircle className="w-8 h-8" />
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-mono font-semibold mb-2">
            HTTP 500 / Network Error
          </span>
          <h2 className="text-xl font-bold text-[#0b1c30] mt-1">
            Couldn't load your documents
          </h2>
          <p className="text-sm text-slate-500 mt-2 max-w-md">
            Failed to connect to <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-mono text-xs">GET /documents/</code>. Please verify your FastAPI backend or academic session token.
          </p>
          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={() => setActivePreviewState('default')}
              className="px-5 py-2 rounded-xl bg-[#3525cd] text-white text-xs font-semibold hover:bg-[#4f46e5] transition-colors shadow-xs"
            >
              Try Again
            </button>
            <button
              onClick={() => setActivePreviewState('empty')}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors"
            >
              Check Health Status
            </button>
          </div>
        </div>
      )}

      {/* ================= STATE CONTAINER: SKELETON LOADING ================= */}
      {activePreviewState === 'loading' && (
        <div className="w-full flex flex-col gap-5 animate-pulse">
          {/* Skeleton Upload Box */}
          <div className="w-full h-44 rounded-2xl bg-slate-200/80 flex flex-col items-center justify-center gap-3 p-6">
            <div className="w-12 h-12 rounded-2xl bg-slate-300"></div>
            <div className="w-48 h-4 rounded-full bg-slate-300"></div>
            <div className="w-72 h-3 rounded-full bg-slate-300"></div>
          </div>

          <div className="flex justify-between items-center mt-2">
            <div className="w-36 h-6 rounded-lg bg-slate-200"></div>
            <div className="w-64 h-9 rounded-lg bg-slate-200"></div>
          </div>

          {/* Skeleton Document Rows */}
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 rounded-2xl bg-white border border-slate-200/70 p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3 w-1/2">
                  <div className="w-11 h-11 rounded-xl bg-slate-200 flex-shrink-0"></div>
                  <div className="flex flex-col gap-2 w-full">
                    <div className="w-3/4 h-4 rounded-md bg-slate-200"></div>
                    <div className="w-1/2 h-3 rounded-md bg-slate-200"></div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="w-20 h-8 rounded-lg bg-slate-200"></div>
                  <div className="w-20 h-8 rounded-lg bg-slate-200"></div>
                  <div className="w-20 h-8 rounded-lg bg-slate-200"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= STATE CONTAINER: EMPTY VIEW ================= */}
      {activePreviewState === 'empty' && (
        <div className="w-full bg-white p-8 sm:p-12 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col items-center justify-center text-center max-w-xl mx-auto my-4">
          <div className="relative mb-4">
            <div className="w-18 h-18 rounded-3xl bg-[#e9ddff] flex items-center justify-center text-[#6b38d4] shadow-inner">
              <FolderOpen className="w-9 h-9" />
            </div>
            <div className="absolute -top-1 -right-1 bg-white p-1 rounded-full shadow-xs border border-slate-200 text-[#3525cd]">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-[#0b1c30]">No documents yet</h2>
          <p className="text-sm text-slate-500 mt-1.5 max-w-md">
            Upload your first set of notes to start learning with AI summaries, interactive flashcards, and conceptual quizzes.
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-6 flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#3525cd] text-white text-xs font-semibold hover:bg-[#4f46e5] shadow-sm transition-all active:scale-95"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Notes Now</span>
          </button>
          <div className="mt-8 p-4 rounded-xl bg-[#eff4ff] text-left w-full border border-[#dce9ff]">
            <div className="flex items-center gap-1.5 text-[#6b38d4] mb-1">
              <Sparkles className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Quick Suggestions</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Optimal inputs include lecture slide exports, textbook chapters, syllabus schedules, or handwritten notes exported as clear PDFs up to 25MB.
            </p>
          </div>
        </div>
      )}

      {/* ================= MAIN CONTENT (Populated / Uploading / Default) ================= */}
      {activePreviewState !== 'error-500' &&
        activePreviewState !== 'loading' &&
        activePreviewState !== 'empty' && (
          <div className="flex flex-col gap-6">
            {/* IN-FLIGHT UPLOADING BANNER */}
            {activePreviewState === 'uploading' && (
              <div className="bg-white rounded-2xl p-5 border border-[#c7c4d8] shadow-xs animate-in fade-in">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#e2dfff] flex items-center justify-center text-[#3525cd] flex-shrink-0 animate-spin">
                      <RefreshCw className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#0b1c30]">
                          Distributed_Systems_Lecture_04.pdf
                        </span>
                        <span className="text-xs text-slate-500 font-mono">(4.2 MB)</span>
                      </div>
                      <span className="text-xs text-slate-500 mt-0.5">
                        Extracting text vectors, metadata chunks, and generating embeddings...
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-[#3525cd]">68%</span>
                    <button
                      type="button"
                      onClick={() => setActivePreviewState('default')}
                      className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>

                <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#3525cd] to-[#6b38d4] h-full rounded-full transition-all duration-500"
                    style={{ width: '68%' }}
                  ></div>
                </div>
              </div>
            )}

            {/* UPLOAD SUCCESS BANNER */}
            {(activePreviewState === 'upload-success' && !isDismissedSuccess) && (
              <div className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-xs flex items-start justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-[#0b1c30]">Upload complete!</span>
                    <p className="text-xs text-slate-600 mt-0.5">
                      <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-800">
                        Distributed_Systems_Lecture_04.pdf
                      </code>{' '}
                      is fully indexed and ready for AI synthesis.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDismissedSuccess(true)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* UPLOAD ERROR BANNER */}
            {(activePreviewState === 'upload-error' && !isDismissedError) && (
              <div className="flex flex-col gap-2 animate-in fade-in">
                <div className="bg-white rounded-2xl p-4 border border-red-200 shadow-xs flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-red-600">Invalid file format</span>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Only <strong className="text-slate-800 font-semibold">.pdf</strong> documents are supported. Please convert notes to PDF format and retry.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsDismissedError(true)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 text-xs text-slate-700">
                    <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <span>Upload failed: Network timeout sending chunk to <code className="bg-slate-100 px-1 rounded font-mono">POST /documents/upload</code>.</span>
                  </div>
                  <button
                    onClick={() => setActivePreviewState('uploading')}
                    className="px-3 py-1 bg-[#e2dfff] text-[#0f0069] hover:bg-[#3525cd] hover:text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            {/* DRAG AND DROP ZONE */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragOver(false);
              }}
              onDrop={handleDrop}
              className={`cursor-pointer group relative overflow-hidden rounded-2xl bg-white p-8 sm:p-10 border-2 border-dashed transition-all text-center flex flex-col items-center justify-center gap-3 shadow-xs ${
                isDragOver
                  ? 'border-[#3525cd] bg-[#eff4ff]'
                  : 'border-slate-200/90 hover:border-[#3525cd] hover:shadow-sm'
              }`}
            >
              <div className="w-16 h-16 rounded-2xl bg-[#eff4ff] flex items-center justify-center text-[#3525cd] group-hover:scale-105 group-hover:bg-[#3525cd] group-hover:text-white transition-all shadow-xs">
                <UploadCloud className="w-8 h-8" />
              </div>

              <div className="flex flex-col items-center max-w-md">
                <h2 className="text-xl font-bold text-[#0b1c30] group-hover:text-[#3525cd] transition-colors">
                  Upload your study notes
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Upload a PDF and let AI turn it into instant summaries, practice questions, and flashcard quizzes.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2 mt-1">
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#3525cd] text-white text-xs font-semibold group-hover:bg-[#4f46e5] transition-all shadow-xs"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload PDF</span>
                </button>
                <span className="text-xs text-slate-400">or drag and drop files here</span>
              </div>

              <div className="flex items-center gap-2.5 mt-2 text-slate-400 text-xs">
                <span className="flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  PDF files only
                </span>
                <span>•</span>
                <span>Max size 25MB</span>
                <span>•</span>
                <span>Up to 250 pages</span>
              </div>
            </div>

            {/* DOCUMENTS LIST SECTION */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-bold text-[#0b1c30]">
                    Your Documents
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#eff4ff] text-[#3525cd] text-xs font-semibold">
                    ({readyDocsCount} active)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative w-full sm:w-60">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Filter by subject, course..."
                      className="w-full h-9 pl-8 pr-3 bg-white border border-slate-200 rounded-lg text-xs text-[#0b1c30] placeholder:text-slate-400 focus:outline-none focus:border-[#3525cd]"
                    />
                  </div>

                  <div className="relative flex-shrink-0">
                    <select
                      value={sortMode}
                      onChange={(e) => setSortMode(e.target.value as any)}
                      aria-label="Sort documents by"
                      className="h-9 pl-3 pr-8 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 hover:text-[#0b1c30] focus:outline-none cursor-pointer appearance-none"
                    >
                      <option value="recent">Recently Uploaded</option>
                      <option value="az">Alphabetical (A-Z)</option>
                      <option value="size">Largest File Size</option>
                      <option value="pages">Most Pages</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Document Cards Stack */}
              <div className="flex flex-col gap-3">
                {sortedDocs.map((doc) => {
                  const isProcessing = doc.status === 'processing';
                  const isMenuOpen = activeMenuId === doc.id;

                  return (
                    <div
                      key={doc.id}
                      className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 group"
                    >
                      {/* Left: Icon & Details */}
                      <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                        {isProcessing ? (
                          <div className="w-12 h-12 rounded-xl bg-[#e9ddff] text-[#6b38d4] flex items-center justify-center flex-shrink-0 shadow-xs animate-pulse">
                            <Hourglass className="w-6 h-6" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center flex-shrink-0 shadow-xs">
                            <span className="text-xs font-bold font-mono">PDF</span>
                          </div>
                        )}

                        <div className="flex flex-col min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-[14px] text-[#0b1c30] group-hover:text-[#3525cd] transition-colors truncate">
                              {doc.title}
                            </span>
                            {isProcessing ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#e9ddff] text-[#6b38d4] text-[11px] font-semibold">
                                <span className="w-2 h-2 rounded-full bg-[#6b38d4] animate-ping"></span>
                                Processing AI embeddings ({doc.progress || 64}%)...
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200/60">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                Ready
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-500 mt-1 font-sans">
                            <span>Uploaded {doc.uploadDate}</span>
                            <span>•</span>
                            <span>{doc.fileSize}</span>
                            <span>•</span>
                            <span>{doc.pageCount} Pages</span>
                            <span>•</span>
                            <span className="font-mono text-slate-600">ID: #{doc.id}</span>
                            {isProcessing && (
                              <>
                                <span>•</span>
                                <span className="text-[#6b38d4] font-semibold">Indexing active</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Action Buttons & Menu */}
                      <div
                        className={`flex items-center flex-wrap sm:flex-nowrap gap-2 self-end lg:self-center ${
                          isProcessing ? 'opacity-60' : ''
                        }`}
                      >
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => onSelectDocument(doc, 'summary')}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] text-xs font-semibold transition-colors disabled:cursor-not-allowed"
                          title="Generate Summary"
                        >
                          <FileText className="w-3.5 h-3.5 text-[#3525cd]" />
                          <span>Summary</span>
                        </button>

                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => onSelectDocument(doc, 'questions')}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] text-xs font-semibold transition-colors disabled:cursor-not-allowed"
                          title="Generate Review Questions"
                        >
                          <HelpCircle className="w-3.5 h-3.5 text-[#6b38d4]" />
                          <span>Questions</span>
                        </button>

                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => onSelectDocument(doc, 'quiz')}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] text-xs font-semibold transition-colors disabled:cursor-not-allowed"
                          title="Build Interactive Quiz"
                        >
                          <CheckSquare className="w-3.5 h-3.5 text-amber-600" />
                          <span>Quiz</span>
                        </button>

                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => onSelectDocument(doc, 'ask')}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#e2dfff] text-[#0f0069] hover:bg-[#3525cd] hover:text-white text-xs font-semibold transition-colors shadow-xs disabled:cursor-not-allowed"
                          title="Open Ask AI Workspace"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Ask AI</span>
                        </button>

                        {/* More Menu Dropdown */}
                        <div className="relative ml-1">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveMenuId(isMenuOpen ? null : doc.id)
                            }
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="More Options"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {isMenuOpen && (
                            <div className="absolute right-0 top-8 w-44 bg-white rounded-xl shadow-lg border border-slate-200/80 p-1.5 z-30 flex flex-col gap-0.5 animate-in fade-in">
                              <button
                                type="button"
                                onClick={() => {
                                  alert(`Downloading: ${doc.title}`);
                                  setActiveMenuId(null);
                                }}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-50 text-slate-700 text-xs text-left transition-colors"
                              >
                                <Download className="w-3.5 h-3.5 text-slate-400" />
                                <span>Download PDF</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const newName = prompt('Enter new document title:', doc.title);
                                  if (newName) doc.title = newName;
                                  setActiveMenuId(null);
                                }}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-50 text-slate-700 text-xs text-left transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                                <span>Rename Document</span>
                              </button>
                              <div className="h-px bg-slate-100 my-1"></div>
                              <button
                                type="button"
                                onClick={() => {
                                  onDeleteDocument(doc.id);
                                  setActiveMenuId(null);
                                }}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-red-50 text-red-600 text-xs text-left transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete Document</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      {/* Backend API Contract Specifications Footer */}
      <FastApiContractFooter />
    </div>
  );
};
