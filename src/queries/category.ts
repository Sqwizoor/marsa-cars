"use server";

import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { Category } from "@prisma/client";
import { api, convexQuery, convexMutation, isConvexEnabled } from "@/lib/convex";

export const upsertCategory = async (category: Category) => {
  try {
    const user = await currentUser();
    if (!user) throw new Error("Unauthenticated.");
    if (user.privateMetadata.role !== "ADMIN")
      throw new Error(
        "Unauthorised Access: Admin Privilages Required for entry."
      );

    if (!category) throw new Error("Please provide category data");

    if (isConvexEnabled()) {
      return (await convexMutation(api.categories.upsertCategory, {
        id: category.id,
        name: category.name,
        image: category.image,
        url: category.url,
        featured: category.featured,
      })) as any;
    }

    const existingCategory = await db.category.findFirst({
      where: {
        AND: [
          {
            OR: [{ name: category.name }, { url: category.url }],
          },
          {
            NOT: {
              id: category.id,
            },
          },
        ],
      },
    });

    if (existingCategory) {
      let errorMessage = "";
      if (existingCategory.name === category.name) {
        errorMessage = " A category with the same Name alredy exists";
      } else if (existingCategory.url === category.url) {
        errorMessage = "A category with the smae URl already exists";
      }
      throw new Error(errorMessage);
    }

    const categoryDetails = await db.category.upsert({
      where: {
        id: category.id,
      },
      update: category,
      create: category,
    });

    return categoryDetails;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getAllCategories = async () => {
  if (isConvexEnabled()) {
    return (await convexQuery(api.categories.getAllCategories, {})) as any[];
  }

  const categories = await db.category.findMany({
    include: {
      subCategories: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
  return categories;
};

export const getAllCategoriesForCategory = async (categoryId: string) => {
  if (isConvexEnabled()) {
    return (await convexQuery(api.categories.getAllCategoriesForCategory, {
      categoryId,
    })) as any[];
  }

  const subCategories = await db.subCategory.findMany({
    where: {
      categoryId,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
  return subCategories;
};

export const getCategory = async (categoryId: string) => {
  if (!categoryId) throw new Error("Please provide category ID.");

  if (isConvexEnabled()) {
    return (await convexQuery(api.categories.getCategory, {
      categoryId,
    })) as any;
  }

  const category = await db.category.findUnique({
    where: {
      id: categoryId,
    },
  });
  return category;
};

export const deleteCategory = async (categoryId: string) => {
  const user = await currentUser();
  if (!user) throw new Error("Unauthenticated.");
  if (user.privateMetadata.role !== "ADMIN")
    throw new Error(
      "Unauthorized Access: Admin Privileges Required for Entry."
    );
  if (!categoryId) throw new Error("Please provide category ID.");

  if (isConvexEnabled()) {
    return (await convexMutation(api.categories.deleteCategory, {
      categoryId,
    })) as any;
  }

  const response = await db.category.delete({
    where: {
      id: categoryId,
    },
  });
  return response;
};
