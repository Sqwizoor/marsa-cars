import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
import { getCategoryBySlug, getThreads } from "@/queries/forum";
import { ThreadCard } from "@/components/store/forum/thread-card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
  searchParams: Promise<{
    page?: string;
    sort?: string;
    order?: string;
  }>;
}

async function CategoryThreads({
  categorySlug,
  page,
  sortBy,
  order,
}: {
  categorySlug: string;
  page: number;
  sortBy: string;
  order: string;
}) {
  const category = await getCategoryBySlug(categorySlug);
  if (!category) return null;

  const result = await getThreads({
    categoryId: category.id,
    page,
    sortBy: sortBy as any,
    order: order as any,
    limit: 20,
  });

  if (result.threads.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-gray-600 mb-4">No threads yet in this category.</p>
          <Link href="/forum/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Start the First Discussion
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {result.threads.map((thread) => (
        <ThreadCard key={thread.id} thread={thread as any} />
      ))}

      {/* Pagination */}
      {result.pages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: result.pages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/forum/${categorySlug}?page=${p}&sort=${sortBy}&order=${order}`}
            >
              <Button variant={p === page ? "default" : "outline"} size="sm">
                {p}
              </Button>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { category: categorySlug } = await params;
  const { page: pageParam, sort, order: orderParam } = await searchParams;
  
  const category = await getCategoryBySlug(categorySlug);

  if (!category) {
    notFound();
  }

  const page = parseInt(pageParam || "1");
  const sortBy = sort || "lastPostAt";
  const order = orderParam || "desc";

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <Link href="/forum" className="hover:text-blue-600">
          Forum
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium" style={{ color: category.color || undefined }}>
          {category.name}
        </span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold mb-2" style={{ color: category.color || undefined }}>
            {category.icon && <span className="mr-3">{category.icon}</span>}
            {category.name}
          </h1>
          <p className="text-lg text-gray-600">{category.description}</p>
        </div>
        <Link href="/forum/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Thread
          </Button>
        </Link>
      </div>

      {/* Subforums */}
      {category.subforums.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Subforums</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {category.subforums.map((subforum) => (
                <Link
                  key={subforum.id}
                  href={`/forum/${categorySlug}/${subforum.slug}`}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {subforum.name}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {subforum.description}
                  </p>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-gray-600">
          {category._count.threads} threads
        </div>
        <div className="flex items-center gap-3">
          <Select defaultValue={sortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lastPostAt">Latest Activity</SelectItem>
              <SelectItem value="createdAt">Newest</SelectItem>
              <SelectItem value="views">Most Viewed</SelectItem>
              <SelectItem value="postCount">Most Replies</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Threads */}
      <Suspense
        fallback={
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        }
      >
        <CategoryThreads
          categorySlug={categorySlug}
          page={page}
          sortBy={sortBy}
          order={order}
        />
      </Suspense>
    </div>
  );
}
