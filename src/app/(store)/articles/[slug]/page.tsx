import { getArticleBySlug } from "@/queries/articles";
import { notFound } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) return {};

  return {
    title: `${article.title} | Cars App`,
    description: article.excerpt || article.title,
    openGraph: {
      images: [article.coverImage],
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) return notFound();

  return (
    <article className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <header className="mb-8 md:mb-12 text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-slate-500 mb-4">
            {article.tags.length > 0 && (
                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {article.tags[0]}
                </span>
            )}
            <span>&bull;</span>
            <time dateTime={article.publishedAt?.toISOString()}>
                {article.publishedAt ? format(new Date(article.publishedAt), 'MMM d, yyyy') : ''}
            </time>
        </div>
        
        <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter text-gray-900 mb-6 leading-tight">
          {article.title}
        </h1>

        <div className="flex items-center justify-center gap-3">
             <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 ring-2 ring-white shadow-sm">
                {article.author.picture ? (
                    <Image 
                        src={article.author.picture} 
                        alt={article.author.name}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-gray-400">
                        {article.author.name.charAt(0)}
                    </div>
                )}
            </div>
            <div className="text-left">
                <div className="font-bold text-gray-900 text-sm">{article.author.name}</div>
                <div className="text-xs text-slate-500">Author</div>
            </div>
        </div>
      </header>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: article.title,
            image: [article.coverImage],
            datePublished: article.publishedAt?.toISOString(),
            dateModified: article.updatedAt.toISOString(),
            author: [{
                '@type': 'Person',
                name: article.author.name,
            }]
          })
        }}
      />


      <div className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden mb-10 shadow-lg">
        <Image
          src={article.coverImage}
          alt={article.title}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1200px) 100vw, 1200px"
        />
      </div>

      <div 
        className="prose prose-lg prose-slate mx-auto prose-headings:font-black prose-headings:italic prose-headings:tracking-tight prose-img:rounded-xl"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
    </article>
  );
}
