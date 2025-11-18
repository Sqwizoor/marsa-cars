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
  params: {
    slug: string;
  };
  searchParams: {
    page?: string;
  };
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
      <Card className="mb-6">
        <CardContent className="pt-6">
          {/* Status Badges */}
          <div className="flex items-center gap-2 mb-4">
            {thread.isPinned && (
              <Badge className="bg-orange-500">
                <Pin className="h-3 w-3 mr-1" />
                Pinned
              </Badge>
            )}
            {thread.isLocked && (
              <Badge variant="secondary">
                <Lock className="h-3 w-3 mr-1" />
                Locked
              </Badge>
            )}
            {thread.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold mb-4">{thread.title}</h1>

          {/* Author & Meta */}
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-2">
              <span>Started by</span>
              <Link
                href={`/forum/user/${thread.author.id}`}
                className="font-medium text-blue-600 hover:underline"
              >
                {thread.author.name}
              </Link>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>
                {formatDistanceToNow(new Date(thread.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{thread.views} views</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span>{thread._count.posts} replies</span>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-sm max-w-none mb-4">
            <p className="whitespace-pre-wrap text-gray-800">{thread.content}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-4 border-t">
            <Button variant="outline" size="sm">
              <Bookmark className="h-4 w-4 mr-2" />
              Bookmark
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Posts */}
      <div className="space-y-4 mb-6">
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
        <div className="flex justify-center gap-2 mb-6">
          {Array.from({ length: postsResult.pages }, (_, i) => i + 1).map((p) => (
            <Link key={p} href={`/forum/thread/${threadSlug}?page=${p}`}>
              <Button variant={p === page ? "default" : "outline"} size="sm">
                {p}
              </Button>
            </Link>
          ))}
        </div>
      )}

      {/* Reply Form */}
      {!thread.isLocked && userId && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Post a Reply</h2>
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
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="py-6 text-center">
            <Lock className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
            <p className="text-yellow-800 font-medium">
              This thread has been locked and no new replies can be posted.
            </p>
          </CardContent>
        </Card>
      )}

      {!userId && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="py-6 text-center">
            <p className="text-blue-800 font-medium mb-3">
              You must be signed in to reply to this thread.
            </p>
            <Link href="/sign-in">
              <Button>Sign In</Button>
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
  const thread = await getThreadBySlug(params.slug);

  if (!thread) {
    notFound();
  }

  const page = parseInt(searchParams.page || "1");

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <Link href="/forum" className="hover:text-blue-600">
          Forum
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link
          href={`/forum/${thread.category.slug}`}
          className="hover:text-blue-600"
        >
          {thread.category.name}
        </Link>
        {thread.subforum && (
          <>
            <ChevronRight className="h-4 w-4" />
            <Link
              href={`/forum/${thread.category.slug}/${thread.subforum.slug}`}
              className="hover:text-blue-600"
            >
              {thread.subforum.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-gray-900">Thread</span>
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
        <ThreadContent threadSlug={params.slug} page={page} />
      </Suspense>
    </div>
  );
}
