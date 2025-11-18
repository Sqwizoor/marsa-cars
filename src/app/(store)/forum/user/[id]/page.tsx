import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Award, MessageSquare, Heart, TrendingUp } from "lucide-react";
import { db } from "@/lib/db";
import { getUserForumStats, getUserForumActivity } from "@/queries/forum";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";

interface UserProfilePageProps {
  params: {
    id: string;
  };
}

async function UserProfile({ userId }: { userId: string }) {
  const [user, stats, activity] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        picture: true,
        createdAt: true,
      },
    }),
    getUserForumStats(userId),
    getUserForumActivity(userId, 10),
  ]);

  if (!user) return null;

  const memberSince = formatDistanceToNow(new Date(user.createdAt), {
    addSuffix: false,
  });

  return (
    <div className="space-y-6">
      {/* User Info Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.picture} alt={user.name} />
              <AvatarFallback className="text-2xl">{user.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
              <p className="text-gray-600 mb-4">Member for {memberSince}</p>

              {/* Stats Grid */}
              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {stats.threadCount}
                    </div>
                    <div className="text-sm text-gray-600">Threads</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {stats.postCount}
                    </div>
                    <div className="text-sm text-gray-600">Posts</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {stats.reputation}
                    </div>
                    <div className="text-sm text-gray-600">Reputation</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {stats.helpfulCount}
                    </div>
                    <div className="text-sm text-gray-600">Helpful</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      {activity.badges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Badges & Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {activity.badges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg"
                >
                  {badge.icon && (
                    <span className="text-2xl">{badge.icon}</span>
                  )}
                  <div>
                    <div className="font-semibold text-sm">{badge.name}</div>
                    <div className="text-xs text-gray-600">
                      {badge.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Threads */}
      {activity.threads.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Recent Threads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activity.threads.map((thread) => (
                <div key={thread.id} className="border-b pb-4 last:border-0">
                  <Link
                    href={`/forum/thread/${thread.slug}`}
                    className="font-semibold text-lg hover:text-blue-600 transition-colors block mb-2"
                  >
                    {thread.title}
                  </Link>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <Link
                      href={`/forum/${thread.category.slug}`}
                      className="text-blue-600 hover:underline"
                    >
                      {thread.category.name}
                    </Link>
                    <span>
                      {formatDistanceToNow(new Date(thread.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                    <span>{thread._count.posts} replies</span>
                    <span>{thread.views} views</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Posts */}
      {activity.posts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Recent Posts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activity.posts.map((post) => (
                <div key={post.id} className="border-b pb-4 last:border-0">
                  <Link
                    href={`/forum/thread/${post.thread.slug}`}
                    className="text-sm text-blue-600 hover:underline block mb-2"
                  >
                    in: {post.thread.title}
                  </Link>
                  <p className="text-gray-800 line-clamp-3 mb-2">
                    {post.content}
                  </p>
                  <span className="text-sm text-gray-600">
                    {formatDistanceToNow(new Date(post.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Activity */}
      {activity.threads.length === 0 && activity.posts.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No forum activity yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <Link href="/forum" className="hover:text-blue-600">
          Forum
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-gray-900">User Profile</span>
      </div>

      {/* Content */}
      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="h-64 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-48 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
          </div>
        }
      >
        <UserProfile userId={params.id} />
      </Suspense>
    </div>
  );
}
