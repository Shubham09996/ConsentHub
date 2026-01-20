// ... imports same as before
import React, { useState } from 'react';
import { FileText, Bell, Activity, Clock, Check, X, Ban } from 'lucide-react'; // Removed User icon
import DashboardLayout from '../../components/layout/DashboardLayout';
import { GlassCard, Button, Badge } from '../../components/ui/PremiumComponents';
import { motion, AnimatePresence } from 'framer-motion';

const OwnerDashboard = () => {
  // ... state logic same as before (requests, connections, logs)
  const [requests, setRequests] = useState([
    { id: 1, org: 'HealthInsure Ltd', purpose: 'Medical Risk Assessment', time: '2 mins ago' },
    { id: 2, org: 'CreditSafe Corp', purpose: 'Loan Eligibility Check', time: '1 hour ago' },
  ]);

  const [activeConnections, setActiveConnections] = useState([
    { id: 101, org: 'TravelBookings Inc', purpose: 'Identity Verification', since: 'Oct 24, 2025' },
    { id: 102, org: 'EduTech Pro', purpose: 'Academic Records', since: 'Nov 01, 2025' },
  ]);

  const [logs] = useState([
    { id: 1, org: 'HealthInsure Ltd', action: 'Accessed Data', time: '10:30 AM', status: 'Success' },
    { id: 2, org: 'Unknown IP', action: 'Failed Attempt', time: '09:15 AM', status: 'Blocked' },
  ]);

  const handleApprove = (id) => setRequests(requests.filter(r => r.id !== id));
  const handleDeny = (id) => setRequests(requests.filter(r => r.id !== id));
  const handleRevoke = (id) => {
    if(window.confirm("Are you sure? This will immediately stop data access.")){
      setActiveConnections(activeConnections.filter(c => c.id !== id));
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
        { label: 'Audit Trail', icon: Activity },
        // Profile removed from here
      ]}
    >
      {/* ... Content same as before (Pending, Active, Logs sections) ... */}
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
                        {req.org.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{req.org}</h4>
                        <p className="text-sm text-gray-500">{req.purpose}</p>
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
                        <span className={`text-xs font-bold px-2 py-1 rounded-md ${log.status === 'Success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
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
      </div>
    </DashboardLayout>
  );
};

export default OwnerDashboard;