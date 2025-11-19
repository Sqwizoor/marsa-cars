import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import {
  ChevronRight,
  Eye,
  MessageSquare,
  Clock,
  Bookmark,
  Share2,
  Pin,
  Lock,
} from "lucide-react";
import { getThreadBySlug, getPosts } from "@/queries/forum";
import { PostCard } from "@/components/store/forum/post-card";
import { ReplyForm } from "@/components/store/forum/reply-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";

interface ThreadPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
}

async function ThreadContent({
  threadSlug,
  page,
}: {
  threadSlug: string;
  page: number;
}) {
  const thread = await getThreadBySlug(threadSlug);
  if (!thread) return null;

  const postsResult = await getPosts({
    threadId: thread.id,
    page,
    limit: 20,
  });

  const { userId } = await auth();

  return (
    <>
      {/* Thread Header */}
      <Card className="mb-6 border-none shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="pt-8 px-8">
          {/* Status Badges */}
          <div className="flex items-center gap-2 mb-6">
            {thread.isPinned && (
              <Badge className="bg-orange-primary hover:bg-orange-hover text-white border-none px-3 py-1">
                <Pin className="h-3 w-3 mr-1.5" />
                Pinned
              </Badge>
            )}
            {thread.isLocked && (
              <Badge variant="secondary" className="bg-main-secondary/10 text-main-secondary px-3 py-1">
                <Lock className="h-3 w-3 mr-1.5" />
                Locked
              </Badge>
            )}
            {thread.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="border-blue-primary/20 text-blue-primary bg-blue-50/50">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-4xl font-black mb-6 text-main-primary tracking-tight leading-tight">
            {thread.title}
          </h1>

          {/* Author & Meta */}
          <div className="flex items-center gap-6 text-sm text-main-secondary mb-8 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="font-medium">Started by</span>
              <Link
                href={`/forum/user/${thread.author.id}`}
                className="font-bold text-blue-primary hover:text-blue-hover hover:underline transition-colors"
              >
                {thread.author.name}
              </Link>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-orange-primary" />
              <span className="font-medium">
                {formatDistanceToNow(new Date(thread.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Eye className="h-4 w-4 text-blue-primary" />
              <span className="font-medium">{thread.views} views</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4 text-pink-primary" />
              <span className="font-medium">{thread._count.posts} replies</span>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none mb-8 text-main-primary font-medium leading-relaxed">
            <p className="whitespace-pre-wrap">{thread.content}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-6 border-t border-gray-100">
            <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:text-blue-primary hover:border-blue-200 transition-all">
              <Bookmark className="h-4 w-4 mr-2" />
              Bookmark
            </Button>
            <Button variant="outline" size="sm" className="hover:bg-orange-50 hover:text-orange-primary hover:border-orange-200 transition-all">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Posts */}
      <div className="space-y-6 mb-8">
        {postsResult.posts.map((post) => (
          <PostCard
            key={post.id}
            post={post as any}
            currentUserId={userId || undefined}
          />
        ))}
      </div>

      {/* Pagination */}
      {postsResult.pages > 1 && (
        <div className="flex justify-center gap-2 mb-8">
          {Array.from({ length: postsResult.pages }, (_, i) => i + 1).map((p) => (
            <Link key={p} href={`/forum/thread/${threadSlug}?page=${p}`}>
              <Button 
                variant={p === page ? "default" : "outline"} 
                size="sm"
                className={p === page ? "bg-blue-primary hover:bg-blue-hover" : ""}
              >
                {p}
              </Button>
            </Link>
          ))}
        </div>
      )}

      {/* Reply Form */}
      {!thread.isLocked && userId && (
        <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-2xl font-bold mb-6 text-main-primary flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-orange-primary" />
            Post a Reply
          </h2>
          <ReplyForm
            threadId={thread.id}
            user={{
              name: thread.author.name,
              picture: thread.author.picture,
            }}
          />
        </div>
      )}

      {thread.isLocked && (
        <Card className="bg-orange-50/50 border-orange-200 shadow-sm">
          <CardContent className="py-8 text-center">
            <Lock className="h-12 w-12 text-orange-primary mx-auto mb-4" />
            <p className="text-orange-900 font-bold text-lg">
              This thread has been locked and no new replies can be posted.
            </p>
          </CardContent>
        </Card>
      )}

      {!userId && (
        <Card className="bg-blue-50/50 border-blue-200 shadow-sm">
          <CardContent className="py-8 text-center">
            <p className="text-blue-900 font-bold text-lg mb-4">
              You must be signed in to reply to this thread.
            </p>
            <Link href="/sign-in">
              <Button className="bg-blue-primary hover:bg-blue-hover text-white px-8">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </>
  );
}

export default async function ThreadPage({
  params,
  searchParams,
}: ThreadPageProps) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  
  const thread = await getThreadBySlug(slug);

  if (!thread) {
    notFound();
  }

  const page = parseInt(pageParam || "1");

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-main-secondary mb-8 font-medium">
        <Link href="/forum" className="hover:text-blue-primary transition-colors">
          Forum
        </Link>
        <ChevronRight className="h-4 w-4 text-orange-primary" />
        <Link
          href={`/forum/${thread.category.slug}`}
          className="hover:text-blue-primary transition-colors"
        >
          {thread.category.name}
        </Link>
        {thread.subforum && (
          <>
            <ChevronRight className="h-4 w-4 text-orange-primary" />
            <Link
              href={`/forum/${thread.category.slug}/${thread.subforum.slug}`}
              className="hover:text-blue-primary transition-colors"
            >
              {thread.subforum.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-4 w-4 text-orange-primary" />
        <span className="font-bold text-main-primary">Thread</span>
      </div>

      {/* Content */}
      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="h-64 bg-gray-200 rounded-lg animate-pulse" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        }
      >
        <ThreadContent threadSlug={slug} page={page} />
      </Suspense>
    </div>
  );
}
