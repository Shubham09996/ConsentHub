import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Phone, MapPin, Camera, Save, X, Shield, Key, 
  Activity, Globe, Building, Bell, Smartphone, FileText, Database, Check, LogOut
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Button, InputGroup } from '../../components/ui/PremiumComponents';

import { userAPI } from '../../services/api';
import { ownerAPI, consumerAPI } from '../../services/api';

const Profile = () => {
  const [role, setRole] = useState('owner');
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [passwordChange, setPasswordChange] = useState({ currentPassword: '', newPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [apiKey, setApiKey] = useState('Loading...');

  useEffect(() => {
    const storedRole = localStorage.getItem('role') || 'owner';
    setRole(storedRole);
    fetchProfile();
    if (storedRole === 'owner') {
      fetchPendingRequestsCount();
    } else if (storedRole === 'consumer') {
      fetchApiKey();
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

  const fetchApiKey = async () => {
    try {
      const res = await consumerAPI.getApiKey();
      setApiKey(res.data.apiKey);
    } catch (err) {
      console.error('Error fetching API key:', err);
      setApiKey('Failed to load API Key');
    }
  };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await userAPI.getProfile();
      setFormData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch profile');
      console.error('Fetch profile error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await userAPI.updateProfile(formData);
      setIsEditing(false);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      console.error('Update profile error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess('');
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
      console.error('Change password error:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- Sidebar Logic ---
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

  if (loading) {
    return <DashboardLayout title="Loading..." subtitle="Fetching profile data..." role={role === 'owner' ? "Data Owner" : "Data Consumer"} menuItems={currentMenuItems}>
      <div className="text-center py-20">Loading profile...</div>
    </DashboardLayout>;
  }

  if (error) {
    return <DashboardLayout title="Error" subtitle="Failed to load profile." role={role === 'owner' ? "Data Owner" : "Data Consumer"} menuItems={currentMenuItems}>
      <div className="text-center py-20 text-red-500">{error}</div>
    </DashboardLayout>;
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
                   <span className="bg-brand-50 text-brand-700 px-2 py-0.5 rounded text-xs uppercase tracking-wide font-bold">{formData.role}</span>
                   <span>•</span>
                   <span>{formData.location || 'N/A'}</span>
                </div>
             </div>
          </div>

          <div className="flex gap-3">
             {isEditing ? (
                <>
                  <Button variant="secondary" onClick={() => setIsEditing(false)} icon={X}>Cancel</Button>
                  <Button onClick={handleSaveProfile} icon={Save} isLoading={loading}>Save Changes</Button>
                </>
             ) : (
               <Button variant="secondary" onClick={() => setIsEditing(true)} disabled={loading}>Edit Profile</Button>
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
              <NavButton active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} icon={Bell} label="Notifications" />
              {role === 'consumer' && (
                 <NavButton active={activeTab === 'api'} onClick={() => setActiveTab('api')} icon={Key} label="API Keys" />
              )}
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
                                <InputGroup label="First Name" value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} disabled={!isEditing} />
                                <InputGroup label="Last Name" value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} disabled={!isEditing} />
                                <InputGroup label="Email" value={formData.email} disabled={true} icon={Mail} className="bg-gray-50 text-gray-500 cursor-not-allowed" />
                                <InputGroup label="Phone" value={formData.phone || ''} onChange={(e) => setFormData({...formData, phone: e.target.value})} disabled={!isEditing} icon={Phone} />
                             </div>

                             <div>
                                <label className="text-sm font-semibold text-gray-700 ml-1 mb-2 block">Bio</label>
                                <textarea 
                                   className={`w-full p-4 rounded-xl border border-gray-200 outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all text-sm resize-none ${!isEditing ? 'bg-gray-50 text-gray-500' : 'bg-white'}`}
                                   rows="4"
                                   value={formData.bio || ''}
                                   onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                   disabled={!isEditing}
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

                             <div className="bg-brand-50/50 border border-brand-100 rounded-xl p-6">
                                <h3 className="text-sm font-bold text-brand-900 mb-4">Change Password</h3>
                                {passwordError && <p className="text-red-500 text-sm mb-4">{passwordError}</p>}
                                {passwordSuccess && <p className="text-green-500 text-sm mb-4">{passwordSuccess}</p>}
                                <div className="space-y-4 max-w-md">
                                   <InputGroup label="Current Password" type="password" placeholder="••••••••" value={passwordChange.currentPassword} onChange={(e) => setPasswordChange({...passwordChange, currentPassword: e.target.value})} disabled={!isEditing} />
                                   <InputGroup label="New Password" type="password" placeholder="••••••••" value={passwordChange.newPassword} onChange={(e) => setPasswordChange({...passwordChange, newPassword: e.target.value})} disabled={!isEditing} />
                                   <div className="pt-2">
                                      <Button onClick={handleChangePassword} disabled={!isEditing || loading}>Update Password</Button>
                                   </div>
                                </div>
                             </div>

                             <div className="flex items-center justify-between py-6 border-b border-gray-100">
                                <div>
                                   <h4 className="font-bold text-gray-900">Two-Factor Authentication</h4>
                                   <p className="text-sm text-gray-500 mt-1">Secure your account with 2FA.</p>
                                </div>
                                <div className="flex items-center gap-3">
                                   <span className="text-sm font-bold text-gray-400">Off</span>
                                   <button className={`w-12 h-6 rounded-full transition-colors relative ${isEditing ? 'bg-gray-200 hover:bg-gray-300' : 'bg-gray-100 cursor-not-allowed'}`}>
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

                       {/* 3. Notifications Tab */}
                       {activeTab === 'notifications' && (
                          <motion.div 
                             key="notifications"
                             initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                          >
                             <h2 className="text-lg font-bold text-gray-900 mb-6">Notification Preferences</h2>
                             <div className="space-y-2">
                                <NotificationToggle title="Access Request Alerts" desc="When a company requests your data." defaultChecked />
                                <NotificationToggle title="Security Alerts" desc="Suspicious login attempts." defaultChecked />
                                <NotificationToggle title="Marketing Updates" desc="News about features." />
                             </div>
                          </motion.div>
                       )}

                        {/* 4. API Tab (Consumer) */}
                        {activeTab === 'api' && (
                          <motion.div 
                             key="api"
                             initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                          >
                             <h2 className="text-lg font-bold text-gray-900 mb-6">Developer API Keys</h2>
                             <div className="bg-gray-900 rounded-xl p-5 flex items-center justify-between mb-6">
                                <code className="text-gray-300 font-mono text-sm">{apiKey}</code>
                                <Button variant="secondary" className="h-8 text-xs bg-gray-800 text-white border-gray-700 hover:bg-gray-700">Copy</Button>
                             </div>
                             <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex gap-3 text-orange-800 text-sm">
                                <Shield size={20} className="shrink-0" />
                                <p>Do not share your API key. It allows access to user data on your behalf.</p>
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

// --- Sub-components for Polish ---

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

const NotificationToggle = ({ title, desc, defaultChecked }) => (
   <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
      <div>
         <p className="text-sm font-bold text-gray-900">{title}</p>
         <p className="text-xs text-gray-500">{desc}</p>
      </div>
      <div className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${defaultChecked ? 'bg-brand-600' : 'bg-gray-200'}`}>
         <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${defaultChecked ? 'left-6' : 'left-1'}`}></div>
      </div>
   </div>
);

export default Profile;