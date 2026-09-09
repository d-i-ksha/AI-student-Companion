import React, { useRef } from 'react';
import { PageType, DocumentItem, User } from '../types';
import { 
  UploadCloud, 
  FileText, 
  HelpCircle, 
  CheckSquare, 
  MessageSquare, 
  ArrowRight, 
  Sparkles,
  Bot
} from 'lucide-react';
import { FastApiContractFooter } from '../components/FastApiContractFooter';

interface DashboardPageProps {
  user: User | null;
  documents: DocumentItem[];
  onNavigate: (page: PageType) => void;
  onSelectDocument: (doc: DocumentItem, targetAction?: 'summary' | 'questions' | 'quiz' | 'ask') => void;
  onUploadFile: (file: File) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  user,
  documents,
  onNavigate,
  onSelectDocument,
  onUploadFile,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadFile(file);
    }
  };

  const activeDocuments = documents.filter((d) => d.status === 'ready');

  return (
    <div className="flex flex-col w-full gap-6 max-w-7xl mx-auto">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf"
        className="hidden"
      />

      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex flex-col max-w-xl z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-[#8455ef] tracking-wide uppercase">
              Study Workspace
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#0b1c30] tracking-tight">
            Welcome back! 👋
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-2 leading-relaxed">
            Upload your study notes and use AI to summarize, generate questions, create quizzes, and ask questions.
          </p>

          <div className="flex items-center gap-3 mt-5">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#3525cd] hover:bg-[#4f46e5] text-white rounded-xl text-sm font-semibold shadow-sm transition-all active:scale-95"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Notes</span>
            </button>
            <button
              onClick={() => onNavigate('my-documents')}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#eff4ff] hover:bg-slate-200/60 text-[#3525cd] rounded-xl text-sm font-semibold transition-colors"
            >
              <span>Explore All Notes</span>
            </button>
          </div>
        </div>

        {/* Robot Illustration / Decorative Side */}
        <div className="relative flex items-center justify-center self-center md:self-auto flex-shrink-0">
          <div className="relative bg-gradient-to-tr from-[#e5eeff] to-[#eff4ff] p-5 rounded-3xl border border-[#dce9ff] shadow-inner flex flex-col items-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#4f46e5] to-[#8455ef] text-white flex items-center justify-center shadow-md shadow-indigo-100">
              <Bot className="w-12 h-12 sm:w-14 sm:h-14 stroke-[1.5]" />
            </div>
            <div className="mt-2.5 px-3 py-1 bg-white/90 backdrop-blur-xs rounded-full border border-slate-200/80 shadow-xs flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#8455ef]" />
              <span className="text-[11px] font-semibold text-[#0b1c30]">Hi! Ready to study? 📚</span>
            </div>
          </div>
        </div>
      </div>

      {/* Documents Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#0b1c30] tracking-tight">My Documents</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[#e5eeff] text-[#3525cd] text-xs font-semibold">
              {documents.length} documents
            </span>
          </div>

          <button
            onClick={() => onNavigate('my-documents')}
            className="text-xs font-bold text-[#3525cd] hover:text-[#4f46e5] flex items-center gap-1 transition-colors group"
          >
            <span>View All Documents</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Document Cards */}
        <div className="flex flex-col gap-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 group"
            >
              {/* Document Info */}
              <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center flex-shrink-0 shadow-xs">
                  <span className="text-xs font-bold font-mono">PDF</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-[14px] text-[#0b1c30] group-hover:text-[#3525cd] transition-colors truncate">
                      {doc.title}
                    </span>
                    {doc.status === 'ready' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                        Ready
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#eff4ff] text-[#6b38d4] text-[11px] font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#6b38d4] animate-ping"></span>
                        Processing ({doc.progress || 64}%)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <span>PDF Document</span>
                    <span>•</span>
                    <span>{doc.uploadDate}</span>
                    <span>•</span>
                    <span>{doc.fileSize}</span>
                    <span>•</span>
                    <span>{doc.pageCount} Pages</span>
                  </div>
                </div>
              </div>

              {/* 4 Action Buttons */}
              <div className="flex items-center flex-wrap sm:flex-nowrap gap-2 self-end lg:self-center">
                <button
                  type="button"
                  onClick={() => onSelectDocument(doc, 'summary')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] text-xs font-semibold transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-[#3525cd]" />
                  <span>Summary</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectDocument(doc, 'questions')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] text-xs font-semibold transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-[#6b38d4]" />
                  <span>Questions</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectDocument(doc, 'quiz')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] text-xs font-semibold transition-colors"
                >
                  <CheckSquare className="w-3.5 h-3.5 text-amber-600" />
                  <span>Quiz</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectDocument(doc, 'ask')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#e2dfff] text-[#0f0069] hover:bg-[#3525cd] hover:text-white text-xs font-semibold transition-colors shadow-xs"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Ask AI</span>
                </button>
              </div>
            </div>
          ))}

          {/* Upload Another Document Box */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer border-2 border-dashed border-slate-200 hover:border-[#3525cd] hover:bg-[#eff4ff]/30 transition-all rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/50"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#eff4ff] text-[#3525cd] flex items-center justify-center flex-shrink-0">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div className="flex flex-col text-center sm:text-left">
                <span className="text-sm font-bold text-[#0b1c30]">
                  Upload another document
                </span>
                <span className="text-xs text-slate-500">
                  Add PDF course slides, book chapters, or notes to analyze
                </span>
              </div>
            </div>

            <button
              type="button"
              className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#0b1c30] shadow-xs flex items-center gap-1.5"
            >
              <span>+ Choose File</span>
            </button>
          </div>
        </div>
      </div>

      {/* Fast API Spec Card */}
      <FastApiContractFooter />
    </div>
  );
};
