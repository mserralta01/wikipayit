import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BankDetailsForm } from "./BankDetailsForm";
import { merchantService } from "@/services/merchantService";
import type { BankDetailsFormData, BankDetailsStorageData } from "@/types/forms";
import { useToast } from "@/components/ui/use-toast";
import { LeadStatus } from '@/types/merchant';

interface ApplicationFormState {
  businessInfo?: any;
  processingHistory?: any;
  beneficialOwners?: any;
  bankDetails?: BankDetailsStorageData;
}

export function MerchantApplicationForm() {
  const [currentStep, setCurrentStep] = useState(3);
  const [formData, setFormData] = useState<ApplicationFormState>({});
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleBankDetailsSubmit = async (data: BankDetailsFormData) => {
    try {
      const { confirmAccountNumber, ...bankDetailsStorage } = data;
      
      const updatedFormData = {
        ...formData,
        bankDetails: bankDetailsStorage,
      };
      setFormData(updatedFormData);

      const leadId = localStorage.getItem('currentLeadId');
      if (!leadId) {
        throw new Error('No lead ID found');
      }

      await merchantService.updateLead(leadId, {
        bankDetails: bankDetailsStorage,
        currentStep: currentStep + 1,
        status: 'completed' as LeadStatus,
        updatedAt: new Date().toISOString()
      });

      toast({
        title: "Success",
        description: "Bank details saved successfully",
      });

      navigate('/apply/complete');
    } catch (error) {
      console.error('Error submitting bank details:', error);
      toast({
        title: "Error",
        description: "Failed to save bank details. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 3:
        return (
          <BankDetailsForm
            onSubmit={handleBankDetailsSubmit}
            onBack={() => setCurrentStep(prev => prev - 1)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Merchant Application</h1>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: `${(currentStep + 1) * 25}%` }}
          ></div>
        </div>
      </div>
      {renderCurrentStep()}
    </div>
  );
} 