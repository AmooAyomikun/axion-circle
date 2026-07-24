import { Navigate } from 'react-router-dom';

export default function AdminRoute({ children }) {
  const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
  
  if (!token || !userStr) {
    return <Navigate to="/admin/login" replace />;
  }

  try {
    const user = JSON.parse(userStr);
    if (user?.role !== 'ADMIN') {
      return <Navigate to="/admin/login" replace />;
    }
  } catch (err) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
