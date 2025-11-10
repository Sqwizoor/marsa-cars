"use client"

import { useEffect } from "react"
import type { Category, SubCategory } from "@prisma/client"
import type * as z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { SubCategoryFormSchema } from "@/lib/schemas"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import ImageUpload from "../shared/image-upload"
import { upsertSubCategory } from "@/queries/subCategories"
import { v4 } from "uuid"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SubCategoryDetailsProps {
  data?: SubCategory
  categories: Category[]
}

const SubCategoryDetails = ({ data, categories }: SubCategoryDetailsProps) => {
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<z.infer<typeof SubCategoryFormSchema>>({
    mode: "onChange",
    resolver: zodResolver(SubCategoryFormSchema),
    defaultValues: {
      name: data?.name || "",
      image: data?.image ? [{ url: data.image }] : [],
      url: data?.url || "",
      featured: data?.featured || false,
      categoryId: data?.categoryId || "",
    },
  })

  const isLoading = form.formState.isSubmitting

  useEffect(() => {
    if (data) {
      form.reset({
        name: data.name,
        image: data.image ? [{ url: data.image }] : [],
        url: data.url,
        featured: data.featured,
        categoryId: data.categoryId,
      })
    }
  }, [data, form])

  const handleSubmit = async (values: z.infer<typeof SubCategoryFormSchema>) => {
    try {
      const response = await upsertSubCategory({
        id: data?.id || v4(),
        name: values.name,
        image: values.image[0]?.url || "",
        url: values.url,
        featured: values.featured,
        categoryId: values.categoryId,
        createdAt: data?.createdAt || new Date(),
        updatedAt: new Date(),
      })

      toast({
        title: data?.id ? "SubCategory has been updated." : `Congratulations! '${response?.name}' is now created.`,
      })

      if (data?.id) {
        router.refresh()
      } else {
        router.push("/dashboard/admin/subCategories")
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
        <CardTitle>SubCategory Information</CardTitle>
        <CardDescription>
            {data?.id
              ? `Update ${data.name} SubCategory information.`
              : "Let's create a subCategory. You can edit subCategory later from the subCategories table or the subCategory page."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                name="image"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
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
                name="name"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>SubCategory name</FormLabel>
                    <FormControl>
                      <Input placeholder="Name" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>SubCategory url</FormLabel>
                    <FormControl>
                      <Input placeholder="/subCategory-url" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Category</FormLabel>
                    <Select
                      disabled={isLoading || categories.length === 0}
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue defaultValue={field.value} placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                      <FormDescription>This SubCategory will appear on the home page</FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Loading..." : data?.id ? "Save SubCategory information" : "Create SubCategory"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    )
  }

export default SubCategoryDetails

