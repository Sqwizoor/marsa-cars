"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ReplyFormProps {
  threadId: string;
  parentPostId?: string;
  user: {
    name: string;
    picture: string;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ReplyForm({
  threadId,
  parentPostId,
  user,
  onSuccess,
  onCancel,
}: ReplyFormProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/forum/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId,
          content: content.trim(),
          parentPostId,
        }),
      });

      if (response.ok) {
        setContent("");
        onSuccess?.();
        router.refresh();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to post reply");
      }
    } catch (error) {
      console.error("Error posting reply:", error);
      alert("Failed to post reply");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardContent className="p-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <Avatar className="h-10 w-10 flex-shrink-0 ring-2 ring-white shadow-sm">
              <AvatarImage src={user.picture} alt={user.name} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={
                  parentPostId
                    ? "Write your reply..."
                    : "Share your thoughts, answer questions, or contribute to the discussion..."
                }
                rows={6}
                required
                className="w-full text-base font-medium text-main-primary bg-white/50 backdrop-blur-sm focus:bg-white transition-all border-gray-200 focus:border-blue-primary focus:ring-blue-primary/20"
              />
              <div className="flex gap-2 mt-3">
                <Button 
                  type="submit" 
                  disabled={loading || !content.trim()}
                  className="bg-blue-primary hover:bg-blue-hover text-white font-bold"
                >
                  {loading ? "Posting..." : parentPostId ? "Post Reply" : "Post Reply"}
                </Button>
                {onCancel && (
                  <Button type="button" variant="outline" onClick={onCancel} className="hover:bg-red-50 hover:text-red-600 hover:border-red-200">
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
