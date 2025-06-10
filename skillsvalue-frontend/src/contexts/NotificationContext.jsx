import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const socket = io("http://localhost:3001"); 

    socket.on("new_submission", (data) => {
      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((count) => count + 1);
    });

    return () => socket.disconnect();
  }, []);

  const markAsRead = () => setUnreadCount(0);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAsRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  return useContext(NotificationContext);
}
