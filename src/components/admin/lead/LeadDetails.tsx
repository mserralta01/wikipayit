import React, { useState, ChangeEvent, useEffect } from "react";
import { CommunicationsSection } from "./CommunicationsSection";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../ui/accordion";
import { Card, CardHeader, CardContent } from "../../ui/card";
import { Label } from "../../ui/label";
import { Badge } from "../../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import {
  MerchantDTO,
  MerchantStatus,
  timestampToString,
  ProcessingHistory,
  FormData,
  BeneficialOwner,
} from "../../../types/merchant";
import { doc, updateDoc, Timestamp, query, where } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { Textarea } from "../../ui/textarea";
import {
  Building,
  Phone,
  MapPin,
  Globe,
  Calendar,
  FileText,
  Building2,
  Shield,
  Landmark,
  Clock,
  DollarSign,
  Mail,
  FileIcon,
  Trash2,
  Plus,
} from "lucide-react";
import { useToast } from "../../../hooks/use-toast";
import { cn } from "../../../lib/utils";
import { PipelineStatus, PipelineFormData } from "../../../types/pipeline";
import { BankDetailsDisplay } from "./BankDetailsDisplay";
import { BeneficialOwnersDisplay } from "./BeneficialOwnersDisplay";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../ui/tabs";
import { DeleteLeadDialog } from "./DeleteLeadDialog";
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs } from "firebase/firestore";
import { COLUMN_CONFIGS } from "../../../types/pipeline";
import { bankingPartnerService } from "../../../services/bankingPartnerService";

interface LeadDetailsProps {
  merchant: MerchantDTO;
}

interface ColumnConfig {
  title: string;
  position: number;
  color: string;
}

type ColumnConfigs = Record<PipelineStatus, ColumnConfig>;

const formatPhoneNumber = (value: string): string => {
  // Remove all non-digits
  const numbers = value.replace(/\D/g, "");

  // Format the number
  if (numbers.length <= 3) {
    return `(${numbers}`;
  }
  if (numbers.length <= 6) {
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
  }
  return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(
    6,
    10
  )}`;
};

const formatWebsite = (value: string): string => {
  if (!value) return value;
  if (!/^https?:\/\//i.test(value)) {
    return `https://${value}`;
  }
  return value;
};

const convertToPipelineFormData = (
  formData: FormData | undefined
): PipelineFormData | undefined => {
  if (!formData) return undefined;

  return {
    ...formData,
    monthlyVolume: formData.monthlyVolume?.toString(),
    averageTicket: formData.averageTicket?.toString(),
    beneficialOwners: {
      owners:
        formData.beneficialOwners?.owners.map((owner) => ({
          ...owner,
          ownershipPercentage: owner.ownershipPercentage?.toString(),
        })) || [],
    },
  };
};

interface BankingPartner {
  id: string;
  name: string;
  color: string;
}

export function LeadDetails({ merchant: initialMerchant }: LeadDetailsProps) {
  const { toast } = useToast();
  const [merchant, setMerchant] = useState(initialMerchant);
  const [editMode, setEditMode] = useState<{ [key: string]: boolean }>({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBankId, setSelectedBankId] = useState<string | undefined>(undefined);
  
  // Query for banking partners
  const { data: bankingPartners = [] } = useQuery<BankingPartner[]>({
    queryKey: ['active-banking-partners'],
    queryFn: async () => {
      try {
        const partnersRef = collection(db, 'bankingPartners');
        const agreementsRef = collection(db, 'bankAgreements');
        
        // Get all active banking partners
        const partnersSnapshot = await getDocs(query(
          partnersRef,
          where('status', '==', 'active')
        ));
        
        // Get all active agreements
        const agreementsSnapshot = await getDocs(query(
          agreementsRef,
          where('status', '==', 'active')
        ));
        
        // Create a set of banking partner IDs with active agreements
        const activePartnerIds = new Set(
          agreementsSnapshot.docs.map(doc => doc.data().bankingPartnerId)
        );
        
        // Filter and map partners to include only those with active agreements
        const filteredPartners = partnersSnapshot.docs
          .filter(doc => activePartnerIds.has(doc.id))
          .map(doc => ({
            id: doc.id,
            name: doc.data().name,
            color: doc.data().color || '#000000'
          }));
        
        return filteredPartners;
      } catch (error) {
        console.error('Error fetching banking partners:', error);
        toast({
          title: 'Error',
          description: 'Failed to load banking partners',
          variant: 'destructive'
        });
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false
  });

  const handleBankSelect = (bankId: string) => {
    setSelectedBankId(bankId);
  };

  const handleAddBank = async () => {
    if (!selectedBankId || !merchant.id) return;

    const selectedBank = bankingPartners.find(p => p.id === selectedBankId);
    if (!selectedBank) {
      toast({
        title: 'Error',
        description: 'Selected bank not found',
        variant: 'destructive'
      });
      return;
    }

    // Check if bank is already assigned
    if (merchant.assignedBanks?.includes(selectedBankId)) {
      toast({
        title: 'Error',
        description: 'This bank is already assigned',
        variant: 'destructive'
      });
      return;
    }

    try {
      const leadRef = doc(db, 'leads', merchant.id);
      const updatedBanks = [...(merchant.assignedBanks || []), selectedBankId];
      
      await updateDoc(leadRef, {
        assignedBanks: updatedBanks,
        updatedAt: Timestamp.fromDate(new Date())
      });

      // Update local state
      setMerchant(prev => ({
        ...prev,
        assignedBanks: updatedBanks
      }));

      // Reset selected bank
      setSelectedBankId(undefined);

      // Update form data state to reflect changes
      setFormData(prev => ({
        ...prev,
        assignedBanks: updatedBanks
      }));

      toast({
        title: 'Success',
        description: `Added ${selectedBank.name} as processing bank`,
      });
    } catch (error) {
      console.error('Error adding bank:', error);
      toast({
        title: 'Error',
        description: 'Failed to add processing bank',
        variant: 'destructive'
      });
    }
  };

  // Add query for column configs
  const { data: columnConfigs } = useQuery<ColumnConfigs>({
    queryKey: ['pipeline-columns'],
    queryFn: async () => {
      const columnConfigsRef = collection(db, 'pipeline-columns')
      const snapshot = await getDocs(columnConfigsRef)
      const configs = {} as ColumnConfigs
      
      // Initialize with default configs
      Object.entries(COLUMN_CONFIGS).forEach(([status, config]) => {
        configs[status as PipelineStatus] = {
          title: config.title,
          position: 0,
          color: config.color
        }
      })
      
      // Override with custom configs from Firestore
      snapshot.forEach((doc) => {
        const data = doc.data()
        const status = doc.id as PipelineStatus
        if (status in configs) {
          configs[status] = {
            ...configs[status],
            ...data
          }
        }
      })
      
      return configs
    }
  });

  // Get the color for the current status
  const statusColor = merchant.pipelineStatus && columnConfigs
    ? (merchant.pipelineStatus in (columnConfigs || {})
      ? columnConfigs[merchant.pipelineStatus as PipelineStatus]?.color
      : COLUMN_CONFIGS[merchant.pipelineStatus as PipelineStatus]?.color) || '#6B7280'
    : '#6B7280';

  const getOwnershipColor = (percentage: number) => {
    if (percentage === 100) return "bg-green-100 text-green-800 border-green-300";
    if (percentage > 100) return "bg-red-100 text-red-800 border-red-300";
    return "bg-yellow-100 text-yellow-800 border-yellow-300";
  };

  const [formData, setFormData] = useState<FormData>(() => ({
    businessName: initialMerchant.formData?.businessName || "",
    dba: initialMerchant.formData?.dba || "",
    phone: initialMerchant.formData?.phone || "",
    businessType: initialMerchant.formData?.businessType || "",
    taxId: initialMerchant.formData?.taxId || "",
    businessDescription: initialMerchant.formData?.businessDescription || "",
    yearEstablished: initialMerchant.formData?.yearEstablished || "",
    website: initialMerchant.formData?.website || "",
    customerServiceEmail: initialMerchant.formData?.customerServiceEmail || "",
    customerServicePhone: initialMerchant.formData?.customerServicePhone || "",
    companyAddress: {
      street: initialMerchant.formData?.companyAddress?.street || "",
      city: initialMerchant.formData?.companyAddress?.city || "",
      state: initialMerchant.formData?.companyAddress?.state || "",
      zipCode: initialMerchant.formData?.companyAddress?.zipCode || "",
    },
    // Bank details at root level
    bankName: initialMerchant.formData?.bankName || "",
    routingNumber: initialMerchant.formData?.routingNumber || "",
    accountNumber: initialMerchant.formData?.accountNumber || "",
    confirmAccountNumber: initialMerchant.formData?.accountNumber || "",
    processingHistory: {
      averageTicket:
        initialMerchant.formData?.processingHistory?.averageTicket || 0,
      cardPresentPercentage:
        initialMerchant.formData?.processingHistory?.cardPresentPercentage || 0,
      currentProcessor:
        initialMerchant.formData?.processingHistory?.currentProcessor || "",
      ecommercePercentage:
        initialMerchant.formData?.processingHistory?.ecommercePercentage || 0,
      hasBeenTerminated:
        initialMerchant.formData?.processingHistory?.hasBeenTerminated || "no",
      highTicket:
        initialMerchant.formData?.processingHistory?.highTicket || 0,
      isCurrentlyProcessing:
        initialMerchant.formData?.processingHistory?.isCurrentlyProcessing ||
        "no",
      monthlyVolume:
        initialMerchant.formData?.processingHistory?.monthlyVolume || 0,
      terminationExplanation:
        initialMerchant.formData?.processingHistory?.terminationExplanation ||
        "",
    },
    beneficialOwners: {
      owners: initialMerchant.formData?.beneficialOwners?.owners || [],
    },
  }));

  // Update merchant state when initialMerchant changes
  useEffect(() => {
    setMerchant({
      ...initialMerchant,
      assignedBanks: initialMerchant.assignedBanks || []
    });
    setFormData((prev) => ({
      ...prev,
      // Bank details at root level
      bankName: initialMerchant.formData?.bankName || "",
      routingNumber: initialMerchant.formData?.routingNumber || "",
      accountNumber: initialMerchant.formData?.accountNumber || "",
      confirmAccountNumber: initialMerchant.formData?.accountNumber || "",
      processingHistory: {
        ...prev.processingHistory,
        averageTicket:
          initialMerchant.formData?.processingHistory?.averageTicket || 0,
        cardPresentPercentage:
          initialMerchant.formData?.processingHistory?.cardPresentPercentage ||
          0,
        currentProcessor:
          initialMerchant.formData?.processingHistory?.currentProcessor || "",
        ecommercePercentage:
          initialMerchant.formData?.processingHistory?.ecommercePercentage || 0,
        hasBeenTerminated:
          initialMerchant.formData?.processingHistory?.hasBeenTerminated ||
          "no",
        highTicket:
          initialMerchant.formData?.processingHistory?.highTicket || 0,
        isCurrentlyProcessing:
          initialMerchant.formData?.processingHistory?.isCurrentlyProcessing ||
          "no",
        monthlyVolume:
          initialMerchant.formData?.processingHistory?.monthlyVolume || 0,
        terminationExplanation:
          initialMerchant.formData?.processingHistory?.terminationExplanation ||
          "",
      },
      beneficialOwners: {
        owners: initialMerchant.formData?.beneficialOwners?.owners || [],
      },
      businessName: initialMerchant.formData?.businessName || "",
      dba: initialMerchant.formData?.dba || "",
      phone: initialMerchant.formData?.phone || "",
      businessType: initialMerchant.formData?.businessType || "",
      taxId: initialMerchant.formData?.taxId || "",
      businessDescription:
        initialMerchant.formData?.businessDescription || "",
      yearEstablished: initialMerchant.formData?.yearEstablished || "",
      website: initialMerchant.formData?.website || "",
      customerServiceEmail:
        initialMerchant.formData?.customerServiceEmail || "",
      customerServicePhone:
        initialMerchant.formData?.customerServicePhone || "",
      companyAddress: {
        street: initialMerchant.formData?.companyAddress?.street || "",
        city: initialMerchant.formData?.companyAddress?.city || "",
        state: initialMerchant.formData?.companyAddress?.state || "",
        zipCode: initialMerchant.formData?.companyAddress?.zipCode || "",
      },
    }));
  }, [initialMerchant]);

  const toggleEdit = (field: string): void => {
    setEditMode((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      if (field === "phone") {
        // Format phone number as user types
        const formattedPhone = formatPhoneNumber(value);
        return {
          ...prev,
          phone: formattedPhone,
        };
      } else if (field === "website") {
        // Format website URL
        const formattedWebsite = formatWebsite(value);
        return {
          ...prev,
          website: formattedWebsite,
        };
      } else if (field.startsWith("companyAddress.")) {
        const addressField = field.split(".")[1] as keyof typeof prev.companyAddress;
        return {
          ...prev,
          companyAddress: {
            ...prev.companyAddress,
            [addressField]: value,
          },
        };
      } else if (field.startsWith("processingHistory.")) {
        const historyField = field.split(".")[1] as keyof ProcessingHistory;
        return {
          ...prev,
          processingHistory: {
            ...prev.processingHistory,
            [historyField]: value,
          },
        };
      } else {
        // Handle all other fields
        return {
          ...prev,
          [field]: value,
        } as FormData;
      }
    });
  };

  const handleSave = async (field: string) => {
    try {
      const updateData: Record<string, any> = {
        [`formData.${field}`]: formData[field as keyof FormData],
      };

      const collectionPath = "leads";
      await updateDoc(doc(db, collectionPath, merchant.id), updateData);

      toast({
        title: "Success",
        description: "Field updated successfully.",
      });

      setEditMode((prev) => ({ ...prev, [field]: false }));
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
    setEditMode((prev) => ({ ...prev, [field]: true }));
  };

  const handleBlur = async (field: string) => {
    if (editMode[field]) {
      await handleSave(field);
    }
  };

  const calculateProgress = (status: MerchantStatus): number => {
    const stages = ["lead", "phone", "offer", "underwriting", "documents", "approved"];
    const currentIndex = stages.indexOf(status);
    return ((currentIndex + 1) / stages.length) * 100;
  };

  const getStatusColor = (status: MerchantStatus): string => {
    const colors: Record<MerchantStatus, string> = {
      lead: "bg-blue-500",
      phone: "bg-yellow-500",
      offer: "bg-purple-500",
      underwriting: "bg-orange-500",
      documents: "bg-indigo-500",
      approved: "bg-green-500",
      started: "bg-gray-400",
      in_progress: "bg-gray-500",
      completed: "bg-gray-600",
    };
    return colors[status] || "bg-gray-500";
  };

  const handleBeneficialOwnerChange = (index: number, field: string, value: string) => {
    // Update formData state
    setFormData((prev) => ({
      ...prev,
      beneficialOwners: {
        owners: prev.beneficialOwners.owners.map((owner, i) => 
          i === index ? { ...owner, [field]: value } : owner
        ),
      },
    }));

    // Update merchant state with the same data
    setMerchant((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        // Ensure we maintain all existing formData fields
        businessName: prev.formData?.businessName || "",
        dba: prev.formData?.dba || "",
        phone: prev.formData?.phone || "",
        businessType: prev.formData?.businessType || "",
        taxId: prev.formData?.taxId || "",
        businessDescription: prev.formData?.businessDescription || "",
        yearEstablished: prev.formData?.yearEstablished || "",
        website: prev.formData?.website || "",
        customerServiceEmail: prev.formData?.customerServiceEmail || "",
        customerServicePhone: prev.formData?.customerServicePhone || "",
        companyAddress: prev.formData?.companyAddress || {
          street: "",
          city: "",
          state: "",
          zipCode: "",
        },
        bankName: prev.formData?.bankName || "",
        routingNumber: prev.formData?.routingNumber || "",
        accountNumber: prev.formData?.accountNumber || "",
        confirmAccountNumber: prev.formData?.accountNumber || "",
        processingHistory: prev.formData?.processingHistory || {
          averageTicket: 0,
          cardPresentPercentage: 0,
          currentProcessor: "",
          ecommercePercentage: 0,
          hasBeenTerminated: "no",
          highTicket: 0,
          isCurrentlyProcessing: "no",
          monthlyVolume: 0,
          terminationExplanation: "",
        },
        beneficialOwners: {
          owners: prev.formData?.beneficialOwners?.owners.map((owner, i) => 
            i === index ? { ...owner, [field]: value } : owner
          ) || [],
        },
      },
    }));
  };

  const handleBeneficialOwnerBlur = async (index: number, field: string) => {
    if (!merchant.id) return;

    try {
      const leadRef = doc(db, 'leads', merchant.id);
      const updateData = {
        formData: {
          ...merchant.formData,
          // Ensure all required fields are present
          businessName: merchant.formData?.businessName || "",
          dba: merchant.formData?.dba || "",
          phone: merchant.formData?.phone || "",
          businessType: merchant.formData?.businessType || "",
          taxId: merchant.formData?.taxId || "",
          businessDescription: merchant.formData?.businessDescription || "",
          yearEstablished: merchant.formData?.yearEstablished || "",
          website: merchant.formData?.website || "",
          customerServiceEmail: merchant.formData?.customerServiceEmail || "",
          customerServicePhone: merchant.formData?.customerServicePhone || "",
          companyAddress: merchant.formData?.companyAddress || {
            street: "",
            city: "",
            state: "",
            zipCode: "",
          },
          bankName: merchant.formData?.bankName || "",
          routingNumber: merchant.formData?.routingNumber || "",
          accountNumber: merchant.formData?.accountNumber || "",
          confirmAccountNumber: merchant.formData?.accountNumber || "",
          processingHistory: merchant.formData?.processingHistory || {
            averageTicket: 0,
            cardPresentPercentage: 0,
            currentProcessor: "",
            ecommercePercentage: 0,
            hasBeenTerminated: "no",
            highTicket: 0,
            isCurrentlyProcessing: "no",
            monthlyVolume: 0,
            terminationExplanation: "",
          },
          beneficialOwners: {
            owners: formData.beneficialOwners.owners,
          },
        },
        updatedAt: Timestamp.fromDate(new Date())
      };

      await updateDoc(leadRef, updateData);
    } catch (error) {
      console.error('Error updating beneficial owner:', error);
      toast({
        title: 'Error',
        description: 'Failed to update beneficial owner information',
        variant: 'destructive',
      });
    }
  };

  const formatCurrency = (value: number): string => {
    return value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  const renderEditableField = (
    data: any,
    field: string,
    placeholder: string,
    icon: React.ReactNode | null,
    type: string = "text"
  ) => {
    const fieldId = field;
    const value = field.includes(".")
      ? field.split(".").reduce((obj, key) => obj?.[key], data)
      : data[field];

    return (
      <div className={cn("flex items-center gap-2")}>
        {icon}
        <div className="flex-1">
          {editMode[fieldId] ? (
            type === "textarea" ? (
              <Textarea
                value={value || ""}
                onChange={(e) => handleInputChange(field, e.target.value)}
                onBlur={() => handleBlur(field)}
                className="min-h-[60px]"
                placeholder={placeholder}
                autoFocus
              />
            ) : (
              <Input
                type={type}
                value={value || ""}
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
      {/* Left Column */}
      <div className="flex flex-col w-[25%] min-w-[400px]">
        <Card className="mb-4 w-full">
          <CardHeader className="space-y-4 pb-4">
            <div className="flex flex-row items-center justify-between">
              <Badge
                className={cn(
                  "text-white text-xl py-2 px-4"
                )}
                style={{ backgroundColor: statusColor }}
              >
                {merchant.formData?.businessName || merchant.businessName}
              </Badge>
            </div>
            <div className="w-full space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Progress</span>
                <span>
                  {Math.round(calculateProgress(merchant.pipelineStatus || "lead"))}%
                </span>
              </div>
              <div className="w-full bg-white rounded-full h-2 mb-4 border border-gray-200">
                <div
                  className="h-full rounded-full bg-blue-500"
                  style={{
                    width: `${calculateProgress(merchant.pipelineStatus || "lead")}%`,
                    transition: "width 0.5s ease-in-out",
                  }}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full space-y-1">
              {/* Business Section */}
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
                      {/* DBA */}
                      {renderEditableField(
                        formData,
                        "dba",
                        "DBA",
                        <Building className="h-4 w-4 text-blue-500" />
                      )}

                      {/* Contact Info */}
                      {renderEditableField(
                        formData,
                        "phone",
                        "Phone Number",
                        <Phone className="h-4 w-4 text-blue-500" />,
                        "tel"
                      )}

                      {/* Website with clickable link */}
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-blue-500" />
                        <div className="flex-1">
                          {editMode.website ? (
                            <Input
                              value={formData.website}
                              onChange={(e) => handleInputChange("website", e.target.value)}
                              onBlur={() => handleBlur("website")}
                              className="h-7 min-h-[28px]"
                              placeholder="Website URL"
                              autoFocus
                            />
                          ) : (
                            <div
                              className="font-medium cursor-pointer hover:bg-gray-50 rounded px-2 py-0.5 flex items-center justify-between"
                              onClick={() => handleFieldClick("website")}
                            >
                              <span>{formData.website || "Add website"}</span>
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
                          "businessType",
                          "Business Type",
                          <Building2 className="h-4 w-4 text-blue-500" />
                        )}

                        {renderEditableField(
                          formData,
                          "yearEstablished",
                          "Year Established",
                          <Calendar className="h-4 w-4 text-blue-500" />
                        )}
                      </div>

                      {/* Tax ID and Description */}
                      <div className="grid grid-cols-2 gap-3">
                        {renderEditableField(
                          formData,
                          "taxId",
                          "Tax ID / EIN",
                          <FileText className="h-4 w-4 text-blue-500" />
                        )}
                      </div>

                      {/* Address Section */}
                      <div className="space-y-1.5">
                        {renderEditableField(
                          formData,
                          "companyAddress.street",
                          "Street Address",
                          <MapPin className="h-4 w-4 text-blue-500" />
                        )}

                        <div className="grid grid-cols-6 gap-2 pl-6">
                          <div className="col-span-3">
                            {renderEditableField(
                              formData,
                              "companyAddress.city",
                              "City",
                              null
                            )}
                          </div>

                          <div className="col-span-1">
                            {renderEditableField(
                              formData,
                              "companyAddress.state",
                              "ST",
                              null
                            )}
                          </div>

                          <div className="col-span-2">
                            {renderEditableField(
                              formData,
                              "companyAddress.zipCode",
                              "ZIP",
                              null
                            )}
                          </div>
                        </div>
                      </div>

                      {renderEditableField(
                        formData,
                        "businessDescription",
                        "Business Description",
                        <FileText className="h-4 w-4 text-blue-500" />,
                        "textarea"
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
                              "customerServiceEmail",
                              "Customer Service Email",
                              <Mail className="h-4 w-4 text-blue-500" />,
                              "email"
                            )}

                            {renderEditableField(
                              formData,
                              "customerServicePhone",
                              "Customer Service Phone",
                              <Phone className="h-4 w-4 text-blue-500" />,
                              "tel"
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>

              {/* Processing History Section */}
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
                            {formatCurrency(formData.processingHistory.averageTicket)}
                          </div>
                        </div>
                        <div>
                          <Label className="font-medium">Card Present %</Label>
                          <div className="text-sm text-gray-700">
                            {formData.processingHistory.cardPresentPercentage}%
                          </div>
                        </div>
                        <div>
                          <Label className="font-medium">Current Processor</Label>
                          <div className="text-sm text-gray-700">
                            {formData.processingHistory.currentProcessor || "N/A"}
                          </div>
                        </div>
                        <div>
                          <Label className="font-medium">E-commerce %</Label>
                          <div className="text-sm text-gray-700">
                            {formData.processingHistory.ecommercePercentage}%
                          </div>
                        </div>
                        <div>
                          <Label className="font-medium">High Ticket</Label>
                          <div className="text-sm text-gray-700">
                            {formatCurrency(formData.processingHistory.highTicket)}
                          </div>
                        </div>
                        <div>
                          <Label className="font-medium">Monthly Volume</Label>
                          <div className="text-sm text-gray-700">
                            {formatCurrency(formData.processingHistory.monthlyVolume)}
                          </div>
                        </div>
                        <div>
                          <Label className="font-medium">Has Been Terminated</Label>
                          <div className="text-sm text-gray-700">
                            {formData.processingHistory.hasBeenTerminated || "no"}
                          </div>
                        </div>
                        <div>
                          <Label className="font-medium">Termination Explanation</Label>
                          <div className="text-sm text-gray-700">
                            {formData.processingHistory.terminationExplanation || "N/A"}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>

              {/* Bank Details Section */}
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

              {/* Beneficial Owners Section */}
              <AccordionItem value="beneficialOwners">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-1">
                      <Shield className="h-5 w-5 text-blue-500" />
                      <span className="text-gray-900">Owners</span>
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
                      Total Ownership:{" "}
                      {merchant.formData?.beneficialOwners?.owners.reduce(
                        (sum, owner) => sum + (Number(owner.ownershipPercentage) || 0),
                        0
                      ) || 0}
                      %
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-8">
                  <BeneficialOwnersDisplay
                    formData={convertToPipelineFormData(merchant.formData)}
                    onOwnerChange={handleBeneficialOwnerChange}
                    editMode={editMode}
                    onFieldClick={toggleEdit}
                    hideHeader={true}
                    onBlur={(field) => {
                      const [_, indexStr, fieldName] = field.split('.');
                      const index = parseInt(indexStr, 10);
                      if (!isNaN(index)) {
                        handleBeneficialOwnerBlur(index, fieldName);
                      }
                      toggleEdit(field);
                    }}
                    onAddOwner={() => {
                      setFormData((prev) => ({
                        ...prev,
                        beneficialOwners: {
                          owners: [
                            ...(prev.beneficialOwners?.owners || []),
                            {
                              firstName: "",
                              lastName: "",
                              title: "",
                              dateOfBirth: "",
                              ssn: "",
                              address: "",
                              city: "",
                              state: "",
                              zipCode: "",
                              phone: "",
                              email: "",
                              ownershipPercentage: "",
                            },
                          ],
                        },
                      }));
                    }}
                    onRemoveOwner={(index) => {
                      setFormData((prev) => ({
                        ...prev,
                        beneficialOwners: {
                          owners: prev.beneficialOwners.owners.filter((_, i) => i !== index),
                        },
                      }));
                    }}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
            {/* Add Bank and Delete Buttons */}
            <div className="mt-6 pt-6 border-t space-y-4">
              <div className="flex gap-4">
                <Select onValueChange={(value) => handleBankSelect(value)}>
                  <SelectTrigger className="flex-1 h-10">
                    <SelectValue placeholder="Select a bank" />
                  </SelectTrigger>
                  <SelectContent 
                    position="popper" 
                    className="w-[--radix-select-trigger-width] bg-white z-50 max-h-[300px] overflow-y-auto"
                  >
                    {bankingPartners.map((partner) => (
                      <SelectItem 
                        key={partner.id} 
                        value={partner.id}
                        className="flex items-center gap-2 py-3 px-4 cursor-pointer hover:bg-gray-100"
                      >
                        <div 
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: partner.color }}
                        />
                        <span className="text-sm font-medium">{partner.name}</span>
                      </SelectItem>
                    ))}
                    {bankingPartners.length === 0 && (
                      <div className="py-3 px-4 text-sm text-gray-500">
                        No active banking partners found
                      </div>
                    )}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleAddBank}
                  disabled={!selectedBankId}
                  className="h-10"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Bank
                </Button>
              </div>
              
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Lead
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Add Delete Dialog */}
        <DeleteLeadDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          leadId={merchant.id}
        />
      </div>

      {/* Right Column */}
      <div className="flex-1 min-w-[600px]">
        <Card className="h-full flex flex-col">
          <Tabs defaultValue="emails" className="flex-1">
            <div className="border-b">
              <div className="px-4">
                <TabsList className="h-12 w-full justify-start gap-4 bg-transparent">
                  <TabsTrigger 
                    value="emails" 
                    className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent px-2 rounded-none"
                  >
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>Emails</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="phone" 
                    className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent px-2 rounded-none"
                  >
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>Phone Calls</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="notes" 
                    className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent px-2 rounded-none"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>Internal Notes</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="documents" 
                    className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent px-2 rounded-none"
                  >
                    <div className="flex items-center gap-2">
                      <FileIcon className="h-4 w-4" />
                      <span>Documents</span>
                    </div>
                  </TabsTrigger>
                  {merchant.assignedBanks?.length > 0 && (
                    <TabsTrigger 
                      value="banks" 
                      className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent px-2 rounded-none"
                    >
                      <div className="flex items-center gap-2">
                        <Landmark className="h-4 w-4" />
                        <span>Banks</span>
                      </div>
                    </TabsTrigger>
                  )}
                </TabsList>
              </div>
            </div>
            <div className="flex-1 p-6">
              <TabsContent value="emails" className="mt-0 border-none p-0">
                <CommunicationsSection merchant={merchant} tab="emails" />
              </TabsContent>
              <TabsContent value="phone" className="mt-0 border-none p-0">
                <CommunicationsSection merchant={merchant} tab="phone" />
              </TabsContent>
              <TabsContent value="notes" className="mt-0 border-none p-0">
                <CommunicationsSection merchant={merchant} tab="notes" />
              </TabsContent>
              <TabsContent value="documents" className="mt-0 border-none p-0">
                <CommunicationsSection merchant={merchant} tab="documents" />
              </TabsContent>
              {merchant.assignedBanks?.length > 0 && (
                <TabsContent value="banks" className="mt-0 border-none p-0">
                  <div className="space-y-4">
                    {merchant.assignedBanks.map((bankId) => {
                      const bank = bankingPartners.find(p => p.id === bankId);
                      if (!bank) return null;
                      return (
                        <BankDetailsDisplay
                          key={bankId}
                          formData={{
                            bankName: bank.name,
                            bankingPartnerId: bank.id,
                            color: bank.color
                          }}
                          onDelete={async () => {
                            const confirm = window.confirm(`Are you sure you want to remove ${bank.name}?`);
                            if (!confirm || !merchant.id) return;
                            
                            try {
                              const leadRef = doc(db, 'leads', merchant.id);
                              await updateDoc(leadRef, {
                                assignedBanks: merchant.assignedBanks?.filter(id => id !== bankId),
                                updatedAt: Timestamp.fromDate(new Date())
                              });
                              
                              // Update local state
                              setMerchant(prev => ({
                                ...prev,
                                assignedBanks: prev.assignedBanks?.filter(id => id !== bankId)
                              }));
                              
                              toast({
                                title: 'Success',
                                description: `${bank.name} removed successfully`,
                              });
                            } catch (error) {
                              console.error('Error removing bank:', error);
                              toast({
                                title: 'Error',
                                description: 'Failed to remove bank',
                                variant: 'destructive'
                              });
                            }
                          }}
                        />
                      );
                    })}
                  </div>
                </TabsContent>
              )}
            </div>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
