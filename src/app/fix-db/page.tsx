import { db } from "@/lib/db";  // Adjust the import path if needed

export const dynamic = 'force-dynamic';

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

export default async function FixDbPage() {
  // Call the function to delete the store by its URL
  await deleteStoreByUrl("all-stores");
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Database Fix</h1>
      <p className="mt-4">Store deletion completed. Check console for results.</p>
    </div>
  );
}
