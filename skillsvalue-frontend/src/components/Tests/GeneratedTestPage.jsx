import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../../services/api';
import { ArrowLeft, Check, Trash2, Plus, X } from 'lucide-react';

export default function GeneratedTestPage() {
  const { id } = useParams();
  const [loadingQcmIndex, setLoadingQcmIndex] = useState(null);
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedQuestions, setSelectedQuestions] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [qcmData, setQcmData] = useState({
    question: '',
    answers: [''],
    correctIndex: 0
  });

  const generateQcmFromAi = async (questionText, answerText) => {
  const prompt = `Generate a multiple-choice quiz with 5 answers (1 correct + 4 false but plausible) for the following question.
Use the provided answer to formulate a short, clear, and correct answer (summary sentence).
Make sure all answers are consistent with the technical context:

Question: ${questionText}

Answer: ${answerText}`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer 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',
        'HTTP-Referer': 'https://www.sitename.com',
        'X-Title': 'SiteName',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1:free',
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    const markdown = data.choices?.[0]?.message?.content;

    return markdown;
  } catch (error) {
    console.error('Erreur génération QCM:', error);
    return null;
  }
};


  useEffect(() => {
    const fetchTest = async () => {
  try {
    const response = await api.get(`/tests/${id}`);
    const testData = response.data;
    
    let questions = [];
    try {
      // Essayez de parser si c'est une string
      const parsed = typeof testData.questions === 'string' 
        ? JSON.parse(testData.questions) 
        : testData.questions;
      
      questions = parsed.items || parsed || [];
    } catch (e) {
      console.error('Erreur parsing questions:', e);
      questions = testData.questions || [];
    }

    const initialSelection = {};
    questions.forEach((_, index) => {
      initialSelection[index] = true;
    });

    setTest({ ...testData, questions });
    setSelectedQuestions(initialSelection);
  } catch (error) {
    console.error('Erreur:', error);
    setTest(null); // Explicitement mettre à null si erreur
  } finally {
    setLoading(false);
  }
};

    fetchTest();
  }, [id]);

  const startEditing = async (index) => {
  const question = test.questions[index];

  // Active le loading pour ce bouton
  setLoadingQcmIndex(index);

  // Si déjà QCM, édition directe
  if (question.isQcm) {
    setEditingIndex(index);
    setQcmData({
      question: question.question,
      answers: question.answers,
      correctIndex: question.correctIndex
    });
    setLoadingQcmIndex(null);
    return;
  }

  // Génération automatique via IA
  const aiQcm = await generateQcmFromAi(question.question, question.answer);

  setLoadingQcmIndex(null); // Désactive le loading dans tous les cas

  if (!aiQcm) {
    alert('Impossible de générer le QCM.');
    return;
  }

  const lines = aiQcm.split('\n').map(l => l.trim()).filter(Boolean);
  const answers = [];
  let qText = question.question;
  let correctIndex = 0;

  lines.forEach((line, i) => {
    if (line.startsWith('### Question')) {
      qText = lines[i + 1] || question.question;
    }
    if (line.match(/^[A-Da-d][\).]/)) {
      answers.push(line.replace(/^[A-Da-d][\).]\s*/, ''));
    }
    if (line.toLowerCase().startsWith('### bonne réponse') || line.toLowerCase().includes('correct answer')) {
      const correct = lines[i + 1] || '';
      if (correct.includes('A')) correctIndex = 0;
      else if (correct.includes('B')) correctIndex = 1;
      else if (correct.includes('C')) correctIndex = 2;
      else if (correct.includes('D')) correctIndex = 3;
    }
  });

  setEditingIndex(index);
  setQcmData({
    question: qText,
    answers,
    correctIndex
  });
};



  const handleAnswerChange = (index, value) => {
    const newAnswers = [...qcmData.answers];
    newAnswers[index] = value;
    setQcmData({...qcmData, answers: newAnswers});
  };

  const addAnswer = () => {
    setQcmData({
      ...qcmData,
      answers: [...qcmData.answers, '']
    });
  };

  const removeAnswer = (index) => {
    const newAnswers = qcmData.answers.filter((_, i) => i !== index);
    const newCorrectIndex = 
      qcmData.correctIndex === index ? 0 :
      qcmData.correctIndex > index ? qcmData.correctIndex - 1 :
      qcmData.correctIndex;
    
    setQcmData({
      ...qcmData,
      answers: newAnswers,
      correctIndex: newCorrectIndex
    });
  };

  const saveQcm = async () => {
  try {
    const updatedQuestions = [...test.questions];
    updatedQuestions[editingIndex] = {
      ...updatedQuestions[editingIndex],
      question: qcmData.question,
      answers: qcmData.answers.filter(a => a.trim() !== ''),
      correctIndex: qcmData.correctIndex,
      isQcm: true
    };
    
    // Préparer le payload pour le backend
    const payload = {
      ...test,
      questions: JSON.stringify({
        items: updatedQuestions,
        source: test.source_url,
        tech: test.tech,
        filtered: false
      })
    };

    // Envoyer les modifications au backend
    const response = await api.put(`/tests/${id}`, payload);

    if (response.data) {
      // Mettre à jour le state avec les nouvelles données
      setTest({
        ...test,
        questions: updatedQuestions
      });
      setEditingIndex(null);
      alert('QCM enregistré avec succès!');
    }
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du QCM:', error);
    alert('Erreur lors de la sauvegarde du QCM');
  }
};

  const toggleQuestionSelection = (index) => {
    setSelectedQuestions(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleSaveSelection = async () => {
  try {
    const filteredQuestions = test.questions.filter(
      (_, index) => selectedQuestions[index]
    );

    // Préparer l'objet exactement comme attendu par le backend
    const payload = {
      ...test,
      questions: JSON.stringify({
        items: filteredQuestions,
        source: test.source_url,
        tech: test.tech,
        filtered: true
      })
    };

    const response = await api.put(`/tests/${id}`, payload);
    
    if (response.data) {
      // Mettre à jour le state avec les nouvelles données
      setTest({
        ...test,
        questions: filteredQuestions
      });
      setIsEditing(false);
    }
  } catch (error) {
    console.error('Erreur sauvegarde:', error);
    alert('Erreur lors de la sauvegarde');
  }
};

  if (loading) return <div className="text-center py-8">Chargement...</div>;
  if (!test) return <div className="text-center py-8">Test non trouvé</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-blue-600 mb-4"
      >
        <ArrowLeft size={18} className="mr-1" />
        Retour aux tests
      </button>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-purple-700 mb-2">{test.titre}</h1>
            <p className="text-gray-600">{test.description}</p>
          </div>
          
          {!isEditing ? (
            <div className="flex space-x-2">
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
              >
                Supprimer des questions
              </button>
            </div>
          ) : (
            <div className="space-x-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 border rounded"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveSelection}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Sauvegarder
              </button>
            </div>
          )}
        </div>

        <h2 className="text-xl font-semibold mb-4 border-b pb-2">
          {test.questions.length} Questions
          {isEditing && ` (${test.questions.length - Object.values(selectedQuestions).filter(Boolean).length} à supprimer)`}
        </h2>
        
        <div className="space-y-3">
          {test.questions.map((question, index) => (
            <div 
              key={index} 
              className={`p-4 border rounded-lg ${
                isEditing && !selectedQuestions[index] ? 'opacity-50 bg-gray-50' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {isEditing ? (
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={!!selectedQuestions[index]}
                        onChange={() => toggleQuestionSelection(index)}
                        className="mr-3"
                      />
                      <h4 className="font-medium text-lg">
                        {index + 1}. {question.question}
                      </h4>
                    </div>
                  ) : (
                    <>
                      <h4 className="font-medium text-lg">
                        {question.question}
                      </h4>
                      {question.isQcm ? (
                        <div className="mt-2 ml-4 space-y-1">
                          {question.answers.map((answer, i) => (
                            <p 
                              key={i} 
                              className={`${i === question.correctIndex ? 'text-green-600 font-medium' : 'text-gray-600'}`}
                            >
                              {i === question.correctIndex ? '✓ ' : '○ '}{answer}
                            </p>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-600 mt-1">{question.answer}</p>
                      )}
                    </>
                  )}
                </div>

                {!isEditing && (
                  <button
  onClick={() => startEditing(index)}
  className={`ml-4 px-3 py-1 rounded text-sm ${
    question.isQcm 
      ? 'bg-purple-100 text-purple-600' 
      : 'bg-blue-100 text-blue-600'
  }`}
>
  {loadingQcmIndex === index ? (
    <span className="flex items-center space-x-2">
      <svg className="animate-spin h-4 w-4 mr-2 text-gray-600" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
      <span>Génération...</span>
    </span>
  ) : (
    question.isQcm ? 'Modifier QCM' : 'Créer QCM'
  )}
</button>

                )}
              </div>
            </div>
          ))}
        </div>

        {test.source_url && (
          <div className="mt-6 pt-4 border-t text-sm">
            <span className="text-gray-500">Source : </span>
            <a 
              href={test.source_url} 
              target="_blank" 
              rel="noopener"
              className="text-blue-600 hover:underline"
            >
              {new URL(test.source_url).hostname}
            </a>
          </div>
        )}
      </div>

      {editingIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-xl font-bold mb-4">
              {test.questions[editingIndex].isQcm ? 'Modifier QCM' : 'Créer QCM'}
            </h3>
            
            <div className="mb-4">
              <label className="block font-medium mb-2">Question</label>
              <input
                type="text"
                value={qcmData.question}
                onChange={(e) => setQcmData({...qcmData, question: e.target.value})}
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            <div className="space-y-2 mb-4">
              <label className="block font-medium mb-2">Réponses</label>
              {qcmData.answers.map((answer, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={qcmData.correctIndex === index}
                    onChange={() => setQcmData({...qcmData, correctIndex: index})}
                  />
                  <input
                    type="text"
                    value={answer}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    className="flex-1 border px-3 py-1 rounded"
                    placeholder={`Option ${index + 1}`}
                  />
                  {qcmData.answers.length > 1 && (
                    <button
                      onClick={() => removeAnswer(index)}
                      className="text-red-500 p-1"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addAnswer}
                className="flex items-center text-sm text-blue-600 mt-2"
              >
                <Plus size={16} className="mr-1" />
                Ajouter une réponse
              </button>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setEditingIndex(null)}
                className="px-4 py-2 border rounded"
              >
                Annuler
              </button>
              <button
                onClick={saveQcm}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled={qcmData.answers.filter(a => a.trim() !== '').length < 2}
              >
                Enregistrer QCM
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}