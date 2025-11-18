import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getForumCategories } from "@/queries/forum";
import { CreateThreadForm } from "@/components/store/forum/create-thread-form";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const metadata = {
  title: "Create New Thread | Forum",
  description: "Start a new discussion in the car parts forum",
};

export default async function NewThreadPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in?redirect=/forum/new");
  }

  const categories = await getForumCategories();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <Link href="/forum" className="hover:text-blue-600">
          Forum
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-gray-900">New Thread</span>
      </div>

      {/* Form */}
      <CreateThreadForm categories={categories as any} />
    </div>
  );
}
