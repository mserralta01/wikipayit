import React, { useState } from "react"
import { CommunicationsSection } from "./CommunicationsSection"
import { PricingSection } from "./PricingSection"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Merchant, MerchantStatus, timestampToString } from "@/types/merchant"
import { doc, updateDoc, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Pencil, X, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface LeadDetailsProps {
  merchant: Merchant & {
    kind?: 'lead' | 'merchant'
  }
}

export function LeadDetails({ merchant: initialMerchant }: LeadDetailsProps) {
  const { toast } = useToast()
  const [merchant, setMerchant] = useState(initialMerchant)
  // Determine collection based on kind
  const collection = merchant.kind === 'lead' ? 'leads' : 'merchants'
  const [editMode, setEditMode] = useState<{ [key: string]: boolean }>({})
  const [formData, setFormData] = useState({
    businessName: merchant.formData?.businessName || merchant.businessName || '',
    dba: merchant.formData?.dba || '',
    phone: merchant.formData?.phone || '',
    businessType: merchant.formData?.businessType || '',
    taxId: merchant.formData?.taxId || '',
    companyAddress: {
      street: merchant.formData?.companyAddress?.street || '',
      city: merchant.formData?.companyAddress?.city || '',
      state: merchant.formData?.companyAddress?.state || '',
      zipCode: merchant.formData?.companyAddress?.zipCode || '',
    },
    bankDetails: {
      bankName: merchant.formData?.bankDetails?.bankName || '',
      routingNumber: merchant.formData?.bankDetails?.routingNumber || '',
      accountNumber: merchant.formData?.bankDetails?.accountNumber || '',
    },
    beneficialOwners: merchant.beneficialOwners || merchant.formData?.beneficialOwners?.owners || []
  })

  const toggleEdit = (field: string): void => {
    setEditMode(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const handleInputChange = (field: string, value: string): void => {
    if (field.startsWith('companyAddress.')) {
      const addressField = field.split('.')[1]
      setFormData(prev => ({
        ...prev,
        companyAddress: {
          ...prev.companyAddress,
          [addressField]: value
        }
      }))
    } else if (field.startsWith('bankDetails.')) {
      const bankField = field.split('.')[1]
      setFormData(prev => ({
        ...prev,
        bankDetails: {
          ...prev.bankDetails,
          [bankField]: value
        }
      }))
    } else if (field.startsWith('beneficialOwners.')) {
      // Handled directly in the component
      return
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleSave = async (field: string) => {
    try {
      let updateData: Record<string, any> = {}
      let localUpdateData: Record<string, any> = {}
      
      if (field.startsWith('companyAddress.')) {
        const addressField = field.split('.')[1]
        updateData = {
          [`formData.companyAddress.${addressField}`]: formData.companyAddress[addressField as keyof typeof formData.companyAddress]
        }
        localUpdateData = {
          companyAddress: {
            ...formData.companyAddress
          }
        }
      } else if (field.startsWith('bankDetails.')) {
        const bankField = field.split('.')[1]
        updateData = {
          [`formData.bankDetails.${bankField}`]: formData.bankDetails[bankField as keyof typeof formData.bankDetails]
        }
        localUpdateData = {
          bankDetails: {
            ...formData.bankDetails
          }
        }
      } else if (field.startsWith('beneficialOwners.')) {
        const [, index, subfield] = field.split('.')
        const owners = [...formData.beneficialOwners]
        updateData = {
          beneficialOwners: owners
        }
        localUpdateData = {
          beneficialOwners: owners
        }
      } else {
        updateData = {
          [`formData.${field}`]: formData[field as keyof typeof formData]
        }
        localUpdateData = {
          [field]: formData[field as keyof typeof formData]
        }
      }

      // Verify document exists before updating
      const docRef = doc(db, collection, merchant.id)
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: new Date()
      })

      // Update local merchant state to reflect changes immediately
      // Update local merchant state to reflect changes immediately
      setMerchant(prev => {
        const updatedMerchant = { ...prev };
        const newFormData = updatedMerchant.formData ? { ...updatedMerchant.formData } : {};

        if (field.startsWith('companyAddress.')) {
          const addressField = field.split('.')[1] as keyof typeof formData.companyAddress;
          newFormData.companyAddress = {
            ...(newFormData.companyAddress || {}),
            [addressField]: formData.companyAddress[addressField]
          };
        } else if (field.startsWith('bankDetails.')) {
          const bankField = field.split('.')[1] as keyof typeof formData.bankDetails;
          newFormData.bankDetails = {
            ...(newFormData.bankDetails || {
              bankName: '',
              routingNumber: '',
              accountNumber: '',
              confirmAccountNumber: ''
            }),
            [bankField]: formData.bankDetails[bankField]
          };
        } else if (field.startsWith('beneficialOwners.')) {
          // Handle beneficial owners separately since it's not in formData
          updatedMerchant.beneficialOwners = formData.beneficialOwners.map(owner => ({
            firstName: owner.firstName,
            lastName: owner.lastName,
            phone: owner.phone || '',
            email: owner.email || '',
            title: '',
            ownershipPercentage: '0',
            dateOfBirth: '',
            ssn: '',
            address: '',
            city: '',
            state: '',
            zipCode: ''
          }));
        } else {
          // For other fields, update formData directly
          if (field in formData) {
            const value = formData[field as keyof typeof formData];
            if (value !== undefined) {
              (newFormData as any)[field] = value;
            }
          }
        }

        // Ensure we maintain the correct Merchant type structure
        const updatedFormData = {
          ...updatedMerchant.formData,
          ...newFormData
        };

        return {
          ...updatedMerchant,
          formData: updatedFormData,
          updatedAt: Timestamp.fromDate(new Date())
        };
      });

      setEditMode(prev => ({ ...prev, [field]: false }))
      toast({
        title: "Success",
        description: "Field updated successfully.",
      })
    } catch (error) {
      console.error("Error updating field:", error)
      toast({
        title: "Error",
        description: "Failed to update field. Please try again.",
        variant: "destructive",
      })
    }
  }

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
      await updateDoc(doc(db, collection, merchant.id), {
        pipelineStatus: status,
        updatedAt: new Date()
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

  return (
    <div className="flex gap-6">
      <div className="flex flex-col w-[35%] min-w-[400px]">
        <Card className="mb-4 w-full">
          <CardHeader className="space-y-4 pb-4">
            <div className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-bold">Lead Details</CardTitle>
          <Badge
            className={cn(
              getStatusColor(merchant.pipelineStatus || 'lead'),
              "text-white"
            )}
          >
            {(merchant.pipelineStatus || 'lead').toUpperCase()}
          </Badge>
        </div>
        <div className="w-full space-y-2">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Progress</span>
            <span>
              {Math.round(calculateProgress(merchant.pipelineStatus || 'lead'))}%
            </span>
          </div>
          <Progress
            value={calculateProgress(merchant.pipelineStatus || 'lead')}
            className={cn(
              "h-2",
              getStatusColor(merchant.pipelineStatus || 'lead')
            )}
          />
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="basic">
            <AccordionTrigger>Basic Information</AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label className="font-medium">Business Name</Label>
                  <div className="flex items-center gap-2">
                    {editMode.businessName ? (
                      <>
                        <Input
                          value={formData.businessName}
                          onChange={(e) => handleInputChange('businessName', e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleSave('businessName')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('businessName')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="text-sm text-gray-700 flex-1">
                          {merchant.formData?.businessName || merchant.businessName}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('businessName')}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className="font-medium">DBA</Label>
                  <div className="flex items-center gap-2">
                    {editMode.dba ? (
                      <>
                        <Input
                          value={formData.dba}
                          onChange={(e) => handleInputChange('dba', e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleSave('dba')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('dba')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="text-sm text-gray-700 flex-1">
                          {merchant.formData?.dba}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('dba')}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className="font-medium">Contact Email</Label>
                  <div className="text-sm text-gray-700">
                    {merchant.email}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="contact">
            <AccordionTrigger>Contact Information</AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label className="font-medium">Phone</Label>
                  <div className="flex items-center gap-2">
                    {editMode.phone ? (
                      <>
                        <Input
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleSave('phone')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('phone')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="text-sm text-gray-700 flex-1">
                          {merchant.formData?.phone}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('phone')}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className="font-medium">Address</Label>
                  <div className="flex items-center gap-2">
                    {editMode['companyAddress.street'] ? (
                      <>
                        <Input
                          value={formData.companyAddress.street}
                          onChange={(e) => handleInputChange('companyAddress.street', e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleSave('companyAddress.street')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('companyAddress.street')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="text-sm text-gray-700 flex-1">
                          {merchant.formData?.companyAddress?.street}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('companyAddress.street')}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {editMode['companyAddress.city'] ? (
                      <>
                        <Input
                          value={formData.companyAddress.city}
                          onChange={(e) => handleInputChange('companyAddress.city', e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleSave('companyAddress.city')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('companyAddress.city')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="text-sm text-gray-700 flex-1">
                          {merchant.formData?.companyAddress?.city}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('companyAddress.city')}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {editMode['companyAddress.state'] ? (
                      <>
                        <Input
                          value={formData.companyAddress.state}
                          onChange={(e) => handleInputChange('companyAddress.state', e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleSave('companyAddress.state')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('companyAddress.state')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="text-sm text-gray-700 flex-1">
                          {merchant.formData?.companyAddress?.state}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('companyAddress.state')}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {editMode['companyAddress.zipCode'] ? (
                      <>
                        <Input
                          value={formData.companyAddress.zipCode}
                          onChange={(e) => handleInputChange('companyAddress.zipCode', e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleSave('companyAddress.zipCode')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('companyAddress.zipCode')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="text-sm text-gray-700 flex-1">
                          {merchant.formData?.companyAddress?.zipCode}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('companyAddress.zipCode')}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="business">
            <AccordionTrigger>Business Details</AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label className="font-medium">Business Type</Label>
                  <div className="flex items-center gap-2">
                    {editMode.businessType ? (
                      <>
                        <Input
                          value={formData.businessType}
                          onChange={(e) => handleInputChange('businessType', e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleSave('businessType')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('businessType')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="text-sm text-gray-700 flex-1">
                          {merchant.formData?.businessType}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('businessType')}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className="font-medium">Tax ID</Label>
                  <div className="flex items-center gap-2">
                    {editMode.taxId ? (
                      <>
                        <Input
                          value={formData.taxId}
                          onChange={(e) => handleInputChange('taxId', e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleSave('taxId')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('taxId')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="text-sm text-gray-700 flex-1">
                          {merchant.formData?.taxId}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('taxId')}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="banking">
            <AccordionTrigger>Banking Information</AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label className="font-medium">Bank Name</Label>
                  <div className="flex items-center gap-2">
                    {editMode['bankDetails.bankName'] ? (
                      <>
                        <Input
                          value={formData.bankDetails.bankName}
                          onChange={(e) => handleInputChange('bankDetails.bankName', e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleSave('bankDetails.bankName')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('bankDetails.bankName')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="text-sm text-gray-700 flex-1">
                          {merchant.formData?.bankDetails?.bankName}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('bankDetails.bankName')}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label className="font-medium">Routing Number</Label>
                  <div className="flex items-center gap-2">
                    {editMode['bankDetails.routingNumber'] ? (
                      <>
                        <Input
                          value={formData.bankDetails.routingNumber}
                          onChange={(e) => handleInputChange('bankDetails.routingNumber', e.target.value)}
                          className="flex-1"
                          maxLength={9}
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleSave('bankDetails.routingNumber')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('bankDetails.routingNumber')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="text-sm text-gray-700 flex-1">
                          {merchant.formData?.bankDetails?.routingNumber}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('bankDetails.routingNumber')}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label className="font-medium">Account Number</Label>
                  <div className="flex items-center gap-2">
                    {editMode['bankDetails.accountNumber'] ? (
                      <>
                        <Input
                          value={formData.bankDetails.accountNumber}
                          onChange={(e) => handleInputChange('bankDetails.accountNumber', e.target.value)}
                          className="flex-1"
                          type="password"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleSave('bankDetails.accountNumber')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('bankDetails.accountNumber')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="text-sm text-gray-700 flex-1">
                          {merchant.formData?.bankDetails?.accountNumber ? '••••••••' : ''}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('bankDetails.accountNumber')}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="beneficialOwners">
            <AccordionTrigger>Beneficial Owners</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                {formData.beneficialOwners.map((owner, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-2">
                    <div className="grid gap-2">
                      <Label className="font-medium">Owner {index + 1}</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm">First Name</Label>
                          <div className="flex items-center gap-2">
                            {editMode[`beneficialOwners.${index}.firstName`] ? (
                              <>
                                <Input
                                  value={owner.firstName}
                                  onChange={(e) => {
                                    const newOwners = [...formData.beneficialOwners];
                                    newOwners[index] = { ...owner, firstName: e.target.value };
                                    setFormData(prev => ({ ...prev, beneficialOwners: newOwners }));
                                  }}
                                  className="flex-1"
                                />
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleSave(`beneficialOwners.${index}.firstName`)}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => toggleEdit(`beneficialOwners.${index}.firstName`)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <div className="text-sm text-gray-700 flex-1">
                                  {owner.firstName}
                                </div>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => toggleEdit(`beneficialOwners.${index}.firstName`)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm">Last Name</Label>
                          <div className="flex items-center gap-2">
                            {editMode[`beneficialOwners.${index}.lastName`] ? (
                              <>
                                <Input
                                  value={owner.lastName}
                                  onChange={(e) => {
                                    const newOwners = [...formData.beneficialOwners];
                                    newOwners[index] = { ...owner, lastName: e.target.value };
                                    setFormData(prev => ({ ...prev, beneficialOwners: newOwners }));
                                  }}
                                  className="flex-1"
                                />
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleSave(`beneficialOwners.${index}.lastName`)}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => toggleEdit(`beneficialOwners.${index}.lastName`)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <div className="text-sm text-gray-700 flex-1">
                                  {owner.lastName}
                                </div>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => toggleEdit(`beneficialOwners.${index}.lastName`)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
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
