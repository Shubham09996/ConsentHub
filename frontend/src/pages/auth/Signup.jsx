import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock, Mail, User, Briefcase, ArrowRight, CheckCircle } from 'lucide-react';
import { Button, InputGroup, GlassCard } from '../../components/ui/PremiumComponents';

const Signup = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('owner');
  const [loading, setLoading] = useState(false);

  const handleSignup = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API Call
    setTimeout(() => {
      localStorage.setItem('token', 'mock_token');
      localStorage.setItem('role', role);
      navigate(role === 'owner' ? '/owner/dashboard' : '/consumer/dashboard');
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-brand-500/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[5%] left-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[120px]" />

      <GlassCard className="w-full max-w-lg p-8 relative z-10 border-white/60">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-brand-600 rounded-xl shadow-lg shadow-brand-500/30 mb-4">
            <Shield className="text-white" size={28} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
          <p className="text-gray-500 text-sm mt-1">Join ConsentHub to manage secure data access</p>
        </div>

        {/* Role Toggle */}
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

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InputGroup label="First Name" placeholder="John" icon={User} required />
            <InputGroup label="Last Name" placeholder="Doe" required />
          </div>
          
          <InputGroup label="Email" type="email" placeholder="you@example.com" icon={Mail} required />
          <InputGroup label="Password" type="password" placeholder="Create a strong password" icon={Lock} required />
          
          <div className="flex items-start gap-2 mt-2">
            <div className="mt-0.5 text-brand-600"><CheckCircle size={16} /></div>
            <p className="text-xs text-gray-500">By creating an account, you agree to our <a href="#" className="text-brand-600 font-bold hover:underline">Terms of Service</a> and <a href="#" className="text-brand-600 font-bold hover:underline">Privacy Policy</a>.</p>
          </div>

          <Button type="submit" isLoading={loading} className="w-full py-3.5 mt-4 text-lg" icon={ArrowRight}>
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            Already have an account? <Link to="/login" className="text-brand-600 font-bold hover:underline">Sign In</Link>
          </p>
        </div>
      </GlassCard>
    </div>
  );
};

export default Signup;