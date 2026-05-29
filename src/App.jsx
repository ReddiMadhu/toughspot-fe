import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

const HomePage = lazy(() => import('./pages/HomePage.jsx'));
const UploadPage = lazy(() => import('./pages/UploadPage.jsx'));
const ProcessingPage = lazy(() => import('./pages/ProcessingPage.jsx'));
const ReviewPage = lazy(() => import('./pages/ReviewPage.jsx'));
const DataModelPage = lazy(() => import('./pages/DataModelPage.jsx'));
const ExportPage = lazy(() => import('./pages/ExportPage.jsx'));

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
            background: '#fff',
            color: '#111827',
            borderRadius: '10px',
            boxShadow: '0 4px 24px -4px rgba(0,0,0,0.12)',
            border: '1px solid #e2e8f0',
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.875rem',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/migration/:migrationId/processing" element={<ProcessingPage />} />
          <Route path="/migration/:migrationId/review" element={<ReviewPage />} />
          <Route path="/migration/:migrationId/data-model" element={<DataModelPage />} />
          <Route path="/migration/:migrationId/export" element={<ExportPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
