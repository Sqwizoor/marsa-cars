"use server";

//db
import { db } from "@/lib/db";
//clerk
import { currentUser } from "@clerk/nextjs/server";
import { Category } from "@prisma/client";

//Function : Upsert Category
//Desription : Upsert a category into the database, updating if it exist or create a new one
// Permission level : Admin only
//Parametrs:
//Category: Category object containing details of the category to be useImperativeHandle.
//Returns: Updated or newly created category details

export const upsertCategory = async (category: Category) => {
  try {
    //Get current user

    const user = await currentUser();
    //Ensure user is authenticated
    if (!user) throw new Error("Unauthenticated.");
    if (user.privateMetadata.role !== "ADMIN")
      throw new Error(
        "Unauthorised Access: Admin Privilages Required for entry."
      );

    if (!category) throw new Error("Please provide category data");

    //Throw error if category with same name or URL already exist
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

    //upsert category into the database
    const categoryDetails = await db.category.upsert({
      where: {
        id: category.id,
      },
      update: category,
      create: category,
    });

    return categoryDetails;
  } catch (error) {
    //log and re-throw any errors
    console.log(error);
    throw error;
  }
};

//Function: getAllCategories
//Description : Retrievs all categories from the databases.
//permission Level: Public
//Return: Array of categories sorted by updatedAt date in descending order
// export const getAllCategories = async () => {
//   //Retrieve all categories from database
//   const categories = await db.category.findMany({
//     orderBy: {
//       updatedAt: "desc",
//     },
//   });
//   return categories
// };





export const getAllCategories = async () => {
  // Retrieve all categories from database WITH their subcategories
  const categories = await db.category.findMany({
    include: {
      subCategories: true, // This is the key change - include the subcategories!
    },
    orderBy: {
      updatedAt: "desc",
    },
  })
  return categories
}




// Function: getAllCategoriesForCategory
// Description: Retrieves all SubCategories fro a category from the database.
// Permission Level: Public
// Returns: Array of subCategories of category sorted by updatedAt date in descending order.
export const getAllCategoriesForCategory = async (categoryId: string) => {
  // Retrieve all subcategories of category from the database
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

// Function: getCategory
// Description: Retrieves a specific category from the database.
// Access Level: Public
// Parameters:
//   - categoryId: The ID of the category to be retrieved.
// Returns: Details of the requested category.
export const getCategory = async (categoryId: string) => {
  // Ensure category ID is provided
  if (!categoryId) throw new Error("Please provide category ID.");

  // Retrieve category
  const category = await db.category.findUnique({
    where: {
      id: categoryId,
    },
  });
  return category;
};

// Function: deleteCategory
// Description: Deletes a category from the database.
// Permission Level: Admin only
// Parameters:
//   - categoryId: The ID of the category to be deleted.
// Returns: Response indicating success or failure of the deletion operation.
export const deleteCategory = async (categoryId: string) => {
  // Get current user
  const user = await currentUser();

  // Check if user is authenticated
  if (!user) throw new Error("Unauthenticated.");

  // Verify admin permission
  if (user.privateMetadata.role !== "ADMIN")
    throw new Error(
      "Unauthorized Access: Admin Privileges Required for Entry."
    );

  // Ensure category ID is provided
  if (!categoryId) throw new Error("Please provide category ID.");

  // Delete category from the database
  const response = await db.category.delete({
    where: {
      id: categoryId,
    },
  });
  return response;
};