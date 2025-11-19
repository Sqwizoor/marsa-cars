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
                <Pin className="h-4 w-4 text-orange-primary flex-shrink-0 mt-1.5" />
              )}
              {thread.isLocked && (
                <Lock className="h-4 w-4 text-main-secondary flex-shrink-0 mt-1.5" />
              )}
              <Link
                href={`/forum/thread/${thread.slug}`}
                className="font-bold text-xl text-main-primary hover:text-blue-primary transition-colors line-clamp-2"
              >
                {thread.title}
              </Link>
            </div>

            {/* Category & Subforum */}
            <div className="flex items-center gap-2 mb-2 text-sm">
              <Link
                href={`/forum/${thread.category.slug}`}
                className="text-blue-primary hover:text-blue-hover hover:underline font-bold"
                style={{ color: thread.category.color || undefined }}
              >
                {thread.category.name}
              </Link>
              {thread.subforum && (
                <>
                  <span className="text-main-secondary/50">/</span>
                  <Link
                    href={`/forum/${thread.category.slug}/${thread.subforum.slug}`}
                    className="text-main-secondary hover:text-blue-primary hover:underline font-medium"
                  >
                    {thread.subforum.name}
                  </Link>
                </>
              )}
            </div>

            {/* Content Preview */}
            <p className="text-sm text-main-secondary mb-3 line-clamp-2 font-medium">
              {thread.content}
            </p>

            {/* Tags */}
            {thread.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {thread.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs bg-blue-50 text-blue-primary hover:bg-blue-100 border-none">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Meta Info */}
            <div className="flex items-center gap-4 text-sm text-main-secondary font-medium">
              <div className="flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4 text-pink-primary" />
                <span>{thread.postCount}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Eye className="h-4 w-4 text-blue-primary" />
                <span>{thread.views}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-orange-primary" />
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
              <span className="text-main-secondary font-medium">Latest reply</span>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6 ring-2 ring-white">
                  <AvatarImage
                    src={thread.lastPostBy.picture}
                    alt={thread.lastPostBy.name}
                  />
                  <AvatarFallback>{thread.lastPostBy.name[0]}</AvatarFallback>
                </Avatar>
                <span className="font-bold text-main-primary">{thread.lastPostBy.name}</span>
              </div>
              <span className="text-main-secondary text-xs font-medium">
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
