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
  BeneficialOwner
} from "@/types/merchant"
import { doc, updateDoc, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Pencil, X, Check, Building, Phone, MapPin, Globe, Calendar, FileText, Building2, Shield, Landmark, Clock, HeadphonesIcon, Mail } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { PipelineStatus, PipelineFormData } from "@/types/pipeline"
import { BankDetailsDisplay } from './BankDetailsDisplay';
import { BeneficialOwnersDisplay } from './BeneficialOwnersDisplay';

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

const convertToPipelineFormData = (formData: FormData | undefined): PipelineFormData | undefined => {
  if (!formData) return undefined;
  
  return {
    ...formData,
    monthlyVolume: formData.monthlyVolume?.toString(),
    averageTicket: formData.averageTicket?.toString(),
    beneficialOwners: {
      owners: formData.beneficialOwners?.owners.map(owner => ({
        ...owner,
        ownershipPercentage: owner.ownershipPercentage?.toString()
      })) || []
    }
  };
};

export function LeadDetails({ merchant: initialMerchant }: LeadDetailsProps) {
  const { toast } = useToast()
  const [merchant, setMerchant] = useState(initialMerchant)
  const [editMode, setEditMode] = useState<{ [key: string]: boolean }>({})

  const getOwnershipColor = (percentage: number) => {
    if (percentage === 100) return 'bg-green-100 text-green-800 border-green-300';
    if (percentage > 100) return 'bg-red-100 text-red-800 border-red-300';
    return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  };

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
    // Bank details at root level
    bankName: initialMerchant.formData?.bankName || '',
    routingNumber: initialMerchant.formData?.routingNumber || '',
    accountNumber: initialMerchant.formData?.accountNumber || '',
    confirmAccountNumber: initialMerchant.formData?.accountNumber || '',
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
    setMerchant(initialMerchant);
    setFormData(prev => ({
      ...prev,
      // Bank details at root level
      bankName: initialMerchant.formData?.bankName || '',
      routingNumber: initialMerchant.formData?.routingNumber || '',
      accountNumber: initialMerchant.formData?.accountNumber || '',
      confirmAccountNumber: initialMerchant.formData?.accountNumber || '',
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
    }));
  }, [initialMerchant]);

  const toggleEdit = (field: string): void => {
    setEditMode(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      if (field === 'phone') {
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
      const updateData: Record<string, any> = {
        [`formData.${field}`]: formData[field as keyof FormData]
      };
      
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

  const handleFieldClick = (field: string) => {
    setEditMode(prev => ({ ...prev, [field]: true }));
  };

  // Add handleBlur function
  const handleBlur = async (field: string) => {
    if (editMode[field]) {
      await handleSave(field);
    }
  };

  // Add back missing functions
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

  const formatCurrency = (value: number): string => {
    return value.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });
  };

  const renderEditableField = (
    data: any,
    field: string,
    placeholder: string,
    icon: React.ReactNode | null,
    type: string = 'text'
  ) => {
    const fieldId = field;
    const value = field.includes('.')
      ? field.split('.').reduce((obj, key) => obj?.[key], data)
      : data[field];
    
    return (
      <div className={cn("flex items-center gap-2")}>
        {icon}
        <div className="flex-1">
          {editMode[fieldId] ? (
            type === 'textarea' ? (
              <Textarea
                value={value || ''}
                onChange={(e) => handleInputChange(field, e.target.value)}
                onBlur={() => handleBlur(field)}
                className="min-h-[60px]"
                placeholder={placeholder}
                autoFocus
              />
            ) : (
              <Input
                type={type}
                value={value || ''}
                onChange={(e) => handleInputChange(field, e.target.value)}
                onBlur={() => handleBlur(field)}
                className="h-7 min-h-[28px]"
                placeholder={placeholder}
                autoFocus
              />
            )
          ) : (
            <div 
              className="font-medium cursor-pointer hover:bg-gray-50 rounded px-2 py-0.5"
              onClick={() => handleFieldClick(field)}
            >
              {value || placeholder}
            </div>
          )}
        </div>
      </div>
    );
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
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-1">
                    <Building2 className="h-5 w-5 text-blue-500" />
                    <span className="text-gray-900">Business</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <Card className="w-full">
                    <CardContent className="pt-6 space-y-3">
                      {/* DBA only (removed Business Name) */}
                      {renderEditableField(
                        formData,
                        'dba',
                        'DBA',
                        <Building className="h-4 w-4 text-blue-500" />
                      )}

                      {/* Contact Info */}
                      {renderEditableField(
                        formData,
                        'phone',
                        'Phone Number',
                        <Phone className="h-4 w-4 text-blue-500" />,
                        'tel'
                      )}

                      {/* Website with clickable link */}
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-blue-500" />
                        <div className="flex-1">
                          {editMode.website ? (
                            <Input
                              value={formData.website}
                              onChange={(e) => handleInputChange('website', e.target.value)}
                              onBlur={() => handleBlur('website')}
                              className="h-7 min-h-[28px]"
                              placeholder="Website URL"
                              autoFocus
                            />
                          ) : (
                            <div 
                              className="font-medium cursor-pointer hover:bg-gray-50 rounded px-2 py-0.5 flex items-center justify-between"
                              onClick={() => handleFieldClick('website')}
                            >
                              <span>{formData.website || 'Add website'}</span>
                              {formData.website && (
                                <a
                                  href={formData.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:text-blue-700 ml-2"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  Visit
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Business Details */}
                      <div className="grid grid-cols-2 gap-3">
                        {renderEditableField(
                          formData,
                          'businessType',
                          'Business Type',
                          <Building2 className="h-4 w-4 text-blue-500" />
                        )}
                        
                        {renderEditableField(
                          formData,
                          'yearEstablished',
                          'Year Established',
                          <Calendar className="h-4 w-4 text-blue-500" />
                        )}
                      </div>

                      {/* Tax ID and Description */}
                      <div className="grid grid-cols-2 gap-3">
                        {renderEditableField(
                          formData,
                          'taxId',
                          'Tax ID / EIN',
                          <FileText className="h-4 w-4 text-blue-500" />
                        )}
                      </div>

                      {/* Address Section */}
                      <div className="space-y-1.5">
                        {renderEditableField(
                          formData,
                          'companyAddress.street',
                          'Street Address',
                          <MapPin className="h-4 w-4 text-blue-500" />
                        )}
                        
                        <div className="grid grid-cols-6 gap-2 pl-6">
                          <div className="col-span-3">
                            {renderEditableField(
                              formData,
                              'companyAddress.city',
                              'City',
                              null
                            )}
                          </div>
                          
                          <div className="col-span-1">
                            {renderEditableField(
                              formData,
                              'companyAddress.state',
                              'ST',
                              null
                            )}
                          </div>
                          
                          <div className="col-span-2">
                            {renderEditableField(
                              formData,
                              'companyAddress.zipCode',
                              'ZIP',
                              null
                            )}
                          </div>
                        </div>
                      </div>

                      {renderEditableField(
                        formData,
                        'businessDescription',
                        'Business Description',
                        <FileText className="h-4 w-4 text-blue-500" />,
                        'textarea'
                      )}

                      {/* Customer Service Section */}
                      <div className="space-y-2">
                        <Card className="bg-gray-50 relative pt-3">
                          <div className="absolute -top-3 left-4">
                            <Badge variant="outline" className="bg-white text-gray-700 font-normal">
                              Customer Service
                            </Badge>
                          </div>
                          <CardContent className="pt-2 pb-4 space-y-2">
                            {renderEditableField(
                              formData,
                              'customerServiceEmail',
                              'Customer Service Email',
                              <Mail className="h-4 w-4 text-blue-500" />,
                              'email'
                            )}
                            
                            {renderEditableField(
                              formData,
                              'customerServicePhone',
                              'Customer Service Phone',
                              <Phone className="h-4 w-4 text-blue-500" />,
                              'tel'
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="processingHistory">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-1">
                    <Clock className="h-5 w-5 text-blue-500" />
                    <span className="text-gray-900">Processing History</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <Card className="w-full">
                    <CardContent className="pt-6">
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
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="bankDetails">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-1">
                    <Landmark className="h-5 w-5 text-blue-500" />
                    <span className="text-gray-900">Bank Details</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <BankDetailsDisplay formData={convertToPipelineFormData(merchant.formData)} />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="beneficialOwners">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-1">
                      <Shield className="h-5 w-5 text-blue-500" />
                      <span className="text-gray-900">
                        Owners
                      </span>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "px-3 py-1",
                        getOwnershipColor(
                          merchant.formData?.beneficialOwners?.owners.reduce(
                            (sum, owner) => sum + (Number(owner.ownershipPercentage) || 0),
                            0
                          ) || 0
                        )
                      )}
                    >
                      Total Ownership: {
                        merchant.formData?.beneficialOwners?.owners.reduce(
                          (sum, owner) => sum + (Number(owner.ownershipPercentage) || 0),
                          0
                        ) || 0
                      }%
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-8">
                  <BeneficialOwnersDisplay
                    formData={convertToPipelineFormData(merchant.formData)}
                    onOwnerChange={handleBeneficialOwnerChange}
                    onAddOwner={() => {
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
                      }));
                    }}
                    onRemoveOwner={(index) => {
                      setFormData(prev => ({
                        ...prev,
                        beneficialOwners: {
                          owners: prev.beneficialOwners.owners.filter((_, i) => i !== index)
                        }
                      }));
                    }}
                    editMode={editMode}
                    onFieldClick={handleFieldClick}
                    onBlur={handleBlur}
                    hideHeader={true}
                  />
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
                    {merchant.updatedAt && (
                      <div className="text-sm text-gray-500">
                        Last updated: {timestampToString(merchant.updatedAt)}
                      </div>
                    )}
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

