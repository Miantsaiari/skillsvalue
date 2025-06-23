import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../../services/api';
import { ArrowLeft } from 'lucide-react';

export default function GeneratedTestPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const response = await api.get(`/tests/${id}`);
        const testData = response.data;
        
        // Conversion des questions
        const questions = typeof testData.questions === 'string' 
          ? JSON.parse(testData.questions).items 
          : testData.questions || [];

        setTest({ ...testData, questions });
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTest();
  }, [id]);

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
        <h1 className="text-2xl font-bold text-purple-700 mb-2">{test.titre}</h1>
        <p className="text-gray-600 mb-6">{test.description}</p>
        
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">
          {test.questions.length} Questions
        </h2>
        
        <div className="space-y-3">
          {test.questions.map((question, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-lg">
              <p className="font-medium">
                <span className="text-purple-600 mr-2"></span>
                {question}
              </p>
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
    </div>
  );
}