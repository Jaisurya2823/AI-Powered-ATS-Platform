import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return children;
};

export const RecruiterRoute = ({ children }) => {
  const { isLoggedIn, isRecruiter } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (!isRecruiter) return <Navigate to="/applicant/dashboard" replace />;
  return children;
};

export const ApplicantRoute = ({ children }) => {
  const { isLoggedIn, isApplicant } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (!isApplicant) return <Navigate to="/recruiter/dashboard" replace />;
  return children;
};