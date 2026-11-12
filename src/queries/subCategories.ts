"use server";

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { SubCategory } from "@prisma/client";
import { api, convexQuery, convexMutation, isConvexEnabled } from "@/lib/convex";

export const upsertSubCategory = async (subCategory: SubCategory) => {
  try {
    const user = await currentUser();
    if (!user) throw new Error("Unauthenticated.");
    if (user.privateMetadata.role !== "ADMIN")
      throw new Error(
        "Unauthorized Access: Admin Privileges Required for Entry."
      );
    if (!subCategory) throw new Error("Please provide subCategory data.");

    if (isConvexEnabled()) {
      return (await convexMutation(api.subCategories.upsertSubCategory, {
        id: subCategory.id,
        name: subCategory.name,
        image: subCategory.image,
        url: subCategory.url,
        featured: subCategory.featured,
        categoryId: subCategory.categoryId,
      })) as any;
    }

    const existingSubCategory = await db.subCategory.findFirst({
      where: {
        AND: [
          {
            OR: [{ name: subCategory.name }, { url: subCategory.url }],
          },
          {
            NOT: {
              id: subCategory.id,
            },
          },
        ],
      },
    });

    if (existingSubCategory) {
      let errorMessage = "";
      if (existingSubCategory.name === subCategory.name) {
        errorMessage = "A SubCategory with the same name already exists";
      } else if (existingSubCategory.url === subCategory.url) {
        errorMessage = "A SubCategory with the same URL already exists";
      }
      throw new Error(errorMessage);
    }

    const subCategoryDetails = await db.subCategory.upsert({
      where: {
        id: subCategory.id,
      },
      update: subCategory,
      create: subCategory,
    });
    return subCategoryDetails;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getAllSubCategories = async () => {
  if (isConvexEnabled()) {
    return (await convexQuery(api.subCategories.getAllSubCategories, {})) as any[];
  }

  const subCategories = await db.subCategory.findMany({
    include: {
      category: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
  return subCategories;
};

export const getSubCategory = async (subCategoryId: string) => {
  if (!subCategoryId) throw new Error("Please provide suCategory ID.");

  if (isConvexEnabled()) {
    return (await convexQuery(api.subCategories.getSubCategory, {
      subCategoryId,
    })) as any;
  }

  const subCategory = await db.subCategory.findUnique({
    where: {
      id: subCategoryId,
    },
  });
  return subCategory;
};

export const deleteSubCategory = async (subCategoryId: string) => {
  const user = await currentUser();
  if (!user) throw new Error("Unauthenticated.");
  if (user.privateMetadata.role !== "ADMIN")
    throw new Error(
      "Unauthorized Access: Admin Privileges Required for Entry."
    );
  if (!subCategoryId) throw new Error("Please provide category ID.");

  if (isConvexEnabled()) {
    return (await convexMutation(api.subCategories.deleteSubCategory, {
      subCategoryId,
    })) as any;
  }

  const response = await db.subCategory.delete({
    where: {
      id: subCategoryId,
    },
  });
  return response;
};

export const getSubcategories = async (
  limit: number | null,
  random: boolean = false
): Promise<SubCategory[]> => {
  enum SortOrder {
    asc = "asc",
    desc = "desc",
  }
  try {
    if (isConvexEnabled()) {
      return (await convexQuery(api.subCategories.getSubcategories, {
        limit: limit || undefined,
        random,
      })) as any[];
    }

    const queryOptions = {
      take: limit || undefined,
      orderBy: random ? undefined : { createdAt: SortOrder.desc },
    };

    if (random) {
      const subcategories = await db.$queryRaw<SubCategory[]>`
    SELECT * FROM "SubCategory"
    ORDER BY RANDOM()
    LIMIT ${limit || 10}
    `;
      return subcategories;
    } else {
      const subcategories = await db.subCategory.findMany(queryOptions);
      return subcategories;
    }
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    throw error;
  }
};
