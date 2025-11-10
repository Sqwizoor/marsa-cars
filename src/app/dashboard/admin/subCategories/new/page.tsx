import SubCategoryDetails from "@/components/dashboard/forms/subCategory-details";
import { getAllCategories } from "@/queries/category";

export const dynamic = 'force-dynamic';

export default async function AdminNewSubCategoryPage() {
  const categories = await getAllCategories();
  return (
    <div>
      <SubCategoryDetails categories={categories} />
    </div>
  );
}
