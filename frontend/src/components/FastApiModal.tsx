import React, { useState } from 'react';
import { api, getApiBaseUrl, setApiBaseUrl } from '../services/api';
import { Terminal, CheckCircle2, XCircle, RefreshCw, X, Server } from 'lucide-react';

interface FastApiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectionChange: (connected: boolean) => void;
}

export const FastApiModal: React.FC<FastApiModalProps> = ({
  isOpen,
  onClose,
  onConnectionChange,
}) => {
  const [url, setUrl] = useState(getApiBaseUrl());
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    setApiBaseUrl(url);

    try {
      const isHealthy = await api.checkHealth();
      if (isHealthy) {
        setTestResult({
          success: true,
          message: 'Successfully reached FastAPI backend at GET /health! Real endpoints active.',
        });
        onConnectionChange(true);
      } else {
        setTestResult({
          success: false,
          message: 'Endpoint unreachable. Falling back to local offline development mock layer.',
        });
        onConnectionChange(false);
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Connection failed. Local development mock active.',
      });
      onConnectionChange(false);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    setApiBaseUrl(url);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-[#3525cd]" />
            <h3 className="font-bold text-base text-[#0b1c30]">FastAPI Backend Connection</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Configure the base URL of your existing FastAPI backend. When connected, all requests
            (auth, PDF upload, summary, quiz, ask) are routed to your backend using Bearer JWT authentication.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
              Backend Base URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="http://localhost:8000"
              className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-[#0b1c30] focus:outline-none focus:bg-white focus:border-[#3525cd]"
            />
          </div>

          {testResult && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-[11px] font-mono text-slate-600 space-y-1">
            <div className="font-bold text-slate-800">Expected API Contract:</div>
            <div>• POST /auth/login, /auth/register</div>
            <div>• GET /documents/, POST /documents/upload</div>
            <div>• POST /study/{'{id}'}/summary, /questions, /quiz, /ask</div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors disabled:opacity-50"
          >
            {isTesting ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Terminal className="w-3.5 h-3.5" />
            )}
            <span>Test Health</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-[#3525cd] hover:bg-[#4f46e5] text-white text-xs font-semibold shadow-xs transition-colors"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
