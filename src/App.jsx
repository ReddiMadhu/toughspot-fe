import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

const HomePage    = lazy(() => import('./pages/HomePage.jsx'));
const UploadPage  = lazy(() => import('./pages/UploadPage.jsx'));
const ExportPage  = lazy(() => import('./pages/ExportPage.jsx'));

// Wizard pages — 4-step agent-driven wizard
const Page1DataUnderstanding = lazy(() => import('./pages/migration-wizard/Page1DataUnderstanding.jsx'));
const Page2ModelIntelligence = lazy(() => import('./pages/migration-wizard/Page2ModelIntelligence.jsx'));
const Page3DAXConversion     = lazy(() => import('./pages/migration-wizard/Page4DAXConversion.jsx'));
const Page4Export            = lazy(() => import('./pages/migration-wizard/Page4Export.jsx'));

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'white',
            color: '#111827',
            borderRadius: '10px',
            boxShadow: '0 4px 24px -4px rgba(0,0,0,0.12)',
            border: '1px solid #e2e8f0',
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.875rem',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Core flow */}
          <Route path="/"       element={<HomePage />} />
          <Route path="/upload" element={<UploadPage />} />

          {/* Wizard — 4 agent-driven steps */}
          <Route path="/migration-wizard/:migrationId/data-understanding" element={<Page1DataUnderstanding />} />
          <Route path="/migration-wizard/:migrationId/model-intelligence"  element={<Page2ModelIntelligence />} />
          <Route path="/migration-wizard/:migrationId/dax-conversion"      element={<Page3DAXConversion />} />
          <Route path="/migration-wizard/:migrationId/export"              element={<Page4Export />} />

          {/* Legacy route redirects */}
          <Route path="/migration/:migrationId/export" element={<Navigate to="../export" replace />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
