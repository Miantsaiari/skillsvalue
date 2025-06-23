  import { useState, useEffect } from 'react';
  import api from '../../services/api';
  import PrivateRoute from '../Auth/PrivateRoute';
  import { useAuth } from '../../contexts/AuthContext';
  import { Link } from 'react-router-dom';
  import { Share2, Trash2 } from 'lucide-react';
  import { useNavigate } from 'react-router-dom';

  export default function Dashboard() {
    const navigate = useNavigate();
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

    const handleTestClick = (test) => {
      if (test.is_generated) {
        // Redirection vers page spéciale pour les tests générés
        navigate(`/generated-test/${test.id}`);
      } else {
        // Comportement normal pour les tests manuels
        navigate(`/tests/${test.id}`);
      }
    };

    const handleDeleteTest = async (testId, e) => {
    e.stopPropagation(); // Empêche le déclenchement du clic sur le test
    if (!window.confirm('Voulez-vous vraiment supprimer ce test ?')) return;

    try {
      setMessage('Suppression en cours...');
      await api.delete(`/tests/${testId}`);
      
      // Mise à jour optimiste de l'état local
      setTests(prev => prev.filter(test => test.id !== testId));
      setMessage('Test supprimé avec succès !');
      
    } catch (error) {
      console.error('Erreur suppression:', error);
      setMessage(error.response?.data?.error || 'Erreur lors de la suppression');
    }
  };

    useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await api.get('/tests');
        const formattedTests = response.data.map(test => ({
          ...test,
          // Convertit la chaîne JSON en tableau si nécessaire
          questions: test.questions 
            ? typeof test.questions === 'string' 
              ? JSON.parse(test.questions).items 
              : test.questions
            : []
        }));
        console.log('Tests formatés:', formattedTests);
        setTests(formattedTests);
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

    // Nouvelle fonction pour générer les tests via l'API interview
    const handleGenerateTests = async () => {
    try {
      const tech = prompt("Quelle technologie pour générer les questions ? (ex: react)");
      if (!tech || tech.trim() === "") return;

      setMessage(`Préparation des questions ${tech}...`);

      // 1. Scraper les questions et réponses depuis la source
      const scrapeResponse = await api.post('/scrape-interview-questions', { tech });
      const { questions, title, url: sourceUrl } = scrapeResponse.data;

      if (!questions?.length) {
        throw new Error("Aucune question n'a pu être récupérée");
      }

      // 2. Formater les questions pour le stockage
      const formattedQuestions = questions.map(q => ({
        question: typeof q === 'string' ? q : q.question || 'Question non formatée',
        answer: typeof q === 'string' ? '' : q.answer || 'Réponse non disponible'
      }));

      // 3. Sauvegarder dans la table 'test'
      const testResponse = await api.post('/tests', {
        titre: `${tech}`,
        description: `Questions générées automatiquement (${new Date().toLocaleDateString()})`,
        duree: 30,
        questions: JSON.stringify({
          items: formattedQuestions,
          source: sourceUrl,
          tech,
          generated_at: new Date().toISOString()
        }),
        is_generated: true
      });

      // 4. Mise à jour de l'état local
      const newTest = {
        ...testResponse.data,
        questions: formattedQuestions, // Tableau prêt pour l'affichage
        is_generated: true
      };

      setTests(prev => [newTest, ...prev]);
      setMessage(`Test créé avec ${formattedQuestions.length} questions !`);

    } catch (error) {
      console.error('Erreur:', {
        message: error.message,
        response: error.response?.data
      });
      
      setMessage(error.response?.data?.error || 
                error.message || 
                "Erreur lors de la création");
    }
  };


    return (
      <PrivateRoute>
        <div className="min-h-screen bg-gray-100">
          <main className="max-w-5xl mx-auto py-6 px-4">
            {message && (
              <div className="mb-4 p-2 bg-blue-100 text-blue-800 rounded">{message}</div>
            )}

            <div className="mb-6 flex space-x-4">
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                {showForm ? 'Annuler' : 'Créer un nouveau test'}
              </button>

              <button
                onClick={handleGenerateTests}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              >
                Générer des tests
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
              <div className="space-y-6">
      {tests.map((test) => (
        <div key={test.id} className="bg-white p-4 rounded shadow">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {/* Titre cliquable avec style différent selon le type */}
              <div 
                className={`cursor-pointer ${test.is_generated ? 'group' : ''}`}
                onClick={() => handleTestClick(test)}
              >
                <h3 className={`text-lg font-bold ${
                  test.is_generated 
                    ? 'text-purple-600 group-hover:underline' 
                    : 'text-blue-600 hover:underline'
                }`}>
                  {test.titre}
                  {test.is_generated && (
                    <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                      Auto-généré
                    </span>
                  )}
                </h3>
                <p className="text-sm text-gray-600">{test.description}</p>
                <p className="text-sm">Durée : {test.duree} minutes</p>
              </div>
            </div>
            <div className="flex flex-col space-y-2 items-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            openInviteModal(test.id);
          }}
          className="text-blue-500 hover:text-blue-700"
          title="Inviter un candidat"
        >
          <Share2 size={20} />
        </button>
        
        <button
          onClick={(e) => handleDeleteTest(test.id, e)}
          className="text-red-500 hover:text-red-700"
          title="Supprimer le test"
        >
          <Trash2 size={20} />
        </button>
      </div>
          </div>
        </div>
      ))}
    </div>
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
