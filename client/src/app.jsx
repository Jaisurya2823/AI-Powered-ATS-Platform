import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import theme from './theme';
import { AuthProvider } from './context/AuthContext';
import { SnackbarProvider } from './context/SnackbarContext';
import { ProtectedRoute, RecruiterRoute, ApplicantRoute } from './components/common/ProtectedRoute';
import Navbar from './components/common/Navbar';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import JobBoard from './pages/public/JobBoard';
import JobDetail from './pages/public/JobDetail';
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import MyJobs from './pages/recruiter/MyJobs';
import CreateJob from './pages/recruiter/CreateJob';
import EditJob from './pages/recruiter/EditJob';
import JobApplications from './pages/recruiter/JobApplications';
import CandidateRankings from './pages/recruiter/CandidateRankings';
import { ApplicantDashboard, MyApplications } from './pages/applicant/ApplicantPages';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <SnackbarProvider>
            <BrowserRouter>
              <Navbar />
              <Box sx={{ minHeight: 'calc(100vh - 64px)', bgcolor: 'background.default' }}>
                <Routes>
                  {/* Public */}
                  <Route path="/" element={<Navigate to="/jobs" replace />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/jobs" element={<JobBoard />} />
                  <Route path="/jobs/:id" element={<JobDetail />} />

                  {/* Recruiter */}
                  <Route path="/recruiter/dashboard" element={<RecruiterRoute><RecruiterDashboard /></RecruiterRoute>} />
                  <Route path="/recruiter/jobs" element={<RecruiterRoute><MyJobs /></RecruiterRoute>} />
                  <Route path="/recruiter/jobs/create" element={<RecruiterRoute><CreateJob /></RecruiterRoute>} />
                  <Route path="/recruiter/jobs/:jobId/edit" element={<RecruiterRoute><EditJob /></RecruiterRoute>} />
                  <Route path="/recruiter/jobs/:jobId/applications" element={<RecruiterRoute><JobApplications /></RecruiterRoute>} />
                  <Route path="/recruiter/jobs/:jobId/rankings" element={<RecruiterRoute><CandidateRankings /></RecruiterRoute>} />

                  {/* Applicant */}
                  <Route path="/applicant/dashboard" element={<ApplicantRoute><ApplicantDashboard /></ApplicantRoute>} />
                  <Route path="/applicant/applications" element={<ApplicantRoute><MyApplications /></ApplicantRoute>} />

                  {/* 404 */}
                  <Route path="*" element={<Navigate to="/jobs" replace />} />
                </Routes>
              </Box>
            </BrowserRouter>
          </SnackbarProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}