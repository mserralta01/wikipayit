import React, { useState, ChangeEvent, useEffect } from "react"
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
  const [editMode, setEditMode] = useState<{ [key: string]: boolean }>({})

  // Add console log to see initial merchant data
  console.log('Initial merchant data:', initialMerchant)
  console.log('Processing History:', initialMerchant.formData?.processingHistory)

  const [formData, setFormData] = useState<FormData>(() => {
    console.log('Initializing form data with beneficial owners:', initialMerchant.formData?.beneficialOwners)
    const initialFormData: FormData = {
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
        bankName: initialMerchant.formData?.bankName || '',
        routingNumber: initialMerchant.formData?.routingNumber || '',
        accountNumber: initialMerchant.formData?.accountNumber || '',
      },
      processingHistory: {
        averageTicket: initialMerchant.formData?.processingHistory?.averageTicket || '',
        cardPresentPercentage: initialMerchant.formData?.processingHistory?.cardPresentPercentage || '',
        currentProcessor: initialMerchant.formData?.processingHistory?.currentProcessor || '',
        ecommercePercentage: initialMerchant.formData?.processingHistory?.ecommercePercentage || '',
        hasBeenTerminated: initialMerchant.formData?.processingHistory?.hasBeenTerminated || 'no',
        highTicket: initialMerchant.formData?.processingHistory?.highTicket || '',
        isCurrentlyProcessing: initialMerchant.formData?.processingHistory?.isCurrentlyProcessing || 'no',
        monthlyVolume: initialMerchant.formData?.processingHistory?.monthlyVolume || '',
        terminationExplanation: initialMerchant.formData?.processingHistory?.terminationExplanation || ''
      },
      beneficialOwners: {
        owners: initialMerchant.formData?.beneficialOwners?.owners || []
      }
    }
    console.log('Initial form data:', initialFormData)
    return initialFormData
  })

  // Update merchant state when initialMerchant changes
  useEffect(() => {
    console.log('useEffect - initialMerchant changed:', initialMerchant)
    console.log('useEffect - processing history:', initialMerchant.formData?.processingHistory)
    
    setMerchant(initialMerchant)
    setFormData(prev => {
      const updatedFormData: FormData = {
        ...prev,
        processingHistory: {
          ...prev.processingHistory,
          averageTicket: initialMerchant.formData?.processingHistory?.averageTicket?.toString() || '',
          cardPresentPercentage: initialMerchant.formData?.processingHistory?.cardPresentPercentage?.toString() || '',
          currentProcessor: initialMerchant.formData?.processingHistory?.currentProcessor || '',
          ecommercePercentage: initialMerchant.formData?.processingHistory?.ecommercePercentage?.toString() || '',
          hasBeenTerminated: initialMerchant.formData?.processingHistory?.hasBeenTerminated || 'no',
          highTicket: initialMerchant.formData?.processingHistory?.highTicket?.toString() || '',
          isCurrentlyProcessing: initialMerchant.formData?.processingHistory?.isCurrentlyProcessing || 'no',
          monthlyVolume: initialMerchant.formData?.processingHistory?.monthlyVolume?.toString() || '',
          terminationExplanation: initialMerchant.formData?.processingHistory?.terminationExplanation || ''
        },
        bankDetails: {
          bankName: initialMerchant.formData?.bankName || '',
          routingNumber: initialMerchant.formData?.routingNumber || '',
          accountNumber: initialMerchant.formData?.accountNumber || ''
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
      }
      console.log('Updated form data:', updatedFormData)
      return updatedFormData
    })
  }, [initialMerchant])

  const toggleEdit = (field: string): void => {
    setEditMode(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const handleInputChange = (field: string, value: string | number): void => {
    if (field.startsWith('processingHistory.')) {
      const historyField = field.split('.')[1] as keyof ProcessingHistory
      setFormData(prev => ({
        ...prev,
        processingHistory: {
          ...prev.processingHistory,
          [historyField]: value
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
    } else if (field.startsWith('companyAddress.')) {
      const addressField = field.split('.')[1]
      setFormData(prev => ({
        ...prev,
        companyAddress: {
          ...prev.companyAddress,
          [addressField]: value
        }
      }))
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

      if (field.startsWith('processingHistory.')) {
        const historyField = field.split('.')[1] as keyof ProcessingHistory
        let value = formData.processingHistory?.[historyField]
        
        // Convert string values to numbers where needed
        if (['averageTicket', 'cardPresentPercentage', 'ecommercePercentage', 'highTicket', 'monthlyVolume'].includes(historyField)) {
          value = Number(value)
        }
        
        updateData = {
          [`formData.processingHistory.${historyField}`]: value,
          updatedAt: Timestamp.fromDate(new Date())
        }
      } else if (field.startsWith('bankDetails.')) {
        const bankField = field.split('.')[1]
        const fieldName = bankField === 'bankName' ? 'bankName' :
                         bankField === 'routingNumber' ? 'routingNumber' :
                         'accountNumber'
        updateData = {
          [`formData.${fieldName}`]: formData.bankDetails[bankField as keyof typeof formData.bankDetails]
        }
      } else if (field.startsWith('companyAddress.')) {
        const addressField = field.split('.')[1]
        updateData = {
          [`formData.companyAddress.${addressField}`]: formData.companyAddress[addressField as keyof typeof formData.companyAddress]
        }
      } else if (field.startsWith('beneficialOwners.')) {
        updateData = {
          'formData.beneficialOwners': formData.beneficialOwners
        }
      } else {
        updateData = {
          [`formData.${field}`]: formData[field as keyof typeof formData]
        }
      }

      // Update document
      const collectionPath = merchant.kind === 'lead' ? 'leads' : 'merchants'
      console.log('Updating document with data:', updateData)
      await updateDoc(doc(db, collectionPath, merchant.id), updateData)

      // Update local merchant state
      setMerchant(prev => ({
        ...prev,
        formData: {
          ...prev.formData,
          ...updateData.formData
        },
        updatedAt: Timestamp.fromDate(new Date())
      }))

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
              <AccordionItem value="business">
                <AccordionTrigger>Business</AccordionTrigger>
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
                              maxLength={2}
                              placeholder="FL"
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
                              pattern="\d{5}(-\d{4})?"
                              placeholder="12345"
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
                              value={formData.processingHistory?.averageTicket ?? ''}
                              onChange={(e) => handleInputChange('processingHistory.averageTicket', e.target.value)}
                              className="flex-1"
                              type="number"
                              min="0"
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
                              ${merchant.formData?.processingHistory?.averageTicket || 'Not set'}
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
                              value={formData.processingHistory?.cardPresentPercentage ?? ''}
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
                              {merchant.formData?.processingHistory?.cardPresentPercentage || 'Not set'}%
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
                              value={formData.processingHistory?.currentProcessor ?? ''}
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
                              {merchant.formData?.processingHistory?.currentProcessor || 'Not set'}
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
                              value={formData.processingHistory?.ecommercePercentage ?? ''}
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
                              {merchant.formData?.processingHistory?.ecommercePercentage || 'Not set'}%
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
                      <Label className="font-medium">Is Currently Processing</Label>
                      <div className="flex items-center gap-2">
                        {editMode['processingHistory.isCurrentlyProcessing'] ? (
                          <>
                            <Select
                              defaultValue={formData.processingHistory?.isCurrentlyProcessing ?? 'no'}
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
                              {merchant.formData?.processingHistory?.isCurrentlyProcessing || 'Not set'}
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
                      <Label className="font-medium">Has Been Terminated</Label>
                      <div className="flex items-center gap-2">
                        {editMode['processingHistory.hasBeenTerminated'] ? (
                          <>
                            <Select
                              defaultValue={formData.processingHistory?.hasBeenTerminated ?? 'no'}
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
                              {merchant.formData?.processingHistory?.hasBeenTerminated || 'Not set'}
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

                    {(formData.processingHistory?.hasBeenTerminated === 'yes' || merchant.formData?.processingHistory?.hasBeenTerminated === 'yes') && (
                      <div className="grid gap-2">
                        <Label className="font-medium">Termination Explanation</Label>
                        <div className="flex items-center gap-2">
                          {editMode['processingHistory.terminationExplanation'] ? (
                            <>
                              <Textarea
                                value={formData.processingHistory?.terminationExplanation ?? ''}
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
                                {merchant.formData?.processingHistory?.terminationExplanation || 'Not set'}
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
                              value={formData.processingHistory?.highTicket ?? ''}
                              onChange={(e) => handleInputChange('processingHistory.highTicket', e.target.value)}
                              className="flex-1"
                              type="number"
                              min="0"
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
                              ${merchant.formData?.processingHistory?.highTicket || 'Not set'}
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
                      <Label className="font-medium">Monthly Volume</Label>
                      <div className="flex items-center gap-2">
                        {editMode['processingHistory.monthlyVolume'] ? (
                          <>
                            <Input
                              value={formData.processingHistory?.monthlyVolume ?? ''}
                              onChange={(e) => handleInputChange('processingHistory.monthlyVolume', e.target.value)}
                              className="flex-1"
                              type="number"
                              min="0"
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
                              ${merchant.formData?.processingHistory?.monthlyVolume || 'Not set'}
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
                              {merchant.formData?.bankName || 'Not set'}
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
                              {merchant.formData?.routingNumber || 'Not set'}
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
                              {merchant.formData?.accountNumber ? '•••••••' : 'Not set'}
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
                    {formData.beneficialOwners?.owners?.length === 0 ? (
                      <div className="text-sm text-gray-500">No beneficial owners added</div>
                    ) : (
                      formData.beneficialOwners?.owners?.map((owner, index) => (
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
                                        onChange={(e) => handleBeneficialOwnerChange(index, 'firstName', e.target.value)}
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
                                        onChange={(e) => handleBeneficialOwnerChange(index, 'lastName', e.target.value)}
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
                                        onChange={(e) => handleBeneficialOwnerChange(index, 'title', e.target.value)}
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
                                        onChange={(e) => handleBeneficialOwnerChange(index, 'dateOfBirth', e.target.value)}
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
                                        onChange={(e) => handleBeneficialOwnerChange(index, 'ssn', e.target.value)}
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
                                        onChange={(e) => handleBeneficialOwnerChange(index, 'address', e.target.value)}
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
                                        onChange={(e) => handleBeneficialOwnerChange(index, 'city', e.target.value)}
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
                                        onChange={(e) => handleBeneficialOwnerChange(index, 'state', e.target.value)}
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
                                        onChange={(e) => handleBeneficialOwnerChange(index, 'zipCode', e.target.value)}
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
                                        onChange={(e) => handleBeneficialOwnerChange(index, 'phone', e.target.value)}
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
                                        onChange={(e) => handleBeneficialOwnerChange(index, 'email', e.target.value)}
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
                                        onChange={(e) => handleBeneficialOwnerChange(index, 'ownershipPercentage', e.target.value)}
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
