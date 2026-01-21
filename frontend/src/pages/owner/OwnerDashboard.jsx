import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom'; // Import to handle query params
import { FileText, Bell, Activity, Clock, Check, X, Ban, Database, ShieldCheck, Users } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { GlassCard, Button, Badge, InputGroup, Select } from '../../components/ui/PremiumComponents';
import { motion, AnimatePresence } from 'framer-motion';
import { ownerAPI } from '../../services/api';

const OwnerDashboard = () => {
  // --- Routing State ---
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview'; // Default to overview

  // --- Data State ---
  const [requests, setRequests] = useState([]);
  const [activeConnections, setActiveConnections] = useState([]);
  const [logs, setLogs] = useState([]);
  const [dataOfferings, setDataOfferings] = useState([]);
  
  // --- Form & Modal State ---
  const [newOffering, setNewOffering] = useState({
    name: '',
    description: '',
    sensitivity: 'LOW',
    category: 'Other',
    dataPayload: '{ "message": "Initial data payload for this offering." }',
  });
  const [editingOffering, setEditingOffering] = useState(null);
  const [dataPayload, setDataPayload] = useState('');
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [selectedOfferingForData, setSelectedOfferingForData] = useState(null);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState('');

  // --- Initial Fetch ---
  useEffect(() => {
    fetchOwnerData();
    fetchDataOfferings();
  }, []);

  // --- API Calls ---
  const fetchOwnerData = async () => {
    setLoading(true);
    try {
      const [requestsRes, connectionsRes, logsRes] = await Promise.all([
        ownerAPI.getRequests(),
        ownerAPI.getActiveConnections(),
        ownerAPI.getLogs(),
      ]);
      setRequests(requestsRes.data.map(req => ({ 
        id: req.id, 
        name: `${req.first_name || ''} ${req.last_name || ''}`.trim(),
        company: req.company || 'N/A',
        purpose: req.purpose, 
        dataOfferingName: req.data_offering_name,
        time: new Date(req.created_at).toLocaleString() 
      })));
      setActiveConnections(connectionsRes.data.map(conn => ({
        id: conn.id,
        org: `${conn.first_name || ''} ${conn.last_name || ''}`.trim() || conn.company || 'N/A',
        purpose: conn.purpose,
        since: new Date(conn.since).toLocaleDateString()
      })));
      setLogs(logsRes.data.map(log => ({
        id: log.id,
        org: log.target_id ? log.target_id.substring(0, 8) : 'N/A',
        action: log.action_type.replace(/_/g, ' '),
        time: new Date(log.timestamp).toLocaleString(),
        status: log.status
      })));
    } catch (err) {
      console.error('Error fetching owner data:', err);
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchDataOfferings = async () => {
    try {
      const res = await ownerAPI.getDataOfferings();
      setDataOfferings(res.data);
    } catch (err) {
      console.error('Error fetching data offerings:', err);
    }
  };

  // --- Action Handlers ---
  const handleCreateOffering = async (e) => {
    e.preventDefault();
    try {
      const customPayload = JSON.parse(newOffering.dataPayload); 
      const combinedDataPayload = {
        name: newOffering.name,
        description: newOffering.description,
        category: newOffering.category,
        sensitivity: newOffering.sensitivity,
        ...customPayload,
      };

      await ownerAPI.createDataOffering({ ...newOffering, dataPayload: combinedDataPayload }); 
      setNewOffering({ 
        name: '',
        description: '',
        sensitivity: 'LOW',
        category: 'Other',
        dataPayload: '{ "message": "Initial data payload for this offering." }', 
      });
      fetchDataOfferings();
      alert('Offering created successfully!');
    } catch (err) {
      alert('Failed to create offering. Invalid JSON.');
    }
  };

  const handleUpdateOffering = async (id) => {
    try {
      await ownerAPI.updateDataOffering(id, { ...editingOffering, dataPayload: JSON.parse(dataPayload) });
      setEditingOffering(null);
      fetchDataOfferings();
    } catch (err) {
      console.error('Error updating data offering:', err);
    }
  };

  const handleDeleteOffering = async (id) => {
    if (window.confirm('Are you sure you want to delete this data offering?')) {
      try {
        await ownerAPI.deleteDataOffering(id);
        fetchDataOfferings();
      } catch (err) {
        console.error('Error deleting data offering:', err);
      }
    }
  };

  const handleManageData = async (offering) => {
    setSelectedOfferingForData(offering);
    setIsDataModalOpen(true);
    try {
      const res = await ownerAPI.getDataRecordByOfferingId(offering.id);
      setDataPayload(JSON.stringify(res.data, null, 2));
    } catch (err) {
      setDataPayload('{ "message": "No data yet. Add your JSON data here." }');
    }
  };

  const handleSaveDataPayload = async () => {
    if (!selectedOfferingForData) return;
    try {
      const parsedPayload = JSON.parse(dataPayload);
      await ownerAPI.updateDataOffering(selectedOfferingForData.id, { 
        ...selectedOfferingForData, 
        dataPayload: parsedPayload 
      });
      alert('Data saved successfully!');
      setIsDataModalOpen(false);
      fetchDataOfferings(); 
    } catch (err) {
      alert('Invalid JSON format.');
    }
  };

  const handleApprove = async (id) => {
    try {
      await ownerAPI.respondToRequest(id, 'APPROVED');
      setRequests(prev => prev.filter(req => req.id !== id));
      fetchOwnerData(); 
      window.dispatchEvent(new CustomEvent('accessApproved', { detail: { accessId: id } }));
      alert('Request approved!');
    } catch (err) {
      alert('Failed to approve request.');
    }
  };

  const handleDeny = async (id) => {
    try {
      await ownerAPI.respondToRequest(id, 'REJECTED');
      setRequests(prev => prev.filter(req => req.id !== id));
      fetchOwnerData();
      alert('Request denied!');
    } catch (err) {
      alert('Failed to deny request.');
    }
  };

  const handleRevoke = async (id) => {
    if(window.confirm("Are you sure? This will immediately stop data access.")){
      try {
        await ownerAPI.revokeAccess(id);
        setActiveConnections(prev => prev.filter(conn => conn.id !== id));
        const logsRes = await ownerAPI.getLogs();
        setLogs(logsRes.data.map(log => ({
            id: log.id,
            org: log.target_id ? log.target_id.substring(0, 8) : 'N/A',
            action: log.action_type.replace(/_/g, ' '),
            time: new Date(log.timestamp).toLocaleString(),
            status: log.status
        })));
        alert('Access revoked successfully!');
      } catch (err) {
        alert('Failed to revoke access.');
      }
    }
  };

  // --- Dynamic Content Rendering ---
  const renderContent = () => {
    if (loading) {
      return <div className="flex justify-center items-center h-64"><div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full"></div></div>;
    }

    switch (currentTab) {
      case 'requests':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
            <div className="flex items-center justify-between mb-6">
               <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                 <Bell className="text-brand-500" /> Pending Approvals
               </h3>
               <span className="bg-brand-100 text-brand-700 px-3 py-1 rounded-full text-sm font-bold">{requests.length} Pending</span>
            </div>
            <div className="grid gap-4">
              <AnimatePresence>
                {requests.length > 0 ? requests.map(req => (
                  <motion.div key={req.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}>
                    <GlassCard className="p-6 flex flex-col md:flex-row items-center justify-between gap-4 border-l-4 border-l-brand-500">
                      <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-lg">{req.name.charAt(0)}</div>
                        <div>
                          <h4 className="font-bold text-gray-900">{req.name}</h4>
                          <p className="text-sm text-gray-600">{req.company !== 'N/A' ? req.company : 'Individual'}</p>
                          <p className="text-sm text-gray-500 italic">"{req.purpose}"</p>
                          {req.dataOfferingName && <p className="text-xs font-bold text-brand-600 mt-1 bg-brand-50 inline-block px-2 py-0.5 rounded">Target: {req.dataOfferingName}</p>}
                          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><Clock size={10}/> {req.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                          <Button variant="secondary" onClick={() => handleDeny(req.id)} icon={X} className="flex-1 md:flex-none">Deny</Button>
                          <Button onClick={() => handleApprove(req.id)} icon={Check} className="flex-1 md:flex-none">Approve</Button>
                      </div>
                    </GlassCard>
                  </motion.div>
                )) : (
                  <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                    <Check size={40} className="mx-auto text-green-500 mb-3" />
                    <p className="text-gray-500 font-medium">All caught up! No pending requests.</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        );

      case 'offerings':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
            <h3 className="font-bold text-xl text-gray-800 mb-6 flex items-center gap-2"><Database className="text-brand-500"/> My Data Offerings</h3>
            
            {/* Create Form */}
            <GlassCard className="mb-8 p-6 border border-brand-100">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs">1</span> Create New Offering</h4>
              <form onSubmit={handleCreateOffering} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <InputGroup label="Data Name" placeholder="e.g., Clinical History" value={newOffering.name} onChange={(e) => setNewOffering({ ...newOffering, name: e.target.value })} required />
                <InputGroup label="Description" placeholder="Brief description" value={newOffering.description} onChange={(e) => setNewOffering({ ...newOffering, description: e.target.value })} required />
                <InputGroup label="Category" placeholder="e.g., Health" value={newOffering.category} onChange={(e) => setNewOffering({ ...newOffering, category: e.target.value })} required />
                <Select label="Sensitivity" value={newOffering.sensitivity} onChange={(e) => setNewOffering({ ...newOffering, sensitivity: e.target.value })} options={[{ value: 'LOW', label: 'Low' }, { value: 'MEDIUM', label: 'Medium' }, { value: 'HIGH', label: 'High' }]} />
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Initial JSON Data</label>
                  <textarea className="w-full p-3 border border-gray-300 rounded-xl font-mono text-sm h-24 focus:ring-brand-500 focus:border-brand-500" value={newOffering.dataPayload} onChange={(e) => setNewOffering({ ...newOffering, dataPayload: e.target.value })} placeholder='{ "key": "value" }'></textarea>
                </div>
                <Button type="submit" className="md:col-span-1">Add Offering</Button>
              </form>
            </GlassCard>

            {/* Offerings List */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase">Name</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase">Description</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase">Category</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase">Sensitivity</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataOfferings.length > 0 ? dataOfferings.map(offering => (
                       <tr key={offering.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                         {editingOffering && editingOffering.id === offering.id ? (
                           <>
                             <td className="p-4"><InputGroup value={editingOffering.name} onChange={(e) => setEditingOffering({ ...editingOffering, name: e.target.value })} /></td>
                             <td className="p-4"><InputGroup value={editingOffering.description} onChange={(e) => setEditingOffering({ ...editingOffering, description: e.target.value })} /></td>
                             <td className="p-4"><InputGroup value={editingOffering.category} onChange={(e) => setEditingOffering({ ...editingOffering, category: e.target.value })} /></td>
                             <td className="p-4">
                               <Select value={editingOffering.sensitivity} onChange={(e) => setEditingOffering({ ...editingOffering, sensitivity: e.target.value })} options={[{ value: 'LOW', label: 'Low' }, { value: 'MEDIUM', label: 'Medium' }, { value: 'HIGH', label: 'High' }]} />
                             </td>
                             <td className="p-4 flex gap-2">
                               <Button size="sm" onClick={() => handleUpdateOffering(offering.id)}>Save</Button>
                               <Button size="sm" variant="secondary" onClick={() => setEditingOffering(null)}>Cancel</Button>
                             </td>
                           </>
                         ) : (
                           <>
                             <td className="p-4 font-semibold text-gray-700">{offering.name}</td>
                             <td className="p-4 text-sm text-gray-600">{offering.description}</td>
                             <td className="p-4 font-medium text-gray-700">{offering.category}</td>
                             <td className="p-4"><Badge status={offering.sensitivity === 'HIGH' ? 'danger' : offering.sensitivity === 'MEDIUM' ? 'warning' : 'success'} text={offering.sensitivity} /></td>
                             <td className="p-4 flex gap-2">
                               <Button size="sm" variant="secondary" onClick={() => setEditingOffering(offering)}>Edit</Button>
                               <Button size="sm" variant="danger" onClick={() => handleDeleteOffering(offering.id)}>Delete</Button>
                               <Button size="sm" onClick={() => handleManageData(offering)}>Manage Data</Button>
                             </td>
                           </>
                         )}
                       </tr>
                    )) : (
                      <tr><td colSpan="5" className="text-center py-8 text-gray-500">No data offerings created yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        );

      case 'audit':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
             <h3 className="font-bold text-xl text-gray-800 mb-6 flex items-center gap-2"><Activity className="text-brand-500" /> Immutable Audit Trail</h3>
             <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase">Entity</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase">Action</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase">Timestamp</th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map(log => (
                      <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="p-4 font-semibold text-gray-700">{log.org}</td>
                        <td className="p-4 text-sm text-gray-600 uppercase tracking-wide font-medium">{log.action}</td>
                        <td className="p-4 text-sm text-gray-500 flex items-center gap-2"><Clock size={14} /> {log.time}</td>
                        <td className="p-4">
                          <span className={`text-xs font-bold px-2 py-1 rounded-md ${log.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {logs.length === 0 && <tr><td colSpan="4" className="text-center py-8 text-gray-500">No logs generated yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        );

      case 'overview':
      default:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
            
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl p-6 text-white shadow-lg shadow-brand-200">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium opacity-90">Active Connections</h4>
                        <div className="p-2 bg-white/20 rounded-lg"><Users size={20} /></div>
                    </div>
                    <p className="text-3xl font-bold">{activeConnections.length}</p>
                    <p className="text-xs opacity-70 mt-1">Organizations accessing data</p>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium text-gray-500">Data Offerings</h4>
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Database size={20} /></div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{dataOfferings.length}</p>
                    <p className="text-xs text-gray-400 mt-1">Available for sharing</p>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium text-gray-500">Total Requests</h4>
                        <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Bell size={20} /></div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{requests.length}</p>
                    <p className="text-xs text-gray-400 mt-1">Pending actions</p>
                </div>
            </div>

            {/* Active Connections Section (Main Dashboard View) */}
            <h3 className="font-bold text-xl text-gray-800 mb-4 flex items-center gap-2"><ShieldCheck className="text-green-500"/> Active Connections</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeConnections.length > 0 ? activeConnections.map(conn => (
                <GlassCard key={conn.id} className="p-5 flex flex-col justify-between h-full hover:border-brand-300 transition-colors">
                  <div>
                     <div className="flex items-start justify-between">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 mb-3">{conn.org.charAt(0)}</div>
                        <div className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Active</div>
                     </div>
                     <h4 className="font-bold text-gray-900 text-lg truncate" title={conn.org}>{conn.org}</h4>
                     <p className="text-sm text-gray-500 mb-4 line-clamp-2">{conn.purpose}</p>
                  </div>
                  <div>
                    <div className="border-t border-gray-100 pt-3 mb-3">
                        <p className="text-xs text-gray-400">Granted: {conn.since}</p>
                    </div>
                    <button 
                      onClick={() => handleRevoke(conn.id)}
                      className="w-full text-red-500 hover:text-white hover:bg-red-500 bg-red-50 p-2.5 rounded-xl transition-all text-sm font-bold flex items-center justify-center gap-2"
                    >
                      <Ban size={16} /> Revoke Access
                    </button>
                  </div>
                </GlassCard>
              )) : (
                <div className="col-span-full text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300 text-gray-500">
                  <ShieldCheck size={48} className="mx-auto text-gray-300 mb-3" />
                  <p>No active connections found.</p>
                  <p className="text-sm">Approved requests will appear here.</p>
                </div>
              )}
            </div>
          </motion.div>
        );
    }
  };

  return (
    <DashboardLayout 
      title="My Data Control" 
      subtitle="Manage access requests, offerings, and view audit logs." 
      role="Data Owner"
      menuItems={[
        { label: 'Overview', icon: FileText, path: '/owner/dashboard?tab=overview' },
        { label: 'Pending Requests', icon: Bell, badge: requests.length, path: '/owner/dashboard?tab=requests' },
        { label: 'My Data Offerings', icon: Database, path: '/owner/dashboard?tab=offerings' },
        { label: 'Audit Trail', icon: Activity, path: '/owner/dashboard?tab=audit' },
      ]}
    >
      <div className="min-h-[500px]">
        {renderContent()}
      </div>

      {/* Data Management Modal */}
      <AnimatePresence>
        {isDataModalOpen && selectedOfferingForData && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md"
            onClick={() => setIsDataModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-[2rem] overflow-hidden shadow-2xl border border-gray-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 flex justify-between items-center">
                <h3 className="font-bold text-white text-lg">Manage Data for: {selectedOfferingForData.name}</h3>
                <button onClick={() => setIsDataModalOpen(false)} className="bg-white/10 hover:bg-white/20 p-2 rounded-full text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <p className="text-gray-700">Edit the JSON data associated with this offering. This data will be securely shared with approved consumers.</p>
                <textarea
                  className="w-full p-4 border border-gray-300 rounded-xl font-mono text-sm h-60 resize-y focus:border-brand-500 outline-none shadow-inner bg-gray-50"
                  value={dataPayload}
                  onChange={(e) => setDataPayload(e.target.value)}
                  placeholder="Enter JSON data here..."
                ></textarea>
                <Button onClick={handleSaveDataPayload} className="w-full">Save Data</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default OwnerDashboard;