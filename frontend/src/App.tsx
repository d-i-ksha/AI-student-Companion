import React, { useState, useEffect } from 'react';
import { PageType, User, DocumentItem } from './types';
import { api, getApiBaseUrl } from './services/api';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { FastApiModal } from './components/FastApiModal';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { MyDocumentsPage } from './pages/MyDocumentsPage';
import { StudyAssistantPage } from './pages/StudyAssistantPage';
import  QuizPage  from './pages/QuizPage';
import { AskAiPage } from './pages/AskAiPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<DocumentItem | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [apiModalOpen, setApiModalOpen] = useState(false);
  const [apiConnected, setApiConnected] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Initial load
  useEffect(() => {
    async function init() {
      // Check stored token and stored user
      const token = api.getStoredToken();
      const currentUser = api.getCurrentUser();

      if (token && currentUser) {
        setUser(currentUser);
        // Fetch documents for the authenticated user
        try {
          const docs = await api.getDocuments();
          setDocuments(docs);
          if (docs.length > 0) {
            setSelectedDocument(docs[0]);
          }
        } catch (err) {
          console.error('Failed to load documents:', err);
        }
      } else {
        // No valid token: redirect to login
        setUser(null);
        setCurrentPage('login');
      }

      // Check backend health
      try {
        const isHealthy = await api.checkHealth();
        setApiConnected(isHealthy);
      } catch {
        setApiConnected(false);
      } finally {
        setIsInitialized(true);
      }
    }

    init();

    // Listen for 401 unauthorized session expiry
    const handleUnauthorized = () => {
      setUser(null);
      setCurrentPage('login');
    };
    window.addEventListener('companion:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('companion:unauthorized', handleUnauthorized);
  }, []);

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setCurrentPage('login');
  };

  const handleLoginSuccess = async (loggedInUser: User) => {
    setUser(loggedInUser);
    setCurrentPage('dashboard');
    try {
      const docs = await api.getDocuments();
      setDocuments(docs);
      if (docs.length > 0) {
        setSelectedDocument(docs[0]);
      }
    } catch (err) {
      console.error('Failed to load documents on login:', err);
    }
  };

  const handleRegisterSuccess = async (registeredUser: User) => {
    if (registeredUser.token) {
      setUser(registeredUser);
      setCurrentPage('dashboard');
      try {
        const docs = await api.getDocuments();
        setDocuments(docs);
        if (docs.length > 0) {
          setSelectedDocument(docs[0]);
        }
      } catch (err) {
        console.error('Failed to load documents on register:', err);
      }
    } else {
      setCurrentPage('login');
    }
  };

  const handleSelectDocument = (
    doc: DocumentItem,
    targetAction?: 'summary' | 'questions' | 'quiz' | 'ask'
  ) => {
    setSelectedDocument(doc);
    if (targetAction === 'summary' || targetAction === 'questions') {
      setCurrentPage('study-assistant');
    } else if (targetAction === 'quiz') {
      setCurrentPage('quiz');
    } else if (targetAction === 'ask') {
      setCurrentPage('ask-ai');
    }
  };

  const handleUploadFile = async (file: File) => {
    try {
      const newDoc = await api.uploadDocument(file);
      setDocuments((prev) => [newDoc, ...prev]);
      setSelectedDocument(newDoc);
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  const handleDeleteDocument = async (id: number | string) => {
    try {
      await api.deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      if (selectedDocument?.id === id) {
        const remaining = documents.filter((d) => d.id !== id);
        setSelectedDocument(remaining.length > 0 ? remaining[0] : null);
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  // If on login or register screen, render full-bleed auth layout
  if (currentPage === 'login') {
    return (
      <LoginPage
        onNavigate={setCurrentPage}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  if (currentPage === 'register') {
    return (
      <RegisterPage
        onNavigate={setCurrentPage}
        onRegisterSuccess={handleRegisterSuccess}
      />
    );
  }

  // Strict route protection: redirect unauthenticated users to login
  if (!user) {
    return (
      <LoginPage
        onNavigate={setCurrentPage}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  const getPageSubtitle = () => {
    switch (currentPage) {
      case 'dashboard':
        return 'Overview & Quick Study Actions';
      case 'my-documents':
        return 'Study Materials & Processing Status';
      case 'study-assistant':
        return 'Active Document Synthesis & Question Generation';
      case 'quiz':
        return 'Interactive Assessments & Active Recall';
      case 'ask-ai':
        return 'Grounded Knowledge Retrieval & Citations';
      default:
        return 'Academic Companion';
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col antialiased selection:bg-[#3525cd] selection:text-white">
      {/* Navigation Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        user={user}
        onLogout={handleLogout}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        apiConnected={apiConnected}
        onToggleApiConfig={() => setApiModalOpen(true)}
      />

      {/* Top Header Bar */}
      <Header
        onOpenMobile={() => setMobileSidebarOpen(true)}
        onUploadClick={() => {
          setCurrentPage('my-documents');
        }}
        user={user}
        subtitle={getPageSubtitle()}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 pt-20 pb-12 px-4 sm:px-6 lg:px-8 transition-all">        
        {currentPage === 'dashboard' && (
          <DashboardPage
            user={user}
            documents={documents}
            onNavigate={setCurrentPage}
            onSelectDocument={handleSelectDocument}
            onUploadFile={handleUploadFile}
          />
        )}

        {currentPage === 'my-documents' && (
          <MyDocumentsPage
            documents={documents}
            onSelectDocument={handleSelectDocument}
            onUploadFile={handleUploadFile}
            onDeleteDocument={handleDeleteDocument}
          />
        )}

        {currentPage === 'study-assistant' && (
          <StudyAssistantPage
            documents={documents}
            selectedDocument={selectedDocument}
            onSelectDocument={setSelectedDocument}
            onNavigateToAskAi={(doc) => {
              setSelectedDocument(doc);
              setCurrentPage('ask-ai');
            }}
            onNavigateToQuiz={(doc) => {
              setSelectedDocument(doc);
              setCurrentPage('quiz');
            }}
          />
        )}

        {currentPage === 'quiz' && (
          <QuizPage
            documents={documents}
            selectedDocument={selectedDocument}
            onSelectDocument={setSelectedDocument}
          />
        )}

        {currentPage === 'ask-ai' && (
          <AskAiPage
            documents={documents}
            selectedDocument={selectedDocument}
            onSelectDocument={setSelectedDocument}
          />
        )}
      </main>

      {/* FastAPI Endpoint Configuration Modal */}
      <FastApiModal
        isOpen={apiModalOpen}
        onClose={() => setApiModalOpen(false)}
        onConnectionChange={setApiConnected}
      />
    </div>
  );
}
