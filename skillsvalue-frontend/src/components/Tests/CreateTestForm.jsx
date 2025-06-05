import { useState } from 'react';
import api from '../../services/api';

export default function CreateTestForm({ onTestCreated }) {
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [duree, setDuree] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/tests', { titre, description, duree });
      setMessage('Test créé avec succès !');
      setTitre('');
      setDescription('');
      setDuree('');
      console.log('Nouveau test :', response.data);
      if (onTestCreated) onTestCreated(); 
    } catch (error) {
      console.error('Erreur création test :', error);
      setMessage("Erreur lors de la création du test.");
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Information sur le nouveau test</h2>
      {message && <p className="mb-4 text-sm text-blue-500">{message}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Titre</label>
          <input
            type="text"
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Durée (en minutes)</label>
          <input
            type="number"
            value={duree}
            onChange={(e) => setDuree(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Créer le test
        </button>
      </form>
    </div>
  );
}
