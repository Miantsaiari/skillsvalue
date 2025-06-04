import { useState } from 'react';
import api from '../../services/api';

export default function InviteCandidateForm() {
  const [email, setEmail] = useState('');
  const [testId, setTestId] = useState('');
  const [message, setMessage] = useState('');

  const handleInvite = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post('/candidates/invite', {
        email,
        test_id: testId,
      });

      setMessage(`Invitation envoyée avec succès à ${email} (ID candidat: ${res.data.candidateId})`);
      setEmail('');
      setTestId('');
    } catch (err) {
      console.error(err);
      setMessage('Erreur lors de l’envoi de l’invitation');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Inviter un candidat</h2>

      <form onSubmit={handleInvite} className="space-y-4">
        <div>
          <label className="block font-medium">Email du candidat</label>
          <input
            type="email"
            className="w-full border px-3 py-2 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-medium">ID du test</label>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded"
            value={testId}
            onChange={(e) => setTestId(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Envoyer le lien
        </button>
      </form>

      {message && <p className="mt-4 text-sm text-green-600">{message}</p>}
    </div>
  );
}
