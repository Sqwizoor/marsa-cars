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
    <Card className="hover:shadow-md transition-all duration-200 border-secondary-lightGrey">
      <CardHeader className="pb-2 pt-4 px-4 bg-main-lightGrey">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Link href={`/forum/${category.slug}`}>
              <CardTitle className="text-base font-bold hover:text-pink-primary cursor-pointer transition-colors text-secondary-charcoal">
                {category.name}
              </CardTitle>
            </Link>
            <p className="text-xs text-secondary-mediumGrey mt-0.5 line-clamp-1">
              {category.description}
            </p>
          </div>
          <div className="text-right ml-3">
            <div className="text-sm font-bold text-secondary-charcoal">
              {totalThreads}
            </div>
            <div className="text-[10px] text-secondary-mediumGrey">threads</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-3 pb-3 px-4">
        {/* Subforums */}
        {category.subforums.length > 0 && (
          <div className="space-y-1.5 mb-2">
            {category.subforums.map((subforum) => (
              <Link
                key={subforum.id}
                href={`/forum/${category.slug}/${subforum.slug}`}
                className="block p-2 rounded hover:bg-pink-background/30 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-xs text-secondary-charcoal hover:text-pink-primary transition-colors truncate">
                      {subforum.name}
                    </h4>
                    <p className="text-[10px] text-secondary-mediumGrey mt-0.5 line-clamp-1">
                      {subforum.description}
                    </p>
                  </div>
                  <div className="ml-3 text-right flex-shrink-0">
                    <div className="text-xs font-bold text-secondary-charcoal">
                      {subforum.threadCount}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between pt-2 border-t border-secondary-lightGrey">
          <div className="flex items-center gap-3 text-xs text-secondary-mediumGrey">
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3 text-pink-primary" />
              <span className="font-semibold text-secondary-charcoal">{totalThreads}</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-navy-primary" />
              <span className="font-semibold text-secondary-charcoal">{totalPosts}</span>
            </div>
          </div>
          <Link
            href={`/forum/${category.slug}`}
            className="text-xs font-semibold text-pink-primary hover:text-pink-dark hover:underline"
          >
            View all →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
