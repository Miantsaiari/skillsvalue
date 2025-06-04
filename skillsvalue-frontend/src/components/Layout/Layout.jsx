import Header from '../Header/Header';
import { Outlet } from 'react-router-dom';
import PrivateRoute from '../Auth/PrivateRoute';

export default function Layout() {
  return (
    <PrivateRoute>
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="max-w-5xl mx-auto py-6 px-4">
        <Outlet />
      </main>
    </div>
    </PrivateRoute>
  );
}
