"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ReactionType } from "@prisma/client";
import { ThumbsUp, Lightbulb, Heart, Smile, CheckCircle, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReactionButtonsProps {
  postId: string;
  reactions?: any[];
  currentUserId?: string;
}

const reactionIcons: Record<ReactionType, { icon: React.ReactNode; label: string; color: string; activeClass: string }> = {
  [ReactionType.LIKE]: {
    icon: <ThumbsUp className="h-4 w-4" />,
    label: "Like",
    color: "text-blue-primary",
    activeClass: "bg-blue-primary hover:bg-blue-hover text-white",
  },
  [ReactionType.HELPFUL]: {
    icon: <CheckCircle className="h-4 w-4" />,
    label: "Helpful",
    color: "text-green-600",
    activeClass: "bg-green-600 hover:bg-green-700 text-white",
  },
  [ReactionType.THANKS]: {
    icon: <Heart className="h-4 w-4" />,
    label: "Thanks",
    color: "text-pink-primary",
    activeClass: "bg-pink-primary hover:bg-pink-hover text-white",
  },
  [ReactionType.INFORMATIVE]: {
    icon: <Lightbulb className="h-4 w-4" />,
    label: "Informative",
    color: "text-yellow-500",
    activeClass: "bg-yellow-500 hover:bg-yellow-600 text-white",
  },
  [ReactionType.FUNNY]: {
    icon: <Smile className="h-4 w-4" />,
    label: "Funny",
    color: "text-orange-primary",
    activeClass: "bg-orange-primary hover:bg-orange-hover text-white",
  },
  [ReactionType.AGREE]: {
    icon: <ThumbsUp className="h-4 w-4" />,
    label: "Agree",
    color: "text-blue-primary",
    activeClass: "bg-blue-primary hover:bg-blue-hover text-white",
  },
  [ReactionType.DISAGREE]: {
    icon: <ThumbsDown className="h-4 w-4" />,
    label: "Disagree",
    color: "text-main-secondary",
    activeClass: "bg-main-secondary hover:bg-main-primary text-white",
  },
};

export function ReactionButtons({ postId, reactions = [], currentUserId }: ReactionButtonsProps) {
  const router = useRouter();
  const { userId: clerkUserId } = useAuth();
  const activeUserId = currentUserId || clerkUserId;

  const [loading, setLoading] = useState(false);
  const [localReactions, setLocalReactions] = useState(reactions);

  // Group reactions by type and count them
  const reactionCounts = localReactions?.reduce((acc, reaction) => {
    acc[reaction.type] = (acc[reaction.type] || 0) + 1;
    return acc;
  }, {} as Record<ReactionType, number>);

  const userReactions = localReactions?.filter(
    (r) => activeUserId && r.user.id === activeUserId
  );

  const handleReaction = async (type: ReactionType) => {
    if (!activeUserId) {
      alert("Please sign in to react to posts");
      return;
    }

    setLoading(true);
    
    // Optimistically update UI
    const hasReacted = userReactions?.some((r) => r.type === type);
    
    if (hasReacted) {
      // Remove reaction
      setLocalReactions(localReactions.filter(r => !(r.user.id === activeUserId && r.type === type)));
    } else {
      // Add reaction
      setLocalReactions([...localReactions, { 
        type, 
        user: { id: activeUserId, name: '', picture: '' },
        id: 'temp-' + Date.now()
      }]);
    }

    try {
      const response = await fetch("/api/forum/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, reactionType: type }),
      });

      if (response.ok) {
        // Refresh server data without full page reload
        router.refresh();
      } else {
        // Revert optimistic update on error
        setLocalReactions(reactions);
      }
    } catch (error) {
      console.error("Error toggling reaction:", error);
      // Revert optimistic update on error
      setLocalReactions(reactions);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {Object.entries(reactionIcons).map(([type, { icon, label, color, activeClass }]) => {
        const count = reactionCounts?.[type as ReactionType] || 0;
        const hasReacted = userReactions?.some((r) => r.type === type);

        return (
          <Button
            key={type}
            variant={hasReacted ? "default" : "outline"}
            size="sm"
            onClick={() => handleReaction(type as ReactionType)}
            disabled={loading}
            className={cn(
              "gap-1.5 h-8 transition-all duration-200 font-medium",
              hasReacted ? activeClass : `hover:bg-gray-50 ${color} border-gray-200`
            )}
          >
            {icon}
            <span className="text-xs">{label}</span>
            {count > 0 && (
              <span className={cn("ml-1 font-bold text-xs", hasReacted ? "text-white" : color)}>
                {count}
              </span>
            )}
          </Button>
        );
      })}
    </div>
  );
}
