import { useState, useEffect } from 'react';
import api from '../../services/api';
import PrivateRoute from '../Auth/PrivateRoute';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import InviteCandidateForm from '../Candidate/inviteCandidateForm';

export default function Dashboard() {
  const { logout } = useAuth();
  const [tests, setTests] = useState([]);
  const [message, setMessage] = useState('');
  const [newTest, setNewTest] = useState({
    titre: '',
    description: '',
    duree: 30,
  });

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await api.get('/tests');
        setTests(response.data);
      } catch (err) {
        console.error('Erreur chargement tests:', err);
      }
    };
    fetchTests();
  }, []);

  const handleAddTest = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/tests', newTest);
      setTests([...tests, response.data]);
      setNewTest({ titre: '', description: '', duree: 30 });
      setMessage('Test créé avec succès !');
    } catch (err) {
      console.error('Erreur création test :', err);
      setMessage('Erreur lors de la création du test.');
    }
  };

  return (
    <PrivateRoute>
      <div className="min-h-screen bg-gray-100">
        <InviteCandidateForm/>
        <main className="max-w-5xl mx-auto py-6 px-4">
          {message && (
            <div className="mb-4 p-2 bg-blue-100 text-blue-800 rounded">{message}</div>
          )}

          {/* Formulaire d'ajout de test */}
          <div className="mb-8 border rounded p-4 shadow bg-white">
            <h2 className="text-xl font-semibold mb-3">Créer un nouveau test</h2>
            <form onSubmit={handleAddTest} className="space-y-3">
              <input
                type="text"
                placeholder="Titre du test"
                className="w-full border px-3 py-2 rounded"
                value={newTest.titre}
                onChange={(e) => setNewTest({ ...newTest, titre: e.target.value })}
                required
              />
              <textarea
                placeholder="Description"
                className="w-full border px-3 py-2 rounded"
                value={newTest.description}
                onChange={(e) => setNewTest({ ...newTest, description: e.target.value })}
              />
              <input
                type="number"
                placeholder="Durée (en minutes)"
                className="w-full border px-3 py-2 rounded"
                value={newTest.duree}
                onChange={(e) => setNewTest({ ...newTest, duree: parseInt(e.target.value) })}
                required
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Créer le test
              </button>
            </form>
          </div>

          {/* Liste des tests */}
          <div className="space-y-6">
            {tests.map((test) => (
              <div key={test.id} className="bg-white p-4 rounded shadow">
                <Link to={`/tests/${test.id}`} className="text-lg font-bold text-blue-600 hover:underline">
  {test.titre}
</Link>
                <p className="text-sm text-gray-600 mb-2">{test.description}</p>
                <p className="text-sm mb-4">Durée : {test.duree} minutes</p>
              </div>
            ))}
          </div>
        </main>
      </div>
    </PrivateRoute>
  );
}
