"use server";

import { db } from "@/lib/db";
import { api, convexMutation, isConvexEnabled } from "@/lib/convex";
import { ReviewDetailsType } from "@/lib/types";
import { currentUser } from "@clerk/nextjs/server";

// Function: upsertReview
// Description: Upserts a review into the database, updating if it exists or creating a new one if not.
// Permission Level: Admin only for creation/updation of reviews.
// Parameters:
//   - productId: ID of the product the review is associated with.
//   - review: Review object containing details of the review to be upserted.
// Returns: Updated or newly created review details.
export const upsertReview = async (
  productId: string,
  review: ReviewDetailsType
) => {
  try {
    // Get current user
    const user = await currentUser();

    // Ensure user is authenticated
    if (!user) throw new Error("Unauthenticated.");

    // Ensure productId and review data are provided
    if (!productId) throw new Error("Product ID is required.");
    if (!review) throw new Error("Please provide review data.");

    if (isConvexEnabled()) {
      return await convexMutation(api.products.upsertReview, {
        productId,
        userId: user.id,
        review: {
          id: review.id,
          variant: review.variant,
          variantImage: (review as any).variantImage || "",
          review: review.review,
          rating: review.rating,
          size: review.size,
          quantity: review.quantity,
          color: review.color,
          images: (review.images || []).map((img) => ({ url: img.url })),
        },
      });
    }

    // check for existing review
    const existingReview = await db.review.findFirst({
      where: {
        productId,
        userId: user.id,
      },
    });

    let review_data: ReviewDetailsType = review;
    if (existingReview) {
      review_data = { ...review_data, id: existingReview.id };
    }
    // Upsert review into the database
    const reviewDetails = await db.review.upsert({
      where: {
        id: review_data.id,
      },
      update: {
        ...review_data,
        images: {
          deleteMany: {},
          create: review_data.images.map((img) => ({
            url: img.url,
          })),
        },
        userId: user.id,
      },
      create: {
        ...review_data,
        images: {
          create: review_data.images.map((img) => ({
            url: img.url,
          })),
        },
        productId,
        userId: user.id,
      },
      include: {
        images: true,
        user: true,
      },
    });

    // Calculate the new average rating
    const productReviews = await db.review.findMany({
      where: {
        productId,
      },
      select: {
        rating: true,
      },
    });

    const totalRating = productReviews.reduce(
      (acc, rev) => acc + rev.rating,
      0
    );

    const averageRating = totalRating / productReviews.length;

    // Update the product rating
    await db.product.update({
      where: {
        id: productId,
      },
      data: {
        rating: averageRating, // Update the product rating with the new average
        numReviews: productReviews.length, // Update the number of reviews
      },
    });
    return reviewDetails;
  } catch (error) {
    // Log and re-throw any errors
    console.log(error);
    throw error;
  }
};
