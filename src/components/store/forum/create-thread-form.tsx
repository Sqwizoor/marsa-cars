"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface CreateThreadFormProps {
  categories: {
    id: string;
    name: string;
    slug: string;
    subforums: {
      id: string;
      name: string;
      slug: string;
    }[];
  }[];
}

export function CreateThreadForm({ categories }: CreateThreadFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subforumId, setSubforumId] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const selectedCategory = categories.find((c) => c.id === categoryId);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !categoryId) return;

    setLoading(true);
    try {
      const response = await fetch("/api/forum/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          categoryId,
          subforumId: subforumId || undefined,
          tags,
        }),
      });

      if (response.ok) {
        const thread = await response.json();
        router.push(`/forum/thread/${thread.slug}`);
      } else {
        alert("Failed to create thread");
      }
    } catch (error) {
      console.error("Error creating thread:", error);
      alert("Failed to create thread");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-main-primary">Create New Thread</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-main-primary font-bold">Thread Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a descriptive title for your thread"
              required
              maxLength={200}
              className="text-base font-medium text-main-primary border-gray-200 focus:border-blue-primary focus:ring-blue-primary/20"
            />
            <p className="text-xs text-main-secondary font-medium">
              {title.length}/200 characters
            </p>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-main-primary font-bold">Category *</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="text-base font-medium text-main-primary border-gray-200 focus:border-blue-primary focus:ring-blue-primary/20">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subforum */}
          {selectedCategory && selectedCategory.subforums.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="subforum" className="text-main-primary font-bold">Subforum (Optional)</Label>
              <Select value={subforumId} onValueChange={setSubforumId}>
                <SelectTrigger className="text-base font-medium text-main-primary border-gray-200 focus:border-blue-primary focus:ring-blue-primary/20">
                  <SelectValue placeholder="Select a subforum (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {selectedCategory.subforums.map((subforum) => (
                    <SelectItem key={subforum.id} value={subforum.id}>
                      {subforum.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content" className="text-main-primary font-bold">Content *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe your question or topic in detail..."
              rows={12}
              required
              className="text-base font-medium text-main-primary border-gray-200 focus:border-blue-primary focus:ring-blue-primary/20"
            />
            <p className="text-xs text-main-secondary font-medium">
              Be as detailed as possible. Include relevant information like car
              model, year, part numbers, etc.
            </p>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags" className="text-main-primary font-bold">Tags (Optional)</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add tags (e.g., engine, brakes, turbo)"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="text-base font-medium text-main-primary border-gray-200 focus:border-blue-primary focus:ring-blue-primary/20"
              />
              <Button type="button" onClick={handleAddTag} variant="outline" className="hover:bg-blue-50 hover:text-blue-primary hover:border-blue-200">
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1 bg-blue-50 text-blue-primary hover:bg-blue-100 border-none">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-600 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={loading || !title || !content || !categoryId}
              className="bg-blue-primary hover:bg-blue-hover text-white font-bold px-8"
            >
              {loading ? "Creating..." : "Create Thread"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
