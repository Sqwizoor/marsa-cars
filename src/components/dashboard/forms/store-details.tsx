"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Store } from "@prisma/client"
import type * as z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { StoreFormSchema } from "@/lib/schemas"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import ImageUpload from "../shared/image-upload"
import { useToast } from "@/hooks/use-toast"
import { upsertStore } from "@/queries/store"
import { v4 } from "uuid"

interface StoreDetailsProps {
  data?: Store
}

const StoreDetails = ({ data }: StoreDetailsProps) => {
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<z.infer<typeof StoreFormSchema>>({
    mode: "onChange",
    resolver: zodResolver(StoreFormSchema),
    defaultValues: {
      name: data?.name || "",
      description: data?.description || "",
      email: data?.email || "",
      phone: data?.phone || "",
      logo: data?.logo ? [{ url: data.logo }] : [],
      cover: data?.cover ? [{ url: data.cover }] : [],
      url: data?.url || "",
      featured: data?.featured || false,
      status: data?.status?.toString() || "",
    },
  })

  const isLoading = form.formState.isSubmitting

  useEffect(() => {
    if (data) {
      form.reset({
        name: data.name || "",
        description: data.description || "",
        email: data.email || "",
        phone: data.phone || "",
        logo: data.logo ? [{ url: data.logo }] : [],
        cover: data.cover ? [{ url: data.cover }] : [],
        url: data.url || "",
        featured: data.featured || false,
        status: data.status?.toString() || "",
      })
    }
  }, [data, form])

  const handleSubmit = async (values: z.infer<typeof StoreFormSchema>) => {
    try {
      const response = await upsertStore({
        id: data?.id || v4(),
        name: values.name,
        description: values.description || "",
        email: values.email,
        phone: values.phone || "",
        logo: values.logo[0]?.url || "",
        cover: values.cover[0]?.url || "",
        url: values.url,
        featured: values.featured ?? false,
        createdAt: data?.createdAt || new Date(),
        updatedAt: new Date(),
        status: "PENDING",
        averageRating: 0,
        numReviews: 0,
        returnPolicy: "",
        defaultShippingService: "",
        defaultShippingFeePerItem: 0,
        defaultShippingFeeForAdditionalItem: 0,
        defaultShippingFeePerKg: 0,
        defaultShippingFeeFixed: 0,
        defaultDeliveryTimeMin: 0,
        defaultDeliveryTimeMax: 0,
        userId: data?.userId || ""
      })

      toast({
        title: data?.id ? "Store has been updated." : `Congratulations! '${response?.name}' is now created.`,
      })

      if (data?.id) {
        router.refresh()
      } else {
        router.push(`/dashboard/seller/stores/${response.url}`)
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error"
      console.error(error)
      toast({
        variant: "destructive",
        title: "Oops!",
        description: message,
      })
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Store Information</CardTitle>
        <CardDescription>
            {data?.id
              ? `Update ${data.name} store information.`
              : "Let's create a store. You can edit store later from the store settings page."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              {/* Logo - Cover */}
              <div className="relative py-2 mb-24">
                <FormField
                  control={form.control}
                  name="logo"
                  render={({ field }) => (
                    <FormItem className="absolute -bottom-20 -left-48 z-10 inset-x-96">
                      <FormControl>
                        <ImageUpload
                          type="profile"
                          value={field.value.map((image) => image.url)}
                          disabled={isLoading}
                          onChange={(url) => field.onChange([{ url }])}
                          onRemove={(url) => field.onChange([...field.value.filter((current) => current.url !== url)])}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cover"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <ImageUpload
                          type="cover"
                          value={field.value.map((image) => image.url)}
                          disabled={isLoading}
                          onChange={(url) => field.onChange([{ url }])}
                          onRemove={(url) => field.onChange([...field.value.filter((current) => current.url !== url)])}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Store name</FormLabel>
                    <FormControl>
                      <Input placeholder="Name" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Store description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Description" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Email - Phone */}
              <div className="flex flex-col gap-6 md:flex-row">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Store email</FormLabel>
                      <FormControl>
                        <Input placeholder="Email" {...field} type="email" disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Store phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Phone" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Store url</FormLabel>
                    <FormControl>
                      <Input placeholder="/store-url" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isLoading} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Featured</FormLabel>
                      <FormDescription>This Store will appear on the home page.</FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Loading..." : data?.id ? "Save store information" : "Create store"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    )
  }

export default StoreDetails

