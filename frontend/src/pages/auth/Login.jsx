import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock, Mail, User, Briefcase, ArrowRight } from 'lucide-react';
import { Button, InputGroup, GlassCard } from '../../components/ui/PremiumComponents'; // Importing custom components

const Login = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('owner');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API
    setTimeout(() => {
      localStorage.setItem('token', 'mock_token');
      localStorage.setItem('role', role);
      navigate(role === 'owner' ? '/owner/dashboard' : '/consumer/dashboard');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center p-4 relative overflow-hidden">
       {/* Decorative Background */}
       <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/20 rounded-full blur-[120px]" />
       <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/20 rounded-full blur-[120px]" />

      <GlassCard className="w-full max-w-md p-8 relative z-10 border-white/60">
        <div className="flex justify-center mb-6">
          <div className="bg-brand-600 p-3 rounded-2xl shadow-xl shadow-brand-500/30 rotate-3">
            <Shield className="text-white" size={32} />
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-gray-500 text-sm mt-1">Select your role to continue</p>
        </div>

        {/* Custom Toggle */}
        <div className="bg-gray-100 p-1.5 rounded-xl flex mb-8 relative">
            <motion.div 
              className="absolute bg-white shadow-sm rounded-lg h-[calc(100%-12px)] top-[6px]"
              initial={false}
              animate={{ left: role === 'owner' ? '6px' : '50%', width: 'calc(50% - 6px)' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            <button onClick={() => setRole('owner')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold z-10 transition-colors ${role === 'owner' ? 'text-gray-900' : 'text-gray-500'}`}>
              <User size={16} /> Data Owner
            </button>
            <button onClick={() => setRole('consumer')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold z-10 transition-colors ${role === 'consumer' ? 'text-gray-900' : 'text-gray-500'}`}>
              <Briefcase size={16} /> Consumer
            </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <InputGroup label="Email" type="email" placeholder="you@example.com" icon={Mail} required />
          <InputGroup label="Password" type="password" placeholder="••••••••" icon={Lock} required />
          
          <div className="flex justify-end">
            <a href="#" className="text-xs font-semibold text-brand-600 hover:text-brand-700">Forgot Password?</a>
          </div>

          <Button type="submit" isLoading={loading} className="w-full py-3.5 text-lg" icon={ArrowRight}>
            Sign In
          </Button>
        </form>
      </GlassCard>
    </div>
  );
};

export default Login;