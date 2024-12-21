import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardHeader, CardContent, CardTitle } from "../../../components/ui/card"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "../../../components/ui/form"
import { Input } from "../../../components/ui/input"
import { Button } from "../../../components/ui/button"
import { Merchant as PipelineMerchant, timestampToString } from "../../../types/merchant"

const pricingSchema = z.object({
  monthlyFee: z.string()
    .min(1, "Monthly fee is required")
    .regex(/^\d+(\.\d{1,2})?$/, "Must be a valid dollar amount"),
  transactionFee: z.string()
    .min(1, "Transaction fee is required")
    .regex(/^\d+(\.\d{1,2})?$/, "Must be a valid dollar amount"),
  discountRate: z.string()
    .min(1, "Discount rate is required")
    .regex(/^\d+(\.\d{1,2})?$/, "Must be a valid percentage")
    .refine((val) => parseFloat(val) <= 100, "Percentage must be less than or equal to 100")
})

type PricingFormValues = z.infer<typeof pricingSchema>

interface PricingSectionProps {
  merchant: PipelineMerchant
}

export function PricingSection({ merchant }: PricingSectionProps) {
  const form = useForm<PricingFormValues>({
    resolver: zodResolver(pricingSchema),
    defaultValues: {
      monthlyFee: merchant.pricing?.monthlyFee || '',
      transactionFee: merchant.pricing?.transactionFee || '',
      discountRate: merchant.pricing?.discountRate || ''
    }
  })

  const onSubmit = async (values: PricingFormValues) => {
    try {
      await updateDoc(doc(db, 'merchants', merchant.id), {
        pricing: {
          ...values,
          updatedAt: new Date()
        },
        updatedAt: new Date()
      })
    } catch (error) {
      console.error("Error saving pricing data:", error)
    }
  }

  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Pricing</CardTitle>
        {merchant.pricing?.updatedAt && (
          <div className="text-sm text-gray-500">
            Last updated: {timestampToString(merchant.pricing.updatedAt)}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="monthlyFee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Fee ($)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="0.00" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="transactionFee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction Fee ($)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="0.00" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="discountRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discount Rate (%)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="0.00" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">Save Pricing</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
