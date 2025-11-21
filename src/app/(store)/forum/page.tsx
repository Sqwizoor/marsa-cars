import { Suspense } from "react";
import Link from "next/link";
import { MessageSquare, TrendingUp, Users, FileText } from "lucide-react";
import { getForumCategories, getForumStats, getTrendingThreads } from "@/queries/forum";
import { CategoryCard } from "@/components/store/forum/category-card";
import { ThreadCard } from "@/components/store/forum/thread-card";
import { ForumSearch } from "@/components/store/forum/forum-search";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata = {
  title: "Car Parts Forum | Community Discussions",
  description: "Join the conversation! Ask questions, share knowledge, and connect with car enthusiasts and experts.",
};

async function ForumStats() {
  const stats = await getForumStats();

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <Card className="border-secondary-lightGrey">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-pink-background rounded-lg">
              <MessageSquare className="h-6 w-6 text-pink-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-charcoal">{stats.totalThreads.toLocaleString()}</p>
              <p className="text-sm text-secondary-mediumGrey">Threads</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-secondary-lightGrey">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-navy-primary/10 rounded-lg">
              <FileText className="h-6 w-6 text-navy-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-charcoal">{stats.totalPosts.toLocaleString()}</p>
              <p className="text-sm text-secondary-mediumGrey">Posts</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-secondary-lightGrey">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-secondary-charcoal/10 rounded-lg">
              <Users className="h-6 w-6 text-secondary-charcoal" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-charcoal">{stats.totalUsers.toLocaleString()}</p>
              <p className="text-sm text-secondary-mediumGrey">Members</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-secondary-lightGrey">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gold-primary/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-gold-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-charcoal">Active</p>
              <p className="text-sm text-secondary-mediumGrey">Community</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

async function TrendingThreads() {
  const threads = await getTrendingThreads(5);

  if (threads.length === 0) return null;

  return (
    <Card className="mb-8 border-secondary-lightGrey">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-secondary-charcoal">
          <TrendingUp className="h-5 w-5 text-pink-primary" />
          Trending This Week
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {threads.map((thread) => (
            <ThreadCard key={thread.id} thread={thread as any} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

async function ForumCategories() {
  const categories = await getForumCategories();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-xl font-bold text-secondary-charcoal">Forum Categories</h2>
        <div className="flex items-center gap-3">
          <ForumSearch />
          <Link href="/forum/new">
            <Button className="bg-pink-primary hover:bg-pink-light">
              <MessageSquare className="h-4 w-4 mr-2" />
              New Thread
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category as any} />
        ))}
      </div>
    </div>
  );
}

export default function ForumPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl font-[var(--font-inter)]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-3 text-secondary-charcoal">Car Parts Forum</h1>
        <p className="text-lg text-secondary-mediumGrey">
          Welcome to our community! Ask questions, share knowledge, and connect
          with fellow car enthusiasts and experts.
        </p>
      </div>

      <Separator className="mb-8" />

      {/* Stats */}
      <Suspense
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg" />
            ))}
          </div>
        }
      >
        <ForumStats />
      </Suspense>

      {/* Trending Threads */}
      <Suspense
        fallback={
          <Card className="mb-8">
            <CardHeader>
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
            </CardContent>
          </Card>
        }
      >
        <TrendingThreads />
      </Suspense>

      {/* Categories */}
      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        }
      >
        <ForumCategories />
      </Suspense>

      {/* Forum Rules/Info */}
      <Card className="mt-8 bg-pink-background border-pink-primary/20">
        <CardHeader>
          <CardTitle className="text-pink-primary">Forum Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-secondary-charcoal space-y-2">
          <ul className="list-disc list-inside space-y-1">
            <li>Be respectful and courteous to all members</li>
            <li>Stay on topic and post in the appropriate category</li>
            <li>No spam, advertising, or duplicate posts</li>
            <li>Use descriptive titles for your threads</li>
            <li>Search before posting to avoid duplicates</li>
            <li>Share accurate information and cite sources when possible</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
