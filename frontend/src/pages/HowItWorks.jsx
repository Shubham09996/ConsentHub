import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, Menu, X, Server, Activity, 
  Code2, Key, Fingerprint
} from 'lucide-react';

// --- Improved Button Component ---
const Button = ({ children, onClick, variant = 'primary', className = "" }) => {
  const baseStyles = "font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg";
  
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/30",
    white: "bg-white text-indigo-600 hover:bg-gray-50 shadow-black/10 border-none",
    outline: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-sm"
  };

  return (
    <button 
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${className}`}
    >
      {children}
    </button>
  );
};

// --- Navbar ---
const Navbar = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-xl border-b border-gray-200/80">
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => navigate('/')}>
          <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Shield size={24} fill="currentColor" />
          </div>
          <span className="text-2xl font-bold text-gray-900 tracking-tight">
            Consent<span className="text-indigo-600">Hub</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/how-it-works" className="text-sm font-medium text-indigo-600 transition-colors relative group">
            How it Works
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 transition-all group-hover:w-full"></span>
          </NavLink>
          <div className="h-6 w-px bg-gray-300 mx-2"></div>
          <button onClick={() => navigate('/login')} className="text-gray-600 font-semibold hover:text-indigo-600 transition-colors">Log in</button>
          <Button onClick={() => navigate('/signup')}>Get Started</Button>
        </div>
        <button className="md:hidden text-gray-700 p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {mobileMenuOpen && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="md:hidden bg-white border-b border-gray-200 overflow-hidden">
          <div className="flex flex-col p-6 gap-4">
            <MobileLink onClick={() => setMobileMenuOpen(false)} href="/">Home</MobileLink>
            <MobileLink onClick={() => setMobileMenuOpen(false)} href="/how-it-works">How it Works</MobileLink>
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
  <a href={href} className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors relative group">
    {children}
    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 transition-all group-hover:w-full"></span>
  </a>
);

const MobileLink = ({ href, onClick, children }) => (
  <a href={href} onClick={onClick} className="text-lg font-medium text-gray-600 hover:text-indigo-600">
    {children}
  </a>
);

// --- Timeline Step Component ---
const TimelineStep = ({ number, title, desc, icon: Icon, visual, align = 'left' }) => {
  const isLeft = align === 'left';
  
  return (
    <div className={`relative flex flex-col md:flex-row items-center gap-12 md:gap-24 py-16 ${isLeft ? '' : 'md:flex-row-reverse'}`}>
      
      {/* Connector Line (Desktop) */}
      <div className="absolute left-4 md:left-1/2 -translate-x-1/2 h-full w-px bg-gradient-to-b from-indigo-100 via-indigo-300 to-indigo-100 hidden md:block"></div>
      <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white border-4 border-indigo-600 shadow-lg z-10 hidden md:flex items-center justify-center">
         <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full"></div>
      </div>

      {/* Content Side */}
      <motion.div 
        initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        className={`flex-1 w-full md:w-auto ${isLeft ? 'md:text-right' : 'md:text-left'} pl-12 md:pl-0`}
      >
        <div className={`flex flex-col gap-4 ${isLeft ? 'md:items-end' : 'md:items-start'}`}>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
            <Icon size={24} />
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
            <span className="text-indigo-600 mr-2">0{number}.</span>{title}
          </h3>
          <p className="text-gray-500 text-lg leading-relaxed max-w-md">
            {desc}
          </p>
        </div>
      </motion.div>

      {/* Visual Side */}
      <motion.div 
        initial={{ opacity: 0, x: isLeft ? 30 : -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        className="flex-1 w-full md:w-auto pl-12 md:pl-0"
      >
        <div className="relative rounded-2xl bg-white border border-gray-200 shadow-2xl shadow-indigo-100/50 overflow-hidden group hover:border-indigo-200 transition-all duration-300">
           {/* Window Controls */}
           <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
            <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
          </div>
          <div className="p-6">
             {visual}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- Main Page Component ---

const HowItWorks = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-20 overflow-hidden bg-gradient-to-b from-white to-gray-50/50">
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        <div className="max-w-7xl mx-auto px-6 text-center relative z-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-semibold mb-8"
          >
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
            Technical Deep Dive
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight"
          >
            The Architecture of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
              Zero-Trust Exchange
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-500 max-w-2xl mx-auto mb-10"
          >
            We decouple the request from the resource. 
            Here is how data flows securely from Provider to Consumer without ever touching our servers.
          </motion.p>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="relative pb-32 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          
          {/* Step 1 */}
          <TimelineStep 
            number="1"
            title="Integration & Definition"
            desc="Data Providers install our lightweight SDK and define data schemas. Access rules (pricing, duration, scope) are cryptographically signed and stored."
            icon={Code2}
            align="left"
            visual={
              <div className="font-mono text-xs md:text-sm">
                <div className="text-gray-400 mb-2">// 1. Define Secure Schema</div>
                <div className="text-purple-600">const</div> <div className="text-indigo-600 inline">medicalSchema</div> = <div className="text-purple-600 inline">new</div> <div className="text-yellow-600 inline">DataSchema</div>({'{'}
                <div className="pl-4">
                  <div>id: <span className="text-green-600">'records_v1'</span>,</div>
                  <div>encryption: <span className="text-green-600">'AES-256-GCM'</span>,</div>
                  <div>access: <span className="text-green-600">'explicit_only'</span></div>
                </div>
                {'})'};
              </div>
            }
          />

          {/* Step 2 */}
          <TimelineStep 
            number="2"
            title="Consumer Request"
            desc="When a third-party app needs data, they trigger a request. The user is redirected to the ConsentHub secure enclave to review permissions."
            icon={Fingerprint}
            align="right"
            visual={
              <div className="flex flex-col gap-3">
                 <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600"><Activity size={16}/></div>
                    <div className="text-sm">
                       <div className="font-bold text-gray-900">HealthApp Request</div>
                       <div className="text-gray-500 text-xs">Wants access to: Vitals</div>
                    </div>
                 </div>
                 <div className="flex gap-2 mt-2">
                    <div className="flex-1 bg-indigo-600 text-white text-center py-2 rounded-lg text-xs font-bold shadow-md shadow-indigo-200">Approve</div>
                    <div className="flex-1 bg-white border border-gray-200 text-gray-600 text-center py-2 rounded-lg text-xs font-bold">Deny</div>
                 </div>
              </div>
            }
          />

          {/* Step 3 */}
          <TimelineStep 
            number="3"
            title="Token Generation"
            desc="Upon user approval, we mint a short-lived, signed JWT. This token contains the decryption keys and is scoped strictly to the approved fields."
            icon={Key}
            align="left"
            visual={
              <div className="font-mono text-xs md:text-sm space-y-1">
                <div className="text-gray-400">// Signed JWT Payload</div>
                <div className="text-gray-900">{'{'}</div>
                <div className="pl-4 text-green-600">"sub": "user_123",</div>
                <div className="pl-4 text-green-600">"scope": "read:vitals",</div>
                <div className="pl-4 text-green-600">"exp": 1715000000,</div>
                <div className="pl-4">
                   <span className="text-green-600">"sig": </span> 
                   <span className="text-gray-400">"sha256_RSA..."</span>
                </div>
                <div className="text-gray-900">{'}'}</div>
              </div>
            }
          />

          {/* Step 4 */}
          <TimelineStep 
            number="4"
            title="Direct Data Tunnel"
            desc="The consumer uses the token to fetch data directly from the Provider. We facilitate the handshake, but the data payload travels peer-to-peer via TLS."
            icon={Server}
            align="right"
            visual={
              <div className="space-y-3">
                 <div className="flex items-center justify-between text-xs font-mono text-gray-500 mb-2">
                    <span>Client</span>
                    <span className="text-indigo-500 animate-pulse">--- TLS Encrypted ---</span>
                    <span>Server</span>
                 </div>
                 <div className="p-3 bg-gray-900 rounded-lg text-green-400 font-mono text-xs shadow-inner">
                    <div>GET /api/v1/data</div>
                    <div>Authorization: Bearer eyJhbGci...</div>
                    <div className="mt-2 text-white">200 OK {'{'} "data": "..." {'}'}</div>
                 </div>
              </div>
            }
          />

        </div>
      </section>

      {/* CTA Section (Last Element) */}
      <section className="py-20 px-6 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Built for developers, trusted by CISO</h2>
          <p className="text-gray-500 text-lg mb-8">Start building compliant data flows in minutes, not months.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
             <Button onClick={() => navigate('/signup')}>Start Integration</Button>
             <Button variant="outline" onClick={() => window.open('#')}>Read the Docs</Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;