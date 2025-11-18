'use client';

import { useState, useEffect } from 'react';
import {
  fetchExporterRequirements,
  findBatchMatches,
  fetchExporterDeals,
  createDeal,
  generateDealDocuments,
  type ExporterRequirement,
  type BatchMatch,
  type Deal,
} from '@/lib/api';

export default function ExporterDashboard() {
  const [activeTab, setActiveTab] = useState<'requirements' | 'matches' | 'deals'>('requirements');
  const [requirements, setRequirements] = useState<ExporterRequirement[]>([]);
  const [matches, setMatches] = useState<BatchMatch[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selectedRequirement, setSelectedRequirement] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRequirements();
    loadDeals();
  }, []);

  const loadRequirements = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchExporterRequirements();
      setRequirements(data);
    } catch (err) {
      console.error('Error fetching requirements:', err);
      setError('Failed to load requirements');
    } finally {
      setLoading(false);
    }
  };

  const loadDeals = async () => {
    try {
      const data = await fetchExporterDeals();
      setDeals(data);
    } catch (err) {
      console.error('Error fetching deals:', err);
    }
  };

  const handleFindMatches = async (requirementId: number) => {
    try {
      setLoading(true);
      setError(null);
      setSelectedRequirement(requirementId);
      const data = await findBatchMatches(requirementId);
      setMatches(data);
      setActiveTab('matches');
    } catch (err) {
      console.error('Error finding matches:', err);
      setError('Failed to find matching batches');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDeal = async (match: BatchMatch) => {
    try {
      setLoading(true);
      setError(null);
      const totalPrice = match.batch.price_per_unit * match.requirement.min_volume;
      
      await createDeal({
        buyer_requirement: match.requirement.id,
        product_batch: match.batch.id,
        quantity: match.requirement.min_volume,
        total_price: totalPrice,
        notes: `Auto-matched with ${match.match_score}% compatibility`
      });
      
      alert('Deal created successfully!');
      await loadDeals();
      setActiveTab('deals');
    } catch (err) {
      console.error('Error creating deal:', err);
      setError('Failed to create deal');
      alert('Failed to create deal');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDocuments = async (dealId: number) => {
    try {
      setLoading(true);
      setError(null);
      const documents = await generateDealDocuments(dealId);
      
      // Show document preview
      alert('Documents generated:\n' + JSON.stringify(documents, null, 2));
      await loadDeals();
    } catch (err) {
      console.error('Error generating documents:', err);
      setError('Failed to generate documents');
      alert('Failed to generate documents');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['requirements', 'matches', 'deals'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Requirements Tab */}
      {activeTab === 'requirements' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Buyer Requirements</h2>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {requirements.map((req) => (
                  <div key={req.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-lg">{req.commodity}</h3>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                        {req.status}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><strong>Buyer:</strong> {req.buyer.username}</p>
                      <p><strong>Volume:</strong> {req.min_volume} - {req.max_volume} kg</p>
                      <p><strong>Destination:</strong> {req.destination_country || 'N/A'}</p>
                      {req.allowed_contaminants && Object.keys(req.allowed_contaminants).length > 0 && (
                        <div>
                          <strong>Contaminant Limits:</strong>
                          <ul className="ml-4 mt-1">
                            {Object.entries(req.allowed_contaminants).map(([key, value]) => (
                              <li key={key}>{key}: ≤ {value}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleFindMatches(req.id)}
                      className="mt-4 w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 transition-colors"
                      disabled={loading}
                    >
                      Find Matching Batches
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Matches Tab */}
      {activeTab === 'matches' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Compatible Batches</h2>
            {matches.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No matches found. Select a requirement to find compatible batches.
              </div>
            ) : (
              <div className="space-y-4">
                {matches.map((match) => (
                  <div key={match.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-semibold text-lg">{match.batch.product_name}</h3>
                          <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                            {match.match_score}% Match
                          </span>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600"><strong>Batch:</strong> {match.batch.batch_number}</p>
                            <p className="text-gray-600"><strong>Available:</strong> {match.batch.quantity} kg</p>
                            <p className="text-gray-600"><strong>Price:</strong> ${match.batch.price_per_unit}/kg</p>
                          </div>
                          <div>
                            <p className="text-gray-600"><strong>QC Status:</strong> {match.batch.qc_status}</p>
                            <div className="mt-2">
                              {Object.entries(match.match_details).map(([key, value]) => (
                                <div key={key} className="flex items-center gap-2">
                                  <span className={`w-2 h-2 rounded-full ${value ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                  <span className="text-xs capitalize">{key.replace(/_/g, ' ')}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleCreateDeal(match)}
                        className="ml-4 bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition-colors disabled:bg-gray-300"
                        disabled={loading || !match.is_compatible}
                      >
                        Create Deal
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Deals Tab */}
      {activeTab === 'deals' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4">My Deals</h2>
            {deals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No deals yet. Create your first deal from matched batches.
              </div>
            ) : (
              <div className="space-y-4">
                {deals.map((deal) => (
                  <div key={deal.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-semibold text-lg">Deal #{deal.id}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            deal.status === 'completed' ? 'bg-green-100 text-green-800' :
                            deal.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {deal.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <p><strong>Product:</strong> {deal.product_batch.product_name}</p>
                            <p><strong>Batch:</strong> {deal.product_batch.batch_number}</p>
                            <p><strong>Buyer:</strong> {deal.buyer_requirement.buyer.username}</p>
                          </div>
                          <div>
                            <p><strong>Quantity:</strong> {deal.quantity} kg</p>
                            <p><strong>Total Price:</strong> ${deal.total_price}</p>
                            <p><strong>Created:</strong> {new Date(deal.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                      {deal.status === 'buyer_approved' && (
                        <button
                          onClick={() => handleGenerateDocuments(deal.id)}
                          className="ml-4 bg-purple-500 text-white px-6 py-2 rounded hover:bg-purple-600 transition-colors"
                          disabled={loading}
                        >
                          Generate Documents
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}