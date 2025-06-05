import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function useAuth() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('access_token', response.data.accessToken);
      localStorage.setItem('refresh_token', response.data.refreshToken);
      navigate('/dashboard');
      window.location.reload();
      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur de connexion');
      return false;
    }
  };

  const logout = () => {
    console.log("logout");
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  return { login, logout, error };
}