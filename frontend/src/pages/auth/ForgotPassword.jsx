import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowRight } from 'lucide-react';
import { Button, InputGroup, GlassCard } from '../../components/ui/PremiumComponents';
import { authAPI } from '../../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const res = await authAPI.forgotPassword(email);
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
      console.error('Forgot password error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/20 rounded-full blur-[120px]" />

      <GlassCard className="w-full max-w-md p-8 relative z-10 border-white/60">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Forgot Password</h2>
          <p className="text-gray-500 text-sm mt-1">Enter your email to receive a password reset link.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputGroup
            label="Email"
            type="email"
            placeholder="you@example.com"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {message && <p className="text-green-500 text-sm text-center mt-4">{message}</p>}
          {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}

          <Button type="submit" isLoading={loading} className="w-full py-3.5 text-lg" icon={ArrowRight}>
            Send Reset Link
          </Button>
          <p className="text-center text-gray-500 text-sm mt-4">
            Remember your password? <a href="/login" className="text-indigo-600 hover:underline">Back to Login</a>
          </p>
        </form>
      </GlassCard>
    </div>
  );
};

export default ForgotPassword;

