import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/Auth/Login';
import Dashboard from './components/Admin/Dashboard';
import TestDetail from './components/Tests/TestDetails';
import Layout from './components/Layout/Layout';
import TestStart from './components/Tests/TestStarts';
import TestPage from './components/Tests/TestPage';
import AdminResultPage from './components/Admin/AdminResultPage';
import Classement from './components/Admin/Classement';
import { NotificationProvider } from './contexts/Notificationcontext';
import Notifications from './components/Admin/Notification';
import AdminSuspicionPage from './components/Admin/AdminSuspicionPage';

function App() {
  return (
    <NotificationProvider>
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<Layout/>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/classement" element={<Classement />} />
            <Route path="/tests/:id" element={<TestDetail />} />
            <Route path='/notifications' element={<Notifications/>} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/admin/suspicions" element={<AdminSuspicionPage />} />

          </Route>
          <Route path="/tests/:testId/start" element={<TestStart />} />
          <Route path="/tests/:testId/page" element={<TestPage />} />
          <Route path="/admin/tests/:testId/results/:token" element={<AdminResultPage />} />
        </Routes>
      </Router>
    </AuthProvider>
    </NotificationProvider>
  );
}

export default App;