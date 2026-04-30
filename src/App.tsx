import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { Suspense } from "react";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Layout from "./components/Layout";
import PWAPrompt from "./components/PWAPrompt";

import HomePage from "./pages/HomePage";
const AgentProcessPage = React.lazy(() => import("./pages/AgentProcessPage"));
const ResultPage = React.lazy(() => import("./pages/ResultPage"));
const HistoryPage = React.lazy(() => import("./pages/HistoryPage"));
const SettingsPage = React.lazy(() => import("./pages/SettingsPage"));
const LoginPage = React.lazy(() => import("./pages/LoginPage"));
const VerifyPage = React.lazy(() => import("./pages/VerifyPage"));
const ResetPasswordPage = React.lazy(() => import("./pages/ResetPasswordPage"));
const FamilyPage = React.lazy(() => import("./pages/FamilyPage"));
const FamilyDetailPage = React.lazy(() => import("./pages/FamilyDetailPage"));
const PrepareVisitPage = React.lazy(() => import("./pages/PrepareVisitPage"));
const VisitListPage = React.lazy(() => import("./pages/VisitListPage"));
const VisitActivePage = React.lazy(() => import("./pages/VisitActivePage"));
const MedicationsPage = React.lazy(() => import("./pages/MedicationsPage"));
const NotificationsPage = React.lazy(() => import("./pages/NotificationsPage"));
const AnnualReportPage = React.lazy(() => import("./pages/AnnualReportPage"));
const PricingPage = React.lazy(() => import("./pages/PricingPage"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-[#FDFDF9]">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-stone-200 border-t-[#5A5A40]"></div>
  </div>
);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Layout>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/auth/verify" element={<VerifyPage />} />
                <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/family" element={<FamilyPage />} />
                <Route path="/family/:id" element={<FamilyDetailPage />} />
                <Route path="/process/:taskId" element={<AgentProcessPage />} />
                <Route path="/result/:taskId" element={<ResultPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/visits" element={<VisitListPage />} />
                <Route path="/visits/prepare" element={<PrepareVisitPage />} />
                <Route path="/visits/:id/active" element={<VisitActivePage />} />
                <Route path="/medications" element={<MedicationsPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/annual-report" element={<AnnualReportPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </Suspense>
          </Layout>
          <Toaster position="top-center" richColors />
          <PWAPrompt />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
