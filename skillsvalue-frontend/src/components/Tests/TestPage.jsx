import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import api from '../../services/api';

export default function TestPage() {
  const { testId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!token) {
        setError('Token manquant');
        setLoading(false);
        return;
      }
      try {
        const res = await api.get(`/tests/${testId}/questions`, { token });
        console.log(res.data);
        
        setQuestions(res.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Lien invalide ou expiré');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [testId, token]);

  const handleChange = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    try {
      await api.post(`/tests/${testId}/submit`, { token, answers });
      navigate('/merci');
    } catch {
      alert('Erreur lors de la soumission');
    }
  };

  if (loading) return <div>Chargement…</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-6">Test #{testId}</h1>
      {questions.map((q, idx) => (
  <div key={q.id} className="mb-4">
    <p className="font-semibold">{idx + 1}. {q.enonce}</p>
    {q.type === 'vrai_faux' && (
  <div className="mt-2">
    <label className="mr-4">
      <input
        type="radio"
        name={`vf-${q.id}`}
        value="vrai"
        checked={answers[q.id] === 'vrai'}
        onChange={() => handleChange(q.id, 'vrai')}
      />
      <span className="ml-2">Vrai</span>
    </label>
    <label>
      <input
        type="radio"
        name={`vf-${q.id}`}
        value="faux"
        checked={answers[q.id] === 'faux'}
        onChange={() => handleChange(q.id, 'faux')}
      />
      <span className="ml-2">Faux</span>
    </label>
  </div>
)}


    {q.type === 'texte_libre' && (
      <textarea
        className="w-full border p-2 rounded mt-2"
        rows={4}
        value={answers[q.id] || ''}
        onChange={e => handleChange(q.id, e.target.value)}
      />
    )}

    {q.type === 'choix_multiple' && Array.isArray(q.options) && (
      <div className="mt-2">
        {q.options.map((option, i) => (
          <label key={i} className="block">
            <input
              type="checkbox"
              value={option}
              checked={Array.isArray(answers[q.id]) && answers[q.id].includes(option)}
              onChange={e => {
                const selected = answers[q.id] || [];
                if (e.target.checked) {
                  handleChange(q.id, [...selected, option]);
                } else {
                  handleChange(
                    q.id,
                    selected.filter(opt => opt !== option)
                  );
                }
              }}
            />
            <span className="ml-2">{option}</span>
          </label>
        ))}
      </div>
    )}
  </div>
))}

      <button
        onClick={handleSubmit}
        className="mt-6 bg-green-600 text-white px-4 py-2 rounded"
      >
        Soumettre les réponses
      </button>
    </div>
  );
}
