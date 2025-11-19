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
                className="text-2xl font-bold hover:underline cursor-pointer"
                style={{ color: category.color || undefined }}
              >
                {category.name}
              </CardTitle>
            </Link>
            <p className="text-base text-main-secondary mt-1 font-medium">
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
                className="block p-3 rounded-lg hover:bg-blue-50/50 transition-colors border border-transparent hover:border-blue-100"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-bold text-main-primary hover:text-blue-primary transition-colors">
                      {subforum.name}
                    </h4>
                    <p className="text-sm text-main-secondary mt-1 line-clamp-1 font-medium">
                      {subforum.description}
                    </p>
                  </div>
                  <div className="ml-4 text-right">
                    <div className="text-sm font-bold text-main-primary">
                      {subforum.threadCount}
                    </div>
                    <div className="text-xs text-main-secondary font-medium">threads</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-4 text-sm text-main-secondary font-medium">
            <div className="flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4 text-orange-primary" />
              <span className="font-bold text-main-primary">{totalThreads}</span>
              <span>threads</span>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-blue-primary" />
              <span className="font-bold text-main-primary">{totalPosts}</span>
              <span>posts</span>
            </div>
          </div>
          <Link
            href={`/forum/${category.slug}`}
            className="text-sm font-bold text-blue-primary hover:text-blue-hover hover:underline"
          >
            View all →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
