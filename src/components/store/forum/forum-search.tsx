"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search as SearchIcon, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export function ForumSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [open, setOpen] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/forum/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <SearchIcon className="h-4 w-4" />
          Search Forum
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white/95 backdrop-blur-md border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-main-primary">Search Forum</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search threads and posts..."
            className="flex-1 text-base font-medium text-main-primary border-gray-200 focus:border-blue-primary focus:ring-blue-primary/20"
          />
          <Button type="submit" disabled={loading} className="bg-blue-primary hover:bg-blue-hover text-white">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SearchIcon className="h-4 w-4" />
            )}
          </Button>
        </form>

        {results && (
          <div className="mt-4 space-y-6">
            {/* Threads */}
            {results.threads.length > 0 && (
              <div>
                <h3 className="font-bold text-xl mb-3 text-main-primary">
                  Threads ({results.threads.length})
                </h3>
                <div className="space-y-2">
                  {results.threads.map((thread: any) => (
                    <Link
                      key={thread.id}
                      href={`/forum/thread/${thread.slug}`}
                      onClick={() => setOpen(false)}
                    >
                      <Card className="p-4 hover:shadow-md transition-all cursor-pointer border-transparent hover:border-blue-100 hover:bg-blue-50/30">
                        <h4 className="font-bold text-blue-primary hover:underline mb-1">
                          {thread.title}
                        </h4>
                        <p className="text-sm text-main-secondary line-clamp-2 font-medium">
                          {thread.content}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-main-secondary font-medium">
                          <span className="text-orange-primary">{thread.category.name}</span>
                          <span>•</span>
                          <span>by {thread.author.name}</span>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Posts */}
            {results.posts.length > 0 && (
              <div>
                <h3 className="font-bold text-xl mb-3 text-main-primary">
                  Posts ({results.posts.length})
                </h3>
                <div className="space-y-2">
                  {results.posts.map((post: any) => (
                    <Link
                      key={post.id}
                      href={`/forum/thread/${post.thread.slug}`}
                      onClick={() => setOpen(false)}
                    >
                      <Card className="p-4 hover:shadow-md transition-all cursor-pointer border-transparent hover:border-blue-100 hover:bg-blue-50/30">
                        <p className="text-sm text-blue-primary hover:underline mb-2 font-bold">
                          in: {post.thread.title}
                        </p>
                        <p className="text-sm text-main-primary line-clamp-3 font-medium">
                          {post.content}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-main-secondary font-medium">
                          <span>by {post.author.name}</span>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {results.threads.length === 0 && results.posts.length === 0 && (
              <div className="text-center py-8 text-main-secondary font-medium">
                No results found for "{query}"
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
