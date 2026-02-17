import { getLatestArticles } from "@/queries/articles";
import ArticleCard from "@/components/store/cards/article-card";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function ArticlesSection() {
  const articles = await getLatestArticles(4);

  return (
    <section className="py-12 md:py-16 bg-gray-50/50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 md:mb-10 gap-4">
          <div>
             <div className="flex items-center gap-2 mb-2">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-200">
                  Blog & News
                </span>
             </div>
            <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter text-gray-900 mb-2">
              Latest Automotive News
            </h2>
            <p className="text-slate-600 max-w-2xl text-sm md:text-base">
              Stay informed with expert reviews, industry trends, and the latest car launches.
            </p>
          </div>
          <Link 
            href="/articles" 
            className="hidden md:inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors group"
          >
            View All Articles <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {articles && articles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500 font-medium">No articles found at the moment.</p>
          </div>
        )}

        <div className="mt-8 text-center md:hidden">
            <Link 
            href="/articles" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-full text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50 transition-colors"
          >
            View All Articles <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
