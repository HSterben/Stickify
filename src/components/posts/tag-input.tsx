"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { X } from "lucide-react";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export function TagInput({ tags, onChange }: TagInputProps) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = (value: string) => {
    const cleaned = value.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (cleaned && !tags.includes(cleaned) && tags.length < 10) {
      onChange([...tags, cleaned]);
    }
    setInput("");
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === "Backspace" && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className="flex min-h-[42px] cursor-text flex-wrap items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-800/50 px-3 py-2 transition-colors focus-within:border-violet-500/50 focus-within:ring-1 focus-within:ring-violet-500/20"
    >
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-full bg-violet-500/15 px-2.5 py-0.5 text-xs font-medium text-violet-300"
        >
          #{tag}
          <button
            onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
            className="ml-0.5 rounded-full p-0.5 hover:bg-violet-500/20"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => { if (input) addTag(input); }}
        placeholder={tags.length === 0 ? "Add tags (press Enter)" : ""}
        className="min-w-[80px] flex-1 bg-transparent text-sm text-white placeholder-zinc-600 outline-none"
      />
    </div>
  );
}
