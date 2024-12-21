import React from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Merchant as PipelineMerchant, MerchantStatus, timestampToString } from "@/types/merchant"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface LeadDetailsProps {
  merchant: PipelineMerchant
}

export function LeadDetails({ merchant }: LeadDetailsProps) {
  const handleStatusChange = async (status: MerchantStatus) => {
    try {
      await updateDoc(doc(db, 'merchants', merchant.id), {
        pipelineStatus: status,
        updatedAt: new Date()
      })
    } catch (error) {
      console.error("Error updating status:", error)
    }
  }

  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Lead Details</CardTitle>
        <Badge variant={merchant.pipelineStatus === "lead" ? 'default' : 'secondary'}>
          {merchant.pipelineStatus}
        </Badge>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="basic">
            <AccordionTrigger>Basic Information</AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label className="font-medium">Business Name</Label>
                  <div className="text-sm text-gray-700">
                    {merchant.formData?.businessName || merchant.businessName}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className="font-medium">DBA</Label>
                  <div className="text-sm text-gray-700">
                    {merchant.formData?.dba}
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
                  <div className="text-sm text-gray-700">
                    {merchant.formData?.phone}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className="font-medium">Address</Label>
                  <div className="text-sm text-gray-700">
                    {merchant.formData?.companyAddress?.street}<br />
                    {merchant.formData?.companyAddress?.city}, {merchant.formData?.companyAddress?.state} {merchant.formData?.companyAddress?.zipCode}
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
                  <div className="text-sm text-gray-700">
                    {merchant.formData?.businessType}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className="font-medium">Tax ID</Label>
                  <div className="text-sm text-gray-700">
                    {merchant.formData?.taxId}
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
