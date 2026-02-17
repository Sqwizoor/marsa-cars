import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { Article } from "@prisma/client";

interface ArticleCardProps {
  article: Article & {
    author: {
      name: string;
      picture: string;
    };
  };
}

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <article className="group flex flex-col h-full bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
      <Link href={`/articles/${article.slug}`} className="block relative aspect-[16/9] overflow-hidden">
        <Image
          src={article.coverImage}
          alt={article.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>
      
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center gap-2 mb-3">
            {article.tags.length > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600">
                    {article.tags[0]}
                </span>
            )}
            <time dateTime={article.publishedAt?.toISOString()} className="text-xs text-slate-500">
                {article.publishedAt ? format(new Date(article.publishedAt), 'MMM d, yyyy') : ''}
            </time>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          <Link href={`/articles/${article.slug}`}>
            {article.title}
          </Link>
        </h3>
        
        {article.excerpt && (
          <p className="text-slate-600 text-sm line-clamp-3 mb-4 flex-1">
            {article.excerpt}
          </p>
        )}
        
        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-100">
                {article.author.picture ? (
                    <Image 
                        src={article.author.picture} 
                        alt={article.author.name}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400">
                        {article.author.name.charAt(0)}
                    </div>
                )}
            </div>
            <span className="text-sm font-medium text-slate-700">
                {article.author.name}
            </span>
        </div>
      </div>
    </article>
  );
}
