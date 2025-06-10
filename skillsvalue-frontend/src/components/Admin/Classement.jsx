import React, { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import api from "../../services/api";

export default function Classement() {
  const [classements, setClassements] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth(); 
  useEffect(() => {
    const fetchClassement = async () => {
      try {
        const response = await api.get("/candidates/classement", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(response.data)
        setClassements(response.data);
      } catch (error) {
        console.error("Erreur lors du chargement du classement", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClassement();
  }, [token]);

  if (loading) return <p className="p-4">Chargement...</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Classement général</h2>
      <table className="min-w-full border border-gray-300 text-left">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Test</th>
            <th className="p-2 border">Score</th>
            <th className="p-2 border">Total</th>
          </tr>
        </thead>
        <tbody>
          {classements.map((c, index) => (
            <tr key={c.token}>
              <td className="p-2 border">{c.email}</td>
              <td className="p-2 border">{c.test_titre}</td>
              <td className="p-2 border">{c.score}</td>
              <td className="p-2 border">{c.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
