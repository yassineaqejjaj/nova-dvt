import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import { InstantPRD } from "./components/InstantPRD";
import TestCaseGeneratorPage from "./pages/TestCaseGenerator";
import CriticalPathAnalyzerPage from "./pages/CriticalPathAnalyzer";
import { UserResearch } from "./pages/UserResearch";
import SmartDiscovery from "./pages/SmartDiscovery";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
