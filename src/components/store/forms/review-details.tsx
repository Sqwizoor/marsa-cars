"use client";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { AddReviewSchema } from "@/lib/schemas";
import {
  ReviewDetailsType,
  ReviewWithImageType,
  VariantInfoType,
} from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import Select from "../ui/selector";
import Input from "../ui/input";
import { Button } from "../ui/button";
import { PulseLoader } from "react-spinners";
import ImageUploadStore from "../shared/upload-images";
import { upsertReview } from "@/queries/review";
import { v4 } from "uuid";
import StarRatings from "react-star-ratings";

export default function ReviewDetails({
  productId,
  data,
  variantsInfo,
  setReviews,
  reviews,
}: {
  productId: string;
  data?: ReviewDetailsType;
  variantsInfo: VariantInfoType[];
  reviews: ReviewWithImageType[];
  setReviews: Dispatch<SetStateAction<ReviewWithImageType[]>>;
}) {
  // State for sizes
  const [sizes, setSizes] = useState<{ name: string; value: string }[]>([]);

  const defaultVariantName = useMemo(
    () => data?.variant || variantsInfo[0]?.variantName || "",
    [data?.variant, variantsInfo]
  );
  const defaultRating = data?.rating ?? 0;

  // Form hook for managing form state and validation
  const form = useForm<z.infer<typeof AddReviewSchema>>({
    mode: "onChange", // Form validation mode
    resolver: zodResolver(AddReviewSchema), // Resolver for form validation
    defaultValues: {
      // Setting default form values from data (if available)
      variantName: defaultVariantName,
      rating: defaultRating,
      size: data?.size || "",
      review: data?.review || "",
      quantity: data?.quantity || undefined,
      images: data?.images || [],
      color: data?.color || "",
    },
  });

  // Loading status based on form submission
  const isLoading = form.formState.isSubmitting;

  // Errors
  const errors = form.formState.errors;
  const ratingValue = form.watch("rating") ?? 0;
  const variantName = form.watch("variantName") || "";

  // Submit handler for form submission
  const handleSubmit = async (values: z.infer<typeof AddReviewSchema>) => {
    try {
      const response = await upsertReview(productId, {
        id: data?.id || v4(),
        variant: values.variantName,
        images: values.images,
        quantity: values.quantity,
        rating: values.rating,
        review: values.review,
        size: values.size,
        color: values.color,
      });
      if (response.id) {
        const rev = reviews.filter((rev) => rev.id !== response.id);
        setReviews([...rev, response]);
      }
      toast.success("Review Added Successfully");
    } catch (error: unknown) {
      // Handling form submission errors
      console.log(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to submit review"
      );
    }
  };

  const variants = variantsInfo.map((variant) => ({
    name: variant.variantName,
    value: variant.variantName,
    image: variant.variantImage,
    colors: variant.colors
      .map((color) => color?.name)
      .filter((name): name is string => Boolean(name))
      .join(","),
  }));

  useEffect(() => {
    const variant = variantsInfo.find((v) => v.variantName === variantName);
    if (!variant) {
      return;
    }

    const variantSizes = variant.sizes.map((s) => ({
      name: s.size,
      value: s.size,
    }));

    setSizes(variantSizes);

    const colorNames = variant.colors
      .map((color) => color?.name)
      .filter((name): name is string => Boolean(name));
    form.setValue("color", colorNames.join(","));

    const currentSize = form.getValues("size");
    const hasMatchingSize = variantSizes.some(
      (size) => size.value === currentSize
    );

    if (!hasMatchingSize) {
      form.setValue("size", "");
    }
  }, [form, variantName, variantsInfo]);

  useEffect(() => {
    if (!variantName && variantsInfo.length > 0) {
      form.setValue("variantName", variantsInfo[0].variantName);
    }
  }, [form, variantName, variantsInfo]);

  return (
    <div>
      <div className="p-4 bg-[#f5f5f5] rounded-xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="flex flex-col space-y-4">
              {/* Title */}
              <div className="pt-4">
                <h1 className="font-bold text-2xl">Add a review</h1>
              </div>
              {/* Form items */}
              <div className="flex flex-col gap-3">
                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex items-center gap-x-2">
                          {/* <ReactStars
                            count={5}
                            size={40}
                            color="#e2dfdf"
                            activeColor="#FFD804"
                            value={field.value}
                            changeRating={field.onChange}
                            isHalf
                            edit={true}
                          /> */}

                          <StarRatings
                            rating={field.value}
                            starRatedColor="#ffb400" // Active star color (yellow)
                            starEmptyColor="#e2dfdf" // Inactive star color (gray)
                            numberOfStars={5}
                            starDimension="19px"
                            starSpacing="2px"
                            changeRating={field.onChange}
                          />
                          <span>({ratingValue.toFixed(1)} out of 5.0)</span>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="w-full flex flex-wrap gap-x-4">
                  <div className="flex items-center flex-wrap gap-2">
                    <FormField
                      control={form.control}
                      name="variantName"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Select
                              value={field.value}
                              onChange={field.onChange}
                              options={variants}
                              placeholder="Select product"
                              subPlaceholder="Please select a product"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="size"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Select
                            value={field.value}
                            onChange={field.onChange}
                            options={sizes}
                            placeholder="Select size"
                            subPlaceholder="Please select a size"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            name="quantity"
                            type="number"
                            placeholder="Quantity (Optional)"
                            onChange={(event) => {
                              const value = event.target.value;
                              field.onChange(value);
                            }}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="review"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <textarea
                          className="min-h-32 p-4 w-full rounded-xl focus:outline-none ring-1 ring-[transparent] focus:ring-[#11BE86]"
                          placeholder="Write your review..."
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="images"
                  render={({ field }) => (
                    <FormItem className="w-full xl:border-r">
                      <FormControl>
                        <ImageUploadStore
                          value={field.value.map((image) => image.url)}
                          disabled={isLoading}
                          onChange={(url) => {
                            const nextImages = [...field.value, { url }];
                            if (nextImages.length <= 3) {
                              field.onChange(nextImages);
                            }
                          }}
                          onRemove={(url) =>
                            field.onChange(
                              field.value.filter((current) => current.url !== url)
                            )
                          }
                          maxImages={3}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-2 text-destructive">
                {errors.rating && <p>{errors.rating.message}</p>}
                {errors.size && <p>{errors.size.message}</p>}
                {errors.review && <p>{errors.review.message}</p>}
              </div>
              <div className="w-full flex justify-end">
                <Button type="submit" className="w-36 h-12">
                  {isLoading ? (
                    <PulseLoader size={5} color="#fff" />
                  ) : (
                    "Submit Review"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
