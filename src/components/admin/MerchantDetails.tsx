import { useState } from "react"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { Label } from "../ui/label"
import { Badge } from "../ui/badge"
import { Merchant, BeneficialOwner, timestampToString } from "../../types/merchant"
import { merchantService } from "../../services/merchantService"
import { PipelineStatus } from '../../types/pipeline'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select"
import { useToast } from "../../hooks/use-toast"

type MerchantDetailsProps = {
  merchant: Merchant
  onUpdate: () => void
}

export function MerchantDetails({ merchant, onUpdate }: MerchantDetailsProps) {
  const { toast } = useToast()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusChange = async (status: PipelineStatus) => {
    if (!merchant.id) return;
    
    try {
      await merchantService.updateMerchantStatus(merchant.id, status);
      onUpdate?.();
      toast({
        description: `Merchant status updated to ${status}`,
      });
    } catch (error) {
      console.error('Error updating merchant status:', error);
      toast({
        description: "Failed to update merchant status",
        variant: "destructive",
      });
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString()
  }

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(numAmount)
  }

  const renderStatusBadge = (status: string) => {
    const variants: { [key: string]: string } = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    }

    return (
      <Badge className={variants[status] || "bg-gray-100 text-gray-800"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const renderOwnerCard = (owner: BeneficialOwner) => (
    <Card className="p-4 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm text-muted-foreground">Name</Label>
          <p className="font-medium">
            {owner.firstName} {owner.lastName}
          </p>
        </div>
        <div>
          <Label className="text-sm text-muted-foreground">Title</Label>
          <p className="font-medium">{owner.title}</p>
        </div>
        <div>
          <Label className="text-sm text-muted-foreground">
            Ownership Percentage
          </Label>
          <p className="font-medium">{owner.ownershipPercentage}%</p>
        </div>
        <div>
          <Label className="text-sm text-muted-foreground">Email</Label>
          <p className="font-medium">{owner.email}</p>
        </div>
        <div>
          <Label className="text-sm text-muted-foreground">Phone</Label>
          <p className="font-medium">{owner.phone}</p>
        </div>
        <div>
          <Label className="text-sm text-muted-foreground">Date of Birth</Label>
          <p className="font-medium">{owner.dateOfBirth}</p>
        </div>
        <div className="col-span-2">
          <Label className="text-sm text-muted-foreground">Address</Label>
          <p className="font-medium">
            {owner.address}, {owner.city}, {owner.state} {owner.zipCode}
          </p>
        </div>
      </div>
    </Card>
  )

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{merchant.businessName}</h2>
          {merchant.dba && (
            <p className="text-muted-foreground">DBA: {merchant.dba}</p>
          )}
        </div>
        <div className="flex items-center gap-4">
          {renderStatusBadge(merchant.status || "pending")}
          <Select
            value={merchant.status}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lead">Lead</SelectItem>
              <SelectItem value="phone">Phone Call</SelectItem>
              <SelectItem value="offer">Offer Sent</SelectItem>
              <SelectItem value="underwriting">Underwriting</SelectItem>
              <SelectItem value="documents">Documents</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Business Information</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">Business Description</Label>
                <p className="font-medium whitespace-pre-wrap">{merchant.businessDescription}</p>
              </div>
              
              <div>
                <Label className="text-sm text-muted-foreground">Company Address</Label>
                <p className="font-medium">
                  {merchant.companyAddress?.street}<br />
                  {merchant.companyAddress?.city}, {merchant.companyAddress?.state} {merchant.companyAddress?.zipCode}
                </p>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Customer Service</Label>
                <p className="font-medium">
                  Email: {merchant.customerServiceEmail}<br />
                  Phone: {merchant.customerServicePhone}
                </p>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Tax ID</Label>
                <p className="font-medium">{merchant.taxId}</p>
              </div>
              
              <div>
                <Label className="text-sm text-muted-foreground">Business Type</Label>
                <p className="font-medium">{merchant.businessType}</p>
              </div>
              
              <div>
                <Label className="text-sm text-muted-foreground">Year Established</Label>
                <p className="font-medium">{merchant.yearEstablished}</p>
              </div>
              
              {merchant.website && (
                <div>
                  <Label className="text-sm text-muted-foreground">Website</Label>
                  <p className="font-medium">
                    <a
                      href={merchant.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {merchant.website}
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Processing Information</h3>
            <div className="space-y-4">
              {merchant.currentProcessor && (
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Current Processor
                  </Label>
                  <p className="font-medium">{merchant.currentProcessor}</p>
                </div>
              )}
              <div>
                <Label className="text-sm text-muted-foreground">
                  Monthly Volume
                </Label>
                <p className="font-medium">
                  {formatCurrency(merchant.monthlyVolume || 0)}
                </p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">
                  Average Ticket
                </Label>
                <p className="font-medium">
                  {formatCurrency(merchant.averageTicket || 0)}
                </p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">
                  High Ticket
                </Label>
                <p className="font-medium">
                  {formatCurrency(merchant.highTicket || 0)}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Beneficial Owners</h3>
        <div className="space-y-4">
          {merchant.beneficialOwners?.map((owner: BeneficialOwner, index: number) => (
            <div key={index} className="space-y-2">
              <h4 className="font-medium">Beneficial Owner {index + 1}</h4>
              {renderOwnerCard(owner)}
            </div>
          ))}
          {(!merchant.beneficialOwners ||
            merchant.beneficialOwners.length === 0) && (
            <p className="text-muted-foreground">No beneficial owners listed</p>
          )}
        </div>
      </Card>

      {merchant.createdAt && (
        <p className="text-sm text-muted-foreground">
          Application submitted on {formatDate(timestampToString(merchant.createdAt))}
        </p>
      )}
    </div>
  )
}
