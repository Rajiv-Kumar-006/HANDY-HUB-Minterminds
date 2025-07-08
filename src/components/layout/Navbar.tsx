import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Menu, 
  X, 
  Home, 
  Settings, 
  User, 
  LogOut,
  Wrench,
  Shield,
  MapPin
} from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'admin': return '/admin/dashboard';
      case 'worker': return '/worker/dashboard';
      default: return '/dashboard';
    }
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-teal-600 rounded-lg flex items-center justify-center">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
              HandyHub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
            >
              Home
            </Link>
            <Link 
              to="/services" 
              className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
            >
              Services
            </Link>
            
            {!user && (
              <Link 
                to="/worker/apply" 
                className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
              >
                Become a Worker
              </Link>
            )}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors duration-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="font-medium">{user.name}</span>
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                    <Link
                      to={getDashboardPath()}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {user.role === 'admin' ? <Shield className="w-4 h-4 mr-2" /> :
                       user.role === 'worker' ? <Wrench className="w-4 h-4 mr-2" /> :
                       <Home className="w-4 h-4 mr-2" />}
                      Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-blue-600 to-teal-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-teal-700 transition-all duration-200 font-medium"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 transition-colors duration-200"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-4">
              <Link 
                to="/" 
                className="block text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/services" 
                className="block text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Services
              </Link>
              
              {user ? (
                <>
                  <Link
                    to={getDashboardPath()}
                    className="block text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    className="block text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/worker/apply"
                    className="block text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Become a Worker
                  </Link>
                  <Link
                    to="/login"
                    className="block text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block bg-gradient-to-r from-blue-600 to-teal-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-teal-700 transition-all duration-200 font-medium text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;