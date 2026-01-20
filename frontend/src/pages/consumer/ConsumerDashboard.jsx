import React, { useState, useEffect } from 'react';
import { 
  Search, Globe, Lock, Unlock, Eye, X, Database, 
  AlertCircle, Clock, CheckCircle2, Zap, LayoutGrid, Filter, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { GlassCard, Button, InputGroup, Badge } from '../../components/ui/PremiumComponents';

import { consumerAPI } from '../../services/api';

const ConsumerDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewData, setViewData] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'pending'
  const [dashboardStats, setDashboardStats] = useState({ activeConnections: 0, pendingRequests: 0, totalApiCalls: 0 });
  const [accessList, setAccessList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchOwners, setSearchOwners] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [requestPurpose, setRequestPurpose] = useState('');
  const [requestError, setRequestError] = useState('');

  useEffect(() => {
    fetchDashboardStats();
    fetchAccessList();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const res = await consumerAPI.getDashboardStats();
      setDashboardStats(res.data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to fetch dashboard stats');
    }
  };

  const fetchAccessList = async () => {
    setLoading(true);
    try {
      const res = await consumerAPI.getAccessList();
      setAccessList(res.data.map(item => ({
        id: item.id,
        name: `${item.first_name}`,
        email: item.email,
        status: item.status.toLowerCase(),
        ownerId: item.owner_id,
        expiry: 'N/A',
        sensitivity: 'N/A', // This would ideally come from the backend with the access list
        data: null
      })));
    } catch (err) {
      console.error('Error fetching access list:', err);
      setError('Failed to fetch access list');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchOwners = async () => {
    if (!searchQuery) return;
    try {
      const res = await consumerAPI.searchOwner(searchQuery);
      setSearchOwners(res.data);
    } catch (err) {
      console.error('Error searching owners:', err);
    }
  };

  const handleRequestAccess = async (ownerId) => {
    setRequestError('');
    if (!requestPurpose) {
      setRequestError('Purpose cannot be empty.');
      return;
    }
    try {
      await consumerAPI.requestAccess(ownerId, requestPurpose);
      setIsSearchModalOpen(false);
      setSearchQuery('');
      setRequestPurpose('');
      fetchAccessList(); // Refresh access list
    } catch (err) {
      setRequestError(err.response?.data?.message || 'Failed to send request');
      console.error('Error requesting access:', err);
    }
  };

  const handleViewData = async (item) => {
    try {
      const res = await consumerAPI.getData(item.ownerId);
      setViewData({ ...item, data: res.data });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to retrieve data.');
      console.error('Error viewing data:', err);
    }
  };

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
          <StatCard label="Active Connections" value={dashboardStats.activeConnections} icon={Zap} color="text-emerald-500" bg="bg-emerald-500/10" />
          <StatCard label="Pending Requests" value={dashboardStats.pendingRequests} icon={Clock} color="text-amber-500" bg="bg-amber-500/10" />
          <StatCard label="Total API Calls" value={dashboardStats.totalApiCalls} icon={Activity} color="text-blue-500" bg="bg-blue-500/10" />
        </div>

        {/* 2. Search & Filter Bar */}
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-2 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
            <input 
              type="text"
              placeholder="Search by name or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 hover:bg-white focus:bg-white border-2 border-transparent focus:border-brand-500 rounded-xl py-3 pl-12 pr-4 outline-none transition-all font-medium text-gray-700"
            />
            <button onClick={handleSearchOwners} className="absolute right-2 top-2 h-10 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-semibold">Search</button>
          </div>
          
          <div className="flex bg-gray-100 p-1.5 rounded-xl w-full md:w-auto">
            {['all', 'active', 'pending', 'revoked'].map((f) => (
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
          
          <Button onClick={() => setIsSearchModalOpen(true)} className="w-full md:w-auto px-6 h-12 rounded-xl whitespace-nowrap shadow-brand-500/20">
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

const StatCard = ({ label, value, icon: Icon, color, bg }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between relative overflow-hidden group hover:shadow-md transition-shadow"
  >
    <div className="relative z-10">
      <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <h3 className="text-3xl font-black text-gray-900">{value}</h3>
    </div>
    <div className={`p-4 rounded-2xl ${bg} ${color} group-hover:scale-110 transition-transform`}>
      <Icon size={24} />
    </div>
    <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full ${bg} opacity-50 blur-2xl group-hover:opacity-100 transition-opacity`}></div>
  </motion.div>
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
            <p className="text-sm font-bold text-gray-700">{'N/A'}</p>
         </div>
         <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Sensitivity</p>
            <p className="text-sm font-bold text-gray-700">{'N/A'}</p>
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
            onClick={() => onView(item)}
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

const SearchOwnerModal = ({ isOpen, onClose, searchResults, onSendRequest, searchQuery, setSearchQuery, handleSearch, requestPurpose, setRequestPurpose, requestError }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white w-full max-w-lg rounded-[2rem] overflow-hidden shadow-2xl border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-brand-600 to-indigo-600 p-6 flex justify-between items-center">
              <h3 className="font-bold text-white text-lg">New Access Request</h3>
              <button onClick={onClose} className="bg-white/10 hover:bg-white/20 p-2 rounded-full text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <InputGroup 
                label="Search Data Owner by Email" 
                placeholder="owner@example.com" 
                icon={Mail}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button onClick={handleSearch} className="w-full">Search</Button>

              {searchResults.length > 0 && (
                <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                  {searchResults.map(owner => (
                    <div key={owner.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div>
                        <p className="font-bold text-gray-900">{owner.first_name} {owner.last_name}</p>
                        <p className="text-sm text-gray-500">{owner.email}</p>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => onSendRequest(owner.id)}
                        disabled={!requestPurpose}
                      >
                        Request Access
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <InputGroup 
                label="Purpose of Request"
                placeholder="e.g., Credit Score Verification"
                value={requestPurpose}
                onChange={(e) => setRequestPurpose(e.target.value)}
              />
              {requestError && <p className="text-red-500 text-sm">{requestError}</p>}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConsumerDashboard;