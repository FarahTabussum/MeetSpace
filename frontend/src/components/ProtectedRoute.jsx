import { Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('access_token');
  const user = localStorage.getItem('user');

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
