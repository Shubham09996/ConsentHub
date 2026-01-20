import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, Lock, Activity, ChevronRight, CheckCircle2, 
  Menu, X, Server, Globe, Zap, ArrowRight, Github, Twitter, Linkedin, Mail 
} from 'lucide-react';
import { Button } from '../components/ui/PremiumComponents';

// --- Components ---

const Navbar = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    // Added border-b for separation as requested
    <nav className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-xl border-b border-gray-200/80">
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        
        {/* Logo Section */}
        <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => navigate('/')}>
          <div className="bg-gradient-to-br from-brand-600 to-violet-600 p-2 rounded-xl text-white shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <Shield size={24} fill="currentColor" />
          </div>
          <span className="text-2xl font-bold text-gray-900 tracking-tight">
            Consent<span className="text-brand-600">Hub</span>
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink href="#features">Features</NavLink>
          <NavLink href="#how-it-works">How it Works</NavLink>
          <NavLink href="#compliance">Compliance</NavLink>
          
          <div className="h-6 w-px bg-gray-300 mx-2"></div>
          
          <button 
            onClick={() => navigate('/login')} 
            className="text-gray-600 font-semibold hover:text-brand-600 transition-colors"
          >
            Log in
          </button>
          <Button onClick={() => navigate('/signup')} className="shadow-brand-500/25">
            Get Started
          </Button>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-gray-700 p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="md:hidden bg-white border-b border-gray-200 overflow-hidden"
        >
          <div className="flex flex-col p-6 gap-4">
            <MobileLink onClick={() => setMobileMenuOpen(false)} href="#features">Features</MobileLink>
            <MobileLink onClick={() => setMobileMenuOpen(false)} href="#how-it-works">How it Works</MobileLink>
            <hr className="border-gray-100" />
            <button onClick={() => navigate('/login')} className="text-left font-bold text-gray-900 py-2">Log In</button>
            <Button onClick={() => navigate('/signup')} className="w-full justify-center">Get Started</Button>
          </div>
        </motion.div>
      )}
    </nav>
  );
};

const NavLink = ({ href, children }) => (
  <a href={href} className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors relative group">
    {children}
    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-600 transition-all group-hover:w-full"></span>
  </a>
);

const MobileLink = ({ href, onClick, children }) => (
  <a href={href} onClick={onClick} className="text-lg font-medium text-gray-600 hover:text-brand-600">
    {children}
  </a>
);

const FeatureCard = ({ icon: Icon, title, desc }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="group p-8 bg-white rounded-3xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-brand-100 transition-all duration-300"
  >
    <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mb-6 text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors">
      <Icon size={28} />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-500 leading-relaxed">{desc}</p>
  </motion.div>
);

const Footer = () => (
  <footer className="bg-gray-900 text-gray-300 pt-20 pb-10">
    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
      
      {/* Brand Column */}
      <div className="col-span-1 md:col-span-1">
        <div className="flex items-center gap-2 mb-6 text-white">
          <Shield size={24} className="text-brand-500" />
          <span className="text-2xl font-bold">ConsentHub</span>
        </div>
        <p className="text-sm leading-relaxed text-gray-400 mb-6">
          The enterprise standard for user-centric data access control. Secure, compliant, and transparent.
        </p>
        <div className="flex gap-4">
          <SocialIcon icon={Twitter} />
          <SocialIcon icon={Github} />
          <SocialIcon icon={Linkedin} />
        </div>
      </div>

      {/* Links Columns */}
      <div>
        <h4 className="text-white font-bold mb-6">Platform</h4>
        <ul className="space-y-4 text-sm">
          <FooterLink>Data Consumption</FooterLink>
          <FooterLink>Audit Trails</FooterLink>
          <FooterLink>Security (SOC2)</FooterLink>
          <FooterLink>Integration API</FooterLink>
        </ul>
      </div>

      <div>
        <h4 className="text-white font-bold mb-6">Company</h4>
        <ul className="space-y-4 text-sm">
          <FooterLink>About Us</FooterLink>
          <FooterLink>Customers</FooterLink>
          <FooterLink>Careers</FooterLink>
          <FooterLink>Contact</FooterLink>
        </ul>
      </div>

      {/* Newsletter Column */}
      <div>
        <h4 className="text-white font-bold mb-6">Stay Updated</h4>
        <p className="text-xs text-gray-500 mb-4">Get the latest security updates.</p>
        <div className="flex gap-2">
          <input 
            type="email" 
            placeholder="Enter your email" 
            className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-4 py-2 w-full focus:outline-none focus:border-brand-500"
          />
          <button className="bg-brand-600 hover:bg-brand-700 text-white rounded-lg px-3 transition-colors">
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>

    <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
      <p>© 2026 ConsentHub Inc. All rights reserved.</p>
      <div className="flex gap-6">
        <a href="#" className="hover:text-white transition">Privacy Policy</a>
        <a href="#" className="hover:text-white transition">Terms of Service</a>
      </div>
    </div>
  </footer>
);

const FooterLink = ({ children }) => (
  <li><a href="#" className="hover:text-brand-400 transition-colors">{children}</a></li>
);

const SocialIcon = ({ icon: Icon }) => (
  <a href="#" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-brand-600 hover:text-white transition-all">
    <Icon size={16} />
  </a>
);

// --- Main Page ---

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-brand-100 selection:text-brand-900">
      <Navbar />

      {/* Hero Section with Grid Background */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* CSS Grid Pattern Background */}
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-white via-transparent to-transparent z-10"></div>
        
        <div className="max-w-7xl mx-auto px-6 text-center relative z-20">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-sm font-semibold mb-8 hover:bg-brand-100 transition-colors cursor-default"
          >
            <span className="flex h-2 w-2 rounded-full bg-brand-600 animate-pulse"></span>
            New: Enhanced Audit Logs v2.0
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight leading-[1.1]"
          >
            Secure Data Access <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">
              Made Transparent
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-500 max-w-2xl mx-auto mb-10"
          >
            The platform where enterprises request data and owners grant explicit consent. 
            Zero ambiguity. 100% auditable.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button onClick={() => navigate('/signup')} className="h-14 px-8 text-lg rounded-full">
              Start Free Integration
            </Button>
            <button className="h-14 px-8 text-lg font-semibold text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-all flex items-center gap-2">
              <Zap size={20} className="text-yellow-500 fill-yellow-500" /> View Live Demo
            </button>
          </motion.div>

          {/* Trust Badge */}
          <div className="mt-16 pt-8 border-t border-gray-100">
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6">Trusted by security teams at</p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
               {/* Placeholder Logos */}
               <div className="flex items-center gap-2 text-xl font-bold font-serif">Acme Corp</div>
               <div className="flex items-center gap-2 text-xl font-bold font-mono">GlobalBank</div>
               <div className="flex items-center gap-2 text-xl font-bold font-sans">HealthPlus</div>
               <div className="flex items-center gap-2 text-xl font-bold">TechStart</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Security Leaders Choose Us</h2>
            <p className="text-gray-500 text-lg">We handle the complexity of consent management so you can focus on building.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={CheckCircle2}
              title="Explicit Consent Flow"
              desc="No data moves without a signed approval token from the owner. Every request is verified."
            />
            <FeatureCard 
              icon={Activity}
              title="Immutable Audit Logs"
              desc="A tamper-proof ledger of who accessed what and when. Export logs for compliance audits easily."
            />
            <FeatureCard 
              icon={Lock}
              title="Instant Revocation"
              desc="Owners can kill access tokens in <50ms. API keys are rotated automatically upon revocation."
            />
            <FeatureCard 
              icon={Server}
              title="Data Isolation"
              desc="Tenant-based data separation ensures that data leaks are mathematically impossible."
            />
            <FeatureCard 
              icon={Globe}
              title="Global Compliance"
              desc="Built-in presets for GDPR, CCPA, and HIPAA compliance requirements."
            />
            <FeatureCard 
              icon={Zap}
              title="Low Latency API"
              desc="Consent checks add less than 10ms overhead to your existing data request pipelines."
            />
          </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto bg-brand-600 rounded-[2.5rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-brand-500/40">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
          
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 relative z-10">Ready to secure your data exchange?</h2>
          <p className="text-brand-100 text-xl mb-10 max-w-2xl mx-auto relative z-10">
            Join the network of transparent data owners and ethical consumers today.
          </p>
          <div className="relative z-10">
             <Button onClick={() => navigate('/signup')} className="bg-white text-brand-600 hover:bg-gray-100 border-none px-10 py-4 h-auto text-lg rounded-xl">
                Get Started Now
             </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;