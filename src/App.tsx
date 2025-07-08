import React from 'react';
import { Routes, Route } from 'react-router-dom'; 
import { AuthProvider } from './contexts/AuthContext';
import { LocationProvider } from './contexts/LocationContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ServicesPage from './pages/ServicesPage';
import BookingPage from './pages/BookingPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import WorkerDashboard from './pages/worker/WorkerDashboard';
import UserDashboard from './pages/user/UserDashboard';
import WorkerApplicationPage from './pages/worker/WorkerApplicationPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';

function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/booking/:serviceId" element={<BookingPage />} />
              <Route path="/worker/apply" element={<WorkerApplicationPage />} />

              {/* Protected Routes */}
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />

              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              } />

              <Route path="/worker/dashboard" element={
                <ProtectedRoute roles={['worker']}>
                  <WorkerDashboard />
                </ProtectedRoute>
              } />

              <Route path="/admin/dashboard" element={
                <ProtectedRoute roles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
          <Footer />
        </div>
      </LocationProvider>
    </AuthProvider>
  );
}

export default App;
