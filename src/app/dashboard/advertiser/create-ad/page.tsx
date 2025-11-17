"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Upload, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-hot-toast";
import { CldUploadWidget } from "next-cloudinary";

const adFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(500),
  image: z.string().optional(),
  url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  targetCategory: z.string().optional(),
  targetSubCategory: z.string().optional(),
});

type AdFormValues = z.infer<typeof adFormSchema>;

export default function CreateAdPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [categories, setCategories] = useState<any[]>([]);

  const form = useForm<AdFormValues>({
    resolver: zodResolver(adFormSchema),
    defaultValues: {
      title: "",
      description: "",
      image: "",
      url: "",
      targetCategory: "",
      targetSubCategory: "",
    },
  });

  useEffect(() => {
    // Fetch categories for targeting
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      // You can implement this to fetch actual categories from your database
      // For now, using placeholder
      setCategories([]);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const onSubmit = async (values: AdFormValues) => {
    setLoading(true);

    try {
      const response = await fetch("/api/advertisements/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          image: imageUrl || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to create advertisement");
        setLoading(false);
        return;
      }

      toast.success("Advertisement created successfully!");
      router.push("/dashboard/advertiser");
    } catch (error) {
      console.error("Error creating advertisement:", error);
      toast.error("Failed to create advertisement");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create New Advertisement</CardTitle>
            <CardDescription>
              Design your ad to reach thousands of potential customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ad Title *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter a catchy title for your ad"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Make it attention-grabbing and clear (5-100 characters)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe what you're offering..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Provide compelling details about your offer (20-500 characters)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Image Upload */}
                <div className="space-y-2">
                  <FormLabel>Ad Image</FormLabel>
                  <div className="border-2 border-dashed rounded-lg p-6">
                    {imageUrl ? (
                      <div className="space-y-4">
                        <img
                          src={imageUrl}
                          alt="Ad preview"
                          className="w-full h-64 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setImageUrl("")}
                          className="w-full"
                        >
                          Remove Image
                        </Button>
                      </div>
                    ) : (
                      <CldUploadWidget
                        uploadPreset="marsa-cars"
                        onSuccess={(result: any) => {
                          setImageUrl(result.info.secure_url);
                          form.setValue("image", result.info.secure_url);
                        }}
                      >
                        {({ open }) => (
                          <div
                            onClick={() => open()}
                            className="cursor-pointer text-center"
                          >
                            <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground mb-2">
                              Click to upload an image
                            </p>
                            <Button type="button" variant="secondary">
                              <Upload className="w-4 h-4 mr-2" />
                              Upload Image
                            </Button>
                          </div>
                        )}
                      </CldUploadWidget>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Recommended: 1200x600px, max 2MB
                  </p>
                </div>

                {/* URL */}
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link URL (optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Where should users go when they click your ad?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Category Targeting */}
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="targetCategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Category (optional)</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="vehicles">Vehicles</SelectItem>
                            <SelectItem value="parts">Parts & Accessories</SelectItem>
                            <SelectItem value="services">Services</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Show ad in specific category
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="targetSubCategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Subcategory (optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Luxury Cars"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Narrow targeting further
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Submit */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? "Creating..." : "Create Advertisement"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
