import { useState, useEffect } from 'react';
import api from '../../services/api';
import PrivateRoute from '../Auth/PrivateRoute';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Share2 } from 'lucide-react'; // Icône de partage

export default function Dashboard() {
  const { logout } = useAuth();
  const [tests, setTests] = useState([]);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');

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
      setShowForm(false);
    } catch (err) {
      console.error('Erreur création test :', err);
      setMessage('Erreur lors de la création du test.');
    }
  };

  const openInviteModal = (testId) => {
    setSelectedTestId(testId);
    setInviteModalOpen(true);
    setInviteEmail('');
    setInviteMessage('');
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/candidates/invite', {
        email: inviteEmail,
        test_id: selectedTestId,
      });
      setInviteMessage(`Invitation envoyée avec succès à ${inviteEmail}`);
      setInviteEmail('');
    } catch (err) {
      console.error(err);
      setInviteMessage('Erreur lors de l’envoi de l’invitation');
    }
  };

  return (
    <PrivateRoute>
      <div className="min-h-screen bg-gray-100">
        <main className="max-w-5xl mx-auto py-6 px-4">
          {message && (
            <div className="mb-4 p-2 bg-blue-100 text-blue-800 rounded">{message}</div>
          )}

          <div className="mb-6">
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              {showForm ? 'Annuler' : 'Créer un nouveau test'}
            </button>
          </div>

          {showForm && (
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
          )}

          <div className="space-y-6">
            {tests.map((test) => (
              <div key={test.id} className="bg-white p-4 rounded shadow flex justify-between items-start">
                <div>
                  <Link
                    to={`/tests/${test.id}`}
                    className="text-lg font-bold text-blue-600 hover:underline"
                  >
                    {test.titre}
                  </Link>
                  <p className="text-sm text-gray-600 mb-2">{test.description}</p>
                  <p className="text-sm mb-4">Durée : {test.duree} minutes</p>
                </div>
                <button
                  onClick={() => openInviteModal(test.id)}
                  className="text-blue-500 hover:text-blue-700"
                  title="Inviter un candidat"
                >
                  <Share2 size={24} />
                </button>
              </div>
            ))}
          </div>
        </main>

        {inviteModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-white/30 z-50">
            <div className="bg-white p-6 rounded shadow max-w-md w-full relative">
              <h2 className="text-xl font-bold mb-4">Inviter un candidat</h2>
              <form onSubmit={handleInviteSubmit} className="space-y-4">
                <div>
                  <label className="block font-medium">Email du candidat</label>
                  <input
                    type="email"
                    className="w-full border px-3 py-2 rounded"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  Envoyer l'invitation
                </button>
              </form>
              {inviteMessage && (
                <p className="mt-4 text-sm text-green-600">{inviteMessage}</p>
              )}
              <button
                onClick={() => setInviteModalOpen(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-black text-lg"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </PrivateRoute>
  );
}
