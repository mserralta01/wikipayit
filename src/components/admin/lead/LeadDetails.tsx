import React, { useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Merchant, MerchantStatus, timestampToString } from "@/types/merchant"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Pencil, X, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface LeadDetailsProps {
  merchant: Merchant
}

export function LeadDetails({ merchant }: LeadDetailsProps) {
  const { toast } = useToast()
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
    }
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
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleSave = async (field: string) => {
    try {
      const updateData = field.startsWith('companyAddress.')
        ? {
            [`formData.companyAddress.${field.split('.')[1]}`]: formData.companyAddress[field.split('.')[1] as keyof typeof formData.companyAddress]
          }
        : {
            [`formData.${field}`]: formData[field as keyof typeof formData]
          }

      await updateDoc(doc(db, 'merchants', merchant.id), {
        ...updateData,
        updatedAt: new Date()
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
      await updateDoc(doc(db, 'merchants', merchant.id), {
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
    <Card className="mb-4">
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
  )
}
