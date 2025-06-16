import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import AdminSuspicionPage from './AdminSuspicionPage';

const AdminResultPage = () => {
  const { testId, token } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const response = await api.get(`/tests/${testId}/results/${token}`);
        setResult(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [testId, token]);

  if (loading) return <div className="p-4">Chargement...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!result) return <div className="p-4">Aucun résultat trouvé.</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Résultats du candidat</h1>
      <p className="mb-2"><strong>Email :</strong> {result.email}</p>
      <p className="mb-2"><strong>Score :</strong> {result.pointsObtenus} / {result.totalPoints} ({result.scorePourcentage}%)</p>

      <div className="overflow-x-auto mt-6">
        <AdminSuspicionPage testId={testId} token={token} />

        <table className="min-w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2 text-left">Enoncé</th>
              <th className="border px-4 py-2 text-left">Réponse du candidat</th>
              <th className="border px-4 py-2 text-left">Bonne réponse</th>
              <th className="border px-4 py-2 text-center">Points</th>
              <th className="border px-4 py-2 text-center">Validé</th>
            </tr>
          </thead>
          <tbody>
            {result.reponses.map((r, index) => (
              <tr key={index} className={r.estCorrect ? 'bg-green-50' : 'bg-red-50'}>
                <td className="border px-4 py-2">{r.enonce}</td>
                <td className="border px-4 py-2">
                  {Array.isArray(r.reponseCandidat)
                    ? r.reponseCandidat.join(', ')
                    : r.reponseCandidat}
                </td>
                <td className="border px-4 py-2">
                  {Array.isArray(r.bonneReponse)
                    ? r.bonneReponse.join(', ')
                    : r.bonneReponse}
                </td>
                <td className="border px-4 py-2 text-center">{r.points}</td>
                <td className="border px-4 py-2 text-center">
                  {r.estCorrect ? '✔️' : '❌'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminResultPage;
