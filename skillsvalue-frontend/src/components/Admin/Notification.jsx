import { useNotification } from "../../contexts/Notificationcontext";
import { useEffect } from "react";
import { Link } from "react-router-dom";

export default function Notifications() {
  const { notifications, markAsRead } = useNotification();

  useEffect(() => {
    markAsRead();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Notifications</h2>
      {notifications.length === 0 ? (
        <p>Aucune notification.</p>
      ) : (
        <ul className="space-y-2">
          {notifications.map((notif, index) => (
            <li key={index} className="border p-2 rounded bg-gray-50 hover:bg-gray-100">
              <Link
                to={`/admin/tests/${notif.testId}/results/${notif.token}`}
                className="text-blue-600 hover:underline"
              >
                <strong>{notif.email}</strong> a soumis le test <strong>{notif.test}</strong> à{" "}
                {new Date(notif.timestamp).toLocaleString()}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
