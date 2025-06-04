import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/Auth/Login';
import Dashboard from './components/Admin/Dashboard';
import TestDetail from './components/Tests/TestDetails';
import Layout from './components/Layout/Layout';
import TestStart from './components/Tests/TestStarts';
import TestPage from './components/Tests/TestPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<Layout/>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tests/:id" element={<TestDetail />} />
            <Route path="/" element={<Dashboard />} />
          </Route>
          <Route path="/tests/:testId/start" element={<TestStart />} />
          <Route path="/tests/:testId/page" element={<TestPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;