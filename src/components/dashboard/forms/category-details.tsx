"use client";

import { CategoryFormSchema } from "@/lib/schemas";
import type { Category } from "@prisma/client";
import { type FC, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type * as z from "zod";

import { AlertDialog, AlertDialogTitle } from "../../ui/alert-dialog"; // Added DialogTitle and VisuallyHidden
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";
import { Input } from "../../ui/input";
import { Checkbox } from "../../ui/checkbox";
import { Button } from "../../ui/button";
import ImageUpload from "../shared/image-upload";
// queries
import { upsertCategory } from "@/queries/category";
// utils
import { v4 } from "uuid";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "../../ui/toast";
import { useRouter } from "next/navigation";
import { Dialog } from "../../ui/dialog";

interface CategoryDetailsProps {
  data?: Category;
}

const CategoryDetails: FC<CategoryDetailsProps> = ({ data }) => {
  // initializing necessary hooks
  const { toast } = useToast();
  const router = useRouter();
  const defaultValues = useMemo(
    () => ({
      name: data?.name || "",
      image: data?.image ? [{ url: data.image }] : [],
      url: data?.url || "",
      featured: data?.featured || false,
    }),
    [data]
  );

  const form = useForm<z.infer<typeof CategoryFormSchema>>({
    mode: "onChange",
    resolver: zodResolver(CategoryFormSchema),
    defaultValues,
  });

  const isLoading = form.formState.isSubmitting;

  useEffect(() => {
    if (data) {
      form.reset(defaultValues);
    }
  }, [data, form.reset, defaultValues]);

  const handleSubmit = async (values: z.infer<typeof CategoryFormSchema>) => {
    try {
      const response = await upsertCategory({
        id: data?.id ? data?.id : v4(),
        name: values.name,
        image: values.image[0].url,
        url: values.url,
        featured: values.featured,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      toast({
        title: data?.id
          ? "Category has been Updated."
          : `Congratulations! '${response?.name}' is now officially created.`,
        action: (
          <ToastAction altText="Go to schedule to undo">
            Updated SuccessFully
          </ToastAction>
        ),
      });

      if (data?.id) {
        router.refresh();
      } else {
        router.push("/dashboard/admin/categories");
      }
    } catch (error: any) {
      console.log(error);
      toast({
        variant: "destructive",
        title: "Oops!",
        description: error.toString(),
      });
    }
  };

  return (
    <AlertDialog>
      <Card className="w-full">
        <CardHeader>
          <AlertDialogTitle>Category Information</AlertDialogTitle>
          <CardDescription>
            {data?.id
              ? `Update ${data.name} category information.`
              : "Let's create a category. You can edit the category later from the categories table or the category page."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ImageUpload
                        type="profile"
                        value={field.value.map((image) => image.url)}
                        disabled={isLoading}
                        onChange={(url) => field.onChange([{ url }])}
                        onRemove={(url) =>
                          field.onChange([
                            ...field.value.filter(
                              (current) => current.url !== url
                            ),
                          ])
                        }
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
                    <FormLabel>Category name</FormLabel>
                    <FormControl>
                      <Input placeholder="Name" {...field} />
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
                    <FormLabel>Category URL</FormLabel>
                    <FormControl>
                      <Input placeholder="/category-url" {...field} />
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
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Featured</FormLabel>
                      <FormDescription>
                        This category will appear on the home page.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? "Loading..."
                  : data?.id
                  ? "Save category information"
                  : "Create category"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AlertDialog>
  );
};

export default CategoryDetails;
