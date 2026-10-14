import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { FloatingLogoBackground } from './components/FloatingLogoBackground.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { DetectionPage } from './pages/DetectionPage.tsx';
import { HistoryPage } from './pages/HistoryPage.tsx';
import { ScenariosAndQuizPage } from './pages/ScenariosAndQuizPage.tsx';
import { AboutPage } from './pages/AboutPage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { SignUpPage } from './pages/SignUpPage.tsx';
import { ContentType, QuizDomain } from './types/cyber.ts';
import { getScanHistory } from './services/historyStorage.ts';
import { fetchUserScansFromFirestore } from './services/firestoreScanService.ts';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';

function AppContent() {
  const { user } = useAuth();
  const [activePage, setActivePage] = useState<string>('home');
  const [detectorType, setDetectorType] = useState<ContentType>('email');
  const [detectorContent, setDetectorContent] = useState<string>('');
  const [detectorSubject, setDetectorSubject] = useState<string>('');
  const [scanHistoryCount, setScanHistoryCount] = useState<number>(0);

  const [scenarioTab, setScenarioTab] = useState<'scenarios' | 'quiz' | 'detective'>('scenarios');
  const [quizDomain, setQuizDomain] = useState<QuizDomain | undefined>(undefined);

  const updateScanCount = async () => {
    try {
      if (user) {
        const firestoreRecords = await fetchUserScansFromFirestore(user.uid);
        if (firestoreRecords.length > 0) {
          setScanHistoryCount(firestoreRecords.length);
          return;
        }
      }
      const records = getScanHistory();
      setScanHistoryCount(records.length);
    } catch {
      setScanHistoryCount(0);
    }
  };

  useEffect(() => {
    updateScanCount();
  }, [user]);

  const navigateToDetection = (type: ContentType, content: string, subject?: string) => {
    setDetectorType(type);
    setDetectorContent(content);
    setDetectorSubject(subject || '');
    setActivePage('detection');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGeneralNavigate = (
    page: string,
    params?: {
      type?: ContentType;
      content?: string;
      subject?: string;
      tab?: 'scenarios' | 'quiz' | 'detective';
      domain?: QuizDomain;
    }
  ) => {
    if (page === 'detection' && params) {
      if (params.type) setDetectorType(params.type);
      if (params.content) setDetectorContent(params.content);
      if (params.subject) setDetectorSubject(params.subject);
    }
    if (page === 'scenarios') {
      if (params?.tab) setScenarioTab(params.tab);
      else setScenarioTab('scenarios');
      if (params?.type && params.type !== 'whatsapp') {
        setQuizDomain(params.type as QuizDomain);
      }
    }
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7FCFA] text-[#183B3A] font-sans selection:bg-[#38BDF8] selection:text-white relative">
      {/* Floating Cyber Kawach Logo Background (Global Ambient Layer) */}
      <FloatingLogoBackground />

      {/* Navigation Bar */}
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        scanHistoryCount={scanHistoryCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 relative z-10">
        {activePage === 'home' && (
          <HomePage
            onNavigate={handleGeneralNavigate}
            scanCount={scanHistoryCount}
          />
        )}

        {activePage === 'dashboard' && (
          <DashboardPage
            onNavigate={(page, params) => handleGeneralNavigate(page, params)}
          />
        )}

        {activePage === 'login' && (
          <LoginPage onNavigate={(page) => handleGeneralNavigate(page)} />
        )}

        {activePage === 'signup' && (
          <SignUpPage onNavigate={(page) => handleGeneralNavigate(page)} />
        )}

        {activePage === 'detection' && (
          <DetectionPage
            key={`${detectorType}-${detectorContent.length}`}
            initialType={detectorType}
            initialContent={detectorContent}
            initialSubject={detectorSubject}
            onScanCompleted={updateScanCount}
          />
        )}

        {activePage === 'history' && (
          <HistoryPage onReopenScanInDetector={navigateToDetection} />
        )}

        {(activePage === 'scenarios' || activePage === 'simulation' || activePage === 'awareness') && (
          <ScenariosAndQuizPage
            onTestInDetector={navigateToDetection}
            initialTab={scenarioTab}
            initialDomain={quizDomain}
            onNavigate={handleGeneralNavigate}
          />
        )}

        {activePage === 'about' && <AboutPage />}
      </main>

      {/* Footer */}
      <Footer setActivePage={setActivePage} />

      {/* Global Auth Modal for Login and Sign-Up */}
      <AuthModal />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
