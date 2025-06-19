import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../../services/api';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-markup-templating';
import "prismjs/components/prism-php";
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-swift';
import 'prismjs/components/prism-kotlin';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-sql';
import { highlight, languages } from 'prismjs';

export default function TestDetails() {
  const { id } = useParams();
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [question, setQuestion] = useState({
  type: 'choix_multiple',
  enonce: '',
  options: [],
  currentOption: '',
  currentCodeOption: '',
  currentLanguage: 'javascript', // Nouveau champ
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

  const addOption = () => {
  if (question.currentOption.trim() || question.currentCodeOption.trim()) {
    const newOption = {
      text: question.currentOption.trim(),
      code: question.currentCodeOption.trim(),
      language: question.currentLanguage // Sauvegarde le langage
    };
    
    setQuestion({
      ...question,
      options: [...question.options, newOption],
      currentOption: '',
      currentCodeOption: ''
    });
  }
};

const removeOption = (index) => {
  const newOptions = [...question.options];
  newOptions.splice(index, 1);
  setQuestion({ ...question, options: newOptions });
};

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
    
    // Gestion des options selon le type de question
    if (question.type === 'choix_multiple') {
      // Deux formats possibles :
      // 1. Ancien format : options séparées par des virgules (rétrocompatibilité)
      // 2. Nouveau format : tableau d'objets {text, code}
      
      let optionsToSend;
      
      if (Array.isArray(question.options)) {
        // Nouveau format avec code
        optionsToSend = question.options.map(opt => {
  return opt.code ? 
    `${opt.text || ''}\n\`\`\`${opt.language}\n${opt.code}\n\`\`\`` : 
    opt.text;
});
      } else {
        // Ancien format (string séparée par virgules)
        optionsToSend = question.options.split(',').map(opt => opt.trim());
      }
      
      formData.append('options', JSON.stringify(optionsToSend));
    } else if (question.type === 'vrai_faux') {
      // Cas particulier pour Vrai/Faux
      formData.append('options', JSON.stringify(['Vrai', 'Faux']));
    } else {
      // Texte libre ou autres types
      formData.append('options', JSON.stringify([]));
    }
    
    // Ajout des images (fonctionnalité existante)
    question.images.forEach((image) => {
      formData.append('images', image);
    });

    const response = await api.post(`/tests/${id}/questions`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    // Réinitialisation du formulaire après succès
    setQuestion({
      type: 'choix_multiple',
      enonce: '',
      options: [],
      currentOption: '',
      currentCodeOption: '',
      bonne_reponse: '',
      points: 1,
      images: []
    });
    setPreviewImages([]);
    setMessage('Question ajoutée avec succès!');
    
    // Rafraîchissement de la liste des questions
    const questionsRes = await api.get(`/tests/${id}/questions`);
    setQuestions(questionsRes.data);
    
  } catch (err) {
    console.error('Erreur détaillée:', err.response?.data);
    setMessage(`Erreur: ${err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || err.message}`);
  }
};

const safeHighlight = (code, language) => {
  // Vérifie d'abord si le langage est disponible
  if (!language || !Prism.languages[language]) {
    console.warn(`Language ${language} not loaded, falling back to plain text`);
    return code; // Retourne le code sans coloration
  }

  try {
    return Prism.highlight(code, Prism.languages[language], language);
  } catch (error) {
    console.error(`Error highlighting ${language} code:`, error);
    return code; // Fallback en cas d'erreur
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
              {(question.type === 'choix_multiple') && (
  <div className="space-y-3">
    <h3 className="font-medium">Options de réponse:</h3>
    
    {/* Champ texte pour le libellé de l'option */}
    <input
      type="text"
      placeholder="Libellé de l'option"
      className="w-full border px-3 py-2 rounded"
      value={question.currentOption}
      onChange={(e) => setQuestion({...question, currentOption: e.target.value})}
    />
    
    {/* Éditeur de code pour le contenu de l'option */}
    <div className="border rounded bg-gray-50">
      <div className="space-y-2">
  <div className="flex items-center space-x-2">
    <label className="text-sm font-medium text-gray-700">Langage :</label>
    <select
      value={question.currentLanguage}
      onChange={(e) => setQuestion({...question, currentLanguage: e.target.value})}
      className="border rounded px-2 py-1 text-sm"
    >
      <option value="javascript">JavaScript</option>
      <option value="python">Python</option>
      <option value="java">Java</option>
      <option value="c">C</option>
      <option value="cpp">C++</option>
      <option value="csharp">C#</option>
      <option value="php">PHP</option>
      <option value="ruby">Ruby</option>
      <option value="swift">Swift</option>
      <option value="kotlin">Kotlin</option>
      <option value="go">Go</option>
      <option value="typescript">TypeScript</option>
      <option value="sql">SQL</option>
    </select>
  </div>

  <Editor
  value={question.currentCodeOption}
  onValueChange={(code) => setQuestion({...question, currentCodeOption: code})}
  highlight={code => safeHighlight(code, question.currentLanguage)}
  padding={10}
  style={{
    fontFamily: '"Fira code", "Fira Mono", monospace',
    fontSize: 14,
    minHeight: '100px'
  }}
  placeholder={`Entrez votre code ${question.currentLanguage} ici...`}
/>
</div>
    </div>
    
    <button
      type="button"
      onClick={addOption}
      className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
    >
      Ajouter cette option
    </button>
    
    {/* Liste des options ajoutées */}
    <div className="mt-3 space-y-2">
      {question.options.map((option, index) => (
  <div key={index} className="border p-3 rounded bg-white group">
    <div className="flex justify-between items-start">
      <div>
        {option.text && <p className="font-medium">{option.text}</p>}
        {option.code && (
          <div className="mt-2">
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
              <Editor
  value={option.code}
  onValueChange={() => {}}
  highlight={code => safeHighlight(code, option.language)}
  padding={8}
  style={{
    fontFamily: '"Fira code", "Fira Mono", monospace',
    fontSize: 12,
    backgroundColor: 'transparent',
    pointerEvents: 'none'
  }}
/>
            </pre>
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={() => removeOption(index)}
        className="text-red-500 opacity-0 group-hover:opacity-100"
      >
        ×
      </button>
    </div>
  </div>
))}
    </div>
    
    {/* Champ pour la bonne réponse */}
    <select
      className="w-full border px-3 py-2 rounded mt-3"
      value={question.bonne_reponse}
      onChange={(e) => setQuestion({...question, bonne_reponse: e.target.value})}
      required
    >
      <option value="">Sélectionnez la bonne réponse</option>
      {question.options.map((option, index) => (
        <option key={index} value={option.text || option.code}>
          {option.text || "Option " + (index + 1)}
        </option>
      ))}
    </select>
  </div>
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
            {q.options && q.options.map((opt, index) => {
  const hasCode = typeof opt === 'string' && opt.includes('```');
  
  if (hasCode) {
    // Modification ici pour gérer le nouveau format avec langage
    const match = opt.match(/(.*?)\n?```[a-z]*\n([\s\S]*?)\n```/);
    const textPart = match ? match[1].trim() : '';
    const codePart = match ? match[2].trim() : '';
    
    return (
      <li key={index}>
        {textPart && <p>{textPart}</p>}
        {codePart && (
          <pre className="bg-gray-100 p-2 rounded text-sm mt-1">
            <code>{codePart}</code>
          </pre>
        )}
      </li>
    );
  }
  
  return <li key={index}>{opt}</li>;
})}
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