import React from 'react';
import { Terminal, CheckCircle2 } from 'lucide-react';
import { ApiContractSpec } from '../types';

interface FastApiContractFooterProps {
  specs?: ApiContractSpec[];
}

export const FastApiContractFooter: React.FC<FastApiContractFooterProps> = ({
  specs = [
    {
      method: 'POST',
      path: '/documents/upload',
      details: 'multipart/form-data • file: UploadFile • returns DocMetadata',
    },
    {
      method: 'GET',
      path: '/documents/',
      details: 'returns List[DocumentResponse(id, filename, pages, status)]',
    },
  ],
}) => {
  return (
    <div className="w-full bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#3525cd]" />
          <span className="text-[12px] font-bold text-[#0b1c30] tracking-wide uppercase">
            FastAPI Backend Contract Specifications
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
          <span className="flex items-center gap-1 text-emerald-600 font-sans">
            <CheckCircle2 className="w-3 h-3" /> REST Compliant
          </span>
          <span>•</span>
          <span>OpenAPI 3.1.0</span>
          <span>•</span>
          <span>Auth: Bearer JWT</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-3">
        {specs.map((spec, i) => (
          <div
            key={i}
            className="bg-[#eff4ff]/60 border border-slate-200/60 p-2.5 rounded-xl flex items-start gap-2.5"
          >
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold text-white uppercase flex-shrink-0 ${
                spec.method === 'POST'
                  ? 'bg-[#3525cd]'
                  : spec.method === 'GET'
                  ? 'bg-emerald-600'
                  : 'bg-amber-600'
              }`}
            >
              {spec.method}
            </span>
            <div className="flex flex-col min-w-0">
              <code className="text-xs font-mono font-bold text-[#0b1c30] truncate">
                {spec.path}
              </code>
              <span className="text-[11px] text-slate-500 truncate">{spec.details}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
