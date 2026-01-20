import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, LogOut, Menu, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardLayout = ({ title, subtitle, role, menuItems, children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State for Desktop Sidebar Collapse
  const [isCollapsed, setIsCollapsed] = useState(false);
  // State for Mobile Menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      
      {/* --- DESKTOP SIDEBAR --- */}
      <aside 
        className={`hidden md:flex flex-col fixed h-full z-30 bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-72'}`}
      >
        {/* Header / Logo */}
        <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} h-20`}>
          <div 
            className="bg-brand-600 p-2.5 rounded-xl shadow-lg shadow-brand-500/30 shrink-0 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <Shield size={22} className="text-white" />
          </div>
          {!isCollapsed && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <span className="font-bold text-xl tracking-tight text-gray-900 block">ConsentHub</span>
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">{role} Portal</span>
            </motion.div>
          )}
        </div>

        {/* Toggle Button */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-9 bg-white border border-gray-200 p-1.5 rounded-full shadow-sm text-gray-500 hover:text-brand-600 z-50 hidden md:flex hover:scale-110 transition-transform"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 space-y-2 mt-4 overflow-y-auto">
          {menuItems.map((item, idx) => {
            const isActive = location.pathname === item.path || (idx === 0 && location.pathname.includes('dashboard'));
            return (
              <button
                key={idx}
                onClick={() => navigate(item.path || '#')}
                title={isCollapsed ? item.label : ''}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-4'} py-3.5 rounded-xl transition-all duration-200 group relative ${
                  isActive 
                    ? 'bg-brand-50 text-brand-700 shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                  <item.icon size={22} className={isActive ? 'text-brand-600' : 'text-gray-400 group-hover:text-gray-600'} />
                  {!isCollapsed && <span className="font-semibold text-sm whitespace-nowrap">{item.label}</span>}
                </div>
                
                {/* Badge Logic */}
                {!isCollapsed && item.badge > 0 && (
                  <span className="bg-brand-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
                {isCollapsed && item.badge > 0 && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-brand-600 rounded-full border-2 border-white"></span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout Section */}
        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-4'} text-gray-500 hover:text-red-600 w-full py-3 rounded-xl hover:bg-red-50 transition-colors font-semibold text-sm`}
            title="Sign Out"
          >
            <LogOut size={20} />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* --- MOBILE OVERLAY SIDEBAR --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-72 bg-white z-50 p-6 md:hidden flex flex-col"
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-2">
                  <Shield className="text-brand-600" />
                  <span className="font-bold text-lg">ConsentHub</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)}><X size={24} className="text-gray-500" /></button>
              </div>
              
              <nav className="space-y-2 flex-1">
                {menuItems.map((item, idx) => (
                   <button
                    key={idx}
                    onClick={() => { navigate(item.path || '#'); setIsMobileMenuOpen(false); }}
                    className="w-full flex items-center gap-4 px-4 py-4 rounded-xl text-gray-600 hover:bg-gray-50 font-medium"
                  >
                    <item.icon size={20} /> {item.label}
                  </button>
                ))}
              </nav>

              <button onClick={handleLogout} className="flex items-center gap-4 px-4 py-4 text-red-600 font-medium mt-auto">
                <LogOut size={20} /> Sign Out
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* --- MAIN CONTENT AREA --- */}
      <main className={`flex-1 p-4 md:p-8 transition-all duration-300 ease-in-out ${isCollapsed ? 'md:ml-20' : 'md:ml-72'} w-full`}>
        
        {/* Mobile Header (Added Avatar here too) */}
        <div className="md:hidden flex items-center justify-between mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100 sticky top-4 z-20">
          <div className="flex items-center gap-3">
             <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 bg-gray-50 rounded-lg">
              <Menu className="text-gray-600" />
            </button>
            <span className="font-bold text-gray-900">ConsentHub</span>
          </div>
          
          {/* Mobile Profile Avatar Trigger */}
          <div 
             onClick={handleProfileClick}
             className="w-9 h-9 bg-brand-600 rounded-full flex items-center justify-center text-white font-bold text-sm cursor-pointer shadow-md active:scale-95 transition-transform"
          >
              {role.charAt(0)}
          </div>
        </div>

        {/* Desktop Header */}
        <header className="hidden md:flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-gray-900"
            >
              {title}
            </motion.h1>
            <p className="text-gray-500 mt-1">{subtitle}</p>
          </div>
          
          {/* Right Side: Role Info + Clickable Profile Avatar */}
          <div className="flex items-center gap-4">
             <div className="text-right">
                <p className="text-sm font-bold text-gray-900">{role === 'Data Owner' ? 'Alex User' : 'Enterprise Corp'}</p>
                <p className="text-xs text-gray-500">{role}</p>
             </div>
             
             {/* Desktop Profile Avatar Trigger */}
             <div 
                onClick={handleProfileClick}
                className="group relative cursor-pointer"
                title="View Profile"
             >
                <div className="w-11 h-11 bg-gradient-to-tr from-brand-500 to-violet-500 rounded-xl flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white group-hover:ring-brand-200 transition-all group-hover:scale-105 active:scale-95">
                    {role.charAt(0)}
                </div>
                {/* Active Status Dot */}
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
             </div>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;