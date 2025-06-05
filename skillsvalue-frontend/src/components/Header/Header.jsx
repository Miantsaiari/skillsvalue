import { useAuth } from "../../contexts/AuthContext";

export default function Header() {
  const { logout } = useAuth();

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto py-6 px-4 flex justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Skills Value</h1>
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Déconnexion
        </button>
      </div>
    </header>
  );
}
