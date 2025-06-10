import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const accessToken = localStorage.getItem('access_token');


  useEffect(() => {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) return; 

  api.get("/notifications")
    .then(res => {
      setNotifications(res.data);
      const unread = res.data.filter(n => !n.is_read).length;
      setUnreadCount(unread);
    })
    .catch(err => console.error("Erreur notifications", err));
}, []);


  const markAsRead = async () => {
    await api.post('/notifications/mark-read');
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
