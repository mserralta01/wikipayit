import React, { useState, ChangeEvent, useEffect } from "react"
import { CommunicationsSection } from "./CommunicationsSection"
import { PricingSection } from "./PricingSection"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  MerchantDTO, 
  MerchantStatus, 
  timestampToString, 
  ProcessingHistory, 
  FormData,
  BeneficialOwner,
  BankDetails
} from "@/types/merchant"
import { doc, updateDoc, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Pencil, X, Check, Building, Phone, MapPin, Globe, Calendar, FileText, Building2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { PipelineStatus } from "@/types/pipeline"

interface LeadDetailsProps {
  merchant: MerchantDTO;
}

const formatPhoneNumber = (value: string): string => {
  // Remove all non-digits
  const numbers = value.replace(/\D/g, '');
  
  // Format the number
  if (numbers.length <= 3) {
    return `(${numbers}`;
  }
  if (numbers.length <= 6) {
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
  }
  return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
};

const formatWebsite = (value: string): string => {
  if (!value) return value;
  if (!/^https?:\/\//i.test(value)) {
    return `https://${value}`;
  }
  return value;
};

export function LeadDetails({ merchant: initialMerchant }: LeadDetailsProps) {
  console.log('LeadDetails rendered with:', {
    initialMerchant,
    bankDetails: initialMerchant.formData?.bankDetails
  });

  const { toast } = useToast()
  const [merchant, setMerchant] = useState(initialMerchant)
  const [editMode, setEditMode] = useState<{ [key: string]: boolean }>({})

  // Add console log to see initial merchant data
  console.log('Initial merchant data:', initialMerchant)
  console.log('Processing History:', initialMerchant.formData?.processingHistory)

  const [formData, setFormData] = useState<FormData>(() => ({
    businessName: initialMerchant.formData?.businessName || '',
    dba: initialMerchant.formData?.dba || '',
    phone: initialMerchant.formData?.phone || '',
    businessType: initialMerchant.formData?.businessType || '',
    taxId: initialMerchant.formData?.taxId || '',
    businessDescription: initialMerchant.formData?.businessDescription || '',
    yearEstablished: initialMerchant.formData?.yearEstablished || '',
    website: initialMerchant.formData?.website || '',
    customerServiceEmail: initialMerchant.formData?.customerServiceEmail || '',
    customerServicePhone: initialMerchant.formData?.customerServicePhone || '',
    companyAddress: {
      street: initialMerchant.formData?.companyAddress?.street || '',
      city: initialMerchant.formData?.companyAddress?.city || '',
      state: initialMerchant.formData?.companyAddress?.state || '',
      zipCode: initialMerchant.formData?.companyAddress?.zipCode || '',
    },
    bankDetails: {
      bankName: initialMerchant.formData?.bankDetails?.bankName || '',
      routingNumber: initialMerchant.formData?.bankDetails?.routingNumber || '',
      accountNumber: initialMerchant.formData?.bankDetails?.accountNumber || '',
      confirmAccountNumber: initialMerchant.formData?.bankDetails?.confirmAccountNumber || ''
    },
    processingHistory: {
      averageTicket: initialMerchant.formData?.processingHistory?.averageTicket || 0,
      cardPresentPercentage: initialMerchant.formData?.processingHistory?.cardPresentPercentage || 0,
      currentProcessor: initialMerchant.formData?.processingHistory?.currentProcessor || '',
      ecommercePercentage: initialMerchant.formData?.processingHistory?.ecommercePercentage || 0,
      hasBeenTerminated: initialMerchant.formData?.processingHistory?.hasBeenTerminated || 'no',
      highTicket: initialMerchant.formData?.processingHistory?.highTicket || 0,
      isCurrentlyProcessing: initialMerchant.formData?.processingHistory?.isCurrentlyProcessing || 'no',
      monthlyVolume: initialMerchant.formData?.processingHistory?.monthlyVolume || 0,
      terminationExplanation: initialMerchant.formData?.processingHistory?.terminationExplanation || ''
    },
    beneficialOwners: {
      owners: initialMerchant.formData?.beneficialOwners?.owners || []
    }
  }));

  // Update merchant state when initialMerchant changes
  useEffect(() => {
    console.log('useEffect - merchant update:', {
      initialMerchant,
      bankDetails: initialMerchant.formData?.bankDetails
    });
    
    setMerchant(initialMerchant);
    setFormData(prev => {
      const updatedFormData: FormData = {
        ...prev,
        bankDetails: {
          bankName: initialMerchant.formData?.bankName || '',
          routingNumber: initialMerchant.formData?.routingNumber || '',
          accountNumber: initialMerchant.formData?.accountNumber || '',
          confirmAccountNumber: initialMerchant.formData?.accountNumber || ''
        },
        processingHistory: {
          ...prev.processingHistory,
          averageTicket: initialMerchant.formData?.processingHistory?.averageTicket || 0,
          cardPresentPercentage: initialMerchant.formData?.processingHistory?.cardPresentPercentage || 0,
          currentProcessor: initialMerchant.formData?.processingHistory?.currentProcessor || '',
          ecommercePercentage: initialMerchant.formData?.processingHistory?.ecommercePercentage || 0,
          hasBeenTerminated: initialMerchant.formData?.processingHistory?.hasBeenTerminated || 'no',
          highTicket: initialMerchant.formData?.processingHistory?.highTicket || 0,
          isCurrentlyProcessing: initialMerchant.formData?.processingHistory?.isCurrentlyProcessing || 'no',
          monthlyVolume: initialMerchant.formData?.processingHistory?.monthlyVolume || 0,
          terminationExplanation: initialMerchant.formData?.processingHistory?.terminationExplanation || ''
        },
        beneficialOwners: {
          owners: initialMerchant.formData?.beneficialOwners?.owners || []
        },
        businessName: initialMerchant.formData?.businessName || '',
        dba: initialMerchant.formData?.dba || '',
        phone: initialMerchant.formData?.phone || '',
        businessType: initialMerchant.formData?.businessType || '',
        taxId: initialMerchant.formData?.taxId || '',
        businessDescription: initialMerchant.formData?.businessDescription || '',
        yearEstablished: initialMerchant.formData?.yearEstablished || '',
        website: initialMerchant.formData?.website || '',
        customerServiceEmail: initialMerchant.formData?.customerServiceEmail || '',
        customerServicePhone: initialMerchant.formData?.customerServicePhone || '',
        companyAddress: {
          street: initialMerchant.formData?.companyAddress?.street || '',
          city: initialMerchant.formData?.companyAddress?.city || '',
          state: initialMerchant.formData?.companyAddress?.state || '',
          zipCode: initialMerchant.formData?.companyAddress?.zipCode || ''
        }
      };
      console.log('Updated form data:', {
        bankDetails: updatedFormData.bankDetails
      });
      return updatedFormData;
    });
  }, [initialMerchant]);

  useEffect(() => {
    console.log('Initial merchant bank details:', initialMerchant.formData?.bankDetails);
    console.log('Form data bank details:', formData.bankDetails);
  }, [initialMerchant, formData]);

  const toggleEdit = (field: string): void => {
    setEditMode(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      if (field.startsWith('bankDetails.')) {
        const bankField = field.split('.')[1] as keyof BankDetails;
        return {
          ...prev,
          bankDetails: {
            ...prev.bankDetails,
            [bankField]: value
          }
        };
      } else if (field === 'phone') {
        // Format phone number as user types
        const formattedPhone = formatPhoneNumber(value);
        return {
          ...prev,
          phone: formattedPhone
        };
      } else if (field === 'website') {
        // Format website URL
        const formattedWebsite = formatWebsite(value);
        return {
          ...prev,
          website: formattedWebsite
        };
      } else if (field.startsWith('companyAddress.')) {
        const addressField = field.split('.')[1] as keyof typeof prev.companyAddress;
        return {
          ...prev,
          companyAddress: {
            ...prev.companyAddress,
            [addressField]: value
          }
        };
      } else if (field.startsWith('processingHistory.')) {
        const historyField = field.split('.')[1] as keyof ProcessingHistory;
        return {
          ...prev,
          processingHistory: {
            ...prev.processingHistory,
            [historyField]: value
          }
        };
      } else {
        // Handle all other fields
        return {
          ...prev,
          [field]: value
        } as FormData;
      }
    });
  };

  const handleSave = async (field: string) => {
    try {
      let updateData: Record<string, any> = {};
      
      if (field.startsWith('bankDetails.')) {
        const bankField = field.split('.')[1] as keyof BankDetails;
        updateData = {
          [`formData.${bankField}`]: formData.bankDetails?.[bankField]
        };
      } else {
        updateData = {
          [`formData.${field}`]: formData[field as keyof FormData]
        };
      }
      
      const collectionPath = 'leads';
      await updateDoc(doc(db, collectionPath, merchant.id), updateData);
      
      toast({
        title: "Success",
        description: "Field updated successfully.",
      });
      
      setEditMode(prev => ({ ...prev, [field]: false }));
    } catch (error) {
      console.error("Error updating field:", error);
      toast({
        title: "Error",
        description: "Failed to update field. Please try again.",
        variant: "destructive",
      });
    }
  };

  const calculateProgress = (status: MerchantStatus): number => {
    const stages = ['lead', 'phone', 'offer', 'underwriting', 'documents', 'approved']
    const currentIndex = stages.indexOf(status)
    return ((currentIndex + 1) / stages.length) * 100
  }

  const getStatusColor = (status: MerchantStatus): string => {
    const colors: Record<MerchantStatus, string> = {
      lead: 'bg-blue-500',
      phone: 'bg-yellow-500',
      offer: 'bg-purple-500',
      underwriting: 'bg-orange-500',
      documents: 'bg-indigo-500',
      approved: 'bg-green-500',
      started: 'bg-gray-400',
      in_progress: 'bg-gray-500',
      completed: 'bg-gray-600'
    }
    return colors[status] || 'bg-gray-500'
  }

  const handleStatusChange = async (status: MerchantStatus): Promise<void> => {
    try {
      const collectionPath = 'leads'
      await updateDoc(doc(db, collectionPath, merchant.id), {
        pipelineStatus: status,
        updatedAt: Timestamp.fromDate(new Date())
      })
      toast({
        title: "Success",
        description: "Status updated successfully.",
      })
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleBeneficialOwnerChange = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      beneficialOwners: {
        owners: prev.beneficialOwners.owners.map((owner, i) => 
          i === index ? { ...owner, [field]: value } : owner
        )
      }
    }))
  }

  const handleBlur = async (field: string) => {
    if (editMode[field]) {
      if (field.startsWith('bankDetails.')) {
        await handleSave(field);
      } else if (field === 'bankName' || field === 'routingNumber' || field === 'accountNumber') {
        await handleSave(`bankDetails.${field}`);
      } else {
        await handleSave(field);
      }
    }
  };

  const handleFieldClick = (field: string) => {
    if (!editMode[field]) {
      if (field.startsWith('bankDetails.') || field === 'bankName' || field === 'routingNumber' || field === 'accountNumber') {
        setEditMode(prev => ({ 
          ...prev, 
          [field]: true,
          [`bankDetails.${field}`]: true 
        }));
      } else {
        setEditMode(prev => ({ ...prev, [field]: true }));
      }
    }
  };

  // Calculate progress based on current status
  const statusProgress: Record<PipelineStatus, number> = {
    lead: 17,
    phone: 33,
    offer: 50,
    underwriting: 67,
    documents: 83,
    approved: 100,
  };

  const progress = merchant.pipelineStatus && 
    Object.keys(statusProgress).includes(merchant.pipelineStatus) ? 
    statusProgress[merchant.pipelineStatus as PipelineStatus] : 0;

  useEffect(() => {
    console.log('Component mounted with data:', {
      initialMerchant: initialMerchant,
      merchantState: merchant,
      formData: formData,
      bankDetails: {
        initial: initialMerchant.formData?.bankDetails,
        current: merchant.formData?.bankDetails,
        form: formData.bankDetails
      }
    });
  }, []);

  // Add a debug render to see what's being displayed
  console.log('Render values:', {
    merchantBankDetails: merchant.formData?.bankDetails,
    formDataBankDetails: formData.bankDetails,
    editMode
  });

  const formatCurrency = (value: number): string => {
    return value.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });
  };

  return (
    <div className="flex gap-6">
      <div className="flex flex-col w-[25%] min-w-[400px]">
        <Card className="mb-4 w-full">
          <CardHeader className="space-y-4 pb-4">
            <div className="flex flex-row items-center justify-between">
              <Badge
                className={cn(
                  getStatusColor(merchant.pipelineStatus || 'lead'),
                  "text-white text-xl py-2 px-4"
                )}
              >
                {merchant.formData?.businessName || merchant.businessName}
              </Badge>
            </div>
            <div className="w-full space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Progress</span>
                <span>
                  {Math.round(calculateProgress(merchant.pipelineStatus || 'lead'))}%
                </span>
              </div>
              <div className="w-full bg-white rounded-full h-2 mb-4 border border-gray-200">
                <div
                  className="h-full rounded-full bg-blue-500"
                  style={{
                    width: `${progress}%`,
                    transition: 'width 0.5s ease-in-out'
                  }}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full space-y-1">
              <AccordionItem value="business">
                <AccordionTrigger>Business</AccordionTrigger>
                <AccordionContent className="pt-0 pb-1">
                  <div className="grid gap-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <Building className="h-5 w-5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          {editMode.dba ? (
                            <Input
                              value={formData.dba}
                              onChange={(e) => handleInputChange('dba', e.target.value)}
                              onBlur={() => handleBlur('dba')}
                              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleBlur('dba');
                                }
                              }}
                              className="h-7 min-w-0 py-0.5 px-1.5"
                              autoFocus
                            />
                          ) : (
                            <div 
                              className="text-sm text-gray-700 py-0.5 px-1.5 hover:bg-gray-100 rounded cursor-pointer truncate"
                              onClick={() => handleFieldClick('dba')}
                            >
                              {merchant.formData?.dba || 'Click to edit'}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="min-w-[100px] text-right">
                        {editMode.yearEstablished ? (
                          <Input
                            value={formData.yearEstablished}
                            onChange={(e) => handleInputChange('yearEstablished', e.target.value)}
                            onBlur={() => handleBlur('yearEstablished')}
                            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleBlur('yearEstablished');
                              }
                            }}
                            className="h-7 min-w-0 py-0.5 px-1.5"
                            autoFocus
                          />
                        ) : (
                          <div 
                            className="text-sm text-gray-700 py-0.5 px-1.5 hover:bg-gray-100 rounded cursor-pointer truncate"
                            onClick={() => handleFieldClick('yearEstablished')}
                          >
                            {merchant.formData?.yearEstablished || 'Year'}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-5 w-5" />
                      <div className="flex-1">
                        {editMode.phone ? (
                          <Input
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            onBlur={() => handleBlur('phone')}
                            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleBlur('phone');
                              }
                            }}
                            className="h-7 min-w-0 py-0.5 px-1.5"
                            maxLength={14}
                            placeholder="(555) 555-5555"
                            autoFocus
                          />
                        ) : (
                          <div 
                            className="text-sm text-gray-700 py-0.5 px-1.5 hover:bg-gray-100 rounded cursor-pointer"
                            onClick={() => handleFieldClick('phone')}
                          >
                            {merchant.formData?.phone}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      <div className="flex-1">
                        {editMode['companyAddress.street'] ? (
                          <Input
                            value={formData.companyAddress.street}
                            onChange={(e) => handleInputChange('companyAddress.street', e.target.value)}
                            onBlur={() => handleBlur('companyAddress.street')}
                            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleBlur('companyAddress.street');
                              }
                            }}
                            className="flex-1"
                            placeholder="Street Address"
                            autoFocus
                          />
                        ) : (
                          <div 
                            className="text-sm text-gray-700 py-0.5 px-1.5 hover:bg-gray-100 rounded cursor-pointer truncate"
                            onClick={() => handleFieldClick('companyAddress.street')}
                          >
                            {merchant.formData?.companyAddress?.street || 'Enter street address'}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 pl-7">
                      <div className="flex-1 flex gap-1 min-w-0">
                        <div className="flex-[2] min-w-0">
                          {editMode['companyAddress.city'] ? (
                            <Input
                              value={formData.companyAddress.city}
                              onChange={(e) => handleInputChange('companyAddress.city', e.target.value)}
                              onBlur={() => handleBlur('companyAddress.city')}
                              placeholder="City"
                              autoFocus
                              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleBlur('companyAddress.city');
                                }
                              }}
                            />
                          ) : (
                            <div 
                              className="text-sm text-gray-700 py-0.5 px-1.5 hover:bg-gray-100 rounded cursor-pointer truncate"
                              onClick={() => handleFieldClick('companyAddress.city')}
                            >
                              {merchant.formData?.companyAddress?.city || 'City'}
                            </div>
                          )}
                        </div>
                        
                        <div className="w-20 flex-shrink-0">
                          {editMode['companyAddress.state'] ? (
                            <Input
                              value={formData.companyAddress.state}
                              onChange={(e) => handleInputChange('companyAddress.state', e.target.value)}
                              onBlur={() => handleBlur('companyAddress.state')}
                              maxLength={2}
                              placeholder="ST"
                              className="uppercase"
                              autoFocus
                              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleBlur('companyAddress.state');
                                }
                              }}
                            />
                          ) : (
                            <div 
                              className="text-sm text-gray-700 py-0.5 px-1.5 hover:bg-gray-100 rounded cursor-pointer text-center"
                              onClick={() => handleFieldClick('companyAddress.state')}
                            >
                              {merchant.formData?.companyAddress?.state?.toUpperCase() || 'ST'}
                            </div>
                          )}
                        </div>
                        
                        <div className="w-24 flex-shrink-0">
                          {editMode['companyAddress.zipCode'] ? (
                            <Input
                              value={formData.companyAddress.zipCode}
                              onChange={(e) => handleInputChange('companyAddress.zipCode', e.target.value)}
                              onBlur={() => handleBlur('companyAddress.zipCode')}
                              pattern="\d{5}(-\d{4})?"
                              placeholder="ZIP"
                              autoFocus
                              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleBlur('companyAddress.zipCode');
                                }
                              }}
                            />
                          ) : (
                            <div 
                              className="text-sm text-gray-700 py-0.5 px-1.5 hover:bg-gray-100 rounded cursor-pointer truncate"
                              onClick={() => handleFieldClick('companyAddress.zipCode')}
                            >
                              {merchant.formData?.companyAddress?.zipCode || 'ZIP'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      <div className="flex-1">
                        {editMode.businessDescription ? (
                          <Input
                            value={formData.businessDescription}
                            onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                            onBlur={() => handleBlur('businessDescription')}
                            className="flex-1"
                            autoFocus
                            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleBlur('businessDescription');
                              }
                            }}
                          />
                        ) : (
                          <div 
                            className="text-sm text-gray-700 py-0.5 px-1.5 hover:bg-gray-100 rounded cursor-pointer truncate"
                            onClick={() => handleFieldClick('businessDescription')}
                          >
                            {merchant.formData?.businessDescription}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      <div className="flex-1">
                        {editMode.website ? (
                          <Input
                            value={formData.website}
                            onChange={(e) => handleInputChange('website', e.target.value)}
                            onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                              // Format website on blur to ensure https:// is added
                              handleInputChange('website', e.target.value);
                              handleBlur('website');
                            }}
                            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleBlur('website');
                              }
                            }}
                            className="h-7 min-w-0 py-0.5 px-1.5"
                            placeholder="https://example.com"
                            autoFocus
                          />
                        ) : (
                          <div 
                            className="text-sm text-gray-700 py-0.5 px-1.5 hover:bg-gray-100 rounded cursor-pointer truncate"
                            onClick={() => handleFieldClick('website')}
                          >
                            {merchant.formData?.website}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div>
                        <Label className="font-medium">Business Type</Label>
                        <div className="flex items-center gap-2">
                          {editMode.businessType ? (
                            <Select
                              value={formData.businessType}
                              onValueChange={(value) => {
                                handleInputChange('businessType', value);
                                handleBlur('businessType');
                              }}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="sole_proprietorship">Sole Proprietorship</SelectItem>
                                <SelectItem value="partnership">Partnership</SelectItem>
                                <SelectItem value="llc">LLC</SelectItem>
                                <SelectItem value="corporation">Corporation</SelectItem>
                                <SelectItem value="non_profit">Non-Profit</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <div 
                              className="flex items-center gap-2 text-sm text-gray-700 py-0.5 px-1.5 hover:bg-gray-100 rounded cursor-pointer truncate"
                              onClick={() => handleFieldClick('businessType')}
                            >
                              <Building2 className="h-4 w-4 text-blue-500" />
                              {merchant.formData?.businessType || 'Click to select'}
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label className="font-medium">EIN/Tax ID</Label>
                        <div className="flex items-center gap-2">
                          {editMode.taxId ? (
                            <Input
                              value={formData.taxId}
                              onChange={(e) => handleInputChange('taxId', e.target.value)}
                              onBlur={() => handleBlur('taxId')}
                              className="flex-1"
                              autoFocus
                              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleBlur('taxId');
                                }
                              }}
                            />
                          ) : (
                            <div 
                              className="flex items-center gap-2 text-sm text-gray-700 py-0.5 px-1.5 hover:bg-gray-100 rounded cursor-pointer truncate"
                              onClick={() => handleFieldClick('taxId')}
                            >
                              <FileText className="h-4 w-4 text-blue-500" />
                              {merchant.formData?.taxId || 'Click to edit'}
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label className="font-medium">Established</Label>
                        <div className="flex items-center gap-2">
                          {editMode.yearEstablished ? (
                            <Input
                              value={formData.yearEstablished}
                              onChange={(e) => handleInputChange('yearEstablished', e.target.value)}
                              onBlur={() => handleBlur('yearEstablished')}
                              className="flex-1"
                              autoFocus
                              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleBlur('yearEstablished');
                                }
                              }}
                            />
                          ) : (
                            <div 
                              className="flex items-center gap-2 text-sm text-gray-700 py-0.5 px-1.5 hover:bg-gray-100 rounded cursor-pointer truncate"
                              onClick={() => handleFieldClick('yearEstablished')}
                            >
                              <Calendar className="h-4 w-4 text-blue-500" />
                              {merchant.formData?.yearEstablished || 'Click to edit'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="processingHistory">
                <AccordionTrigger>Processing History</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-medium">Average Ticket</Label>
                      <div className="text-sm text-gray-700">
                        {formatCurrency(merchant.formData?.processingHistory?.averageTicket || 0)}
                      </div>
                    </div>
                    <div>
                      <Label className="font-medium">Card Present %</Label>
                      <div className="text-sm text-gray-700">
                        {merchant.formData?.processingHistory?.cardPresentPercentage || 0}%
                      </div>
                    </div>
                    <div>
                      <Label className="font-medium">Current Processor</Label>
                      <div className="text-sm text-gray-700">
                        {merchant.formData?.processingHistory?.currentProcessor || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <Label className="font-medium">E-commerce %</Label>
                      <div className="text-sm text-gray-700">
                        {merchant.formData?.processingHistory?.ecommercePercentage || 0}%
                      </div>
                    </div>
                    <div>
                      <Label className="font-medium">High Ticket</Label>
                      <div className="text-sm text-gray-700">
                        {formatCurrency(merchant.formData?.processingHistory?.highTicket || 0)}
                      </div>
                    </div>
                    <div>
                      <Label className="font-medium">Monthly Volume</Label>
                      <div className="text-sm text-gray-700">
                        {formatCurrency(merchant.formData?.processingHistory?.monthlyVolume || 0)}
                      </div>
                    </div>
                    <div>
                      <Label className="font-medium">Has Been Terminated</Label>
                      <div className="text-sm text-gray-700">
                        {merchant.formData?.processingHistory?.hasBeenTerminated || 'no'}
                      </div>
                    </div>
                    <div>
                      <Label className="font-medium">Termination Explanation</Label>
                      <div className="text-sm text-gray-700">
                        {merchant.formData?.processingHistory?.terminationExplanation || 'N/A'}
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="bankDetails">
                <AccordionTrigger>Bank Details</AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-2">
                    <Label className="font-medium">Bank Name</Label>
                    <div className="flex items-center gap-2">
                      {editMode['bankDetails.bankName'] ? (
                        <Input
                          value={formData.bankDetails.bankName}
                          onChange={(e) => handleInputChange('bankDetails.bankName', e.target.value)}
                          onBlur={() => handleBlur('bankDetails.bankName')}
                          className="flex-1"
                          autoFocus
                        />
                      ) : (
                        <div 
                          className="text-sm text-gray-700 py-0.5 px-1.5 hover:bg-gray-100 rounded cursor-pointer truncate"
                          onClick={() => handleFieldClick('bankDetails.bankName')}
                        >
                          {merchant.formData?.bankName || 'Click to edit'}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label className="font-medium">Routing Number</Label>
                    <div className="flex items-center gap-2">
                      {editMode['bankDetails.routingNumber'] ? (
                        <Input
                          value={formData.bankDetails.routingNumber}
                          onChange={(e) => handleInputChange('bankDetails.routingNumber', e.target.value)}
                          onBlur={() => handleBlur('bankDetails.routingNumber')}
                          className="flex-1"
                          autoFocus
                        />
                      ) : (
                        <div 
                          className="text-sm text-gray-700 py-0.5 px-1.5 hover:bg-gray-100 rounded cursor-pointer truncate"
                          onClick={() => handleFieldClick('bankDetails.routingNumber')}
                        >
                          {merchant.formData?.routingNumber || 'Click to edit'}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label className="font-medium">Account Number</Label>
                    <div className="flex items-center gap-2">
                      {editMode['bankDetails.accountNumber'] ? (
                        <Input
                          value={formData.bankDetails.accountNumber}
                          onChange={(e) => handleInputChange('bankDetails.accountNumber', e.target.value)}
                          onBlur={() => handleBlur('bankDetails.accountNumber')}
                          className="flex-1"
                          type="password"
                          autoFocus
                        />
                      ) : (
                        <div 
                          className="text-sm text-gray-700 py-0.5 px-1.5 hover:bg-gray-100 rounded cursor-pointer truncate"
                          onClick={() => handleFieldClick('bankDetails.accountNumber')}
                        >
                          {merchant.formData?.accountNumber ? '••••••••' + merchant.formData?.accountNumber.slice(-4) : 'Click to edit'}
                        </div>
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="beneficialOwners">
                <AccordionTrigger>Beneficial Owners</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    {formData.beneficialOwners?.owners?.length === 0 ? (
                      <div className="text-sm text-gray-500">No beneficial owners added</div>
                    ) : (
                      formData.beneficialOwners?.owners?.map((owner, index) => (
                        <div key={index} className="p-4 border rounded-lg space-y-2">
                          <div className="grid gap-0.5">
                            <Label className="font-medium">Owner {index + 1}</Label>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm">First Name</Label>
                                <div className="flex items-center gap-2">
                                  {editMode[`beneficialOwners.${index}.firstName`] ? (
                                    <Input
                                      value={owner.firstName}
                                      onChange={(e) => handleBeneficialOwnerChange(index, 'firstName', e.target.value)}
                                      onBlur={() => handleBlur(`beneficialOwners.${index}.firstName`)}
                                      className="flex-1"
                                      autoFocus
                                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          handleBlur(`beneficialOwners.${index}.firstName`);
                                        }
                                      }}
                                    />
                                  ) : (
                                    <div 
                                      className="text-sm text-gray-700 py-0.5 px-1.5 hover:bg-gray-100 rounded cursor-pointer truncate"
                                      onClick={() => handleFieldClick(`beneficialOwners.${index}.firstName`)}
                                    >
                                      {owner.firstName}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div>
                                <Label className="text-sm">Last Name</Label>
                                <div className="flex items-center gap-2">
                                  {editMode[`beneficialOwners.${index}.lastName`] ? (
                                    <Input
                                      value={owner.lastName}
                                      onChange={(e) => handleBeneficialOwnerChange(index, 'lastName', e.target.value)}
                                      onBlur={() => handleBlur(`beneficialOwners.${index}.lastName`)}
                                      className="flex-1"
                                      autoFocus
                                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          handleBlur(`beneficialOwners.${index}.lastName`);
                                        }
                                      }}
                                    />
                                  ) : (
                                    <div 
                                      className="text-sm text-gray-700 py-0.5 px-1.5 hover:bg-gray-100 rounded cursor-pointer truncate"
                                      onClick={() => handleFieldClick(`beneficialOwners.${index}.lastName`)}
                                    >
                                      {owner.lastName}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div>
                                <Label className="text-sm">Title</Label>
                                <div className="flex items-center gap-2">
                                  {editMode[`beneficialOwners.${index}.title`] ? (
                                    <Input
                                      value={owner.title}
                                      onChange={(e) => handleBeneficialOwnerChange(index, 'title', e.target.value)}
                                      onBlur={() => handleBlur(`beneficialOwners.${index}.title`)}
                                      className="flex-1"
                                      autoFocus
                                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          handleBlur(`beneficialOwners.${index}.title`);
                                        }
                                      }}
                                    />
                                  ) : (
                                    <div 
                                      className="text-sm text-gray-700 py-0.5 px-1.5 hover:bg-gray-100 rounded cursor-pointer truncate"
                                      onClick={() => handleFieldClick(`beneficialOwners.${index}.title`)}
                                    >
                                      {owner.title}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div>
                                <Label className="text-sm">Date of Birth</Label>
                                <div className="flex items-center gap-2">
                                  {editMode[`beneficialOwners.${index}.dateOfBirth`] ? (
                                    <Input
                                      type="date"
                                      value={owner.dateOfBirth}
                                      onChange={(e) => handleBeneficialOwnerChange(index, 'dateOfBirth', e.target.value)}
                                      onBlur={() => handleBlur(`beneficialOwners.${index}.dateOfBirth`)}
                                      className="flex-1"
                                      autoFocus
                                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          handleBlur(`beneficialOwners.${index}.dateOfBirth`);
                                        }
                                      }}
                                    />
                                  ) : (
                                    <div 
                                      className="text-sm text-gray-700 py-0.5 px-1.5 hover:bg-gray-100 rounded cursor-pointer truncate"
                                      onClick={() => handleFieldClick(`beneficialOwners.${index}.dateOfBirth`)}
                                    >
                                      {owner.dateOfBirth}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div>
                                <Label className="text-sm">SSN</Label>
                                <div className="flex items-center gap-2">
                                  {editMode[`beneficialOwners.${index}.ssn`] ? (
                                    <Input
                                      type="password"
                                      value={owner.ssn}
                                      onChange={(e) => handleBeneficialOwnerChange(index, 'ssn', e.target.value)}
                                      onBlur={() => handleBlur(`beneficialOwners.${index}.ssn`)}
                                      className="flex-1"
                                      pattern="\d{3}-\d{2}-\d{4}"
                                      placeholder="XXX-XX-XXXX"
                                      autoFocus
                                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          handleBlur(`beneficialOwners.${index}.ssn`);
                                        }
                                      }}
                                    />
                                  ) : (
                                    <div 
                                      className="text-sm text-gray-700 py-0.5 px-1.5 hover:bg-gray-100 rounded cursor-pointer truncate"
                                      onClick={() => handleFieldClick(`beneficialOwners.${index}.ssn`)}
                                    >
                                      {owner.ssn ? "XXX-XX-" + owner.ssn.slice(-4) : ""}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div>
                                <Label className="text-sm">Address</Label>
                                <div className="flex items-center gap-2">
                                  {editMode[`beneficialOwners.${index}.address`] ? (
                                    <Input
                                      value={owner.address}
                                      onChange={(e) => handleBeneficialOwnerChange(index, 'address', e.target.value)}
                                      onBlur={() => handleBlur(`beneficialOwners.${index}.address`)}
                                      className="flex-1"
                                      autoFocus
                                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          handleBlur(`beneficialOwners.${index}.address`);
                                        }
                                      }}
                                    />
                                  ) : (
                                    <div 
                                      className="text-sm text-gray-700 py-0.5 px-1.5 hover:bg-gray-100 rounded cursor-pointer truncate"
                                      onClick={() => handleFieldClick(`beneficialOwners.${index}.address`)}
                                    >
                                      {owner.address}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div>
                                <Label className="text-sm">City</Label>
                                <div className="flex items-center gap-2">
                                  {editMode[`beneficialOwners.${index}.city`] ? (
                                    <Input
                                      value={owner.city}
                                      onChange={(e) => handleBeneficialOwnerChange(index, 'city', e.target.value)}
                                      onBlur={() => handleBlur(`beneficialOwners.${index}.city`)}
                                      className="flex-1"
                                      autoFocus
                                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          handleBlur(`beneficialOwners.${index}.city`);
                                        }
                                      }}
                                    />
                                  ) : (
                                    <div 
                                      className="text-sm text-gray-700 py-0.5 px-1.5 hover:bg-gray-100 rounded cursor-pointer truncate"
                                      onClick={() => handleFieldClick(`beneficialOwners.${index}.city`)}
                                    >
                                      {owner.city}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div>
                                <Label className="text-sm">State</Label>
                                <div className="flex items-center gap-2">
                                  {editMode[`beneficialOwners.${index}.state`] ? (
                                    <Input
                                      value={owner.state}
                                      onChange={(e) => handleBeneficialOwnerChange(index, 'state', e.target.value)}
                                      onBlur={() => handleBlur(`beneficialOwners.${index}.state`)}
                                      className="flex-1"
                                      maxLength={2}
                                      placeholder="FL"
                                      autoFocus
                                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          handleBlur(`beneficialOwners.${index}.state`);
                                        }
                                      }}
                                    />
                                  ) : (
                                    <div 
                                      className="text-sm text-gray-700 py-0.5 px-1.5 hover:bg-gray-100 rounded cursor-pointer truncate"
                                      onClick={() => handleFieldClick(`beneficialOwners.${index}.state`)}
                                    >
                                      {owner.state}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div>
                                <Label className="text-sm">ZIP Code</Label>
                                <div className="flex items-center gap-2">
                                  {editMode[`beneficialOwners.${index}.zipCode`] ? (
                                    <Input
                                      value={owner.zipCode}
                                      onChange={(e) => handleBeneficialOwnerChange(index, 'zipCode', e.target.value)}
                                      onBlur={() => handleBlur(`beneficialOwners.${index}.zipCode`)}
                                      className="flex-1"
                                      pattern="\d{5}(-\d{4})?"
                                      placeholder="12345"
                                      autoFocus
                                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          handleBlur(`beneficialOwners.${index}.zipCode`);
                                        }
                                      }}
                                    />
                                  ) : (
                                    <div 
                                      className="text-sm text-gray-700 py-0.5 px-1.5 hover:bg-gray-100 rounded cursor-pointer truncate"
                                      onClick={() => handleFieldClick(`beneficialOwners.${index}.zipCode`)}
                                    >
                                      {owner.zipCode}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div>
                                <Label className="text-sm">Phone</Label>
                                <div className="flex items-center gap-2">
                                  {editMode[`beneficialOwners.${index}.phone`] ? (
                                    <Input
                                      type="tel"
                                      value={owner.phone}
                                      onChange={(e) => handleBeneficialOwnerChange(index, 'phone', e.target.value)}
                                      onBlur={() => handleBlur(`beneficialOwners.${index}.phone`)}
                                      className="flex-1"
                                      placeholder="(123) 456-7890"
                                      autoFocus
                                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          handleBlur(`beneficialOwners.${index}.phone`);
                                        }
                                      }}
                                    />
                                  ) : (
                                    <div 
                                      className="text-sm text-gray-700 py-0.5 px-1.5 hover:bg-gray-100 rounded cursor-pointer truncate"
                                      onClick={() => handleFieldClick(`beneficialOwners.${index}.phone`)}
                                    >
                                      {owner.phone}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div>
                                <Label className="text-sm">Email</Label>
                                <div className="flex items-center gap-2">
                                  {editMode[`beneficialOwners.${index}.email`] ? (
                                    <Input
                                      type="email"
                                      value={owner.email}
                                      onChange={(e) => handleBeneficialOwnerChange(index, 'email', e.target.value)}
                                      onBlur={() => handleBlur(`beneficialOwners.${index}.email`)}
                                      className="flex-1"
                                      autoFocus
                                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          handleBlur(`beneficialOwners.${index}.email`);
                                        }
                                      }}
                                    />
                                  ) : (
                                    <div 
                                      className="text-sm text-gray-700 py-0.5 px-1.5 hover:bg-gray-100 rounded cursor-pointer truncate"
                                      onClick={() => handleFieldClick(`beneficialOwners.${index}.email`)}
                                    >
                                      {owner.email}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div>
                                <Label className="text-sm">Ownership Percentage</Label>
                                <div className="flex items-center gap-2">
                                  {editMode[`beneficialOwners.${index}.ownershipPercentage`] ? (
                                    <Input
                                      type="number"
                                      min="0"
                                      max="100"
                                      value={owner.ownershipPercentage}
                                      onChange={(e) => handleBeneficialOwnerChange(index, 'ownershipPercentage', e.target.value)}
                                      onBlur={() => handleBlur(`beneficialOwners.${index}.ownershipPercentage`)}
                                      className="flex-1"
                                      autoFocus
                                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          handleBlur(`beneficialOwners.${index}.ownershipPercentage`);
                                        }
                                      }}
                                    />
                                  ) : (
                                    <div 
                                      className="text-sm text-gray-700 py-0.5 px-1.5 hover:bg-gray-100 rounded cursor-pointer truncate"
                                      onClick={() => handleFieldClick(`beneficialOwners.${index}.ownershipPercentage`)}
                                    >
                                      {owner.ownershipPercentage}%
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    <Button
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          beneficialOwners: {
                            owners: [
                              ...(prev.beneficialOwners?.owners || []),
                              {
                                firstName: '',
                                lastName: '',
                                title: '',
                                dateOfBirth: '',
                                ssn: '',
                                address: '',
                                city: '',
                                state: '',
                                zipCode: '',
                                phone: '',
                                email: '',
                                ownershipPercentage: ''
                              }
                            ]
                          }
                        }))
                      }}
                      className="w-full"
                    >
                      Add Beneficial Owner
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="customerService">
                <AccordionTrigger>Customer Service</AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label className="font-medium">Customer Service Email</Label>
                      <div className="flex items-center gap-2">
                        {editMode.customerServiceEmail ? (
                          <Input
                            value={formData.customerServiceEmail}
                            onChange={(e) => handleInputChange('customerServiceEmail', e.target.value)}
                            onBlur={() => handleBlur('customerServiceEmail')}
                            className="flex-1"
                            type="email"
                            autoFocus
                            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleBlur('customerServiceEmail');
                              }
                            }}
                          />
                        ) : (
                          <div 
                            className="text-sm text-gray-700 py-0.5 px-1.5 hover:bg-gray-100 rounded cursor-pointer truncate"
                            onClick={() => handleFieldClick('customerServiceEmail')}
                          >
                            {merchant.formData?.customerServiceEmail}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label className="font-medium">Customer Service Phone</Label>
                      <div className="flex items-center gap-2">
                        {editMode.customerServicePhone ? (
                          <Input
                            value={formData.customerServicePhone}
                            onChange={(e) => handleInputChange('customerServicePhone', e.target.value)}
                            onBlur={() => handleBlur('customerServicePhone')}
                            className="flex-1"
                            type="tel"
                            autoFocus
                            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleBlur('customerServicePhone');
                              }
                            }}
                          />
                        ) : (
                          <div 
                            className="text-sm text-gray-700 py-0.5 px-1.5 hover:bg-gray-100 rounded cursor-pointer truncate"
                            onClick={() => handleFieldClick('customerServicePhone')}
                          >
                            {merchant.formData?.customerServicePhone}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="documents">
                <AccordionTrigger>Documents</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="font-medium">Bank Statements</Label>
                      <div className="mt-2 space-y-2">
                        {merchant.bank_statements?.map((url: string, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            <a 
                              href={url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800 flex-1 truncate"
                            >
                              {url.split('/').pop()}
                            </a>
                          </div>
                        ))}
                        {(!merchant.bank_statements || merchant.bank_statements.length === 0) && (
                          <div className="text-sm text-gray-500">No bank statements uploaded</div>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label className="font-medium">Driver's License</Label>
                      <div className="mt-2 space-y-2">
                        {merchant.drivers_license?.map((url: string, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            <a 
                              href={url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800 flex-1 truncate"
                            >
                              {url.split('/').pop()}
                            </a>
                          </div>
                        ))}
                        {(!merchant.drivers_license || merchant.drivers_license.length === 0) && (
                          <div className="text-sm text-gray-500">No driver's license uploaded</div>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label className="font-medium">Voided Check</Label>
                      <div className="mt-2 space-y-2">
                        {merchant.voided_check?.map((url: string, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            <a 
                              href={url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800 flex-1 truncate"
                            >
                              {url.split('/').pop()}
                            </a>
                          </div>
                        ))}
                        {(!merchant.voided_check || merchant.voided_check.length === 0) && (
                          <div className="text-sm text-gray-500">No voided check uploaded</div>
                        )}
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="status">
                <AccordionTrigger>Status and Stage</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="font-medium">Current Status</Label>
                      <Select
                        defaultValue={merchant.pipelineStatus}
                        onValueChange={handleStatusChange}
                      >
                        <SelectTrigger className="w-full mt-2">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lead">Lead</SelectItem>
                          <SelectItem value="phone">Phone</SelectItem>
                          <SelectItem value="offer">Offer</SelectItem>
                          <SelectItem value="underwriting">Underwriting</SelectItem>
                          <SelectItem value="documents">Documents</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label className="font-medium">Current Step</Label>
                      <div className="text-sm text-gray-700">
                        {merchant.currentStep || 0}
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label className="font-medium">User ID</Label>
                      <div className="text-sm text-gray-700">
                        {merchant.uid || 'Not assigned'}
                      </div>
                    </div>
                    {merchant.updatedAt && (
                      <div className="text-sm text-gray-500">
                        Last updated: {timestampToString(merchant.updatedAt)}
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="systemFields">
                <AccordionTrigger>System Fields</AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label className="font-medium">ID</Label>
                      <div className="text-sm text-gray-700">
                        {merchant.id}
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label className="font-medium">Created At</Label>
                      <div className="text-sm text-gray-700">
                        {merchant.createdAt ? timestampToString(merchant.createdAt) : ''}
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label className="font-medium">Updated At</Label>
                      <div className="text-sm text-gray-700">
                        {merchant.updatedAt ? timestampToString(merchant.updatedAt) : ''}
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label className="font-medium">User ID</Label>
                      <div className="text-sm text-gray-700">
                        {merchant.uid}
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label className="font-medium">Current Step</Label>
                      <div className="text-sm text-gray-700">
                        {merchant.currentStep}
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
        <div className="mt-8 w-full">
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <PricingSection merchant={merchant} />
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="flex-1 min-w-[600px]">
        <Card>
          <CardHeader>
            <CardTitle>Communications</CardTitle>
          </CardHeader>
          <CardContent>
            <CommunicationsSection merchant={merchant} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

