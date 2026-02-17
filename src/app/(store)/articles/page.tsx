import { getAllArticles } from "@/queries/articles";
import ArticleCard from "@/components/store/cards/article-card";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Automotive News & Articles | Cars App",
  description: "Read the latest news, reviews, and insights about the automotive world.",
};

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
    const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.search || "";
  const { articles, totalPages } = await getAllArticles(page, 12, search);

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-gray-900 mb-4">
            Automotive Journal
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Discover the latest trends, expert car reviews, and maintenance tips to keep you informed.
          </p>
        </div>

        {articles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <h3 className="text-xl font-medium text-gray-500">No articles found.</h3>
          </div>
        )}

        {/* Basic Pagination */}
        {totalPages > 1 && (
            <div className="mt-12 flex justify-center gap-2">
                {page > 1 && (
                    <a href={`/articles?page=${page - 1}`} className="px-4 py-2 border rounded-md bg-white hover:bg-gray-50">Previous</a>
                )}
                <span className="px-4 py-2 text-gray-600">Page {page} of {totalPages}</span>
                {page < totalPages && (
                    <a href={`/articles?page=${page + 1}`} className="px-4 py-2 border rounded-md bg-white hover:bg-gray-50">Next</a>
                )}
            </div>
        )}
      </div>
    </div>
  );
}
