"use client"

import type React from "react"

import { StoreShippingSchema } from "@/lib/schemas"
import type { StoreType } from "@/lib/types"
import { zodResolver } from "@hookform/resolvers/zod"
import type { Dispatch, SetStateAction } from "react"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import AnimatedContainer from "../../animated-container"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import Input from "@/components/store/ui/input"
import { Textarea } from "@/components/store/ui/textarea"
import { applySeller } from "@/queries/store"
import toast from "react-hot-toast"

export default function Step3({
  step,
  setStep,
  formData,
  setFormData,
}: {
  formData: StoreType
  setFormData: Dispatch<SetStateAction<StoreType>>
  step: number
  setStep: Dispatch<SetStateAction<number>>
}) {
  // Form hook for managing form state and validation
  const form = useForm<z.infer<typeof StoreShippingSchema>>({
    mode: "onChange", // Form validation mode
    resolver: zodResolver(StoreShippingSchema), // Resolver for form validation
    defaultValues: {
      // Setting default form values from data (if available)
      defaultShippingService: formData.defaultShippingService || "",
      defaultShippingFeePerItem: formData.defaultShippingFeePerItem,
      defaultShippingFeePerKg: formData.defaultShippingFeePerKg,
      defaultShippingFeeForAdditionalItem: formData.defaultShippingFeeForAdditionalItem,
      defaultShippingFeeFixed: formData.defaultShippingFeeFixed,
      defaultDeliveryTimeMin: formData.defaultDeliveryTimeMin,
      defaultDeliveryTimeMax: formData.defaultDeliveryTimeMax,
      returnPolicy: formData.returnPolicy || "",
    },
  })

  // Get product details that are needed to add review info
  const handleSubmit = async (values: z.infer<typeof StoreShippingSchema>) => {
    try {
      // Log the data before submission to debug
      console.log("Submitting store data:", {
        ...formData,
        ...values,
      })

      const response = await applySeller({
        name: formData.name,
        description: formData.description,
        email: formData.email,
        phone: formData.phone,
        logo: formData.logo,
        cover: formData.cover,
        url: formData.url,
        defaultShippingService: values.defaultShippingService,
        defaultShippingFeePerItem: values.defaultShippingFeePerItem,
        defaultShippingFeeForAdditionalItem: values.defaultShippingFeeForAdditionalItem,
        defaultShippingFeePerKg: values.defaultShippingFeePerKg,
        defaultShippingFeeFixed: values.defaultShippingFeeFixed,
        defaultDeliveryTimeMin: values.defaultDeliveryTimeMin,
        defaultDeliveryTimeMax: values.defaultDeliveryTimeMax,
        returnPolicy: values.returnPolicy,
        // You need to add userId here or in your API
      })
      if (response.id) {
        setStep((prev) => prev + 1)
      }
    } catch (error: any) {
      toast.error(error.toString())
      console.error("Error submitting form:", error)
    }
  }
  interface FormData {
    defaultShippingService: string
    defaultShippingFeePerItem: number
    defaultShippingFeePerKg: number
    defaultShippingFeeForAdditionalItem: number
    defaultShippingFeeFixed: number
    defaultDeliveryTimeMin: number
    defaultDeliveryTimeMax: number
    returnPolicy: string
  }
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    const parsedValue = type === "number" ? (value ? Number(value) : undefined) : value

    setFormData((prev) => ({
      ...prev,
      [name]: parsedValue,
    }))
  }

  return (
    <div className="h-full">
      <AnimatedContainer>
        <div className="pl-1 text-gray-600 mt-2 mb-4">
          <p className="font-medium">Fill out your store's default shipping details (this is optional).</p>
          <ul className="list-disc text-sm ml-4 mt-2">
            <li>Any fields left empty will default to our pre-set formData.</li>
            <li>Don't worry, you can update your details anytime from your seller dashboard.</li>
            <li>You'll also be able to customize shipping details for each country later on.</li>
          </ul>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            {/* Form items */}
            <div className="space-y-4">
              {/* Shipping Service */}
              <FormField
                control={form.control}
                name="defaultShippingService"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Shipping Service"
                        value={field.value}
                        type="text"
                        name="defaultShippingService"
                        onChange={(e) => {
                          field.onChange(e)
                          handleInputChange(e)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Shipping Fee per Item */}
              <FormField
                control={form.control}
                name="defaultShippingFeePerItem"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Shipping Fee per item"
                        value={field.value}
                        type="number"
                        name="defaultShippingFeePerItem"
                        onChange={(e) => {
                          field.onChange(e)
                          handleInputChange(e)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Shipping Fee per Kg */}
              <FormField
                control={form.control}
                name="defaultShippingFeePerKg"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Shipping Fee per Kg"
                        value={field.value}
                        type="number"
                        name="defaultShippingFeePerKg"
                        onChange={(e) => {
                          field.onChange(e)
                          handleInputChange(e)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Shipping Fee for Additional Item */}
              <FormField
                control={form.control}
                name="defaultShippingFeeForAdditionalItem"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Shipping Fee for Additional Item"
                        value={field.value}
                        type="number"
                        name="defaultShippingFeeForAdditionalItem"
                        onChange={(e) => {
                          field.onChange(e)
                          handleInputChange(e)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Fixed Shipping Fee */}
              <FormField
                control={form.control}
                name="defaultShippingFeeFixed"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Fixed Shipping Fee"
                        value={field.value}
                        type="number"
                        name="defaultShippingFeeFixed"
                        onChange={(e) => {
                          field.onChange(e)
                          handleInputChange(e)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Delivery Time Min */}
              <FormField
                control={form.control}
                name="defaultDeliveryTimeMin"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Min Delivery Time"
                        value={field.value}
                        type="number"
                        name="defaultDeliveryTimeMin"
                        onChange={(e) => {
                          field.onChange(e)
                          handleInputChange(e)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Delivery Time Max */}
              <FormField
                control={form.control}
                name="defaultDeliveryTimeMax"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Max Delivery Time"
                        value={field.value}
                        type="number"
                        name="defaultDeliveryTimeMax"
                        onChange={(e) => {
                          field.onChange(e)
                          handleInputChange(e)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Return Policy */}
              <FormField
                control={form.control}
                name="returnPolicy"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Return Policy"
                        name="returnPolicy"
                        value={field.value}
                        onChange={(e) => {
                          field.onChange(e)
                          const { name, value } = e.target
                          setFormData((prev) => ({ ...prev, [name]: value }))
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      </AnimatedContainer>
      <div className="h-[100px] flex pt-4 px-2 justify-between">
        <button
          type="button"
          onClick={() => step > 1 && setStep((prev) => prev - 1)}
          className="h-10 py-2 px-4 rounded-lg shadow-sm text-gray-600 bg-white hover:bg-gray-100 font-medium border"
        >
          Previous
        </button>
        <button
          type="submit"
          onClick={form.handleSubmit(handleSubmit)}
          className="h-10 py-2 px-4 rounded-lg shadow-sm text-white bg-blue-500 hover:bg-blue-700 font-medium"
        >
          Submit
        </button>
      </div>
    </div>
  )
}

