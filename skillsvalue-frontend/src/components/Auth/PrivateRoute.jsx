import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {useAuth} from '../../contexts/AuthContext';

export default function PrivateRoute({ children }) {
  const { auth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.isAuthenticated) {
      navigate('/login');
    }
  }, [auth, navigate]);

  return auth.isAuthenticated ? children : null;
}