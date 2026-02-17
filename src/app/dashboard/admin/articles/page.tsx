import { getAdminArticles } from "@/queries/articles";
import DataTable from "@/components/ui/data-table";
import { columns } from "./columns";
import CustomModal from "@/components/dashboard/shared/custom-modal";
import ArticleDetails from "@/components/dashboard/forms/article-details";
import { FilePlus2 } from "lucide-react";

export default async function AdminArticlesPage() {
  const articles = await getAdminArticles();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Blog Articles</h1>
      </div>
      
      <DataTable
        filterValue="title"
        data={articles as any}
        searchPlaceholder="Search article title..."
        columns={columns as any}
        actionButtonText={
            <div className="flex items-center gap-2">
                <FilePlus2 className="w-4 h-4" />
                Upload Article
            </div>
        }
        modalChildren={
            <ArticleDetails />
        }
        heading="Create Article"
        subheading="Write and publish a new blog article for your store."
        newTabLink="" // We use modalChildren instead
      />
    </div>
  );
}
