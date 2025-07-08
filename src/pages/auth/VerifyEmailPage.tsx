import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, KeyRound, Loader } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const VerifyEmailPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const initialEmail = (location.state as { email?: string })?.email || '';
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { verifyOTP } = useAuth();

  useEffect(() => {
    if (!initialEmail) {
      navigate('/register');
    }
  }, [initialEmail, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      await verifyOTP(email, otp);
      setSuccess('Email verified successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-teal-100 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Verify Your Email</h2>

        {error && <div className="bg-red-100 text-red-600 px-4 py-2 rounded mb-4 text-sm">{error}</div>}
        {success && <div className="bg-green-100 text-green-600 px-4 py-2 rounded mb-4 text-sm">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">OTP</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Enter the OTP"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader className="animate-spin w-5 h-5 mr-2" />
                Verifying...
              </>
            ) : (
              'Verify Email'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
