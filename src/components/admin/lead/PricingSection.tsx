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
  volume: z.string().min(1, "Volume is required"),
  rate: z.string()
    .min(1, "Rate is required")
    .regex(/^\d+(\.\d{1,2})?$/, "Must be a valid percentage")
    .refine((val) => parseFloat(val) <= 100, "Percentage must be less than or equal to 100"),
})

const pricingSchema = z.object({
  type: z.enum(["tier", "interchange", "flat", "surcharge"] as const),
  tiers: z.array(pricingTierSchema).optional(),
  interchangeMarkup: z.string()
    .regex(/^\d+(\.\d{1,2})?$/, "Must be a valid percentage")
    .refine((val) => parseFloat(val) <= 100, "Percentage must be less than or equal to 100")
    .optional(),
  flatRate: z.string()
    .regex(/^\d+(\.\d{1,2})?$/, "Must be a valid percentage")
    .refine((val) => parseFloat(val) <= 100, "Percentage must be less than or equal to 100")
    .optional(),
  surchargeRate: z.string()
    .regex(/^\d+(\.\d{1,2})?$/, "Must be a valid percentage")
    .refine((val) => parseFloat(val) <= 100, "Percentage must be less than or equal to 100")
    .optional(),
  transactionFee: z.string()
    .regex(/^\d+(\.\d{1,2})?$/, "Must be a valid dollar amount")
    .optional(),
}).refine((data) => {
  if (data.type === "tier" && (!data.tiers || data.tiers.length === 0)) {
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
      tiers: merchant.pricing?.tiers?.map(tier => ({
        volume: tier.volume.toString(),
        rate: tier.rate.toString(),
      })) || [{ volume: "", rate: "" }],
      interchangeMarkup: merchant.pricing?.interchangeMarkup?.toString() || "",
      flatRate: merchant.pricing?.flatRate?.toString() || "",
      surchargeRate: merchant.pricing?.surchargeRate?.toString() || "",
      transactionFee: merchant.pricing?.transactionFee?.toString() || "",
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
        transactionFee: values.transactionFee ? parseFloat(values.transactionFee) : undefined,
        lastUpdated: Timestamp.fromDate(new Date()),
      }

      if (values.type === "tier") {
        pricingData.tiers = values.tiers?.map(tier => ({
          volume: parseFloat(tier.volume),
          rate: parseFloat(tier.rate),
        }))
      } else if (values.type === "interchange") {
        pricingData.interchangeMarkup = values.interchangeMarkup ? parseFloat(values.interchangeMarkup) : undefined
      } else if (values.type === "flat") {
        pricingData.flatRate = values.flatRate ? parseFloat(values.flatRate) : undefined
      } else if (values.type === "surcharge") {
        pricingData.surchargeRate = values.surchargeRate ? parseFloat(values.surchargeRate) : undefined
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
                    }}
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
                            <Input {...field} type="number" step="0.01" />
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
                            <Input {...field} type="number" step="0.01" />
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
                  onClick={() => append({ volume: "", rate: "" })}
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
                      <Input {...field} type="number" step="0.01" />
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
                      <Input {...field} type="number" step="0.01" />
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
                      <Input {...field} type="number" step="0.01" />
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
                    <Input {...field} type="number" step="0.01" />
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
