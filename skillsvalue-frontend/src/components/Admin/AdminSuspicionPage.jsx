import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function AdminSuspicionPage({ testId, token }) {
  const [suspicions, setSuspicions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuspicions = async () => {
      try {
        const res = await api.get('/admins/suspicions',{
            params: { testId, token }
        });
        setSuspicions(res.data);
      } catch (err) {
        console.error('Erreur chargement:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSuspicions();
  }, [testId, token]);

  if (loading) return <p>Chargement...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Tentatives de triche</h1>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-2 border">Test</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Événement</th>
            <th className="p-2 border">Horaire</th>
          </tr>
        </thead>
        <tbody>
          {suspicions.map((s) => (
            <tr key={s.id} className="border-b">
              <td className="p-2 border">{s.test_titre}</td>
              <td className="p-2 border">{s.email}</td>
              <td className="p-2 border text-red-600">{s.event}</td>
              <td className="p-2 border">{new Date(s.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
