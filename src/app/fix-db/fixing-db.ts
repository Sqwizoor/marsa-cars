import { db } from "@/lib/db";  // Adjust the import path if needed

async function deleteStoreByUrl(storeUrl: string) {
  try {
    await db.store.delete({
      where: {
        url: storeUrl,  // Using 'url' as a unique identifier
      },
    });
    console.log(`Store with URL '${storeUrl}' deleted successfully.`);
  } catch (error) {
    console.error("Error deleting store:", error);
  }
}

// Call the function to delete the store by its URL
deleteStoreByUrl("all-stores");
