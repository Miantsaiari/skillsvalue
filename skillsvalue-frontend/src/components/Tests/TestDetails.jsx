import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function TestDetails() {
  const { id } = useParams();
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [question, setQuestion] = useState({
    type: 'choix_multiple',
    enonce: '',
    options: '',
    bonne_reponse: '',
    points: 1
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchTest = async () => {
      const response = await api.get(`/tests/${id}`);
      setTest(response.data);
      const questionsRes = await api.get(`/tests/${id}/questions`);
      setQuestions(questionsRes.data);
    };
    fetchTest();
  }, [id]);

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...question,
        options: question.options.split(',').map(opt => opt.trim()),
        points: parseInt(question.points)
      };
      await api.post(`/tests/${id}/questions`, payload);
      setMessage('Question ajoutée avec succès');
      setQuestion({
        type: 'choix_multiple',
        enonce: '',
        options: '',
        bonne_reponse: '',
        points: 1
      });
      setShowForm(false);
      const updated = await api.get(`/tests/${id}/questions`);
      setQuestions(updated.data);
    } catch (err) {
      setMessage('Erreur lors de l’ajout');
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {test && (
        <>
          <h1 className="text-2xl font-bold mb-4">{test.titre}</h1>
          <p className="mb-2">{test.description}</p>
          <p className="mb-4">Durée : {test.duree} minutes</p>

          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            {showForm ? 'Annuler' : 'Ajouter une question'}
          </button>

          {showForm && (
            <form onSubmit={handleAddQuestion} className="mt-4 space-y-3 border-t pt-4">
              <select
                className="w-full border px-3 py-2 rounded"
                value={question.type}
                onChange={(e) => setQuestion({ ...question, type: e.target.value })}
              >
                <option value="choix_multiple">Choix multiple</option>
                <option value="vrai_faux">Vrai / Faux</option>
                <option value="texte_libre">Texte libre</option>
              </select>
              <input
                type="text"
                placeholder="Énoncé"
                className="w-full border px-3 py-2 rounded"
                value={question.enonce}
                onChange={(e) => setQuestion({ ...question, enonce: e.target.value })}
                required
              />
              {(question.type === 'choix_multiple' || question.type === 'vrai_faux') && (
                <input
                  type="text"
                  placeholder="Options (séparées par virgules)"
                  className="w-full border px-3 py-2 rounded"
                  value={question.options}
                  onChange={(e) => setQuestion({ ...question, options: e.target.value })}
                />
              )}
              <input
                type="text"
                placeholder="Bonne réponse"
                className="w-full border px-3 py-2 rounded"
                value={question.bonne_reponse}
                onChange={(e) => setQuestion({ ...question, bonne_reponse: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Points"
                className="w-full border px-3 py-2 rounded"
                value={question.points}
                onChange={(e) => setQuestion({ ...question, points: e.target.value })}
              />
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              >
                Ajouter la question
              </button>
            </form>
          )}

          {message && <p className="mt-2 text-green-600">{message}</p>}

          <h2 className="mt-8 text-xl font-semibold">Questions existantes :</h2>
          <ul className="mt-4 space-y-4">
            {questions.map((q, i) => (
              <li key={i} className="border p-4 rounded shadow">
                <p className="font-semibold">Question {i + 1} :</p>
                <p className="mb-1">Énoncé : {q.enonce}</p>
                <p className="mb-1">Type : {q.type}</p>
                {(q.type === 'choix_multiple' || q.type === 'vrai_faux') && (
                  <div className="mb-1">
                    <p className="font-medium">Options :</p>
                    <ul className="list-disc pl-6">
                      {q.options && q.options.map((opt, index) => (
                        <li key={index}>{opt}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <p className="mb-1">Bonne réponse : <span className="font-semibold text-green-600">{q.bonne_reponse}</span></p>
                <p className="mb-1">Points : {q.points}</p>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
