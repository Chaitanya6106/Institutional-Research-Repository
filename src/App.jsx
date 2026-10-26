import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import PaperDetails from './pages/PaperDetails';
import SearchPage from './pages/SearchPage';
import FacultyPortal from './pages/FacultyPortal';
import StudentPortal from './pages/StudentPortal';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';

// Every application page except login/registration requires a valid authenticated user.
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center" role="status">
        <p className="text-slate-600">Checking your session...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Do not send unauthorized users to a public route or create a redirect loop.
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
          <Navbar />
          <div className="flex-1">
            <Routes>
              {/* Public routes: users can authenticate or create an account. */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* All repository content is protected, including the home page. */}
              <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/paper/:id" element={<ProtectedRoute><PaperDetails /></ProtectedRoute>} />
              <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
              <Route
                path="/student"
                element={<ProtectedRoute allowedRoles={['student']}><StudentPortal /></ProtectedRoute>}
              />
              <Route
                path="/faculty"
                element={<ProtectedRoute allowedRoles={['faculty', 'researcher', 'admin']}><FacultyPortal /></ProtectedRoute>}
              />
              <Route
                path="/admin"
                element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>}
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
