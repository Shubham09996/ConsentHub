import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { consumerAPI } from '../../services/api';
import { Globe, Database, Settings, Mail, Layers } from 'lucide-react';
import { Button, InputGroup, Select } from '../../components/ui/PremiumComponents';
import { motion, AnimatePresence } from 'framer-motion';

const AllOwners = () => {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [ownerDataOfferings, setOwnerDataOfferings] = useState([]);
  const [selectedDataOfferingId, setSelectedDataOfferingId] = useState('');
  const [requestPurpose, setRequestPurpose] = useState('');
  const [requestError, setRequestError] = useState('');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  const menuItems = [
    { label: 'My Access Hub', icon: Database, path: '/consumer/dashboard' },
    { label: 'Global Search', icon: Globe, path: '/consumer/owners' },
    { label: 'Profile Settings', icon: Settings, path: '/profile' },
  ];

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const res = await consumerAPI.getAllOwners();
        setOwners(res.data);
      } catch (err) {
        console.error('Error fetching owners:', err);
        setError('Failed to fetch owners.');
      } finally {
        setLoading(false);
      }
    };
    fetchOwners();
  }, []);

  const handleViewOfferings = async (owner) => {
    setSelectedOwner(owner);
    setIsRequestModalOpen(true);
    try {
      const res = await consumerAPI.getDataOfferingsByOwner(owner.id);
      setOwnerDataOfferings(res.data);
      setSelectedDataOfferingId(''); // Reset selected offering
    } catch (err) {
      console.error('Error fetching data offerings:', err);
      setRequestError('Failed to fetch data offerings for this owner.');
    }
  };

  const handleRequestAccess = async () => {
    setRequestError('');
    if (!requestPurpose || !selectedDataOfferingId || !selectedOwner) {
      setRequestError('Please fill all required fields.');
      return;
    }
    try {
      await consumerAPI.requestAccess(selectedOwner.id, requestPurpose, selectedDataOfferingId);
      alert('Access request sent successfully!');
      setIsRequestModalOpen(false);
      setRequestPurpose('');
      setSelectedDataOfferingId('');
      setSelectedOwner(null);
    } catch (err) {
      console.error('Error requesting access:', err);
      setRequestError(err.response?.data?.message || 'Failed to send request.');
    }
  };

  return (
    <DashboardLayout
      title="Global Search"
      subtitle="Discover and request data from owners."
      role="Data Consumer"
      menuItems={menuItems}
    >
      <div className="space-y-8 max-w-7xl mx-auto pb-10">
        <h2 className="text-2xl font-bold text-gray-900">All Data Owners</h2>

        {loading && <p className="text-gray-500">Loading owners...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {owners.map(owner => (
            <motion.div
              key={owner.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-start space-y-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                  {owner.first_name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 leading-tight">{owner.first_name} {owner.last_name}</h3>
                </div>
              </div>
              <p className="text-gray-600 text-sm flex items-center gap-2"><Mail size={16} /> {owner.email}</p>
              <Button onClick={() => handleViewOfferings(owner)} className="w-full bg-brand-600 hover:bg-brand-700 text-white">
                View Data Offerings
              </Button>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {isRequestModalOpen && selectedOwner && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md"
            onClick={() => setIsRequestModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[2rem] overflow-hidden shadow-2xl border border-gray-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-brand-600 to-indigo-600 p-6 flex justify-between items-center">
                <h3 className="font-bold text-white text-lg">Request Access from {selectedOwner.first_name} {selectedOwner.last_name}</h3>
                <button onClick={() => setIsRequestModalOpen(false)} className="bg-white/10 hover:bg-white/20 p-2 rounded-full text-white transition-colors">
                  <Layers size={20} />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <h4 className="text-md font-semibold text-gray-800">Available Data Offerings:</h4>
                {ownerDataOfferings.length > 0 ? (
                  <Select
                    label="Select Data Offering"
                    value={selectedDataOfferingId}
                    onChange={(e) => setSelectedDataOfferingId(e.target.value)}
                    options={[
                      { value: '', label: '-- Select an offering --' },
                      ...ownerDataOfferings.map(offering => ({ value: offering.id, label: offering.name }))
                    ]}
                    required
                  />
                ) : (
                  <p className="text-gray-500">No data offerings found for this owner.</p>
                )}

                <InputGroup 
                  label="Purpose of Access"
                  placeholder="e.g. Loan Verification, Research Study"
                  icon={Mail}
                  value={requestPurpose}
                  onChange={(e) => setRequestPurpose(e.target.value)}
                  required
                />

                {requestError && <p className="text-red-500 text-sm mt-2 text-center">{requestError}</p>}

                <Button 
                  onClick={handleRequestAccess}
                  className="w-full"
                  disabled={!selectedDataOfferingId || !requestPurpose}
                >
                  Send Access Request
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default AllOwners;
