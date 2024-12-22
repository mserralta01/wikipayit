import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { merchantService } from '../../services/merchantService';
import { PipelineItem, isPipelineMerchant, PIPELINE_STATUSES } from '../../types/pipeline';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const LeadDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const { data: item } = useQuery({
    queryKey: ['pipeline-item', id],
    queryFn: async () => {
      if (!id) return null;
      const merchant = await merchantService.getMerchant(id);
      return merchant as PipelineItem;
    },
    enabled: !!id
  });

  const handleSave = async (field: string, value: any) => {
    if (!item || !id) return;

    try {
      if (isPipelineMerchant(item)) {
        await merchantService.updateMerchant(id, {
          [field.startsWith("companyAddress.")
            ? `formData.companyAddress.${field.split(".")[1]}`
            : `formData.${field}`
          ]: value
        });
      } else {
        await merchantService.updateLead(id, {
          [field.startsWith("companyAddress.")
            ? `formData.companyAddress.${field.split(".")[1]}`
            : `formData.${field}`
          ]: value
        });
      }
      // Invalidate the query to refresh the data
      await queryClient.invalidateQueries({ queryKey: ['pipeline-item', id] });
    } catch (error) {
      console.error('Error updating field:', error);
    }
  };

  if (!item) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Lead Details</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Status and Stage</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700">Current Status</label>
            <select
              value={item.pipelineStatus}
              onChange={(e) => handleSave('pipelineStatus', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              {PIPELINE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status === 'lead' ? 'Leads' :
                   status === 'phone' ? 'Phone Calls' :
                   status === 'offer' ? 'Offer Sent' :
                   status === 'underwriting' ? 'Underwriting' :
                   status === 'documents' ? 'Documents' :
                   status === 'approved' ? 'Approved' :
                   status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Business Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Business Name</label>
                <div className="mt-1 flex items-center">
                  {editingField === 'businessName' ? (
                    <>
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                      <button
                        onClick={async () => {
                          await handleSave(isPipelineMerchant(item) ? 'businessName' : 'companyName', editValue);
                          setEditingField(null);
                        }}
                        className="ml-2 p-1 text-green-600 hover:text-green-700"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => setEditingField(null)}
                        className="ml-1 p-1 text-red-600 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </>
                  ) : (
                    <>
                      <input
                        type="text"
                        value={isPipelineMerchant(item) ? item.businessName : item.companyName}
                        readOnly
                        className="block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                      <button
                        onClick={() => {
                          setEditValue(isPipelineMerchant(item) ? item.businessName || '' : item.companyName || '');
                          setEditingField('businessName');
                        }}
                        className="ml-2 p-1 text-gray-400 hover:text-gray-500"
                      >
                        ✎
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <div className="mt-1 flex items-center">
                  {editingField === 'email' ? (
                    <>
                      <input
                        type="email"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                      <button
                        onClick={async () => {
                          await handleSave('email', editValue);
                          setEditingField(null);
                        }}
                        className="ml-2 p-1 text-green-600 hover:text-green-700"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => setEditingField(null)}
                        className="ml-1 p-1 text-red-600 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </>
                  ) : (
                    <>
                      <input
                        type="email"
                        value={item.email}
                        readOnly
                        className="block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                      <button
                        onClick={() => {
                          setEditValue(item.email);
                          setEditingField('email');
                        }}
                        className="ml-2 p-1 text-gray-400 hover:text-gray-500"
                      >
                        ✎
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <div className="mt-1 flex items-center">
                  {editingField === 'phone' ? (
                    <>
                      <input
                        type="tel"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                      <button
                        onClick={async () => {
                          await handleSave('phone', editValue);
                          setEditingField(null);
                        }}
                        className="ml-2 p-1 text-green-600 hover:text-green-700"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => setEditingField(null)}
                        className="ml-1 p-1 text-red-600 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </>
                  ) : (
                    <>
                      <input
                        type="tel"
                        value={item.phone || ''}
                        readOnly
                        className="block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                      <button
                        onClick={() => {
                          setEditValue(item.phone || '');
                          setEditingField('phone');
                        }}
                        className="ml-2 p-1 text-gray-400 hover:text-gray-500"
                      >
                        ✎
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailView;
