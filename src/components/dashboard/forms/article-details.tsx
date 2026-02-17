"use client";

import { ArticleFormSchema } from "@/lib/schemas";
import type { Article } from "@prisma/client";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type * as z from "zod";

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
import { Skeleton } from "@/components/ui/skeleton";
import ImageUpload from "../shared/image-upload";
import { Textarea } from "@/components/ui/textarea";

// queries
import { upsertArticle } from "@/queries/articles";

// utils
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import slugify from "slugify";

interface ArticleDetailsProps {
  data?: Article;
}

const ArticleDetails = ({ data }: ArticleDetailsProps) => {
  const { toast } = useToast();
  const router = useRouter();

  const defaultValues = useMemo(
    () => ({
      title: data?.title || "",
      slug: data?.slug || "",
      content: data?.content || "",
      excerpt: data?.excerpt || "",
      coverImage: data?.coverImage ? [{ url: data.coverImage }] : [],
      published: data?.published || false,
      tags: data?.tags || [],
    }),
    [data]
  );

  const form = useForm<z.infer<typeof ArticleFormSchema>>({
    mode: "onChange",
    resolver: zodResolver(ArticleFormSchema),
    defaultValues,
  });

  const isLoading = form.formState.isSubmitting;

  useEffect(() => {
    if (data) {
      form.reset(defaultValues);
    }
  }, [data, form, defaultValues]);

  const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    form.setValue("title", title);
    if (!data?.id) {
        form.setValue("slug", slugify(title, { lower: true, strict: true }));
    }
  };

  const handleSubmit = async (values: z.infer<typeof ArticleFormSchema>) => {
    try {
      await upsertArticle({
        id: data?.id,
        title: values.title,
        slug: values.slug,
        content: values.content,
        excerpt: values.excerpt,
        coverImage: values.coverImage[0].url,
        published: values.published,
        tags: values.tags,
      });

      toast({
        title: data?.id ? "Article updated" : "Article created",
        description: `The article "${values.title}" has been saved successfully.`,
      });

      router.refresh();
      if (!data?.id) {
        router.push("/dashboard/admin/articles");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save article",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Article Details</CardTitle>
        <CardDescription>
          {data?.id ? "Update article" : "Create a new blog article"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="coverImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover Image</FormLabel>
                  <FormControl>
                    <ImageUpload
                      type="profile"
                      value={field.value.map((img) => img.url)}
                      disabled={isLoading}
                      onChange={(url) => field.onChange([{ url }])}
                      onRemove={(url) =>
                        field.onChange(field.value.filter((img) => img.url !== url))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input 
                        placeholder="Article Title" 
                        {...field} 
                        onChange={(e) => {
                            field.onChange(e);
                            onTitleChange(e);
                        }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="article-slug" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="excerpt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Excerpt (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Brief summary of the article" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea 
                        placeholder="Write your article content here..." 
                        className="min-h-[300px]" 
                        {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="published"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Published</FormLabel>
                    <FormDescription>
                      If checked, this article will be visible to everyone.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : data?.id ? "Update Article" : "Create Article"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ArticleDetails;
