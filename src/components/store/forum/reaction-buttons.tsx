"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ReactionType } from "@prisma/client";
import { ThumbsUp, Lightbulb, Heart, Smile, CheckCircle, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReactionButtonsProps {
  postId: string;
  reactions?: any[];
  currentUserId?: string;
}

const reactionIcons: Record<ReactionType, { icon: React.ReactNode; label: string; color: string }> = {
  [ReactionType.LIKE]: {
    icon: <ThumbsUp className="h-4 w-4" />,
    label: "Like",
    color: "text-blue-600",
  },
  [ReactionType.HELPFUL]: {
    icon: <CheckCircle className="h-4 w-4" />,
    label: "Helpful",
    color: "text-green-600",
  },
  [ReactionType.THANKS]: {
    icon: <Heart className="h-4 w-4" />,
    label: "Thanks",
    color: "text-red-600",
  },
  [ReactionType.INFORMATIVE]: {
    icon: <Lightbulb className="h-4 w-4" />,
    label: "Informative",
    color: "text-yellow-600",
  },
  [ReactionType.FUNNY]: {
    icon: <Smile className="h-4 w-4" />,
    label: "Funny",
    color: "text-orange-600",
  },
  [ReactionType.AGREE]: {
    icon: <ThumbsUp className="h-4 w-4" />,
    label: "Agree",
    color: "text-teal-600",
  },
  [ReactionType.DISAGREE]: {
    icon: <ThumbsDown className="h-4 w-4" />,
    label: "Disagree",
    color: "text-gray-600",
  },
};

export function ReactionButtons({ postId, reactions = [], currentUserId }: ReactionButtonsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [localReactions, setLocalReactions] = useState(reactions);

  // Group reactions by type and count them
  const reactionCounts = localReactions?.reduce((acc, reaction) => {
    acc[reaction.type] = (acc[reaction.type] || 0) + 1;
    return acc;
  }, {} as Record<ReactionType, number>);

  const userReactions = localReactions?.filter(
    (r) => currentUserId && r.user.id === currentUserId
  );

  const handleReaction = async (type: ReactionType) => {
    if (!currentUserId) {
      alert("Please sign in to react to posts");
      return;
    }

    setLoading(true);
    
    // Optimistically update UI
    const hasReacted = userReactions?.some((r) => r.type === type);
    
    if (hasReacted) {
      // Remove reaction
      setLocalReactions(localReactions.filter(r => !(r.user.id === currentUserId && r.type === type)));
    } else {
      // Add reaction
      setLocalReactions([...localReactions, { 
        type, 
        user: { id: currentUserId, name: '', picture: '' },
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
      {Object.entries(reactionIcons).map(([type, { icon, label, color }]) => {
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
              "gap-1 h-8",
              hasReacted && color
            )}
          >
            {icon}
            <span className="text-xs">{label}</span>
            {count > 0 && (
              <span className="ml-1 font-semibold text-xs">
                {count}
              </span>
            )}
          </Button>
        );
      })}
    </div>
  );
}
