import React, { useState, useEffect } from 'react';
import { FileText, Bell, Activity, Clock, Check, X, Ban, Database } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { GlassCard, Button, Badge, InputGroup, Select } from '../../components/ui/PremiumComponents';
import { motion, AnimatePresence } from 'framer-motion';
import { ownerAPI } from '../../services/api';

const OwnerDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [activeConnections, setActiveConnections] = useState([]);
  const [logs, setLogs] = useState([]);
  const [dataOfferings, setDataOfferings] = useState([]);
  const [newOffering, setNewOffering] = useState({
    name: '',
    description: '',
    sensitivity: 'LOW',
    category: 'Other',
    dataPayload: '{ "message": "Initial data payload for this offering." }', // New: Default JSON payload
  });
  const [editingOffering, setEditingOffering] = useState(null);
  const [dataPayload, setDataPayload] = useState(''); // New state for data payload
  const [isDataModalOpen, setIsDataModalOpen] = useState(false); // New state for data modal
  const [selectedOfferingForData, setSelectedOfferingForData] = useState(null); // New state for selected offering for data management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOwnerData();
    fetchDataOfferings();
  }, []);

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
        dataOfferingName: req.data_offering_name, // New: Specific data offering name
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
        org: log.target_id ? log.target_id.substring(0, 8) : 'N/A', // Placeholder, ideally join with users table for actual org name
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
      setError('Failed to fetch data offerings');
    }
  };

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
    } catch (err) {
      console.error('Error creating data offering:', err);
      alert('Failed to create data offering. Please ensure your initial data payload is valid JSON.');
    }
  };

  const handleUpdateOffering = async (id) => {
    try {
      // Ensure dataPayload is included when updating an offering
      await ownerAPI.updateDataOffering(id, { ...editingOffering, dataPayload: JSON.parse(dataPayload) });
      setEditingOffering(null);
      fetchDataOfferings();
    } catch (err) {
      console.error('Error updating data offering:', err);
      setError('Failed to update data offering');
    }
  };

  const handleDeleteOffering = async (id) => {
    if (window.confirm('Are you sure you want to delete this data offering?')) {
      try {
        await ownerAPI.deleteDataOffering(id);
        fetchDataOfferings();
      } catch (err) {
        console.error('Error deleting data offering:', err);
        setError('Failed to delete data offering');
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
      console.error('Error fetching data record:', err);
      setDataPayload('{ "message": "No data yet. Add your JSON data here." }');
    }
  };

  const handleSaveDataPayload = async () => {
    if (!selectedOfferingForData) {
      alert('No data offering selected.');
      return;
    }
    try {
      const parsedPayload = JSON.parse(dataPayload);
      
      // Now, we update the data offering with the new payload
      await ownerAPI.updateDataOffering(selectedOfferingForData.id, { 
        ...selectedOfferingForData, 
        dataPayload: parsedPayload 
      });
      
      alert('Data saved successfully!');
      setIsDataModalOpen(false);
      fetchDataOfferings(); 
    } catch (err) {
      console.error('Error saving data payload:', err);
      alert('Failed to save data. Please ensure it is valid JSON and you have an active offering selected.');
    }
  };

  const handleApprove = async (id) => {
    try {
      await ownerAPI.respondToRequest(id, 'APPROVED');
      fetchOwnerData();
    } catch (err) {
      console.error('Error approving request:', err);
    }
  };
  const handleDeny = async (id) => {
    try {
      await ownerAPI.respondToRequest(id, 'REJECTED');
      fetchOwnerData();
    } catch (err) {
      console.error('Error denying request:', err);
    }
  };
  const handleRevoke = async (id) => {
    if(window.confirm("Are you sure? This will immediately stop data access.")){
      try {
        await ownerAPI.revokeAccess(id);
        fetchOwnerData();
      } catch (err) {
        console.error('Error revoking access:', err);
      }
    }
  };

  return (
    <DashboardLayout 
      title="My Data Control" 
      subtitle="Manage access requests and audit logs." 
      role="Data Owner"
      menuItems={[
        { label: 'Overview', icon: FileText, path: '/owner/dashboard' },
        { label: 'Pending Requests', icon: Bell, badge: requests.length },
        { label: 'My Data Offerings', icon: Database, path: '/owner/dashboard#data-offerings' },
        { label: 'Audit Trail', icon: Activity },
        // Profile removed from here
      ]}
    >
      <div className="grid gap-8">
        
        {/* 1. Pending Requests Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
              Pending Approvals
            </h3>
          </div>
          
          <div className="grid gap-4">
            <AnimatePresence>
              {requests.length > 0 ? requests.map(req => (
                <motion.div 
                  key={req.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
                >
                  <GlassCard className="p-6 flex flex-col md:flex-row items-center justify-between gap-4 border-l-4 border-l-brand-500">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-lg">
                        {req.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{req.name}</h4>
                        {req.company !== 'N/A' && <p className="text-sm text-gray-600">{req.company}</p>}
                        <p className="text-sm text-gray-500">{req.purpose}</p>
                        {req.dataOfferingName && <p className="text-sm font-medium text-brand-600">Data: {req.dataOfferingName}</p>}
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
                <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-gray-300">
                  <p className="text-gray-400">All caught up! No pending requests.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* 2. Active Connections */}
        <section>
          <h3 className="font-bold text-lg text-gray-800 mb-4">Active Connections</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeConnections.map(conn => (
              <GlassCard key={conn.id} className="p-5 flex justify-between items-start">
                <div>
                   <h4 className="font-bold text-gray-900">{conn.org}</h4>
                   <p className="text-sm text-gray-500 mb-2">{conn.purpose}</p>
                   <Badge status="active" text="Access Granted" />
                   <p className="text-xs text-gray-400 mt-3">Active since: {conn.since}</p>
                </div>
                <button 
                  onClick={() => handleRevoke(conn.id)}
                  className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors text-xs font-bold flex items-center gap-1"
                >
                  <Ban size={14} /> Revoke
                </button>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* 3. Audit Logs Section */}
        <section>
          <h3 className="font-bold text-lg text-gray-800 mb-4">Audit Trail (Immutable)</h3>
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
                      <td className="p-4 text-sm text-gray-600">{log.action}</td>
                      <td className="p-4 text-sm text-gray-500 flex items-center gap-2">
                        <Clock size={14} /> {log.time}
                      </td>
                      <td className="p-4">
                        <span className={`text-xs font-bold px-2 py-1 rounded-md ${log.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 4. My Data Offerings Section */}
        <section id="data-offerings">
          <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
            <Database size={20} /> My Data Offerings
          </h3>

          {/* Form to Add New Data Offering */}
          <GlassCard className="mb-6 p-6">
            <h4 className="font-bold text-gray-900 mb-4">Create New Data Offering</h4>
            <form onSubmit={handleCreateOffering} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <InputGroup
                label="Data Name"
                placeholder="e.g., Health Records"
                value={newOffering.name}
                onChange={(e) => setNewOffering({ ...newOffering, name: e.target.value })}
                required
              />
              <InputGroup
                label="Description"
                placeholder="Briefly describe the data"
                value={newOffering.description}
                onChange={(e) => setNewOffering({ ...newOffering, description: e.target.value })}
                required
              />
              <InputGroup
                label="Category"
                placeholder="e.g., Financial, Health, Personal"
                value={newOffering.category}
                onChange={(e) => setNewOffering({ ...newOffering, category: e.target.value })}
                required
              />
              <Select
                label="Sensitivity"
                value={newOffering.sensitivity}
                onChange={(e) => setNewOffering({ ...newOffering, sensitivity: e.target.value })}
                options={[
                  { value: 'LOW', label: 'Low' },
                  { value: 'MEDIUM', label: 'Medium' },
                  { value: 'HIGH', label: 'High' },
                ]}
              />
              {/* New Data Payload Input */}
              <div className="md:col-span-3">
                <label htmlFor="dataPayload" className="block text-sm font-medium text-gray-700">Initial Data Payload (JSON)</label>
                <textarea
                  id="dataPayload"
                  className="mt-1 block w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-sm font-mono h-32 resize-y"
                  value={newOffering.dataPayload}
                  onChange={(e) => setNewOffering({ ...newOffering, dataPayload: e.target.value })}
                  placeholder="Enter JSON data here..."
                ></textarea>
              </div>
              <Button type="submit" className="md:col-span-1">Add Offering</Button>
            </form>
          </GlassCard>

          {/* List of Data Offerings */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[700px]">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Name</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Description</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Category</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Sensitivity</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Created At</th>
                    <th className="p-4 text-xs font-bold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dataOfferings.length > 0 ? (
                    dataOfferings.map(offering => (
                      <tr key={offering.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                        {editingOffering && editingOffering.id === offering.id ? (
                          <>
                            <td className="p-4">
                              <InputGroup
                                value={editingOffering.name}
                                onChange={(e) => setEditingOffering({ ...editingOffering, name: e.target.value })}
                              />
                            </td>
                            <td className="p-4">
                              <InputGroup
                                value={editingOffering.description}
                                onChange={(e) => setEditingOffering({ ...editingOffering, description: e.target.value })}
                              />
                            </td>
                            <td className="p-4">
                              <InputGroup
                                value={editingOffering.category}
                                onChange={(e) => setEditingOffering({ ...editingOffering, category: e.target.value })}
                              />
                            </td>
                            <td className="p-4">
                              <Select
                                value={editingOffering.sensitivity}
                                onChange={(e) => setEditingOffering({ ...editingOffering, sensitivity: e.target.value })}
                                options={[
                                  { value: 'LOW', label: 'Low' },
                                  { value: 'MEDIUM', label: 'Medium' },
                                  { value: 'HIGH', label: 'High' },
                                ]}
                              />
                            </td>
                            <td className="p-4 text-sm text-gray-500">{new Date(offering.created_at).toLocaleDateString()}</td>
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
                            <td className="p-4">
                              <Badge
                                status={offering.sensitivity === 'HIGH' ? 'danger' : offering.sensitivity === 'MEDIUM' ? 'warning' : 'success'}
                                text={offering.sensitivity}
                              />
                            </td>
                            <td className="p-4 text-sm text-gray-500">{new Date(offering.created_at).toLocaleDateString()}</td>
                            <td className="p-4 flex gap-2">
                              <Button size="sm" variant="secondary" onClick={() => setEditingOffering(offering)}>Edit</Button>
                              <Button size="sm" variant="danger" onClick={() => handleDeleteOffering(offering.id)}>Delete</Button>
                              <Button size="sm" onClick={() => handleManageData(offering)}>Manage Data</Button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-gray-500">No data offerings created yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

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
                    className="w-full p-4 border border-gray-300 rounded-xl font-mono text-sm h-60 resize-y focus:border-brand-500 outline-none"
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
      </div>
    </DashboardLayout>
  );
};

export default OwnerDashboard;