import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock, Mail, User, Briefcase, ArrowRight, CheckCircle, Globe } from 'lucide-react';
import { Button, InputGroup, GlassCard } from '../../components/ui/PremiumComponents';
import { authAPI } from '../../services/api';

const Signup = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('owner');
  const [loading, setLoading] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [company, setCompany] = useState('');
  const [website, setWebsite] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // New state for multi-step form


  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authAPI.register({ firstName, lastName, email, password, role, phone, location, bio, company, website });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      navigate(res.data.role === 'owner' ? '/owner/dashboard' : '/consumer/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = () => {
    // Basic validation for step 1
    if (step === 1) {
      if (!firstName || !lastName || !email || !password) {
        setError('Please fill all required fields in Step 1.');
        return;
      }
    }
    setError('');
    setStep(prevStep => prevStep + 1);
  };

  const handlePrevStep = () => {
    setError('');
    setStep(prevStep => prevStep - 1);
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

        <form onSubmit={step === 2 ? handleSignup : handleNextStep} className="space-y-4">

          {/* Step 1: Basic Information */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <InputGroup label="First Name" placeholder="John" icon={User} value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                <InputGroup label="Last Name" placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>
              
              <InputGroup label="Email" type="email" placeholder="you@example.com" icon={Mail} value={email} onChange={(e) => setEmail(e.target.value)} required />
              <InputGroup label="Password" type="password" placeholder="Create a strong password" icon={Lock} value={password} onChange={(e) => setPassword(e.target.value)} required />
            </motion.div>
          )}

          {/* Step 2: Additional Information (conditional for Consumer) */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <InputGroup label="Phone Number" type="tel" placeholder="+1 (555) 123-4567" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <InputGroup label="Location" placeholder="New York, USA" value={location} onChange={(e) => setLocation(e.target.value)} />

              <label className="text-sm font-semibold text-gray-700 ml-1 mb-2 block">Bio</label>
              <textarea 
                className="w-full p-4 rounded-xl border border-gray-200 outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all text-sm resize-none bg-white"
                rows="3"
                placeholder="Tell us about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />

              {role === 'consumer' && (
                <>
                  <InputGroup label="Company Name" placeholder="Acme Corp" value={company} onChange={(e) => setCompany(e.target.value)} icon={Briefcase} />
                  <InputGroup label="Company Website" placeholder="https://acme.com" value={website} onChange={(e) => setWebsite(e.target.value)} icon={Globe} />
                </>
              )}
            </motion.div>
          )}

          <div className="flex items-start gap-2 mt-2">
            <div className="mt-0.5 text-brand-600"><CheckCircle size={16} /></div>
            <p className="text-xs text-gray-500">By creating an account, you agree to our <a href="#" className="text-brand-600 font-bold hover:underline">Terms of Service</a> and <a href="#" className="text-brand-600 font-bold hover:underline">Privacy Policy</a>.</p>
          </div>
          {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}

          {/* Navigation and Submit Buttons */}
          <div className="flex justify-between mt-6">
            {step === 2 && (
              <Button type="button" variant="secondary" onClick={handlePrevStep} icon={ArrowRight} iconPlacement="left">
                Back
              </Button>
            )}
            
            <div className={step === 1 ? 'w-full' : 'w-auto'}>
              {step === 1 && (
                <Button type="button" onClick={handleNextStep} className="w-full py-3.5 text-lg" icon={ArrowRight}>
                  Next
                </Button>
              )}

              {step === 2 && (
                <Button type="submit" isLoading={loading} className="w-full py-3.5 text-lg" icon={ArrowRight}>
                  Create Account
                </Button>
              )}
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
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