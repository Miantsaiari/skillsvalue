import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import api from '../../services/api';

export default function TestPage() {
  const { testId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [testInfo, setTestInfo] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(1); // en secondes
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setError('Token manquant');
        setLoading(false);
        return;
      }

      try {
        const [testRes, questionsRes] = await Promise.all([
          api.get(`/tests/${testId}/public`),
          api.get(`/tests/${testId}/questions`, { token }),
        ]);
        setTestInfo(testRes.data);
        setQuestions(questionsRes.data);
        setTimeLeft(testRes.data.duree * 60); // minutes → secondes
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.error || 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [testId, token]);

  // TIMER
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleChange = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
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

  const currentQuestion = questions[currentIdx];

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Test: {testInfo?.titre}</h1>
        <div className="text-red-600 font-mono text-lg">
          ⏳ {formatTime(timeLeft)}
        </div>
      </div>

      <div className="mb-4">
        <p className="font-semibold">{currentIdx + 1}. {currentQuestion.enonce}</p>

        {currentQuestion.type === 'vrai_faux' && (
          <div className="mt-2">
            {['vrai', 'faux'].map(option => (
              <label key={option} className="mr-4">
                <input
                  type="radio"
                  name={`vf-${currentQuestion.id}`}
                  value={option}
                  checked={answers[currentQuestion.id] === option}
                  onChange={() => handleChange(currentQuestion.id, option)}
                />
                <span className="ml-2 capitalize">{option}</span>
              </label>
            ))}
          </div>
        )}

        {currentQuestion.type === 'texte_libre' && (
          <textarea
            className="w-full border p-2 rounded mt-2"
            rows={4}
            value={answers[currentQuestion.id] || ''}
            onChange={e => handleChange(currentQuestion.id, e.target.value)}
          />
        )}

        {currentQuestion.type === 'choix_multiple' && Array.isArray(currentQuestion.options) && (
          <div className="mt-2">
            {currentQuestion.options.map((option, i) => (
              <label key={i} className="block">
                <input
                  type="checkbox"
                  value={option}
                  checked={Array.isArray(answers[currentQuestion.id]) && answers[currentQuestion.id].includes(option)}
                  onChange={e => {
                    const selected = answers[currentQuestion.id] || [];
                    if (e.target.checked) {
                      handleChange(currentQuestion.id, [...selected, option]);
                    } else {
                      handleChange(
                        currentQuestion.id,
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

      <div className="flex justify-between mt-6">
        <button
          onClick={handlePrev}
          disabled={currentIdx === 0}
          className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
        >
          Précédent
        </button>

        {currentIdx < questions.length - 1 ? (
          <button
            onClick={handleNext}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Suivant
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Soumettre
          </button>
        )}
      </div>
    </div>
  );
}
