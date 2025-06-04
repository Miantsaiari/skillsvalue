import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import api from '../../services/api';

export default function TestStart() {
  const { testId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [testInfo, setTestInfo] = useState(null);
  const [candidateId, setCandidateId] = useState(null);

  const handleStartTest = () => {
  const token = searchParams.get("token");
  navigate(`/tests/${testId}/page?token=${token}&candidateId=${candidateId}`);
};


  useEffect(() => {
    const verifyToken = async () => {
      try {
        const res = await api.post(`/candidates/${testId}/verify-token`, { token });
        setCandidateId(res.data.candidateId);
        setTestInfo(res.data); 
      } catch (err) {
        setError(err.response?.data?.error || "Lien invalide ou expiré.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      verifyToken();
    } else {
      setError("Token manquant.");
      setLoading(false);
    }
  }, [testId, token]);

  if (loading) return <div className="p-4">Chargement...</div>;

  if (error) {
    return <div className="p-4 text-red-600 font-semibold">{error}</div>;
  }

  return (
    <div className="p-6 max-w-xl mx-auto bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-4">Bienvenue au test</h1>
      <p className="mb-6">Vous êtes invité à passer le test : <strong>{testInfo.testTitle}</strong></p>
      <button 
  onClick={handleStartTest} 
  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
>
  Commencer le test
</button>

    </div>
  );
}
