import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';

export default function AdminResultPage() {
  const { testId, token } = useParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState(" ");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await api.get(`/tests/${testId}/results/${token}`);
        setResults(res.data);
        setEmail(res.data[0].email)
      } catch (err) {
        setError(err.response?.data?.error || 'Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [testId, token]);

  if (loading) return <div>Chargement des résultats...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-4">Résultats du candidat ({email})</h1>
      {results.map((r, i) => (
        <div key={i} className="mb-4">
          <p className="font-semibold">{i + 1}. {r.enonce}</p>
          <p className="text-gray-700 mt-1">Réponse : 
            <span className="ml-2 bg-gray-100 px-2 py-1 rounded">
              {Array.isArray(r.reponse) ? r.reponse.join(', ') : r.reponse}
            </span>
          </p>
        </div>
      ))}
    </div>
  );
}
