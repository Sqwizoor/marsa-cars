"use client";

import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Eye, Clock, Pin, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ThreadCardProps {
  thread: {
    id: string;
    title: string;
    slug: string;
    content: string;
    views: number;
    postCount: number;
    isPinned: boolean;
    isLocked: boolean;
    tags: string[];
    createdAt: Date;
    lastPostAt: Date;
    author: {
      id: string;
      name: string;
      picture: string;
    };
    category: {
      name: string;
      slug: string;
      color?: string | null;
    };
    subforum?: {
      name: string;
      slug: string;
    } | null;
    lastPostBy?: {
      id: string;
      name: string;
      picture: string;
    } | null;
  };
}

export function ThreadCard({ thread }: ThreadCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <Avatar className="h-12 w-12">
              <AvatarImage src={thread.author.picture} alt={thread.author.name} />
              <AvatarFallback>{thread.author.name[0]}</AvatarFallback>
            </Avatar>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title & Status Icons */}
            <div className="flex items-start gap-2 mb-1">
              {thread.isPinned && (
                <Pin className="h-4 w-4 text-orange-500 flex-shrink-0 mt-1" />
              )}
              {thread.isLocked && (
                <Lock className="h-4 w-4 text-gray-500 flex-shrink-0 mt-1" />
              )}
              <Link
                href={`/forum/thread/${thread.slug}`}
                className="font-semibold text-lg hover:text-blue-600 transition-colors line-clamp-2"
              >
                {thread.title}
              </Link>
            </div>

            {/* Category & Subforum */}
            <div className="flex items-center gap-2 mb-2 text-sm">
              <Link
                href={`/forum/${thread.category.slug}`}
                className="text-blue-600 hover:underline font-medium"
                style={{ color: thread.category.color || undefined }}
              >
                {thread.category.name}
              </Link>
              {thread.subforum && (
                <>
                  <span className="text-gray-400">/</span>
                  <Link
                    href={`/forum/${thread.category.slug}/${thread.subforum.slug}`}
                    className="text-gray-600 hover:underline"
                  >
                    {thread.subforum.name}
                  </Link>
                </>
              )}
            </div>

            {/* Content Preview */}
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {thread.content}
            </p>

            {/* Tags */}
            {thread.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {thread.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Meta Info */}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>{thread.postCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{thread.views}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>
                  {formatDistanceToNow(new Date(thread.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Last Post Info */}
          {thread.lastPostBy && (
            <div className="hidden md:flex flex-col items-end gap-1 text-sm">
              <span className="text-gray-500">Latest reply</span>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={thread.lastPostBy.picture}
                    alt={thread.lastPostBy.name}
                  />
                  <AvatarFallback>{thread.lastPostBy.name[0]}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{thread.lastPostBy.name}</span>
              </div>
              <span className="text-gray-500 text-xs">
                {formatDistanceToNow(new Date(thread.lastPostAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
