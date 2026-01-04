"use client";

import { Share2 } from "lucide-react";
import { useState } from "react";

interface ShareButtonProps {
  title: string;
  text: string;
  url: string;
  className?: string;
}

export function ShareButton({ title, text, url, className }: ShareButtonProps) {
  const [message, setMessage] = useState<string | null>(null);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
      } else {
        await navigator.clipboard.writeText(url);
        setMessage("Link copied!");
        setTimeout(() => setMessage(null), 2000);
      }
    } catch {
      await navigator.clipboard.writeText(url);
      setMessage("Link copied!");
      setTimeout(() => setMessage(null), 2000);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleShare}
        className={
          className ??
          "flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm transition-colors hover:bg-accent"
        }
      >
        <Share2 className="h-4 w-4" />
        Share
      </button>
      {message && (
        <div className="absolute top-full right-0 z-10 mt-2 whitespace-nowrap rounded-md bg-status-solved px-3 py-1 text-white text-xs">
          {message}
        </div>
      )}
    </div>
  );
}
