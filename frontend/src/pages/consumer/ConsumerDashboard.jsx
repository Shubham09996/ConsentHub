import React, { useState } from 'react';
import { 
  Search, Globe, Lock, Unlock, Eye, X, Database, 
  AlertCircle, Clock, CheckCircle2, Zap, LayoutGrid, Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { GlassCard, Button, InputGroup, Badge } from '../../components/ui/PremiumComponents';

const ConsumerDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewData, setViewData] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'pending'

  // Mock Data (Expanded for better UI)
  const stats = [
    { label: 'Active Connections', value: '08', icon: Zap, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Pending Requests', value: '03', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Total API Calls', value: '1.2k', icon: Activity, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  ];

  const [accessList] = useState([
    { 
      id: 1, 
      name: 'Alex Doe', 
      email: 'alex@example.com', 
      status: 'active', 
      expiry: '24h remaining',
      sensitivity: 'High',
      data: { score: 720, history: 'Clean', lastUpdated: 'Today' } 
    },
    { 
      id: 2, 
      name: 'Sarah Smith', 
      email: 'sarah@design.co', 
      status: 'pending', 
      expiry: 'Waiting...',
      sensitivity: 'Medium',
      data: null 
    },
    { 
      id: 3, 
      name: 'Mike Ross', 
      email: 'mike@tech.io', 
      status: 'revoked', 
      expiry: 'Expired',
      sensitivity: 'Low',
      data: null 
    },
    { 
      id: 4, 
      name: 'Emily Blunt', 
      email: 'emily@studio.com', 
      status: 'active', 
      expiry: '12h remaining',
      sensitivity: 'Medium',
      data: { score: 680, history: 'Pending', lastUpdated: 'Yesterday' } 
    },
  ]);

  // Filter Logic
  const filteredList = accessList.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || item.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <DashboardLayout 
      title="Access Hub" 
      subtitle="Manage your data requests and active connections." 
      role="Data Consumer"
      menuItems={[
        { label: 'My Access Hub', icon: Database, path: '/consumer/dashboard' },
        { label: 'Global Search', icon: Globe },
        { label: 'Profile Settings', icon: Lock, path: '/profile' }
      ]}
    >
      <div className="space-y-8 max-w-7xl mx-auto pb-10">
        
        {/* 1. Hero Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between relative overflow-hidden group hover:shadow-md transition-shadow"
            >
              <div className="relative z-10">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">{stat.label}</p>
                <h3 className="text-3xl font-black text-gray-900">{stat.value}</h3>
              </div>
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} />
              </div>
              {/* Background Blob */}
              <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full ${stat.bg} opacity-50 blur-2xl group-hover:opacity-100 transition-opacity`}></div>
            </motion.div>
          ))}
        </div>

        {/* 2. Search & Filter Bar */}
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-2 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
            <input 
              type="text"
              placeholder="Search by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 hover:bg-white focus:bg-white border-2 border-transparent focus:border-brand-500 rounded-xl py-3 pl-12 pr-4 outline-none transition-all font-medium text-gray-700"
            />
          </div>
          
          <div className="flex bg-gray-100 p-1.5 rounded-xl w-full md:w-auto">
            {['all', 'active', 'pending'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold capitalize transition-all ${
                  filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          
          <Button className="w-full md:w-auto px-6 h-12 rounded-xl whitespace-nowrap shadow-brand-500/20">
            <Globe size={18} className="mr-2" /> New Request
          </Button>
        </div>

        {/* 3. Access Cards Grid */}
        <div>
           <div className="flex justify-between items-end mb-6">
              <h3 className="font-bold text-xl text-gray-900">Connections</h3>
              <p className="text-sm text-gray-500 font-medium">{filteredList.length} records found</p>
           </div>

           {filteredList.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredList.map((item, idx) => (
                <AccessCard 
                  key={item.id} 
                  item={item} 
                  onView={() => setViewData(item)} 
                  index={idx} 
                />
              ))}
            </div>
           ) : (
             <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
               <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                 <Search size={24} />
               </div>
               <h3 className="text-lg font-bold text-gray-900">No connections found</h3>
               <p className="text-gray-500 mt-1">Try adjusting your search or filters.</p>
             </div>
           )}
        </div>

        {/* 4. Data Modal (Secure View) */}
        <AnimatePresence>
          {viewData && (
            <DataModal data={viewData} onClose={() => setViewData(null)} />
          )}
        </AnimatePresence>

      </div>
    </DashboardLayout>
  );
};

// --- Helper Components ---

const Activity = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
  </svg>
);

const AccessCard = ({ item, onView, index }) => {
  const statusStyles = {
    active: { border: 'border-emerald-200', bg: 'bg-emerald-50', text: 'text-emerald-700', icon: Unlock },
    pending: { border: 'border-amber-200', bg: 'bg-amber-50', text: 'text-amber-700', icon: Clock },
    revoked: { border: 'border-red-200', bg: 'bg-red-50', text: 'text-red-700', icon: Lock },
  };
  
  const style = statusStyles[item.status];
  const StatusIcon = style.icon;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className={`bg-white rounded-[1.5rem] p-6 border transition-all duration-300 shadow-sm hover:shadow-xl relative overflow-hidden group ${item.status === 'active' ? 'border-gray-200 hover:border-emerald-300' : 'border-gray-200'}`}
    >
      {/* Top Status Bar */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg transition-colors ${item.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
            {item.name.charAt(0)}
          </div>
          <div>
            <h4 className="font-bold text-gray-900 leading-tight">{item.name}</h4>
            <p className="text-xs text-gray-500 font-medium">{item.email}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${style.bg} ${style.border} ${style.text}`}>
           <StatusIcon size={12} /> <span className="capitalize">{item.status}</span>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
         <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Expiry</p>
            <p className="text-sm font-bold text-gray-700">{item.expiry}</p>
         </div>
         <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Sensitivity</p>
            <p className="text-sm font-bold text-gray-700">{item.sensitivity}</p>
         </div>
      </div>

      {/* Action Button */}
      <div className="relative z-10">
        {item.status === 'revoked' ? (
            <button disabled className="w-full py-3 rounded-xl bg-gray-100 text-gray-400 font-bold text-sm cursor-not-allowed flex items-center justify-center gap-2">
              <Lock size={16} /> Access Revoked
            </button>
        ) : item.status === 'pending' ? (
            <button disabled className="w-full py-3 rounded-xl bg-amber-50 text-amber-600 font-bold text-sm cursor-not-allowed flex items-center justify-center gap-2 border border-amber-100">
              <Clock size={16} /> Awaiting Approval
            </button>
        ) : (
          <Button 
            onClick={onView}
            className="w-full bg-gray-900 hover:bg-black text-white shadow-lg shadow-gray-900/20"
            icon={Eye}
          >
            View Decrypted Data
          </Button>
        )}
      </div>

      {/* Decorative Glow for Active Cards */}
      {item.status === 'active' && (
         <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-[50px] -mr-10 -mt-10 pointer-events-none group-hover:bg-emerald-400/20 transition-colors"></div>
      )}
    </motion.div>
  );
};

const DataModal = ({ data, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md" onClick={onClose}>
    <motion.div 
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.9, opacity: 0, y: 20 }}
      onClick={(e) => e.stopPropagation()}
      className="bg-white w-full max-w-lg rounded-[2rem] overflow-hidden shadow-2xl border border-gray-100"
    >
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/20 rounded-lg border border-green-500/30">
             <Unlock size={20} className="text-green-400" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">Secure Data View</h3>
            <p className="text-gray-400 text-xs font-mono mt-0.5">ID: {data.id} • End-to-End Encrypted</p>
          </div>
        </div>
        <button onClick={onClose} className="bg-white/10 hover:bg-white/20 p-2 rounded-full text-white transition-colors">
          <X size={20} />
        </button>
      </div>
      
      <div className="p-8 bg-gray-50">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-50">
             <Database size={100} className="text-gray-50 opacity-50 -mr-4 -mt-4" />
          </div>
          <pre className="text-gray-800 font-mono text-sm relative z-10 whitespace-pre-wrap">
            {JSON.stringify(data.data, null, 2)}
          </pre>
        </div>
        
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500 font-medium bg-gray-100 py-2 rounded-lg">
           <CheckCircle2 size={14} className="text-green-600" />
           <span>Access logged in immutable audit trail.</span>
        </div>
      </div>
    </motion.div>
  </div>
);

export default ConsumerDashboard;