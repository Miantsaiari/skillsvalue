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
  const [timeLeft, setTimeLeft] = useState(1); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const disableRightClick = (e) => e.preventDefault();
    const disableSelection = () => document.body.style.userSelect = 'none';

    document.addEventListener('contextmenu', disableRightClick);
    disableSelection();

    const blockKeys = (e) => {
      const keyCombo = `${e.ctrlKey ? 'Control+' : ''}${e.shiftKey ? 'Shift+' : ''}${e.key.toLowerCase()}`;
      const blockedCombos = [
        'f12', 'printscreen',
        'control+u', 'control+c', 'control+v', 'control+x',
        'control+shift+i', 'control+shift+j'
      ];
      if (blockedCombos.includes(e.key.toLowerCase()) || blockedCombos.includes(keyCombo)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const handleBlur = () => {
      alert("Ne changez pas d'onglet !");
    };

    const handleMouseLeave = () => {
      alert("Ne quittez pas la page !");
    };

    document.addEventListener('keydown', blockKeys);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('contextmenu', disableRightClick);
      document.body.style.userSelect = 'auto';
      document.removeEventListener('keydown', blockKeys);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  useEffect(() => {
  const handleBlur = () => {
    sendSuspicion('blur');
  };

  const handleMouseLeave = () => {
    sendSuspicion('mouseleave');
  };

  const sendSuspicion = async (eventType) => {
    try {
      await api.post(`/tests/${testId}/suspicion`, {
        token,
        event: eventType
      });
    } catch (err) {
      console.error("Erreur suspicion:", err.message);
    }
  };

  window.addEventListener('blur', handleBlur);
  document.addEventListener('mouseleave', handleMouseLeave);

  return () => {
    window.removeEventListener('blur', handleBlur);
    document.removeEventListener('mouseleave', handleMouseLeave);
  };
}, [testId, token]);

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
          api.get(`/tests/${testId}/questions/candidate`, { params: { token } }),
        ]);

        setTestInfo(testRes.data);
        setQuestions(questionsRes.data);
        const savedTime = localStorage.getItem(`timeLeft-${testId}-${token}`);
        setTimeLeft(savedTime ? parseInt(savedTime, 10) : testRes.data.duree * 60);


        const initialAnswers = {};
        questionsRes.data.forEach(q => {
          initialAnswers[q.id] = q.type === 'choix_multiple' ? [] : '';
        });
        setAnswers(initialAnswers);

      } catch (err) {
        console.error(err);
        setError(err.response?.data?.error || 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [testId, token]);

 useEffect(() => {
  if (timeLeft <= 0) {
    handleSubmit();
    return;
  }

  const interval = setInterval(() => {
    setTimeLeft((prev) => {
      const newTime = prev - 1;
      localStorage.setItem(`timeLeft-${testId}-${token}`, newTime); // 🔁 sauvegarde à chaque tick
      return newTime;
    });
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
      const formattedAnswers = Object.entries(answers).reduce((acc, [questionId, value]) => {
        acc[questionId] = Array.isArray(value) ? value.join(', ') : value.toString();
        return acc;
      }, {});

      await api.post(`/tests/${testId}/submit`, {
        token,
        answers: formattedAnswers,
      });

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
            {['Vrai', 'Faux'].map(option => (
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
