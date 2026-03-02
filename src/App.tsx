import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Branches from "./pages/Branches";
import BranchDetail from "./pages/BranchDetail";
import Signage from "./pages/Signage";
import Sfa from "./pages/Sfa";
import SfaNew from "./pages/SfaNew";
import Analytics from "./pages/Analytics";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import Notifications from "./pages/Notifications";
import Approvals from "./pages/Approvals";
import Reactions from "./pages/Reactions";
import Calendar from "./pages/Calendar";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/branches" element={<Branches />} />
          <Route path="/branches/:id" element={<BranchDetail />} />
          <Route path="/signage" element={<Signage />} />
          <Route path="/signage/calendar" element={<Calendar />} />
          <Route path="/sfa" element={<Sfa />} />
          <Route path="/sfa/new" element={<SfaNew />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/approvals" element={<Approvals />} />
          <Route path="/reactions" element={<Reactions />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
