import { lazy, Suspense } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AppErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingFallback } from '@/components/LoadingFallback';

// Eagerly loaded — always needed
import Index from './pages/Index';
import NotFound from './pages/NotFound';

// Lazy-loaded routes — only fetched when navigated to
const Admin = lazy(() => import('./pages/Admin'));
const InstantPRD = lazy(() =>
  import('./components/InstantPRD').then((m) => ({ default: m.InstantPRD }))
);
const TestCaseGeneratorPage = lazy(() => import('./pages/TestCaseGenerator'));
const CriticalPathAnalyzerPage = lazy(() => import('./pages/CriticalPathAnalyzer'));
const UserResearch = lazy(() =>
  import('./pages/UserResearch').then((m) => ({ default: m.UserResearch }))
);
const SmartDiscovery = lazy(() => import('./pages/SmartDiscovery'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <AppErrorBoundary>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/instant-prd" element={<InstantPRD />} />
                <Route path="/test-generator" element={<TestCaseGeneratorPage />} />
                <Route path="/critical-path-analyzer" element={<CriticalPathAnalyzerPage />} />
                <Route path="/user-research" element={<UserResearch />} />
                <Route path="/smart-discovery" element={<SmartDiscovery />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AppErrorBoundary>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
