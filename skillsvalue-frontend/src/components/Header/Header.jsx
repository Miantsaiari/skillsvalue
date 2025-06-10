import useAuth from "../../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { useNotification } from "../../contexts/Notificationcontext";

export default function Header() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { unreadCount } = useNotification();

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto py-6 px-4 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Skills Value</h1>

        <nav className="flex space-x-6">
          <Link
            to="/dashboard"
            className="text-gray-700 hover:text-blue-600 font-medium"
          >
            Tests
          </Link>
          <div className="relative">
            <Link to="/notifications" className="text-gray-700 hover:text-blue-600 font-medium">
              Notifications
            </Link>
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2">
                {unreadCount}
              </span>
            )}
          </div>
          <Link
            to="/classement"
            className="text-gray-700 hover:text-blue-600 font-medium"
          >
            Classement
          </Link>
          <button
            onClick={logout}
            className="ml-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Déconnexion
          </button>
        </nav>
      </div>
    </header>
  );
}
