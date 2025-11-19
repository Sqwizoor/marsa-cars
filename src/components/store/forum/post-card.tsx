"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  ThumbsUp,
  MessageSquare,
  Edit,
  Trash2,
  MoreVertical,
  CheckCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReactionButtons } from "./reaction-buttons";

interface PostCardProps {
  post: {
    id: string;
    content: string;
    createdAt: Date;
    isEdited: boolean;
    editedAt?: Date | null;
    isAcceptedAnswer: boolean;
    reactionCount: number;
    replyCount: number;
    author: {
      id: string;
      name: string;
      picture: string;
      createdAt: Date;
      forumStats?: {
        postCount: number;
        reputation: number;
      } | null;
      forumBadges: {
        id: string;
        type: string;
        name: string;
        icon?: string | null;
        color?: string | null;
      }[];
    };
    replies?: any[];
    reactions?: any[];
  };
  currentUserId?: string;
  onReply?: (postId: string) => void;
  onEdit?: (postId: string, content: string) => void;
  onDelete?: (postId: string) => void;
}

export function PostCard({
  post,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
}: PostCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [showReplies, setShowReplies] = useState(false);

  const isAuthor = currentUserId === post.author.id;
  const memberSince = formatDistanceToNow(new Date(post.author.createdAt), {
    addSuffix: false,
  });

  const handleSaveEdit = () => {
    if (onEdit) {
      onEdit(post.id, editContent);
      setIsEditing(false);
    }
  };

  return (
    <Card className={post.isAcceptedAnswer ? "border-green-500 border-2" : ""}>
      <CardContent className="p-6">
        <div className="flex gap-4">
          {/* Author Sidebar */}
          <div className="flex-shrink-0 w-40 text-center">
            <Avatar className="h-20 w-20 mx-auto mb-2">
              <AvatarImage src={post.author.picture} alt={post.author.name} />
              <AvatarFallback>{post.author.name[0]}</AvatarFallback>
            </Avatar>
            <h4 className="font-semibold text-sm mb-1">{post.author.name}</h4>
            
            {/* Badges */}
            {post.author.forumBadges.length > 0 && (
              <div className="flex flex-wrap gap-1 justify-center mb-2">
                {post.author.forumBadges.slice(0, 3).map((badge) => (
                  <Badge
                    key={badge.id}
                    variant="secondary"
                    className="text-xs"
                    style={{
                      backgroundColor: badge.color || undefined,
                    }}
                  >
                    {badge.icon && <span className="mr-1">{badge.icon}</span>}
                    {badge.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Stats */}
            {post.author.forumStats && (
              <div className="text-xs text-gray-600 space-y-1">
                <div>
                  <span className="font-medium">
                    {post.author.forumStats.postCount}
                  </span>{" "}
                  posts
                </div>
                <div>
                  <span className="font-medium text-orange-600">
                    {post.author.forumStats.reputation}
                  </span>{" "}
                  rep
                </div>
                <div className="text-gray-500">Member {memberSince}</div>
              </div>
            )}
          </div>

          {/* Post Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>
                  {formatDistanceToNow(new Date(post.createdAt), {
                    addSuffix: true,
                  })}
                </span>
                {post.isEdited && post.editedAt && (
                  <span className="text-gray-500">
                    (edited{" "}
                    {formatDistanceToNow(new Date(post.editedAt), {
                      addSuffix: true,
                    })}
                    )
                  </span>
                )}
                {post.isAcceptedAnswer && (
                  <Badge className="bg-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Accepted Answer
                  </Badge>
                )}
              </div>

              {/* Action Menu */}
              {isAuthor && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete?.(post.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Content */}
            {isEditing ? (
              <div className="space-y-3">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={6}
                  className="w-full"
                />
                <div className="flex gap-2">
                  <Button onClick={handleSaveEdit} size="sm">
                    Save
                  </Button>
                  <Button
                    onClick={() => {
                      setIsEditing(false);
                      setEditContent(post.content);
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none mb-4">
                <p className="whitespace-pre-wrap text-gray-800">
                  {post.content}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4 pt-3 border-t">
              <ReactionButtons 
                postId={post.id} 
                reactions={post.reactions} 
                currentUserId={currentUserId}
              />
              
              {onReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onReply(post.id)}
                  className="gap-1"
                >
                  <MessageSquare className="h-4 w-4" />
                  Reply {post.replyCount > 0 && `(${post.replyCount})`}
                </Button>
              )}

              {post.replies && post.replies.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplies(!showReplies)}
                >
                  {showReplies ? "Hide" : "Show"} {post.replies.length} replies
                </Button>
              )}
            </div>

            {/* Replies */}
            {showReplies && post.replies && post.replies.length > 0 && (
              <div className="mt-4 pl-6 border-l-2 space-y-4">
                {post.replies.map((reply: any) => (
                  <div key={reply.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={reply.author.picture}
                          alt={reply.author.name}
                        />
                        <AvatarFallback>
                          {reply.author.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-sm">
                            {reply.author.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(reply.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-800 whitespace-pre-wrap">
                          {reply.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
