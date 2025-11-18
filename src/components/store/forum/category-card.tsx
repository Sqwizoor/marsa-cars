"use client";

import Link from "next/link";
import { MessageSquare, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    slug: string;
    description: string;
    icon?: string | null;
    color?: string | null;
    subforums: {
      id: string;
      name: string;
      slug: string;
      description: string;
      threadCount: number;
      postCount: number;
    }[];
    _count: {
      threads: number;
    };
  };
}

export function CategoryCard({ category }: CategoryCardProps) {
  const totalPosts = category.subforums.reduce(
    (acc, sub) => acc + sub.postCount,
    0
  );
  const totalThreads = category._count.threads;

  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardHeader
        className="pb-3"
        style={{
          backgroundColor: category.color
            ? `${category.color}10`
            : undefined,
        }}
      >
        <div className="flex items-center gap-3">
          {category.icon && (
            <div
              className="text-3xl"
              style={{ color: category.color || undefined }}
            >
              {category.icon}
            </div>
          )}
          <div className="flex-1">
            <Link href={`/forum/${category.slug}`}>
              <CardTitle
                className="text-xl hover:underline cursor-pointer"
                style={{ color: category.color || undefined }}
              >
                {category.name}
              </CardTitle>
            </Link>
            <p className="text-sm text-gray-600 mt-1">
              {category.description}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {/* Subforums */}
        {category.subforums.length > 0 && (
          <div className="space-y-3 mb-4">
            {category.subforums.map((subforum) => (
              <Link
                key={subforum.id}
                href={`/forum/${category.slug}/${subforum.slug}`}
                className="block p-3 rounded-lg hover:bg-gray-50 transition-colors border"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 hover:text-blue-600">
                      {subforum.name}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                      {subforum.description}
                    </p>
                  </div>
                  <div className="ml-4 text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {subforum.threadCount}
                    </div>
                    <div className="text-xs text-gray-500">threads</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span className="font-medium">{totalThreads}</span>
              <span>threads</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              <span className="font-medium">{totalPosts}</span>
              <span>posts</span>
            </div>
          </div>
          <Link
            href={`/forum/${category.slug}`}
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            View all →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
