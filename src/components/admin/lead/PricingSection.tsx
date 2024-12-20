import React from "react"
import { useForm } from "react-hook-form"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardHeader, CardContent } from "../../../components/ui/card"
import { Form, FormField, FormItem, FormLabel, FormControl } from "../../../components/ui/form"
import { Input } from "../../../components/ui/input"
import { Button } from "../../../components/ui/button"
import { Merchant as PipelineMerchant } from "../../../types/merchant"

interface PricingSectionProps {
  merchant: PipelineMerchant
}

interface PricingFormValues {
  monthlyFee: string
  transactionFee: string
  discountRate: string
}

export function PricingSection({ merchant }: PricingSectionProps) {
  const form = useForm<PricingFormValues>({
    defaultValues: {
      monthlyFee: merchant.pricing?.monthlyFee || '',
      transactionFee: merchant.pricing?.transactionFee || '',
      discountRate: merchant.pricing?.discountRate || ''
    }
  })

  const onSubmit = async (values: PricingFormValues) => {
    await updateDoc(doc(db, 'merchants', merchant.id), {
      pricing: values,
      updatedAt: new Date()
    })
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <h3 className="text-lg font-semibold">Pricing</h3>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="monthlyFee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Fee</FormLabel>
                  <FormControl>
                    <Input {...field} type="text" placeholder="Enter monthly fee" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="transactionFee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction Fee</FormLabel>
                  <FormControl>
                    <Input {...field} type="text" placeholder="Enter transaction fee" />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="discountRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discount Rate</FormLabel>
                  <FormControl>
                    <Input {...field} type="text" placeholder="Enter discount rate" />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit">Save Pricing</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
