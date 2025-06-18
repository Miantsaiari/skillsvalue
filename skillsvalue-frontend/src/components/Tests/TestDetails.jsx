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
    points: 1,
    images: []
  });
  const [message, setMessage] = useState('');
  const [previewImages, setPreviewImages] = useState([]);

  useEffect(() => {
    const fetchTest = async () => {
      const response = await api.get(`/tests/${id}`);
      setTest(response.data);
      const questionsRes = await api.get(`/tests/${id}/questions`);
      setQuestions(questionsRes.data);
    };
    fetchTest();
  }, [id]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Création des prévisualisations
    const imagePreviews = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    
    setPreviewImages([...previewImages, ...imagePreviews]);
    setQuestion({ ...question, images: [...question.images, ...files] });
  };

  const removeImage = (index) => {
    const newImages = [...question.images];
    const newPreviews = [...previewImages];
    
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setQuestion({ ...question, images: newImages });
    setPreviewImages(newPreviews);
  };

  const handleAddQuestion = async (e) => {
  e.preventDefault();
  try {
    const formData = new FormData();
    formData.append('type', question.type);
    formData.append('enonce', question.enonce);
    formData.append('bonne_reponse', question.bonne_reponse);
    formData.append('points', question.points.toString());
    
    // Modifiez cette partie pour les options
    if (question.type === 'choix_multiple') {
      const options = question.options.split(',').map(opt => opt.trim());
      formData.append('options', JSON.stringify(options));
    } else {
      formData.append('options', JSON.stringify([]));
    }
    
    // Ajout des images
    question.images.forEach((image) => {
      formData.append('images', image);
    });

    const response = await api.post(`/tests/${id}/questions`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    // ... reste du code inchangé
  } catch (err) {
    console.error('Erreur détaillée:', err.response?.data);
    setMessage(`Erreur: ${err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || err.message}`);
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
              
              {/* Champ pour uploader des images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Images (optionnel)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full border px-3 py-2 rounded"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Vous pouvez ajouter jusqu'à 5 images (max 5MB chacune)
                </p>
              </div>
              
              {/* Prévisualisation des images */}
              {previewImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {previewImages.map((img, index) => (
                    <div key={index} className="relative">
                      <img
                        src={img.preview}
                        alt={`Preview ${index}`}
                        className="h-24 w-full object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
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
      
      {q.images && q.images.length > 0 && (
        <div className="mb-2">
          <p className="font-medium">Images :</p>
          <div className="grid grid-cols-3 gap-2 mt-1">
            {q.images.map((img, index) => {
              // Correction de l'URL de l'image
              const imageUrl = img.startsWith('/') 
                ? `http://localhost:3001${img}`
                : img;
              
              return (
                <div key={index} className="relative group">
                  <a href={imageUrl} target="_blank" rel="noopener noreferrer">
                  <img
                   src={imageUrl}
                   alt={`Question ${i + 1} - Image ${index + 1}`}
                   className="h-48 w-full object-contain border rounded bg-white shadow hover:scale-105 transition-transform"
                   onError={(e) => {
                     e.target.src = 'https://via.placeholder.com/150?text=Image+Not+Found';
                   }}
                  />
                </a>

                  <span className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-center text-xs py-1">
                    Image {index + 1}
                  </span>
                </div>
              );
            })}
          </div>
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