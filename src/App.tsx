
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import DemoMode from "./pages/DemoMode";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import { InstantPRD } from "./components/InstantPRD";
import TestCaseGeneratorPage from "./pages/TestCaseGenerator";
import CriticalPathAnalyzerPage from "./pages/CriticalPathAnalyzer";
import { UserResearch } from "./pages/UserResearch";
import SmartDiscovery from "./pages/SmartDiscovery";
import Vision from "./pages/Vision";
import Product from "./pages/Product";
import UseCases from "./pages/UseCases";
import Demo from "./pages/Demo";
import Agents from "./pages/Agents";
import WorkflowsPage from "./pages/Workflows";
import Artefacts from "./pages/Artefacts";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/discover" element={<DemoMode />} />
            <Route path="/vision" element={<Vision />} />
            <Route path="/product" element={<Product />} />
            <Route path="/use-cases" element={<UseCases />} />
            <Route path="/demo" element={<Demo />} />
            <Route path="/agents" element={<Agents />} />
            <Route path="/workflows" element={<WorkflowsPage />} />
            <Route path="/artefacts" element={<Artefacts />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/instant-prd" element={<InstantPRD />} />
            <Route path="/test-generator" element={<TestCaseGeneratorPage />} />
            <Route path="/critical-path-analyzer" element={<CriticalPathAnalyzerPage />} />
            <Route path="/user-research" element={<UserResearch />} />
            <Route path="/smart-discovery" element={<SmartDiscovery />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
