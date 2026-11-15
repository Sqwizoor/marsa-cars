"use client";
import { SearchResult } from "@/lib/types";
import { Search as SearchIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";
import SearchSuggestions from "./suggestions";
import { trackMetaSearch } from "@/lib/meta-pixel";
export default function Search() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const params = new URLSearchParams(searchParams);
  const { push, replace } = useRouter();

  const search_query_url = params.get("search");

  const [searchQuery, setSearchQuery] = useState<string>(
    search_query_url || ""
  );
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      trackMetaSearch({
        searchString: searchQuery.trim(),
        contentCategory: "products",
      });
    }
    if (pathname !== "/browse") {
      // We are not in browse page
      push(`/browse?search=${searchQuery}`);
    } else {
      // We are in browse page
      if (!searchQuery) {
        params.delete("search");
      } else {
        params.set("search", searchQuery);
      }
      replace(`${pathname}?${params.toString()}`);
    }
  };

  const handleInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (pathname === "/browse") return;

    if (value.length >= 2) {
      try {
        const res = await fetch(`/api/search-products?search=${value}`);
        const data = await res.json();
        setSuggestions(data);
      } catch (error) {
        console.error("Error fetching autocomplete suggestions:", error);
      }
    } else {
      setSuggestions([]);
    }
  };

  return (
    <div className="relative lg:w-full flex-1">
      <form
        onSubmit={handleSubmit}
        className="h-10 rounded-full bg-white/95 relative border border-white/20 shadow-sm focus-within:ring-2 focus-within:ring-pink-500/50 flex items-center overflow-hidden transition-all"
      >
        <input
          type="text"
          placeholder="Search cars, parts, oils..."
          className="bg-transparent text-sm text-black placeholder:text-slate-400 flex-1 border-none pl-4 pr-2 outline-none h-full min-w-0"
          value={searchQuery}
          onChange={handleInputChange}
        />
        {suggestions.length > 0 && (
          <SearchSuggestions suggestions={suggestions} query={searchQuery} />
        )}
        <button
          type="submit"
          aria-label="Search"
          className="h-full w-12 sm:w-14 bg-pink-600 text-white grid place-items-center cursor-pointer hover:bg-pink-700 transition-colors shrink-0"
        >
          <SearchIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </form>
    </div>
  );
}
