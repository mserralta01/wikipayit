import React, { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { doc, updateDoc, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PlusCircle, Trash2 } from "lucide-react"
import {
  Merchant as PipelineMerchant,
  PricingType,
  PricingDetails,
  timestampToString,
} from "@/types/merchant"
import { useToast } from "@/hooks/use-toast"

const pricingTierSchema = z.object({
  volume: z.number()
    .min(0, "Volume cannot be negative")
    .max(1000000, "Volume cannot exceed 1,000,000"),
  rate: z.number()
    .min(0.01, "Rate must be at least 0.01%")
    .max(100, "Rate cannot exceed 100%")
})

const pricingSchema = z.object({
  type: z.enum(["tier", "interchange", "flat", "surcharge"]),
  tiers: z.array(pricingTierSchema)
    .min(2, "Must have at least 2 tiers")
    .refine(
      (tiers) => {
        for (let i = 1; i < tiers.length; i++) {
          if (tiers[i].volume <= tiers[i-1].volume) return false;
        }
        return true;
      },
      "Volume thresholds must be strictly increasing"
    )
    .optional(),
  interchangeMarkup: z.number()
    .min(0.01, "Markup must be at least 0.01%")
    .max(15, "Markup cannot exceed 15%")
    .optional(),
  flatRate: z.number()
    .min(0.01, "Rate must be at least 0.01%")
    .max(5, "Rate cannot exceed 5%")
    .optional(),
  surchargeRate: z.number()
    .min(1, "Surcharge must be at least 1%")
    .max(4, "Surcharge cannot exceed 4%")
    .optional(),
  transactionFee: z.number()
    .min(0, "Transaction fee cannot be negative")
    .max(1, "Transaction fee cannot exceed $1.00")
    .optional(),
}).refine((data) => {
  if (data.type === "tier" && (!data.tiers || data.tiers.length < 2)) {
    return false
  }
  if (data.type === "interchange" && !data.interchangeMarkup) {
    return false
  }
  if (data.type === "flat" && !data.flatRate) {
    return false
  }
  if (data.type === "surcharge" && !data.surchargeRate) {
    return false
  }
  return true
}, {
  message: "Required fields missing for selected pricing type",
})

type PricingFormValues = z.infer<typeof pricingSchema>

interface PricingSectionProps {
  merchant: PipelineMerchant
}

export function PricingSection({ merchant }: PricingSectionProps) {
  const { toast } = useToast()
  const [selectedType, setSelectedType] = useState<PricingType>(
    merchant.pricing?.type || "flat"
  )

  const form = useForm<PricingFormValues>({
    resolver: zodResolver(pricingSchema),
    defaultValues: {
      type: merchant.pricing?.type || "flat",
      tiers: merchant.pricing?.tiers?.length ? merchant.pricing.tiers : [
        { volume: 1000, rate: 2.5 },
        { volume: 5000, rate: 2.0 }
      ],
      interchangeMarkup: merchant.pricing?.interchangeMarkup || 0.01,
      flatRate: merchant.pricing?.flatRate || 0.01,
      surchargeRate: merchant.pricing?.surchargeRate || 1,
      transactionFee: merchant.pricing?.transactionFee || 0,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "tiers",
  })

  const onSubmit = async (values: PricingFormValues) => {
    try {
      const pricingData: PricingDetails = {
        type: values.type,
        transactionFee: values.transactionFee,
        lastUpdated: Timestamp.fromDate(new Date()),
      }

      if (values.type === "tier" && values.tiers) {
        pricingData.tiers = values.tiers.map(tier => ({
          volume: tier.volume,
          rate: tier.rate,
        }))
      } else if (values.type === "interchange" && values.interchangeMarkup) {
        pricingData.interchangeMarkup = values.interchangeMarkup
      } else if (values.type === "flat" && values.flatRate) {
        pricingData.flatRate = values.flatRate
      } else if (values.type === "surcharge" && values.surchargeRate) {
        pricingData.surchargeRate = values.surchargeRate
      }

      await updateDoc(doc(db, "merchants", merchant.id), {
        pricing: pricingData,
        updatedAt: new Date(),
      })

      toast({
        title: "Pricing updated",
        description: "The pricing information has been saved successfully.",
      })
    } catch (error) {
      console.error("Error saving pricing data:", error)
      toast({
        title: "Error",
        description: "Failed to save pricing information. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="flex items-center justify-between border-b">
        <CardTitle className="text-xl font-semibold text-gray-900">Pricing</CardTitle>
        {merchant.pricing?.lastUpdated && (
          <div className="text-sm text-gray-500">
            Last updated: {timestampToString(merchant.pricing.lastUpdated)}
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pricing Type</FormLabel>
                  <Select
                    onValueChange={(value: PricingType) => {
                      field.onChange(value)
                      setSelectedType(value)
                      // Reset form values based on pricing type
                      switch (value) {
                        case "tier":
                          form.setValue("tiers", [
                            { volume: 1000, rate: 2.5 },
                            { volume: 5000, rate: 2.0 }
                          ])
                          form.setValue("interchangeMarkup", undefined)
                          form.setValue("flatRate", undefined)
                          form.setValue("surchargeRate", undefined)
                          break
                        case "interchange":
                          form.setValue("tiers", undefined)
                          form.setValue("interchangeMarkup", 0.01)
                          form.setValue("flatRate", undefined)
                          form.setValue("surchargeRate", undefined)
                          break
                        case "flat":
                          form.setValue("tiers", undefined)
                          form.setValue("interchangeMarkup", undefined)
                          form.setValue("flatRate", 0.01)
                          form.setValue("surchargeRate", undefined)
                          break
                        case "surcharge":
                          form.setValue("tiers", undefined)
                          form.setValue("interchangeMarkup", undefined)
                          form.setValue("flatRate", undefined)
                          form.setValue("surchargeRate", 1)
                          break
                      }
                      form.setValue("transactionFee", 0)
                    }}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select pricing type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="tier">Tier Pricing</SelectItem>
                      <SelectItem value="interchange">Interchange+</SelectItem>
                      <SelectItem value="flat">Flat Rate</SelectItem>
                      <SelectItem value="surcharge">Surcharge</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedType === "tier" && (
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-4 items-end">
                    <FormField
                      control={form.control}
                      name={`tiers.${index}.volume`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Volume Threshold ($)</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" step="0.01" min="0" max="1000000" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`tiers.${index}.rate`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Rate (%)</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" step="0.01" min="0.01" max="100" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      className="mb-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ volume: 0, rate: 0 })}
                  className="w-full"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Tier
                </Button>
              </div>
            )}

            {selectedType === "interchange" && (
              <FormField
                control={form.control}
                name="interchangeMarkup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interchange Markup (%)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" min="0.01" max="15" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {selectedType === "flat" && (
              <FormField
                control={form.control}
                name="flatRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Flat Rate (%)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" min="0.01" max="5" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {selectedType === "surcharge" && (
              <FormField
                control={form.control}
                name="surchargeRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Surcharge Rate (%)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" min="1" max="4" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="transactionFee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction Fee ($)</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" step="0.01" min="0" max="1" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white">
              Save Pricing
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
