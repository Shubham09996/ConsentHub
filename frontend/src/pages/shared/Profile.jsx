import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Phone, Camera, Save, X, Shield, 
  Activity, Globe, Building, Bell, Smartphone, FileText, Database, Lock
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Button, InputGroup } from '../../components/ui/PremiumComponents';
import { userAPI, ownerAPI } from '../../services/api';

const Profile = () => {
  // --- State Management ---
  const [role, setRole] = useState('owner');
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Initialize with empty strings to prevent "uncontrolled input" errors
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    company: '',
    website: '',
    role: ''
  });

  const [passwordChange, setPasswordChange] = useState({ currentPassword: '', newPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  // --- Initial Data Fetching ---
  useEffect(() => {
    const storedRole = localStorage.getItem('role') || 'owner';
    setRole(storedRole);
    fetchProfile();
    if (storedRole === 'owner') {
      fetchPendingRequestsCount();
    }
  }, []);

  const fetchPendingRequestsCount = async () => {
    try {
      const res = await ownerAPI.getRequests();
      setPendingRequestsCount(res.data.length);
    } catch (err) {
      console.error('Error fetching pending requests count:', err);
    }
  };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await userAPI.getProfile();
      // Ensure we don't set null values to state
      setFormData({
        first_name: res.data.first_name || '',
        last_name: res.data.last_name || '',
        email: res.data.email || '',
        phone: res.data.phone || '',
        bio: res.data.bio || '',
        location: res.data.location || '',
        company: res.data.company || '',
        website: res.data.website || '',
        role: res.data.role || ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers ---
  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await userAPI.updateProfile(formData);
      setIsEditing(false);
      setError('');
      alert('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess('');
    
    if (!passwordChange.currentPassword || !passwordChange.newPassword) {
      setPasswordError('Please fill in both fields');
      return;
    }
    
    if (passwordChange.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      await userAPI.changePassword(passwordChange);
      setPasswordSuccess('Password updated successfully!');
      setPasswordChange({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  // --- Menu Items Logic ---
  const ownerMenuItems = [
    { label: 'Overview', icon: FileText, path: '/owner/dashboard' },
    { label: 'Pending Requests', icon: Bell, badge: pendingRequestsCount },
    { label: 'Audit Trail', icon: Activity }
  ];
  const consumerMenuItems = [
    { label: 'My Access Hub', icon: Database, path: '/consumer/dashboard' },
    { label: 'Global Search', icon: Globe }
  ];
  const currentMenuItems = role === 'owner' ? ownerMenuItems : consumerMenuItems;

  // --- Loading State ---
  if (loading && !formData.email) {
    return (
      <DashboardLayout title="Profile" subtitle="Loading..." role={role === 'owner' ? "Data Owner" : "Data Consumer"} menuItems={currentMenuItems}>
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Account Settings" 
      subtitle="Manage your profile and security preferences."
      role={role === 'owner' ? "Data Owner" : "Data Consumer"}
      menuItems={currentMenuItems}
    >
      <div className="relative max-w-6xl mx-auto pb-10">
        
        {/* Background Ambient Glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-brand-500/10 rounded-full blur-[100px] -z-10"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 bg-purple-500/10 rounded-full blur-[80px] -z-10"></div>

        {/* --- Header Card --- */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-2xl p-6 md:p-8 shadow-lg shadow-brand-900/5 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
             <div className="relative group">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-brand-100 to-white p-1 shadow-inner">
                   <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.first_name}`} 
                    alt="Avatar" 
                    className="w-full h-full object-cover rounded-xl bg-white"
                   />
                </div>
                <button className="absolute -bottom-2 -right-2 p-2 bg-brand-600 text-white rounded-lg shadow-lg hover:bg-brand-700 transition-all hover:scale-110">
                   <Camera size={16} />
                </button>
             </div>
             <div className="text-center md:text-left">
                <h1 className="text-2xl font-bold text-gray-900">{formData.first_name} {formData.last_name}</h1>
                <div className="flex items-center justify-center md:justify-start gap-2 mt-1 text-sm text-gray-500 font-medium">
                   <span className="bg-brand-50 text-brand-700 px-2 py-0.5 rounded text-xs uppercase tracking-wide font-bold">{role}</span>
                   {formData.location && (
                     <>
                       <span>•</span>
                       <span>{formData.location}</span>
                     </>
                   )}
                </div>
             </div>
          </div>

          <div className="flex gap-3">
             {isEditing ? (
               <>
                 <Button variant="secondary" onClick={() => { setIsEditing(false); fetchProfile(); }} icon={X}>Cancel</Button>
                 <Button onClick={handleSaveProfile} icon={Save} isLoading={loading}>Save Changes</Button>
               </>
             ) : (
               <Button variant="secondary" onClick={() => setIsEditing(true)}>Edit Profile</Button>
             )}
          </div>
        </div>

        {/* --- Main Grid Layout --- */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
           
           {/* Sidebar Navigation */}
           <div className="md:col-span-3 space-y-2 sticky top-24">
             <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-4 mb-2">Account</p>
             <NavButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={User} label="Profile Details" />
             <NavButton active={activeTab === 'security'} onClick={() => setActiveTab('security')} icon={Shield} label="Login & Security" />
           </div>

           {/* Content Area */}
           <div className="md:col-span-9">
             <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-brand-900/5 overflow-hidden min-h-[500px]">
                <div className="p-8">
                   <AnimatePresence mode="wait">
                      
                      {/* 1. Profile Details Tab */}
                      {activeTab === 'profile' && (
                         <motion.div 
                            key="profile"
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                         >
                            <div>
                               <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
                               <p className="text-sm text-gray-500 mt-1">Update your photo and personal details here.</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               <InputGroup 
                                  label="First Name" 
                                  value={formData.first_name || ''} 
                                  onChange={(e) => setFormData({...formData, first_name: e.target.value})} 
                                  disabled={!isEditing} 
                               />
                               <InputGroup 
                                  label="Last Name" 
                                  value={formData.last_name || ''} 
                                  onChange={(e) => setFormData({...formData, last_name: e.target.value})} 
                                  disabled={!isEditing} 
                               />
                               
                               {/* Locked Email UI */}
                               <div className="md:col-span-2">
                                  <label className="text-sm font-semibold text-gray-700 ml-1 mb-2 block">Email Address</label>
                                  <div className="relative group">
                                    <div className="flex items-center w-full p-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 transition-colors group-hover:border-gray-300">
                                      <Lock size={18} className="text-gray-400 mr-3" />
                                      <span className="flex-1 font-mono text-sm">{formData.email}</span>
                                      <span className="text-[10px] font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full uppercase tracking-wide">Verified</span>
                                    </div>
                                    {isEditing && (
                                      <div className="absolute right-0 top-full mt-1 text-xs text-gray-400 flex items-center gap-1">
                                        <Shield size={10} /> Email cannot be changed for security.
                                      </div>
                                    )}
                                  </div>
                               </div>

                               <InputGroup 
                                  label="Phone" 
                                  value={formData.phone || ''} 
                                  onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                                  disabled={!isEditing} 
                                  icon={Phone} 
                               />
                            </div>

                            <div>
                               <label className="text-sm font-semibold text-gray-700 ml-1 mb-2 block">Bio</label>
                               <textarea 
                                  className={`w-full p-4 rounded-xl border border-gray-200 outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all text-sm resize-none ${!isEditing ? 'bg-gray-50 text-gray-500' : 'bg-white'}`}
                                  rows="4"
                                  value={formData.bio || ''}
                                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                  disabled={!isEditing}
                                  placeholder="Tell us a little about yourself..."
                               />
                            </div>

                            {role === 'consumer' && (
                               <div className="pt-8 border-t border-gray-100">
                                  <h2 className="text-lg font-bold text-gray-900 mb-6">Organization Details</h2>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                     <InputGroup label="Company Name" value={formData.company || ''} icon={Building} onChange={(e) => setFormData({...formData, company: e.target.value})} disabled={!isEditing} />
                                     <InputGroup label="Website" value={formData.website || ''} icon={Globe} onChange={(e) => setFormData({...formData, website: e.target.value})} disabled={!isEditing} />
                                  </div>
                               </div>
                            )}
                         </motion.div>
                      )}

                      {/* 2. Security Tab */}
                      {activeTab === 'security' && (
                         <motion.div 
                            key="security"
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                         >
                            <div>
                               <h2 className="text-lg font-bold text-gray-900">Password & Authentication</h2>
                               <p className="text-sm text-gray-500 mt-1">Manage your access security.</p>
                            </div>

                            <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-6">
                               <h3 className="text-sm font-bold text-orange-900 mb-4 flex items-center gap-2"><Lock size={16}/> Change Password</h3>
                               {passwordError && <p className="text-red-500 text-xs font-bold mb-4 bg-red-50 p-2 rounded">{passwordError}</p>}
                               {passwordSuccess && <p className="text-green-500 text-xs font-bold mb-4 bg-green-50 p-2 rounded">{passwordSuccess}</p>}
                               
                               <div className="space-y-4 max-w-md">
                                  <InputGroup 
                                    label="Current Password" 
                                    type="password" 
                                    placeholder="••••••••" 
                                    value={passwordChange.currentPassword} 
                                    onChange={(e) => setPasswordChange({...passwordChange, currentPassword: e.target.value})} 
                                    // Always allow typing here, even if main profile isn't in edit mode
                                  />
                                  <InputGroup 
                                    label="New Password" 
                                    type="password" 
                                    placeholder="••••••••" 
                                    value={passwordChange.newPassword} 
                                    onChange={(e) => setPasswordChange({...passwordChange, newPassword: e.target.value})} 
                                  />
                                  <div className="pt-2">
                                     <Button onClick={handleChangePassword} disabled={loading} size="sm">Update Password</Button>
                                  </div>
                               </div>
                            </div>

                            <div className="flex items-center justify-between py-6 border-b border-gray-100">
                               <div>
                                  <h4 className="font-bold text-gray-900">Two-Factor Authentication</h4>
                                  <p className="text-sm text-gray-500 mt-1">Add an extra layer of security.</p>
                               </div>
                               <div className="flex items-center gap-3">
                                  <span className="text-sm font-bold text-gray-400">Off</span>
                                  <button disabled className="w-12 h-6 rounded-full bg-gray-100 cursor-not-allowed relative">
                                     <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></span>
                                  </button>
                               </div>
                            </div>

                            <div>
                               <h4 className="font-bold text-gray-900 mb-4">Active Devices</h4>
                               <div className="space-y-3">
                                  <DeviceItem name="Chrome on MacOS" location="New York, USA" active={true} />
                                  <DeviceItem name="ConsentHub Mobile App" location="New York, USA" time="2h ago" />
                               </div>
                            </div>
                         </motion.div>
                      )}
                   </AnimatePresence>
                </div>
             </div>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

// --- Sub-components ---

const NavButton = ({ active, onClick, icon: Icon, label }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 relative ${
       active 
       ? 'text-brand-700 bg-brand-50 shadow-sm' 
       : 'text-gray-600 hover:bg-white hover:text-gray-900'
    }`}
  >
    <Icon size={18} className={active ? 'text-brand-600' : 'text-gray-400'} />
    <span>{label}</span>
    {active && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-brand-600 rounded-l-full"></div>}
  </button>
);

const DeviceItem = ({ name, location, active, time }) => (
   <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50/50">
      <div className="flex items-center gap-4">
         <div className="p-2 bg-white rounded-lg shadow-sm text-gray-500"><Smartphone size={20}/></div>
         <div>
            <p className="text-sm font-bold text-gray-900">{name}</p>
            <p className="text-xs text-gray-500">{location} • {active ? <span className="text-green-600 font-bold">Active Now</span> : time}</p>
         </div>
      </div>
      {!active && <button className="text-xs text-red-500 font-bold hover:underline">Revoke</button>}
   </div>
);

export default Profile;