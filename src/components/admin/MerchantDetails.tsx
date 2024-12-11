import { useState } from "react"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { Label } from "../ui/label"
import { Badge } from "../ui/badge"
import { Merchant, BeneficialOwner } from "../../types/merchant"
import { merchantService } from "../../services/merchantService"

type MerchantDetailsProps = {
  merchant: Merchant
  onUpdate: () => void
}

export function MerchantDetails({ merchant, onUpdate }: MerchantDetailsProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusUpdate = async (status: "approved" | "rejected") => {
    try {
      setIsUpdating(true)
      await merchantService.updateMerchantStatus(merchant.id!, status)
      onUpdate()
    } catch (error) {
      console.error("Error updating merchant status:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString()
  }

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(parseFloat(amount))
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
          {merchant.status === "pending" && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleStatusUpdate("rejected")}
                disabled={isUpdating}
              >
                Reject
              </Button>
              <Button
                onClick={() => handleStatusUpdate("approved")}
                disabled={isUpdating}
              >
                Approve
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Business Information</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">Tax ID</Label>
                <p className="font-medium">{merchant.taxId}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">
                  Business Type
                </Label>
                <p className="font-medium">{merchant.businessType}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">
                  Year Established
                </Label>
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
                  {formatCurrency(merchant.monthlyVolume)}
                </p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">
                  Average Ticket
                </Label>
                <p className="font-medium">
                  {formatCurrency(merchant.averageTicket)}
                </p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">
                  High Ticket
                </Label>
                <p className="font-medium">
                  {formatCurrency(merchant.highTicket)}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Processing Method Breakdown</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label className="text-sm text-muted-foreground">Card Present</Label>
            <p className="font-medium">{merchant.cardPresentPercentage}%</p>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">E-commerce</Label>
            <p className="font-medium">{merchant.ecommercePercentage}%</p>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">MOTO</Label>
            <p className="font-medium">{merchant.motoPercentage}%</p>
          </div>
        </div>
      </Card>

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
          Application submitted on {formatDate(merchant.createdAt)}
        </p>
      )}
    </div>
  )
}
