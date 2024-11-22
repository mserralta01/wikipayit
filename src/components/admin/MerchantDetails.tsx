import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'

type MerchantDetailsProps = {
  merchant: Merchant
  isOpen: boolean
  onClose: () => void
}

export function MerchantDetails({ merchant, isOpen, onClose }: MerchantDetailsProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>{merchant.businessName}</SheetTitle>
        </SheetHeader>
        
        <Tabs defaultValue="details" className="mt-6">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
          
          {/* Add tab contents */}
        </Tabs>
      </SheetContent>
    </Sheet>
  )
} 