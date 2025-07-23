import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Interfaces
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'worker' | 'user';
  phone?: string;
  avatar?: string;
  isWorker?: boolean;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: 'user' | 'worker';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  sendOTP: (email: string) => Promise<void>;
  verifyOTP: (email: string, otp: string) => Promise<void>;
  checkWorkerStatus: () => Promise<any>;
  isLoading: boolean;
}

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
});

// Helpers
const persistAuthData = (user: User, token: string) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

const extractError = (error: any) =>
  error?.response?.data?.message || 'Something went wrong';

// Provider
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (err) {
        console.error('Failed to parse user data', err);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const userData: User = res.data.user;
      persistAuthData(userData, res.data.token);
      setUser(userData);

      // Navigate based on role
      switch (userData.role) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'worker':
          navigate('/worker/dashboard');
          break;
        default:
          navigate('/dashboard');
      }
    } catch (error: any) {
      throw new Error(extractError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    try {
      await api.post('/auth/register', userData);
      localStorage.setItem('verify_email', userData.email);
      navigate('/verify-email');
    } catch (error: any) {
      throw new Error(extractError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  const sendOTP = async (email: string) => {
    try {
      await api.post('/auth/resend-otp', {
        email,
        purpose: 'email-verification',
      });
    } catch (error: any) {
      throw new Error(extractError(error));
    }
  };

  const verifyOTP = async (email: string, otp: string) => {
    try {
      await api.post('/auth/verify-email', { email, otp });
      localStorage.removeItem('verify_email');
      navigate('/login');
    } catch (error: any) {
      throw new Error(extractError(error));
    }
  };

  const checkWorkerStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/workers/application/status', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data;
    } catch (error: any) {
      throw new Error(extractError(error));
    }
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    sendOTP,
    verifyOTP,
    checkWorkerStatus,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
