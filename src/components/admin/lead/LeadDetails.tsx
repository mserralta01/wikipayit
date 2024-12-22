import React, { useState, ChangeEvent } from "react"
import { CommunicationsSection } from "./CommunicationsSection"
import { PricingSection } from "./PricingSection"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Merchant, 
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

  // Type guards for field types
  const isProcessingHistoryField = (field: string): boolean => field.startsWith('processingHistory.')
  const isCompanyAddressField = (field: string): boolean => field.startsWith('companyAddress.')
  const isBankDetailsField = (field: string): boolean => field.startsWith('bankDetails.')
  const isBeneficialOwnersField = (field: string): boolean => field.startsWith('beneficialOwners.')
  // Determine collection based on kind
  const collection = merchant.kind === 'lead' ? 'leads' : 'merchants'
  const [editMode, setEditMode] = useState<{ [key: string]: boolean }>({})
  const defaultProcessingHistory: ProcessingHistory = {
    averageTicket: '',
    cardPresentPercentage: '',
    currentProcessor: '',
    ecommercePercentage: '',
    hasBeenTerminated: 'no',
    highTicket: '',
    isCurrentlyProcessing: 'no',
    monthlyVolume: '',
    terminationExplanation: ''
  }

  const [formData, setFormData] = useState<FormData>(() => {
    const initialFormData: FormData = {
      businessName: merchant.formData?.businessName || merchant.businessName || '',
      dba: merchant.formData?.dba || '',
      phone: merchant.formData?.phone || '',
      businessType: merchant.formData?.businessType || '',
      taxId: merchant.formData?.taxId || '',
      businessDescription: merchant.formData?.businessDescription || '',
      yearEstablished: merchant.formData?.yearEstablished || '',
      website: merchant.formData?.website || '',
      customerServiceEmail: merchant.formData?.customerServiceEmail || '',
      customerServicePhone: merchant.formData?.customerServicePhone || '',
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
      processingHistory: {
        ...defaultProcessingHistory,
        ...(merchant.processingHistory || {}),
      },
      beneficialOwners: merchant.beneficialOwners || merchant.formData?.beneficialOwners?.owners || []
    }
    return initialFormData
  })

  const toggleEdit = (field: string): void => {
    setEditMode(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const handleInputChange = (field: string, value: string | number): void => {
    if (field.startsWith('processingHistory.')) {
      const historyField = field.split('.')[1] as keyof ProcessingHistory
      setFormData(prev => {
        const processingHistory: ProcessingHistory = prev.processingHistory || {
          averageTicket: '',
          cardPresentPercentage: '',
          currentProcessor: '',
          ecommercePercentage: '',
          hasBeenTerminated: 'no',
          highTicket: '',
          isCurrentlyProcessing: 'no',
          monthlyVolume: '',
          terminationExplanation: ''
        }
        return {
          ...prev,
          processingHistory: {
            ...processingHistory,
            [historyField]: value
          }
        }
      })
    } else if (field.startsWith('companyAddress.')) {
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

      if (isProcessingHistoryField(field)) {
        const historyField = field.split('.')[1] as keyof ProcessingHistory
        const processingHistory: ProcessingHistory = formData.processingHistory || {
          averageTicket: '',
          cardPresentPercentage: '',
          currentProcessor: '',
          ecommercePercentage: '',
          hasBeenTerminated: 'no',
          highTicket: '',
          isCurrentlyProcessing: 'no',
          monthlyVolume: '',
          terminationExplanation: ''
        }
        const value = processingHistory[historyField]

        updateData = {
          [`processingHistory.${historyField}`]: value ?? '',
          updatedAt: Timestamp.fromDate(new Date())
        }

        // Update Firestore
        await updateDoc(doc(db, collection, merchant.id), updateData)

        // Update local merchant state with type safety
        setMerchant((prev) => {
          const updatedMerchant = { ...prev }
          if (!updatedMerchant.processingHistory) {
            updatedMerchant.processingHistory = {} as ProcessingHistory
          }
          updatedMerchant.processingHistory = {
            ...updatedMerchant.processingHistory,
            [historyField]: value,
            updatedAt: Timestamp.fromDate(new Date())
          }
          return updatedMerchant
        })

        setEditMode(prev => ({ ...prev, [field]: false }))
        toast({
          title: "Success",
          description: "Field updated successfully.",
        })
        return
      }

      // Handle other fields
      if (isCompanyAddressField(field)) {
        const addressField = field.split('.')[1] as keyof typeof formData.companyAddress
        updateData = {
          [`formData.companyAddress.${addressField}`]: formData.companyAddress[addressField]
        }
        localUpdateData = {
          companyAddress: {
            ...formData.companyAddress
          }
        }
      } else if (isBankDetailsField(field)) {
        const bankField = field.split('.')[1] as keyof typeof formData.bankDetails
        updateData = {
          [`formData.bankDetails.${bankField}`]: formData.bankDetails[bankField]
        }
        localUpdateData = {
          bankDetails: {
            ...formData.bankDetails
          }
        }
      } else if (isBeneficialOwnersField(field)) {
        const [, index, subfield] = field.split('.')
        const owners = [...formData.beneficialOwners].map((owner): BeneficialOwner => ({
          firstName: owner.firstName,
          lastName: owner.lastName,
          phone: owner.phone || '',
          email: owner.email || '',
          title: owner.title || '',
          ownershipPercentage: owner.ownershipPercentage || '0',
          dateOfBirth: owner.dateOfBirth || '',
          ssn: owner.ssn || '',
          address: owner.address || '',
          city: owner.city || '',
          state: owner.state || '',
          zipCode: owner.zipCode || ''
        }))
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

      // Update document
      const collectionPath = merchant.kind === 'lead' ? 'leads' : 'merchants'
      await updateDoc(doc(db, collectionPath, merchant.id), {
        ...updateData,
        updatedAt: Timestamp.fromDate(new Date())
      })

      // Update local merchant state
      setMerchant(prev => {
        const updatedMerchant = { ...prev }
        const newFormData = updatedMerchant.formData ? { ...updatedMerchant.formData } : {}

        if (isCompanyAddressField(field)) {
          const addressField = field.split('.')[1] as keyof typeof formData.companyAddress
          newFormData.companyAddress = {
            ...(newFormData.companyAddress || {}),
            [addressField]: formData.companyAddress[addressField]
          }
        } else if (isBankDetailsField(field)) {
          const bankField = field.split('.')[1] as keyof typeof formData.bankDetails
          newFormData.bankDetails = {
            ...(newFormData.bankDetails || {
              bankName: '',
              routingNumber: '',
              accountNumber: '',
              confirmAccountNumber: ''
            }),
            [bankField]: formData.bankDetails[bankField]
          }
        } else if (isBeneficialOwnersField(field)) {
          updatedMerchant.beneficialOwners = formData.beneficialOwners.map((owner): BeneficialOwner => ({
            firstName: owner.firstName,
            lastName: owner.lastName,
            phone: owner.phone || '',
            email: owner.email || '',
            title: owner.title || '',
            ownershipPercentage: owner.ownershipPercentage || '0',
            dateOfBirth: owner.dateOfBirth || '',
            ssn: owner.ssn || '',
            address: owner.address || '',
            city: owner.city || '',
            state: owner.state || '',
            zipCode: owner.zipCode || ''
          }))
        } else {
          if (field in formData) {
            const value = formData[field as keyof typeof formData]
            if (value !== undefined) {
              (newFormData as any)[field] = value
            }
          }
        }

        const updatedFormData = {
          ...updatedMerchant.formData,
          ...newFormData
        }

        return {
          ...updatedMerchant,
          formData: updatedFormData,
          updatedAt: Timestamp.fromDate(new Date())
        }
      })

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
      const collectionPath = merchant.kind === 'lead' ? 'leads' : 'merchants'
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

          <AccordionItem value="additionalBusiness">
            <AccordionTrigger>Additional Business Information</AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label className="font-medium">Business Description</Label>
                  <div className="flex items-center gap-2">
                    {editMode.businessDescription ? (
                      <>
                        <Input
                          value={formData.businessDescription}
                          onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleSave('businessDescription')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('businessDescription')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="text-sm text-gray-700 flex-1">
                          {merchant.formData?.businessDescription}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('businessDescription')}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className="font-medium">Year Established</Label>
                  <div className="flex items-center gap-2">
                    {editMode.yearEstablished ? (
                      <>
                        <Input
                          value={formData.yearEstablished}
                          onChange={(e) => handleInputChange('yearEstablished', e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleSave('yearEstablished')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('yearEstablished')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="text-sm text-gray-700 flex-1">
                          {merchant.formData?.yearEstablished}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('yearEstablished')}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className="font-medium">Website</Label>
                  <div className="flex items-center gap-2">
                    {editMode.website ? (
                      <>
                        <Input
                          value={formData.website}
                          onChange={(e) => handleInputChange('website', e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleSave('website')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('website')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="text-sm text-gray-700 flex-1">
                          {merchant.formData?.website}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('website')}
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

          <AccordionItem value="processingHistory">
            <AccordionTrigger>Processing History</AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label className="font-medium">Average Ticket</Label>
                  <div className="flex items-center gap-2">
                    {editMode['processingHistory.averageTicket'] ? (
                      <>
                        <Input
                          type="number"
                          value={formData.processingHistory.averageTicket}
                          onChange={(e) => handleInputChange('processingHistory.averageTicket', e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleSave('processingHistory.averageTicket')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('processingHistory.averageTicket')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="text-sm text-gray-700 flex-1">
                          {merchant.processingHistory?.averageTicket}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('processingHistory.averageTicket')}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label className="font-medium">Card Present Percentage</Label>
                  <div className="flex items-center gap-2">
                    {editMode['processingHistory.cardPresentPercentage'] ? (
                      <>
                        <Input
                          type="number"
                          value={formData.processingHistory.cardPresentPercentage}
                          onChange={(e) => handleInputChange('processingHistory.cardPresentPercentage', e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleSave('processingHistory.cardPresentPercentage')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('processingHistory.cardPresentPercentage')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="text-sm text-gray-700 flex-1">
                          {merchant.processingHistory?.cardPresentPercentage}%
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('processingHistory.cardPresentPercentage')}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label className="font-medium">Current Processor</Label>
                  <div className="flex items-center gap-2">
                    {editMode['processingHistory.currentProcessor'] ? (
                      <>
                        <Input
                          value={formData.processingHistory.currentProcessor}
                          onChange={(e) => handleInputChange('processingHistory.currentProcessor', e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleSave('processingHistory.currentProcessor')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('processingHistory.currentProcessor')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="text-sm text-gray-700 flex-1">
                          {merchant.processingHistory?.currentProcessor}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('processingHistory.currentProcessor')}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label className="font-medium">Ecommerce Percentage</Label>
                  <div className="flex items-center gap-2">
                    {editMode['processingHistory.ecommercePercentage'] ? (
                      <>
                        <Input
                          type="number"
                          value={formData.processingHistory.ecommercePercentage}
                          onChange={(e) => handleInputChange('processingHistory.ecommercePercentage', e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleSave('processingHistory.ecommercePercentage')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('processingHistory.ecommercePercentage')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="text-sm text-gray-700 flex-1">
                          {merchant.processingHistory?.ecommercePercentage}%
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('processingHistory.ecommercePercentage')}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label className="font-medium">Has Been Terminated</Label>
                  <div className="flex items-center gap-2">
                    {editMode['processingHistory.hasBeenTerminated'] ? (
                      <>
                        <Select
                          value={formData.processingHistory.hasBeenTerminated}
                          onValueChange={(value) => handleInputChange('processingHistory.hasBeenTerminated', value)}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleSave('processingHistory.hasBeenTerminated')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('processingHistory.hasBeenTerminated')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="text-sm text-gray-700 flex-1">
                          {merchant.processingHistory?.hasBeenTerminated}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('processingHistory.hasBeenTerminated')}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label className="font-medium">High Ticket</Label>
                  <div className="flex items-center gap-2">
                    {editMode['processingHistory.highTicket'] ? (
                      <>
                        <Input
                          type="number"
                          value={formData.processingHistory.highTicket}
                          onChange={(e) => handleInputChange('processingHistory.highTicket', e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleSave('processingHistory.highTicket')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('processingHistory.highTicket')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="text-sm text-gray-700 flex-1">
                          {merchant.processingHistory?.highTicket}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('processingHistory.highTicket')}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label className="font-medium">Is Currently Processing</Label>
                  <div className="flex items-center gap-2">
                    {editMode['processingHistory.isCurrentlyProcessing'] ? (
                      <>
                        <Select
                          value={formData.processingHistory.isCurrentlyProcessing}
                          onValueChange={(value) => handleInputChange('processingHistory.isCurrentlyProcessing', value)}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleSave('processingHistory.isCurrentlyProcessing')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('processingHistory.isCurrentlyProcessing')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="text-sm text-gray-700 flex-1">
                          {merchant.processingHistory?.isCurrentlyProcessing}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('processingHistory.isCurrentlyProcessing')}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label className="font-medium">Monthly Volume</Label>
                  <div className="flex items-center gap-2">
                    {editMode['processingHistory.monthlyVolume'] ? (
                      <>
                        <Input
                          type="number"
                          value={formData.processingHistory.monthlyVolume}
                          onChange={(e) => handleInputChange('processingHistory.monthlyVolume', e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleSave('processingHistory.monthlyVolume')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('processingHistory.monthlyVolume')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="text-sm text-gray-700 flex-1">
                          {merchant.processingHistory?.monthlyVolume}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('processingHistory.monthlyVolume')}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label className="font-medium">Termination Explanation</Label>
                  <div className="flex items-center gap-2">
                    {editMode['processingHistory.terminationExplanation'] ? (
                      <>
                        <Textarea
                          value={formData.processingHistory.terminationExplanation}
                          onChange={(e) => handleInputChange('processingHistory.terminationExplanation', e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleSave('processingHistory.terminationExplanation')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('processingHistory.terminationExplanation')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="text-sm text-gray-700 flex-1">
                          {merchant.processingHistory?.terminationExplanation}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('processingHistory.terminationExplanation')}
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

                        <div>
                          <Label className="text-sm">Title</Label>
                          <div className="flex items-center gap-2">
                            {editMode[`beneficialOwners.${index}.title`] ? (
                              <>
                                <Input
                                  value={owner.title}
                                  onChange={(e) => {
                                    const newOwners = [...formData.beneficialOwners];
                                    newOwners[index] = { ...owner, title: e.target.value };
                                    setFormData(prev => ({ ...prev, beneficialOwners: newOwners }));
                                  }}
                                  className="flex-1"
                                />
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleSave(`beneficialOwners.${index}.title`)}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => toggleEdit(`beneficialOwners.${index}.title`)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <div className="text-sm text-gray-700 flex-1">
                                  {owner.title}
                                </div>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => toggleEdit(`beneficialOwners.${index}.title`)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm">Date of Birth</Label>
                          <div className="flex items-center gap-2">
                            {editMode[`beneficialOwners.${index}.dateOfBirth`] ? (
                              <>
                                <Input
                                  type="date"
                                  value={owner.dateOfBirth}
                                  onChange={(e) => {
                                    const newOwners = [...formData.beneficialOwners];
                                    newOwners[index] = { ...owner, dateOfBirth: e.target.value };
                                    setFormData(prev => ({ ...prev, beneficialOwners: newOwners }));
                                  }}
                                  className="flex-1"
                                />
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleSave(`beneficialOwners.${index}.dateOfBirth`)}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => toggleEdit(`beneficialOwners.${index}.dateOfBirth`)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <div className="text-sm text-gray-700 flex-1">
                                  {owner.dateOfBirth}
                                </div>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => toggleEdit(`beneficialOwners.${index}.dateOfBirth`)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm">SSN</Label>
                          <div className="flex items-center gap-2">
                            {editMode[`beneficialOwners.${index}.ssn`] ? (
                              <>
                                <Input
                                  type="password"
                                  value={owner.ssn}
                                  onChange={(e) => {
                                    const newOwners = [...formData.beneficialOwners];
                                    newOwners[index] = { ...owner, ssn: e.target.value };
                                    setFormData(prev => ({ ...prev, beneficialOwners: newOwners }));
                                  }}
                                  className="flex-1"
                                  pattern="\d{3}-\d{2}-\d{4}"
                                  placeholder="XXX-XX-XXXX"
                                />
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleSave(`beneficialOwners.${index}.ssn`)}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => toggleEdit(`beneficialOwners.${index}.ssn`)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <div className="text-sm text-gray-700 flex-1">
                                  {owner.ssn ? "XXX-XX-" + owner.ssn.slice(-4) : ""}
                                </div>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => toggleEdit(`beneficialOwners.${index}.ssn`)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm">Address</Label>
                          <div className="flex items-center gap-2">
                            {editMode[`beneficialOwners.${index}.address`] ? (
                              <>
                                <Input
                                  value={owner.address}
                                  onChange={(e) => {
                                    const newOwners = [...formData.beneficialOwners];
                                    newOwners[index] = { ...owner, address: e.target.value };
                                    setFormData(prev => ({ ...prev, beneficialOwners: newOwners }));
                                  }}
                                  className="flex-1"
                                />
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleSave(`beneficialOwners.${index}.address`)}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => toggleEdit(`beneficialOwners.${index}.address`)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <div className="text-sm text-gray-700 flex-1">
                                  {owner.address}
                                </div>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => toggleEdit(`beneficialOwners.${index}.address`)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm">City</Label>
                          <div className="flex items-center gap-2">
                            {editMode[`beneficialOwners.${index}.city`] ? (
                              <>
                                <Input
                                  value={owner.city}
                                  onChange={(e) => {
                                    const newOwners = [...formData.beneficialOwners];
                                    newOwners[index] = { ...owner, city: e.target.value };
                                    setFormData(prev => ({ ...prev, beneficialOwners: newOwners }));
                                  }}
                                  className="flex-1"
                                />
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleSave(`beneficialOwners.${index}.city`)}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => toggleEdit(`beneficialOwners.${index}.city`)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <div className="text-sm text-gray-700 flex-1">
                                  {owner.city}
                                </div>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => toggleEdit(`beneficialOwners.${index}.city`)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm">State</Label>
                          <div className="flex items-center gap-2">
                            {editMode[`beneficialOwners.${index}.state`] ? (
                              <>
                                <Input
                                  value={owner.state}
                                  onChange={(e) => {
                                    const newOwners = [...formData.beneficialOwners];
                                    newOwners[index] = { ...owner, state: e.target.value };
                                    setFormData(prev => ({ ...prev, beneficialOwners: newOwners }));
                                  }}
                                  className="flex-1"
                                  maxLength={2}
                                  placeholder="FL"
                                />
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleSave(`beneficialOwners.${index}.state`)}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => toggleEdit(`beneficialOwners.${index}.state`)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <div className="text-sm text-gray-700 flex-1">
                                  {owner.state}
                                </div>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => toggleEdit(`beneficialOwners.${index}.state`)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm">ZIP Code</Label>
                          <div className="flex items-center gap-2">
                            {editMode[`beneficialOwners.${index}.zipCode`] ? (
                              <>
                                <Input
                                  value={owner.zipCode}
                                  onChange={(e) => {
                                    const newOwners = [...formData.beneficialOwners];
                                    newOwners[index] = { ...owner, zipCode: e.target.value };
                                    setFormData(prev => ({ ...prev, beneficialOwners: newOwners }));
                                  }}
                                  className="flex-1"
                                  pattern="\d{5}(-\d{4})?"
                                  placeholder="12345"
                                />
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleSave(`beneficialOwners.${index}.zipCode`)}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => toggleEdit(`beneficialOwners.${index}.zipCode`)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <div className="text-sm text-gray-700 flex-1">
                                  {owner.zipCode}
                                </div>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => toggleEdit(`beneficialOwners.${index}.zipCode`)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm">Phone</Label>
                          <div className="flex items-center gap-2">
                            {editMode[`beneficialOwners.${index}.phone`] ? (
                              <>
                                <Input
                                  type="tel"
                                  value={owner.phone}
                                  onChange={(e) => {
                                    const newOwners = [...formData.beneficialOwners];
                                    newOwners[index] = { ...owner, phone: e.target.value };
                                    setFormData(prev => ({ ...prev, beneficialOwners: newOwners }));
                                  }}
                                  className="flex-1"
                                  placeholder="(123) 456-7890"
                                />
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleSave(`beneficialOwners.${index}.phone`)}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => toggleEdit(`beneficialOwners.${index}.phone`)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <div className="text-sm text-gray-700 flex-1">
                                  {owner.phone}
                                </div>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => toggleEdit(`beneficialOwners.${index}.phone`)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm">Email</Label>
                          <div className="flex items-center gap-2">
                            {editMode[`beneficialOwners.${index}.email`] ? (
                              <>
                                <Input
                                  type="email"
                                  value={owner.email}
                                  onChange={(e) => {
                                    const newOwners = [...formData.beneficialOwners];
                                    newOwners[index] = { ...owner, email: e.target.value };
                                    setFormData(prev => ({ ...prev, beneficialOwners: newOwners }));
                                  }}
                                  className="flex-1"
                                />
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleSave(`beneficialOwners.${index}.email`)}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => toggleEdit(`beneficialOwners.${index}.email`)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <div className="text-sm text-gray-700 flex-1">
                                  {owner.email}
                                </div>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => toggleEdit(`beneficialOwners.${index}.email`)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm">Ownership Percentage</Label>
                          <div className="flex items-center gap-2">
                            {editMode[`beneficialOwners.${index}.ownershipPercentage`] ? (
                              <>
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={owner.ownershipPercentage}
                                  onChange={(e) => {
                                    const newOwners = [...formData.beneficialOwners];
                                    newOwners[index] = { ...owner, ownershipPercentage: e.target.value };
                                    setFormData(prev => ({ ...prev, beneficialOwners: newOwners }));
                                  }}
                                  className="flex-1"
                                />
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleSave(`beneficialOwners.${index}.ownershipPercentage`)}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => toggleEdit(`beneficialOwners.${index}.ownershipPercentage`)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <div className="text-sm text-gray-700 flex-1">
                                  {owner.ownershipPercentage}%
                                </div>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => toggleEdit(`beneficialOwners.${index}.ownershipPercentage`)}
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

          <AccordionItem value="customerService">
            <AccordionTrigger>Customer Service</AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label className="font-medium">Customer Service Email</Label>
                  <div className="flex items-center gap-2">
                    {editMode.customerServiceEmail ? (
                      <>
                        <Input
                          value={formData.customerServiceEmail}
                          onChange={(e) => handleInputChange('customerServiceEmail', e.target.value)}
                          className="flex-1"
                          type="email"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleSave('customerServiceEmail')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('customerServiceEmail')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="text-sm text-gray-700 flex-1">
                          {merchant.formData?.customerServiceEmail}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('customerServiceEmail')}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className="font-medium">Customer Service Phone</Label>
                  <div className="flex items-center gap-2">
                    {editMode.customerServicePhone ? (
                      <>
                        <Input
                          value={formData.customerServicePhone}
                          onChange={(e) => handleInputChange('customerServicePhone', e.target.value)}
                          className="flex-1"
                          type="tel"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleSave('customerServicePhone')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('customerServicePhone')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="text-sm text-gray-700 flex-1">
                          {merchant.formData?.customerServicePhone}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('customerServicePhone')}
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

          <AccordionItem value="processingHistory">
            <AccordionTrigger>Processing History</AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label className="font-medium">Average Ticket</Label>
                  <div className="flex items-center gap-2">
                    {editMode['processingHistory.averageTicket'] ? (
                      <>
                        <Input
                          value={formData.processingHistory?.averageTicket ?? ''}
                          onChange={(e) => handleInputChange('processingHistory.averageTicket', e.target.value)}
                          className="flex-1"
                          type="number"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleSave('processingHistory.averageTicket')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('processingHistory.averageTicket')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="text-sm text-gray-700 flex-1">
                          {merchant.processingHistory?.averageTicket}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('processingHistory.averageTicket')}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label className="font-medium">Card Present Percentage</Label>
                  <div className="flex items-center gap-2">
                    {editMode['processingHistory.cardPresentPercentage'] ? (
                      <>
                        <Input
                          value={formData.processingHistory.cardPresentPercentage}
                          onChange={(e) => handleInputChange('processingHistory.cardPresentPercentage', e.target.value)}
                          className="flex-1"
                          type="number"
                          min="0"
                          max="100"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleSave('processingHistory.cardPresentPercentage')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('processingHistory.cardPresentPercentage')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="text-sm text-gray-700 flex-1">
                          {merchant.processingHistory?.cardPresentPercentage}%
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('processingHistory.cardPresentPercentage')}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label className="font-medium">Current Processor</Label>
                  <div className="flex items-center gap-2">
                    {editMode['processingHistory.currentProcessor'] ? (
                      <>
                        <Input
                          value={formData.processingHistory.currentProcessor}
                          onChange={(e) => handleInputChange('processingHistory.currentProcessor', e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleSave('processingHistory.currentProcessor')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('processingHistory.currentProcessor')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="text-sm text-gray-700 flex-1">
                          {merchant.processingHistory?.currentProcessor}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('processingHistory.currentProcessor')}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label className="font-medium">E-commerce Percentage</Label>
                  <div className="flex items-center gap-2">
                    {editMode['processingHistory.ecommercePercentage'] ? (
                      <>
                        <Input
                          value={formData.processingHistory.ecommercePercentage}
                          onChange={(e) => handleInputChange('processingHistory.ecommercePercentage', e.target.value)}
                          className="flex-1"
                          type="number"
                          min="0"
                          max="100"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleSave('processingHistory.ecommercePercentage')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('processingHistory.ecommercePercentage')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="text-sm text-gray-700 flex-1">
                          {merchant.processingHistory?.ecommercePercentage}%
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('processingHistory.ecommercePercentage')}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label className="font-medium">Has Been Terminated</Label>
                  <div className="flex items-center gap-2">
                    {editMode['processingHistory.hasBeenTerminated'] ? (
                      <>
                        <Select
                          defaultValue={formData.processingHistory.hasBeenTerminated}
                          onValueChange={(value) => handleInputChange('processingHistory.hasBeenTerminated', value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleSave('processingHistory.hasBeenTerminated')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('processingHistory.hasBeenTerminated')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="text-sm text-gray-700 flex-1">
                          {merchant.processingHistory?.hasBeenTerminated}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('processingHistory.hasBeenTerminated')}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {formData.processingHistory.hasBeenTerminated === 'yes' && (
                  <div className="grid gap-2">
                    <Label className="font-medium">Termination Explanation</Label>
                    <div className="flex items-center gap-2">
                      {editMode['processingHistory.terminationExplanation'] ? (
                        <>
                          <Input
                            value={formData.processingHistory.terminationExplanation}
                            onChange={(e) => handleInputChange('processingHistory.terminationExplanation', e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleSave('processingHistory.terminationExplanation')}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => toggleEdit('processingHistory.terminationExplanation')}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <div className="text-sm text-gray-700 flex-1">
                            {merchant.processingHistory?.terminationExplanation}
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => toggleEdit('processingHistory.terminationExplanation')}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid gap-2">
                  <Label className="font-medium">High Ticket</Label>
                  <div className="flex items-center gap-2">
                    {editMode['processingHistory.highTicket'] ? (
                      <>
                        <Input
                          value={formData.processingHistory.highTicket}
                          onChange={(e) => handleInputChange('processingHistory.highTicket', e.target.value)}
                          className="flex-1"
                          type="number"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleSave('processingHistory.highTicket')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('processingHistory.highTicket')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="text-sm text-gray-700 flex-1">
                          {merchant.processingHistory?.highTicket}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('processingHistory.highTicket')}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label className="font-medium">Currently Processing</Label>
                  <div className="flex items-center gap-2">
                    {editMode['processingHistory.isCurrentlyProcessing'] ? (
                      <>
                        <Select
                          defaultValue={formData.processingHistory.isCurrentlyProcessing}
                          onValueChange={(value) => handleInputChange('processingHistory.isCurrentlyProcessing', value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleSave('processingHistory.isCurrentlyProcessing')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('processingHistory.isCurrentlyProcessing')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="text-sm text-gray-700 flex-1">
                          {merchant.processingHistory?.isCurrentlyProcessing}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('processingHistory.isCurrentlyProcessing')}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label className="font-medium">Monthly Volume</Label>
                  <div className="flex items-center gap-2">
                    {editMode['processingHistory.monthlyVolume'] ? (
                      <>
                        <Input
                          value={formData.processingHistory.monthlyVolume}
                          onChange={(e) => handleInputChange('processingHistory.monthlyVolume', e.target.value)}
                          className="flex-1"
                          type="number"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleSave('processingHistory.monthlyVolume')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('processingHistory.monthlyVolume')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="text-sm text-gray-700 flex-1">
                          {merchant.processingHistory?.monthlyVolume}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('processingHistory.monthlyVolume')}
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

          <AccordionItem value="processingHistory">
            <AccordionTrigger>Processing History</AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label className="font-medium">Average Ticket</Label>
                  <div className="flex items-center gap-2">
                    {editMode['processingHistory.averageTicket'] ? (
                      <>
                        <Input
                          type="number"
                          value={formData.processingHistory.averageTicket}
                          onChange={(e) =>
                            handleInputChange('processingHistory.averageTicket', e.target.value)
                          }
                          className="flex-1"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleSave('averageTicket')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('averageTicket')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="text-sm text-gray-700 flex-1">
                          {merchant.processingHistory?.averageTicket || 'Not set'}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('averageTicket')}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label className="font-medium">Card Present Percentage</Label>
                  <div className="flex items-center gap-2">
                    {editMode.cardPresentPercentage ? (
                      <>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={formData.processingHistory.cardPresentPercentage}
                          onChange={(e) =>
                            handleInputChange('processingHistory.cardPresentPercentage', e.target.value)
                          }
                          className="flex-1"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleSave('cardPresentPercentage')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('cardPresentPercentage')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="text-sm text-gray-700 flex-1">
                          {merchant.processingHistory?.cardPresentPercentage || 'Not set'}%
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('cardPresentPercentage')}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label className="font-medium">Current Processor</Label>
                  <div className="flex items-center gap-2">
                    {editMode.currentProcessor ? (
                      <>
                        <Input
                          value={formData.processingHistory.currentProcessor}
                          onChange={(e) =>
                            handleInputChange('processingHistory.currentProcessor', e.target.value)
                          }
                          className="flex-1"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleSave('currentProcessor')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('currentProcessor')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="text-sm text-gray-700 flex-1">
                          {merchant.processingHistory?.currentProcessor || 'Not set'}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('currentProcessor')}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label className="font-medium">Ecommerce Percentage</Label>
                  <div className="flex items-center gap-2">
                    {editMode.ecommercePercentage ? (
                      <>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={formData.processingHistory.ecommercePercentage}
                          onChange={(e) =>
                            handleInputChange('processingHistory.ecommercePercentage', e.target.value)
                          }
                          className="flex-1"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleSave('ecommercePercentage')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('ecommercePercentage')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="text-sm text-gray-700 flex-1">
                          {merchant.processingHistory?.ecommercePercentage || 'Not set'}%
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('ecommercePercentage')}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label className="font-medium">Currently Processing?</Label>
                  <div className="flex items-center gap-2">
                    {editMode['processingHistory.isCurrentlyProcessing'] ? (
                      <>
                        <Select
                          value={formData.processingHistory?.isCurrentlyProcessing ?? 'no'}
                          onValueChange={(value) =>
                            handleInputChange('processingHistory.isCurrentlyProcessing', value)
                          }
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleSave('processingHistory.isCurrentlyProcessing')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('processingHistory.isCurrentlyProcessing')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="text-sm text-gray-700 flex-1">
                          {merchant.processingHistory?.isCurrentlyProcessing || 'Not set'}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('isCurrentlyProcessing')}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label className="font-medium">Has Been Terminated?</Label>
                  <div className="flex items-center gap-2">
                    {editMode['processingHistory.hasBeenTerminated'] ? (
                      <>
                        <Select
                          value={formData.processingHistory?.hasBeenTerminated ?? 'no'}
                          onValueChange={(value) =>
                            handleInputChange('processingHistory.hasBeenTerminated', value)
                          }
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleSave('processingHistory.hasBeenTerminated')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('processingHistory.hasBeenTerminated')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="text-sm text-gray-700 flex-1">
                          {merchant.processingHistory?.hasBeenTerminated || 'Not set'}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('processingHistory.hasBeenTerminated')}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {formData.processingHistory?.hasBeenTerminated === 'yes' && (
                  <div className="grid gap-2">
                    <Label className="font-medium">Termination Explanation</Label>
                    <div className="flex items-center gap-2">
                      {editMode.terminationExplanation ? (
                        <>
                          <Textarea
                            value={formData.processingHistory.terminationExplanation}
                            onChange={(e) =>
                              handleInputChange('processingHistory.terminationExplanation', e.target.value)
                            }
                            className="flex-1"
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleSave('terminationExplanation')}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => toggleEdit('terminationExplanation')}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <div className="text-sm text-gray-700 flex-1">
                            {merchant.processingHistory?.terminationExplanation || 'Not set'}
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => toggleEdit('terminationExplanation')}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid gap-2">
                  <Label className="font-medium">High Ticket</Label>
                  <div className="flex items-center gap-2">
                    {editMode.highTicket ? (
                      <>
                        <Input
                          type="number"
                          value={formData.processingHistory.highTicket}
                          onChange={(e) =>
                            handleInputChange('processingHistory.highTicket', e.target.value)
                          }
                          className="flex-1"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleSave('highTicket')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('highTicket')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="text-sm text-gray-700 flex-1">
                          {merchant.processingHistory?.highTicket || 'Not set'}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('highTicket')}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label className="font-medium">Monthly Volume</Label>
                  <div className="flex items-center gap-2">
                    {editMode.monthlyVolume ? (
                      <>
                        <Input
                          type="number"
                          value={formData.processingHistory.monthlyVolume}
                          onChange={(e) =>
                            handleInputChange('processingHistory.monthlyVolume', e.target.value)
                          }
                          className="flex-1"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleSave('monthlyVolume')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('monthlyVolume')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="text-sm text-gray-700 flex-1">
                          {merchant.processingHistory?.monthlyVolume || 'Not set'}
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleEdit('monthlyVolume')}
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

          <AccordionItem value="documents">
            <AccordionTrigger>Documents</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div>
                  <Label className="font-medium">Bank Statements</Label>
                  <div className="mt-2 space-y-2">
                    {merchant.bank_statements?.map((url, index) => (
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
                    {merchant.drivers_license?.map((url, index) => (
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
                    {merchant.voided_check?.map((url, index) => (
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
