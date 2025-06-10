import { useNotification } from "../../contexts/Notificationcontext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Notifications() {
  const { notifications, unreadCount, markAsRead } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    markAsRead();
  }, []);

  const handleClick = (notif) => {
    navigate(`/admin/tests/${notif.test_id}/results/${notif.token}`);
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Notifications</h2>
        {unreadCount > 0 && (
          <span className="bg-red-500 text-white rounded-full px-2 py-0.5 text-sm">
            {unreadCount}
          </span>
        )}
      </div>
      {notifications.length === 0 ? (
        <p>Aucune notification.</p>
      ) : (
        <ul className="space-y-2">
          {notifications.map((notif) => (
            <li
              key={notif.id}
              className={`border p-2 rounded cursor-pointer ${
                notif.is_read ? 'bg-gray-50' : 'bg-yellow-100'
              } hover:bg-gray-100`}
              onClick={() => handleClick(notif)}
            >
              <strong>{notif.email}</strong> a soumis le test <strong>{notif.test}</strong> à {new Date(notif.timestamp).toLocaleString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
